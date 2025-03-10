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
  fontFamily: "Oswald",
  fontWeight: "normal",
};

// Static translations for UI text
const translations = {
  dailyCheckInCalendar: {
    en: "Daily Rewards",
    ru: "Ежедневные награды",
  },
  currentStreak: {
    en: "Come back every day to collect as many rewards as you can in a week",
    ru: "Заходите каждый день, чтобы собрать как можно больше наград за неделю",
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
                    background: "rgb(32, 32, 32)",
                    border: "1px solid rgb(57, 57, 57)",
                    padding: "7px 15px 15px 15px",
                    borderRadius: "6px",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
                    maxWidth: "374px",
                    width: "90%",
                    color: "white",
                    textAlign: "center",
                     position: "absolute",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "5px",
                      fontFamily: "Oswald",
                      fontWeight: "normal",
                      textTransform: "uppercase",
                      textAlign: "left",
                    }}
                  >
                    {translations.dailyCheckInCalendar[lang] ||
                      translations.dailyCheckInCalendar.en}
                  </h2>
                  <img
  className="ModalClose2"
  onClick={() => setIsActive(false)} 
  src={Assets.Icons.modalClose} 
  alt="closeIcon"
  width= "16"
  height= "16"
  style={{ 
    cursor: "pointer",
    position: "absolute",
    right: "17px",
    top: "15px",
   
    }} 
/>
                  {/* Single Row with Horizontal Scroll */}
                  <div
  style={{
    position: "relative", 
    marginBottom: "15px", 
  }}
>
  {/* Левый градиент */}
  <div
    style={{
      position: "absolute",
      top: "10px",
      left: "0px",
      width: "10px",
      height: "calc(100% - 20px)",
      background: "linear-gradient(to right, rgba(18, 18, 18, 1), rgba(18, 18, 18, 0))",
      zIndex: 1,
      pointerEvents: "none",
    }}
  />
  {/* Правый градиент */}
  <div
    style={{
      position: "absolute",
      top: "10px",
      right: "0px",
      width: "10px",
      height: "calc(100% - 20px)",
      background: "linear-gradient(to left, rgba(18, 18, 18, 1), rgba(18, 18, 18, 0))",
      zIndex: 1,
      pointerEvents: "none",
    }}
  />
  {/* Контейнер со скроллом */}
  <div
    style={{
      position: "relative",
      display: "flex",
      flexDirection: "row",
      gap: "15px",
      padding: "10px",
      background: "rgb(18, 18, 18)",
      borderRadius: "8px",
      overflowX: "auto",
      whiteSpace: "nowrap",
      scrollbarWidth: "thin",
      scrollbarColor: "#ff7600 #2a2a2a",
      WebkitOverflowScrolling: "touch",
      borderBottom: "1px solid rgba(117, 117, 117, 0.23)",
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
                          // justifyContent: "center",
                          padding: "5px",
                          color:
                          streak >= item.day
                            ? "#000"
                            : "#CCCCCC",
                          background:
                            streak >= item.day
                              ? "linear-gradient(45deg, #ff7600, #ff9d00)"
                              : "rgb(39 39 39)",
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
                            fontSize: "14px", // Reduced font size
                            marginBottom: "5px",
                            fontFamily: "Oswald",
                            opacity: 0.9,
                            wordBreak: "break-word",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal", // Allow wrapping
                            maxWidth: "100%",
                            textTransform: "uppercase",
                          }}
                        >
                          {translations.day[lang] || translations.day.en}{" "}
                          {item.day}
                        </p>
                        <div
    style={{
      background: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21) 2px, rgba(57, 57, 57, 0.06) 2px, rgba(57, 57, 57, 0.06) 6px) rgb(26, 26, 26)", // Светлый полупрозрачный фон для контраста
      borderBottom: "1px solid rgba(117, 117, 117, 0.23)", 
      boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
      borderRadius: "6px", 
      padding: "5px", 
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%", 
    }}
  >
    <img
      src={item.image}
      alt={item.name[lang] || item.name.en}
      style={{
        width: "60px",
        height: "60px",
        objectFit: "contain",
        marginBottom: "5px",
        filter: streak < item.day ? "grayscale(80%)" : "none",
      }}
    />
    </div>
    <p
  style={{
    fontSize: "11px",
    marginTop: "0",
    fontFamily: "Oswald",
    opacity: streak >= item.day ? 1 : 0.7,
    wordBreak: "break-word",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "normal",
    maxWidth: "100%",
    textAlign: "center",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    minHeight: "40px", 
    fontWeight: "600",
    textTransform: "uppercase",
  }}
>
      {item.name[lang] || item.name.en}
    </p>
  
</div>
                    ))}
                  </div>
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
                        fontSize: "12px",
                        fontFamily: "Oswald",
                        opacity: 0.9,
                        fontWeight: "200",
                      }}
                    >
                      {translations.currentStreak[lang] ||
                        translations.currentStreak.en}{" "}
                      {streak} / 7
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
                      borderRadius: "6px",
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
                        fontFamily: "Oswald",
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
                        fontFamily: "Oswald",
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