import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { instance } from "../../services/instance";
import { useUser } from "../../UserContext";
import Button from "../../components/simple/Button/Button";
import { useSettingsProvider } from "../../hooks";
import Assets from "../../assets";

const buttonStyle = {
  width: "100%",
  height: 44,
  shadowColor: "rgb(199, 80, 21)",
  color: "rgb(255, 255, 255)",
  ownColor: "rgb(255, 118, 0)",
  bgColor: "rgb(255, 118, 0)",
  fontSize: 14,
  fontFamily: "Anonymous pro",
  fontWeight: "normal",
};

// Static translations for UI text
const translations = {
  dailyCheckInCalendar: {
    en: "Daily Rewards",
    ru: "Ежедневные награды",
  },
  currentStreak: {
    en: "Current Streak",
    ru: "Текущая серия",
  },
  checkIn: {
    en: "Check In",
    ru: "Отметиться",
  },
  claimReward: {
    en: "Claim Reward",
    ru: "Получить награду",
  },
  close: {
    en: "Close",
    ru: "Закрыть",
  },
  youWon: {
    en: "Congratulations!",
    ru: "Поздравляем!",
  },
  ok: {
    en: "OK",
    ru: "ОК",
  },
  daily: {
    en: "Daily",
    ru: "Ежедневно",
  },
  day: {
    en: "Day",
    ru: "День",
  },
};

