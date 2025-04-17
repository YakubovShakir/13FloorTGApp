import { useRef, useEffect, useCallback, useState, memo } from "react";
import { instance } from "../../services/instance";
import { useUser } from "../../UserContext";
import Button from "../../components/simple/Button/Button";
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
  boost: {
    ru: 'УСКОРИТЬ',
    en: 'BOOST'
  }
}

const WorkGame = ({
  workDuration: initialWorkDuration,
  onDurationUpdate,
  onComplete,
}) => {
  const { userId, refreshData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Cooldown in milliseconds
  const [showBoost, setShowBoost] = useState(false); // Track boost animation
  const remainingSecondsRef = useRef(initialWorkDuration);
  const lastReportedSecondsRef = useRef(initialWorkDuration);
  const timerRef = useRef(null);
  const { lang } = useSettingsProvider()

  // Format cooldown to ss:ms (e.g., 30:00)
  const formatCooldown = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10); // Show first two digits of ms
    return `${seconds.toString().padStart(2, "0")}:${milliseconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle jump (boost press)
  const handlePress = useCallback(async () => {
    if (cooldown > 0 || isLoading) return; // Prevent clicks during cooldown or loading
    setIsLoading(true);
    try {
      const response = await instance.post(`/users/work/boost-time/${userId}`);
      const newRemainingSeconds = response.data.remainingSeconds;
      remainingSecondsRef.current = newRemainingSeconds;
      if (Math.abs(newRemainingSeconds - lastReportedSecondsRef.current) >= 1) {
        onDurationUpdate(newRemainingSeconds);
        lastReportedSecondsRef.current = newRemainingSeconds;
      }
      if (newRemainingSeconds <= 0) onComplete();
      setCooldown(30000); // Set 30-second cooldown
      setShowBoost(true); // Trigger boost animation
      refreshData(); // Refresh user data after successful boost
    } catch (err) {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshData, cooldown, isLoading]);

  // Manage cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 16) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 16; // Approx 60fps (1000ms / 60 ≈ 16.67ms)
        });
      }, 16);
    }
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  // Reset boost animation after it completes
  useEffect(() => {
    if (showBoost) {
      const timeout = setTimeout(() => {
        setShowBoost(false);
      }, 1000); // Match animation duration
      return () => clearTimeout(timeout);
    }
  }, [showBoost]);

  return (
    <div
      style={{
        position: "absolute",
        top: "47.5%",
        left: "22.5%",
        width: "100%",
        height: "200px",
        zIndex: 999999,
        overflow: "hidden",
        animation: "fadeIn 0.5s ease-in",
        opacity: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button
        text={isLoading ? <Spinner /> : cooldown > 0 ? formatCooldown(cooldown) : translations.boost[lang]}
        active={cooldown === 0 && !isLoading}
        onClick={handlePress}
        height={44}
        width={138}
        color="white"
        style={cooldown === 0 ? { animation: "pulseGlow 1.5s ease-in-out infinite" } : {}}
      />
      {showBoost && (
        <div
          style={{
            position: "absolute",
            top: "40%", // Start slightly above the button
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            animation: "floatUp 2s ease-out forwards",
            zIndex: 1000000,
          }}
        >
          {translations.minus[lang]}
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
    0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.4); }
    50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
    100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.4); }
  }
`,
  styleSheet.cssRules.length
);

export default memo(WorkGame, (prevProps, nextProps) =>
  prevProps.workDuration === nextProps.workDuration &&
  prevProps.onDurationUpdate === nextProps.onDurationUpdate &&
  prevProps.onComplete === nextProps.onComplete
);