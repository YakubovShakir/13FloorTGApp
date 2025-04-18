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
  const [isLoading, setIsLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [needleAngle, setNeedleAngle] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const needleRef = useRef(0);
  const successZoneRef = useRef({ start: 0, end: 0 });
  const remainingSecondsRef = useRef(initialWorkDuration);
  const lastReportedSecondsRef = useRef(initialWorkDuration);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const hasPassedZoneRef = useRef(false);

  // Fetch last click with silent retries
  const fetchLastClick = useCallback(async (retryCount = 10) => {
    console.log("fetchLastClick called, retryCount:", retryCount);
    try {
      const response = await instance.get(`/users/work/last-click/${userId}`);
      const { lastClickedAt, remainingCooldown } = response.data;
      console.log("fetchLastClick response:", { lastClickedAt, remainingCooldown });
      if (Number.isFinite(remainingCooldown) && remainingCooldown >= 0) {
        setCooldown(remainingCooldown);
        setShowResult(null);
        setIsLoading(false);
      } else {
        console.log("Invalid cooldown, retrying...");
        throw new Error("Invalid remainingCooldown");
      }
    } catch (error) {
      console.error("Error fetching last click:", error.message, error.response?.data);
      if (retryCount > 0) {
        console.log(`Retrying fetchLastClick, ${retryCount} attempts left...`);
        setTimeout(() => fetchLastClick(retryCount - 1), 1500);
      } else {
        console.log("Max retries reached, starting new skill check");
        setCooldown(0);
        setIsLoading(false);
      }
    }
  }, [userId]);

  // Debounce function for fetch
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced fetchLastClick
  const debouncedFetchLastClick = useCallback(debounce(fetchLastClick, 300), [fetchLastClick]);

  // Fetch on mount and visibility change
  useEffect(() => {
    fetchLastClick();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab refocused, fetching last click");
        setIsLoading(true);
        debouncedFetchLastClick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchLastClick, debouncedFetchLastClick]);

  // Format cooldown to ss:ms
  const formatCooldown = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
  };

  // Initialize success zone
  const initSuccessZone = useCallback(() => {
    const zoneSize = 35;
    const currentEnd = successZoneRef.current.end || 0;
    const newStart = normalizeAngle(currentEnd + 180);
    const newEnd = normalizeAngle(newStart + zoneSize);
    successZoneRef.current = { start: newStart, end: newEnd };
    hasPassedZoneRef.current = false;
    console.log("initSuccessZone:", { start: newStart, end: newEnd });
  }, []);

  // Normalize angle to [0, 360)
  const normalizeAngle = (angle) => {
    return angle >= 0 ? angle % 360 : (angle % 360) + 360;
  };

  // Check if angle is within zone
  const isAngleInZone = (angle, start, end) => {
    const normAngle = normalizeAngle(angle);
    const normStart = normalizeAngle(start);
    const normEnd = normalizeAngle(end);
    return normAngle >= normStart && normAngle <= normEnd;
  };

  // Animate needle and check zone pass
  useEffect(() => {
    if (cooldown > 0 || isLoading || !isVisible) return;

    if (!successZoneRef.current.start && !successZoneRef.current.end) {
      initSuccessZone();
    }

    let lastTime = performance.now();
    const animate = (time) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      const prevAngle = needleRef.current;
      needleRef.current = (needleRef.current + deltaTime * 180) % 360;
      setNeedleAngle(needleRef.current);

      const normPrev = normalizeAngle(prevAngle);
      const normCurrent = normalizeAngle(needleRef.current);
      const zoneStart = successZoneRef.current.start;
      const zoneEnd = successZoneRef.current.end;

      // Check if needle passed the zone end
      if (!hasPassedZoneRef.current && !showResult) {
        const passedZone = normPrev <= zoneEnd && normCurrent > zoneEnd;
        if (passedZone) {
          console.log("Needle passed success zone:", { normPrev, normCurrent, zoneStart, zoneEnd });
          initSuccessZone();
        }
      }

      // Reset hasPassedZoneRef after a full rotation
      if (normPrev > normCurrent) {
        hasPassedZoneRef.current = false;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [cooldown, isLoading, isVisible, initSuccessZone, showResult]);

  // Handle skill check
  const handleSkillCheck = useCallback(async (event) => {
    console.log("Click detected:", { x: event.clientX, y: event.clientY });
    if (cooldown > 0 || isLoading || !isVisible) return;
    setIsLoading(true);
    cancelAnimationFrame(animationFrameRef.current);

    const capturedAngle = needleRef.current;
    const normAngle = normalizeAngle(capturedAngle);
    const isSuccess = isAngleInZone(capturedAngle, successZoneRef.current.start, successZoneRef.current.end);
    setShowResult(isSuccess ? "success" : "miss");

    console.log({
      capturedAngle,
      normAngle,
      zoneStart: successZoneRef.current.start,
      zoneEnd: successZoneRef.current.end,
      isSuccess
    });

    try {
      if (isSuccess) {
        const response = await instance.post(`/users/work/boost-time/${userId}`);
        const newRemainingSeconds = response.data.remainingSeconds;
        remainingSecondsRef.current = newRemainingSeconds;
        if (Math.abs(newRemainingSeconds - lastReportedSecondsRef.current) >= 1) {
          onDurationUpdate(newRemainingSeconds);
          lastReportedSecondsRef.current = newRemainingSeconds;
        }
        if (newRemainingSeconds <= 0) {
          setIsVisible(false);
          onComplete();
        }
        refreshData();
      }
      setCooldown(30000);
    } catch (err) {
      console.error("Error boosting work time:", err.message, err.response?.data);
    } finally {
      setIsLoading(false);
    }
  }, [cooldown, isLoading, isVisible, userId, refreshData, onDurationUpdate, onComplete]);

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
        if (!cooldown && isVisible) initSuccessZone();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showResult, cooldown, isVisible, initSuccessZone]);

  // Sync initial work duration
  useEffect(() => {
    remainingSecondsRef.current = initialWorkDuration;
    lastReportedSecondsRef.current = initialWorkDuration;
  }, [initialWorkDuration]);

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
        opacity: isVisible ? 1 : 0,
        display: isVisible ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.5s ease-out",
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
            textAlign: "left",
            paddingLeft:"15px"
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
          <defs>
            <linearGradient id="successZoneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "rgba(233, 78, 27, 1)" }} />
              <stop offset="50%" style={{ stopColor: "rgba(243, 117, 0, 1)" }} />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            style={{ pointerEvents: "none" }}
          />
          <path
            d={`
              M ${50 + 45 * Math.cos(((successZoneRef.current.start + 270) % 360 * Math.PI) / 180)} 
                ${50 + 45 * Math.sin(((successZoneRef.current.start + 270) % 360 * Math.PI) / 180)}
              A 45 45 0 ${successZoneRef.current.end - successZoneRef.current.start > 180 ? 1 : 0} 1 
                ${50 + 45 * Math.cos(((successZoneRef.current.end + 270) % 360 * Math.PI) / 180)} 
                ${50 + 45 * Math.sin(((successZoneRef.current.end + 270) % 360 * Math.PI) / 180)}
            `}
            fill="none"
            stroke="url(#successZoneGradient)"
            strokeWidth="8"
            style={{ pointerEvents: "none" }}
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="red"
            strokeWidth="4"
            transform={`rotate(${needleAngle} 50 50)`}
            style={{ pointerEvents: "none" }}
          />
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