const DailyCheckInOverlay = () => {
  const [isActive, setIsActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [reward, setReward] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useUser();
  const { lang } = useSettingsProvider(); // Language setting

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const { data } = await instance.get(`/users/${userId}/daily/status`);
      setStreak(data.streak);
      setCanClaim(data.canClaim);
      setHasCheckedInToday(data.hasCheckedInToday);
      setRewards(data.rewards);
    } catch (error) {
      console.error("Error fetching daily status:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (userId && isActive) {
      fetchStatus();
    }
  }, [userId, isActive]);

  const handleCheckIn = async () => {
    try {
      const { data } = await instance.get(`/users/${userId}/daily/check-in`);
      setStreak(data.streak);
      setCanClaim(data.canClaim);
      setHasCheckedInToday(true);
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const handleClaim = async () => {
    try {
      const { data } = await instance.get(`/users/${userId}/daily/claim`);
      setReward(data.wonItem);
      setCanClaim(false);
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsActive(true)}
        style={{
          cursor: "pointer",
          position: "fixed",
          bottom: "13vh",
          right: "3.5vw",
          color: "white",
          zIndex: 99999,
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        <img src={Assets.Icons.task} width={50} alt="Daily" />
        <p>{translations.daily[lang]}</p>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.6)",
              opacity: 1,
              zIndex: 99999999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div style={{ color: "white", fontSize: "24px" }}>Loading...</div>
            ) : (
              <>
                <div
                  style={{
                    background: "rgba(30, 30, 30, 0.95)",
                    padding: "15px",
                    borderRadius: "15px",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
                    maxWidth: "374px",
                    width: "90%",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "15px",
                      fontFamily: "Arial, sans-serif",
                      fontWeight: "normal",
                    }}
                  >
                    {translations.dailyCheckInCalendar[lang] ||
                      translations.dailyCheckInCalendar.en}
                  </h2>

                  {/* Single Row with Horizontal Scroll */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "15px", // Increased gap to prevent overlap
                      padding: "10px",
                      background: "rgba(40, 40, 40, 0.9)",
                      borderRadius: "10px",
                      marginBottom: "15px",
                      overflowX: "auto", // Horizontal scroll
                      whiteSpace: "nowrap", // Prevent wrapping
                      scrollbarWidth: "thin", // Firefox
                      scrollbarColor: "#ff7600 #2a2a2a", // Firefox
                      WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
                    }}
                    className="custom-scroll"
                  >
                    {rewards.map((item) => (
                      <div
                        key={item.day}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px",
                          background:
                            streak >= item.day
                              ? "linear-gradient(45deg, #ff7600, #ff9d00)"
                              : "rgba(60, 60, 60, 0.8)",
                          borderRadius: "8px",
                          border:
                            streak === item.day && canClaim
                              ? "2px solid #ff4444"
                              : "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.2s ease",
                          textAlign: "center",
                          minWidth: "100px", // Adjusted minWidth
                          maxWidth: "110px", // Adjusted maxWidth
                          minHeight: "130px", // Increased height for better spacing
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px", // Reduced font size
                            marginBottom: "5px",
                            fontFamily: "Arial, sans-serif",
                            opacity: 0.9,
                            wordBreak: "break-word",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal", // Allow wrapping
                            maxWidth: "100%",
                          }}
                        >
                          {translations.day[lang] || translations.day.en}{" "}
                          {item.day}
                        </p>
                        <img
                          src={item.image}
                          alt={item.name[lang] || item.name.en}
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "contain",
                            marginBottom: "5px",
                            filter: streak < item.day ? "grayscale(80%)" : "none",
                          }}
                        />
                        <p
                          style={{
                            fontSize: "11px", // Reduced font size
                            marginTop: "0",
                            fontFamily: "Arial, sans-serif",
                            opacity: streak >= item.day ? 1 : 0.7,
                            wordBreak: "break-word",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal", // Allow wrapping
                            maxWidth: "100%",
                          }}
                        >
                          {item.name[lang] || item.name.en}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontFamily: "Arial, sans-serif",
                        opacity: 0.9,
                      }}
                    >
                      {translations.currentStreak[lang] ||
                        translations.currentStreak.en}{" "}
                      {streak} / 14
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {hasCheckedInToday ? (
                        canClaim ? (
                          <Button
                            onClick={handleClaim}
                            style={buttonStyle}
                            text={
                              translations.claimReward[lang] ||
                              translations.claimReward.en
                            }
                            width={120}
                            active={true}
                            color={'white'}
                            fontSize={14}
                            fontWeight={400}
                          />
                        ) : (
                          <Button
                            style={buttonStyle}
                            text={
                              translations.claimReward[lang] ||
                              translations.claimReward.en
                            }
                            width={120}
                            active={false} // Disabled state
                            color={'white'}
                            fontSize={14}
                            fontWeight={400}
                          />
                        )
                      ) : (
                        <Button
                          onClick={handleCheckIn}
                          style={buttonStyle}
                          text={
                            translations.checkIn[lang] || translations.checkIn.en
                          }
                          width={120}
                          active={true}
                          color={'white'}
                          fontSize={14}
                          fontWeight={400}
                        />
                      )}
                      <Button
                        onClick={() => setIsActive(false)}
                        style={buttonStyle}
                        text={translations.close[lang] || translations.close.en}
                        width={120}
                        active={true}
                        fontSize={14}
                        fontWeight={400}
                        color={'white'}
                      />
                    </div>
                  </div>
                </div>

                {reward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      position: "fixed",
                      background: "linear-gradient(135deg, #2a2a2a, #3a3a3a)",
                      padding: "20px",
                      borderRadius: "15px",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
                      zIndex: 10000,
                      width: "280px",
                      textAlign: "center",
                      color: "white",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "18px",
                        marginBottom: "15px",
                        fontFamily: "Arial, sans-serif",
                        fontWeight: "normal",
                      }}
                    >
                      {translations.youWon[lang] || translations.youWon.en}
                    </h2>
                    <img
                      src={reward.image}
                      alt={reward.name[lang] || reward.name.en}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "10px",
                        marginBottom: "10px",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "14px",
                        fontFamily: "Arial, sans-serif",
                        marginBottom: "15px",
                        opacity: "0.9",
                        wordBreak: "break-word",
                      }}
                    >
                      {reward.name[lang] || reward.name.en}
                    </p>
                    <Button
                      onClick={() => setReward(null)}
                      style={buttonStyle}
                      text={translations.ok[lang] || translations.ok.en}
                      width={75}
                      active={true}
                    />
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Custom CSS for scrollbar (Webkit browsers)
const styles = `
  .custom-scroll::-webkit-scrollbar {
    height: 8px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #ff7600;
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #ff9d00;
  }
`;

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default DailyCheckInOverlay;