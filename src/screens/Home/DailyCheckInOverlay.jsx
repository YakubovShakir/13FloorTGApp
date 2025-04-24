import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { instance } from "../../services/instance"
import { useUser } from "../../UserContext"
import Button from "../../components/simple/Button/Button"
import { useSettingsProvider } from "../../hooks"
import Assets from "../../assets"
import globalTranslations from "../../globalTranslations"
import { useNavigate } from "react-router-dom"

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
}

const translations = globalTranslations.daily

const DailyCheckInOverlay = () => {
  const [isActive, setIsActive] = useState(true)
  const [streak, setStreak] = useState(0)
  const [canClaim, setCanClaim] = useState(false)
  const [reward, setReward] = useState(null)
  const [rewards, setRewards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { userId } = useUser()
  const { lang } = useSettingsProvider()

  const fetchStatus = async () => {
    setIsLoading(true)
    try {
      const { data } = await instance.get(`/users/${userId}/daily/status`)
      setStreak(data.streak)
      setCanClaim(data.canClaim)
      setRewards(data.rewards)
    } catch (error) {
      console.error("Error fetching daily status:", error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (userId && isActive) {
      fetchStatus()
    }
  }, [userId, isActive])

  const handleClaim = async () => {
    try {
      setIsLoading(true)
      const { data } = await instance.get(`/users/${userId}/daily/claim`)
      setReward(data.wonItem)
      setCanClaim(false)
      fetchStatus().finally(() => setIsLoading(false))
    } catch (error) {
      console.error("Error claiming reward:", error)
    }
  }

  const navigate = useNavigate()

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21) 2px, rgba(57, 57, 57, 0.06) 2px, rgba(57, 57, 57, 0.06) 6px) rgb(20, 20, 20)",
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
                    onClick={() => navigate("/")}
                    src={Assets.Icons.modalClose}
                    alt="closeIcon"
                    width="16"
                    height="16"
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
                        background:
                          "linear-gradient(to right, rgba(18, 18, 18, 1), rgba(18, 18, 18, 0))",
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
                        background:
                          "linear-gradient(to left, rgba(18, 18, 18, 1), rgba(18, 18, 18, 0))",
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
                      {rewards.map((item) => {
                        const isPast = item.collected
                        const isCurrent = item.day === streak + 1 && canClaim
                        const isFuture = item.day > streak + (canClaim ? 1 : 0)

                        return (
                          <div
                            key={item.day}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "5px",
                              color: isPast ? "#000" : "#CCCCCC",
                              background: isPast
                                ? "linear-gradient(45deg, #ff7600, #ff9d00)"
                                : "rgb(39, 39, 39)",
                              borderRadius: "8px",
                              border: isCurrent
                                ? "2px solid #ff9d00"
                                : "1px solid rgba(255, 255, 255, 0.1)",
                              transition:
                                "background 0.2s ease, border 0.2s ease",
                              textAlign: "center",
                              minWidth: "100px",
                              maxWidth: "110px",
                              minHeight: "130px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                marginBottom: "5px",
                                fontFamily: "Oswald",
                                opacity: isPast || isCurrent ? 1 : 0.9,
                                wordBreak: "break-word",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "normal",
                                maxWidth: "100%",
                                textTransform: "uppercase",
                                textRendering: "optimizeLegibility",
                                WebkitFontSmoothing: "antialiased",
                              }}
                            >
                              {translations.day[lang] || translations.day.en}{" "}
                              {item.day}
                            </p>
                            <div
                              style={{
                                background: "rgb(26, 26, 26)",
                                borderBottom:
                                  "1px solid rgba(117, 117, 117, 0.23)",
                                boxShadow:
                                  "rgba(0, 0, 0, 0.15) 0px 0px 4px inset",
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
                                  filter: isFuture
                                    ? "grayscale(80%) opacity(0.6)"
                                    : "none",
                                  imageRendering: "auto",
                                }}
                              />
                            </div>
                            <p
                              style={{
                                fontSize: "12px",
                                marginTop: "0",
                                fontFamily: "Oswald",
                                opacity: isPast || isCurrent ? 1 : 0.7,
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
                                textRendering: "optimizeLegibility",
                                WebkitFontSmoothing: "antialiased",
                              }}
                            >
                              {item.name[lang] || item.name.en}
                            </p>
                          </div>
                        )
                      })}
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
                        fontFamily: "Roboto",
                        opacity: 0.9,
                        fontWeight: "200",
                      }}
                    >
                      {translations.currentStreak[lang] ||
                        translations.currentStreak.en}{" "}
                      {streak} / 30
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {canClaim ? (
                        <Button
                          onClick={handleClaim}
                          style={buttonStyle}
                          text={
                            translations.claimReward[lang] ||
                            translations.claimReward.en
                          }
                          width={180}
                          active={true}
                          color={"white"}
                          fontSize={14}
                          fontWeight={400}
                          fontFamily={"Oswald"}
                        />
                      ) : (
                        <Button
                          style={buttonStyle}
                          text={
                            translations.claimReward[lang] ||
                            translations.claimReward.en
                          }
                          width={180}
                          active={false}
                          color={"white"}
                          fontSize={14}
                          fontWeight={400}
                          fontFamily={"Oswald"}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {reward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      background: [
                        "radial-gradient(circle at center, rgba(255, 98, 0, 0.56) 0%, rgba(255, 98, 0, 0) 30%)",
                        "radial-gradient(circle at center, rgba(255, 140, 0, 0.53) 0%, rgba(255, 140, 0, 0) 50%)",
                        "radial-gradient(circle at center, rgba(255, 98, 0, 0.58) 0%, rgba(255, 98, 0, 0) 30%)",
                      ],
                    }}
                    transition={{
                      opacity: { duration: 0.5 },
                      scale: { duration: 0.5 },
                      background: {
                        delay: 0.5,
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      display: "flex",
                      padding: "20px",
                      borderRadius: "6px",
                      justifyContent: "center",
                      zIndex: 10000,
                      width: "100%",
                      height: "100%",
                      textAlign: "center",
                      color: "white",
                      boxShadow:
                        "0px 0px 100px 100px rgba(0, 0, 0, 0.47) inset",
                      backdropFilter: "blur(5px)",
                    }}
                  >
                    <h2
                      style={{
                        textTransform: "uppercase",
                        textShadow: " 1px 1px 10px black",
                        fontSize: "16px",
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
                        textTransform: "uppercase",
                        textShadow: " 1px 1px 10px black",
                        fontSize: "18px",
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
                      color={"white"}
                      margin={"auto"}
                      display={"math"}
                    />
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

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
`

// Inject styles into the document
const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

export default DailyCheckInOverlay