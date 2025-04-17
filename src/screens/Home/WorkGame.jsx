import { useRef, useEffect, useCallback, useState, memo } from "react";
import { instance } from "../../services/instance";
import { useUser } from "../../UserContext";
import { useSettingsProvider } from "../../hooks";

// Simple spinner SVG component
const Spinner = () => (
  <svg
    className="animate-spin"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      opacity="0.2"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="4"
    />
  </svg>
);

const translations = {
  minus: {
    ru: '-10 СЕКУНД!',
    en: '-10 SECONDS!'
  },
  miss: {
    ru: 'ПРОМАХ',
    en: 'MISSED'
  },
  boost: {
    ru: 'УСКОРИТЬ',
    en: 'BOOST'
  }
};

const WorkGame = ({
  workDuration: initialWorkDuration,
  onDurationUpdate,
  onComplete,
}) => {
  const { userId, refreshData } = useUser();
  const { lang } = useSettingsProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Cooldown in milliseconds
  const [showResult, setShowResult] = useState(null); // null, 'success', 'miss'
  const [needleAngle, setNeedleAngle] = useState(0); // Needle rotation in degrees
  const needleRef = useRef(0); // Track needle angle without state
  const successZoneRef = useRef({ start: 0, end: 0 }); // Success zone angles
  const remainingSecondsRef = useRef(initialWorkDuration);
  const lastReportedSecondsRef = useRef(initialWorkDuration);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const debugInfoRef = useRef({ needle: 0, zoneStart: 0, zoneEnd: 0 }); // Debug info

  // Debounce function to prevent multiple simultaneous fetches
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Fetch last click
  const fetchLastClick = useCallback(async () => {
    console.log("fetchLastClick called");
    try {
      const response = await instance.get(`/users/work/last-click/${userId}`);
      const { lastClickedAt, remainingCooldown } = response.data;
      console.log("fetchLastClick response:", { lastClickedAt, remainingCooldown });
      if (lastClickedAt && remainingCooldown > 0 && Number.isFinite(remainingCooldown)) {
        setCooldown(remainingCooldown);
      } else {
        setCooldown(0);
        console.log("No valid cooldown, set to 0");
      }
    } catch (error) {
      console.error("Error fetching last click:", error);
      console.log("Fetch failed, keeping current cooldown:", cooldown);
    }
  }, [userId]);

  // Debounced fetchLastClick
  const debouncedFetchLastClick = useCallback(debounce(fetchLastClick, 300), [fetchLastClick]);

  // Fetch on mount and visibility change
  useEffect(() => {
    fetchLastClick();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab refocused, fetching last click");
        debouncedFetchLastClick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchLastClick, debouncedFetchLastClick]);

  // Format cooldown to ss:ms (e.g., 30:00)
  const formatCooldown = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds.toString().padStart(2, "0")}:${milliseconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Initialize success zone
  const initSuccessZone = useCallback(() => {
    const zoneSize = 35; // Success zone size in degrees
    const start = Math.floor(Math.random() * 360); // Random angle in [0, 359]
    const end = start + zoneSize; // Unnormalized end for wrapping zones
    const newSuccessZone = { start, end };
    successZoneRef.current = newSuccessZone;
    console.log("initSuccessZone:", newSuccessZone);
  }, []);

  // Animate needle
  useEffect(() => {
    if (cooldown > 0 || isLoading) return;

    initSuccessZone();
    let lastTime = performance.now();
    const animate = (time) => {
      const deltaTime = (time - lastTime) / 1000; // Convert to seconds
      lastTime = time;
      needleRef.current = (needleRef.current + (deltaTime * 180)) % 360; // 180°/s, clockwise
      setNeedleAngle(needleRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [cooldown, isLoading, initSuccessZone]);

  // Normalize angle to [0, 360)
  const normalizeAngle = (angle) => {
    return angle >= 0 ? angle % 360 : (angle % 360) + 360;
  };

  // Check if angle is within start and end (handles wrapping)
  const isAngleInZone = (angle, start, end) => {
    const normAngle = normalizeAngle(angle);
    const normStart = normalizeAngle(start);
    const normEnd = normalizeAngle(end);
    
    if (normStart <= normEnd) {
      // Non-wrapping zone (e.g., 30° to 150°)
      return normAngle >= normStart && normAngle <= normEnd;
    } else {
      // Wrapping zone (e.g., 300° to 420°)
      return normAngle >= normStart || normAngle <= normEnd;
    }
  };

  // Handle skill check
  const handleSkillCheck = useCallback(async (event) => {
    console.log("Click detected:", { x: event.clientX, y: event.clientY });
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    cancelAnimationFrame(animationFrameRef.current); // Stop needle immediately

    // Capture current needle angle and adjust for SVG (0° at 12 o'clock)
    const capturedAngle = needleRef.current;
    const adjustedAngle = normalizeAngle(capturedAngle - 90); // Shift 0° to top
    const zoneStart = successZoneRef.current.start;
    const zoneEnd = successZoneRef.current.end;

    // Determine if needle is in the success zone
    const isSuccess = isAngleInZone(adjustedAngle, zoneStart, zoneEnd);

    // Store debug info
    debugInfoRef.current = {
      needle: adjustedAngle,
      zoneStart: normalizeAngle(zoneStart),
      zoneEnd: normalizeAngle(zoneEnd),
      isSuccess,
    };

    // Debugging log
    console.log({
      capturedAngle,
      adjustedAngle,
      zoneStart,
      zoneEnd,
      isSuccess,
      successZone: successZoneRef.current,
      svgPath: `M ${50 + 45 * Math.cos(((zoneStart - 90) * Math.PI) / 180)} 
                ${50 + 45 * Math.sin(((zoneStart - 90) * Math.PI) / 180)}
                A 45 45 0 ${zoneEnd - zoneStart > 180 ? 1 : 0} 1 
                ${50 + 45 * Math.cos(((zoneEnd - 90) * Math.PI) / 180)} 
                ${50 + 45 * Math.sin(((zoneEnd - 90) * Math.PI) / 180)}`
    });

    setShowResult(isSuccess ? "success" : "miss");

    try {
      if (isSuccess) {
        const response = await instance.post(`/users/work/boost-time/${userId}`);
        const newRemainingSeconds = response.data.remainingSeconds;
        remainingSecondsRef.current = newRemainingSeconds;
        if (Math.abs(newRemainingSeconds - lastReportedSecondsRef.current) >= 1) {
          onDurationUpdate(newRemainingSeconds);
          lastReportedSecondsRef.current = newRemainingSeconds;
        }
        if (newRemainingSeconds <= 0) onComplete();
        refreshData();
      }
      setCooldown(30000); // 30-second cooldown for success or miss
    } catch (err) {
      console.error("Error boosting work time:", err);
    } finally {
      setIsLoading(false);
    }
  }, [cooldown, isLoading, userId, refreshData, onDurationUpdate, onComplete]);

  // Manage cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 16) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 16;
        });
      }, 16);
    }
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  // Reset result animation
  useEffect(() => {
    if (showResult) {
      const timeout = setTimeout(() => {
        setShowResult(null);
        if (!cooldown) initSuccessZone(); // Reset success zone
      }, 2000); // Match floatUp animation duration
      return () => clearTimeout(timeout);
    }
  }, [showResult, cooldown, initSuccessZone]);

  return (
   
    <div
      style={{
        position: "absolute",
        top: "40%",
        left: "22.5%",
        width: "100%",
        height: "200px",
        zIndex: 99,
        overflow: "hidden",
        animation: "fadeIn 0.5s ease-in",
        opacity: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={handleSkillCheck}
    >
      {cooldown > 0 ? (
        <div
          style={{   
            borderRadius: "5px",
            backgroundColor: "#212121d9",
            width: "100px",
            color: "white",
            fontSize: "32px",
            fontFamily: "Oswald",
            textAlign: "center",
          }}
        >
          {formatCooldown(cooldown)}
        </div>
      ) : isLoading ? (
        <Spinner />
      ) : (
        
        <svg
          width="150"
          height="150"
          viewBox="0 0 100 100"
          style={{
            padding: "6px",
            borderRadius: "97px",
            background: "#020202b3",
            animation: cooldown === 0 && !isLoading ? "pulseGlow 1.5s ease-in-out infinite" : "none",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
          onClick={handleSkillCheck}
        >
          
          {/* Definitions for gradient */}
          <defs>
            <linearGradient id="successZoneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "rgba(233, 78, 27, 1)" }} />
              <stop offset="50%" style={{ stopColor: "rgba(243, 117, 0, 1)" }} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            style={{ pointerEvents: "none" }}
          />
          {/* Success zone with gradient */}
          <path
            d={`
              M ${50 + 45 * Math.cos(((successZoneRef.current.start - 90) * Math.PI) / 180)} 
                ${50 + 45 * Math.sin(((successZoneRef.current.start - 90) * Math.PI) / 180)}
              A 45 45 0 ${successZoneRef.current.end - successZoneRef.current.start > 180 ? 1 : 0} 1 
                ${50 + 45 * Math.cos(((successZoneRef.current.end - 90) * Math.PI) / 180)} 
                ${50 + 45 * Math.sin(((successZoneRef.current.end - 90) * Math.PI) / 180)}
            `}
            fill="none"
            stroke="url(#successZoneGradient)"
            strokeWidth="8"
            style={{ pointerEvents: "none" }}
          />
          {/* Needle */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="red"
            strokeWidth="4"
            transform={`rotate(${needleAngle - 90} 50 50)`} // Adjust for 0° at top
            style={{ pointerEvents: "none" }}
          />
          {/* Center dot */}
          <circle
            cx="50"
            cy="50"
            r="5"
            fill="white"
            style={{ pointerEvents: "none" }}
          />
        </svg>
        
      )}
      {showResult === "success" && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "Oswald",
            animation: "floatUp 2s ease-out forwards",
            zIndex: 1000000,
          }}
        >
          {translations.minus[lang]}
        </div>
      )}
      {showResult === "miss" && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            color: "red",
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "Oswald",
            animation: "floatUp 2s ease-out forwards",
            zIndex: 1000000,
          }}
        >
          {translations.miss[lang]}
        </div>
      )}
    </div>
  );
};

// CSS animations
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`,
  styleSheet.cssRules.length
);
styleSheet.insertRule(
  `
  @keyframes floatUp {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-150px); }
  }
`,
  styleSheet.cssRules.length
);
styleSheet.insertRule(
  `
  @keyframes pulseGlow {
    0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); }
    50% { filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)); }
    100% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); }
  }
`,
  styleSheet.cssRules.length
);

export default memo(WorkGame, (prevProps, nextProps) =>
  prevProps.workDuration === nextProps.workDuration &&
  prevProps.onDurationUpdate === nextProps.onDurationUpdate &&
  prevProps.onComplete === nextProps.onComplete
);