import React, { useEffect, useState, useRef } from "react"
import "./Home.css"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Assets from "../../assets/index"
import {
  getForeignNekoState,
  getUserActiveProcess,
  interactWithNeko,
} from "../../services/user/user"
import { useForeignUser, useUser } from "../../UserContext"
import { getLevels } from "../../services/levels/levels"
import { getTrainingParameters } from "../../services/user/user"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "react-router-dom"
import FullScreenSpinner from "./FullScreenSpinner"
import moment from "moment-timezone"
import { useVisibilityChange, useWindowFocus } from "../../hooks/userActivities"
import { formatCoins } from "../../utils/formatCoins"
import { formUsername } from "../../utils/formUsername"
import { useSettingsProvider } from "../../hooks"
import Button from "../../components/simple/Button/Button"
import { useEmojiReaction } from "../../EmojiReactionContext"

const translations = {
  neko: {
    ru: "Вы заклеймили",
    en: `YOU'VE JUST CLAIMED`,
  },
  coins: {
    ru: "МОНЕТ",
    en: "COINS",
  },
  nekoSub: {
    ru: "Успейте собрать монеты через час!",
    en: "Be the one to collect more in an hour!",
  },
  boostToOwner5: {
    ru: "И активировали владельцу буст к доходу в 5%!",
    en: "And boosted owners hourly income by 5%!",
  },
  boostToOwner10: {
    ru: "И активировали владельцу буст к доходу в 5%!",
    en: "And boosted owners hourly income by 5%!",
  },
}

const ForeignHome = () => {
  const mountedRef = useRef(false)
  const { userId = "0" } = useParams()
  const { lang } = useSettingsProvider()
  const [state, setState] = useState({
    currentWindow: null,
    currentProcess: null,
    visibleWindow: false,
    visibleSettingsModal: false,
    trainingParameters: null,
    levels: null,
    isStoppingProcess: false,
    imagesLoaded: false,
    nekoState: { canClick: false, cooldownUntil: null },
  })
  const [result, setResult] = useState(null)
  const [ownersBoost, setOwnersBoost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timer, setTimer] = useState(null)

  const triggerEmojiReaction = useEmojiReaction()

  const {
    userParameters,
    isInitialized,
    userPersonage,
    userClothing,
    userShelf,
    refreshData,
  } = useForeignUser(userId)

  const { userId: ownUserId } = useUser()

  useEffect(() => {
    mountedRef.current = true
    refreshData()
    return () => {
      mountedRef.current = false
    }
  }, [])

  const preloadImages = async () => {
    const imageUrls = [
      Assets.Layers.cover,
      Assets.BG.workScreenBG,
      Assets.BG.sleepScreenBG,
      Assets.BG.trainScreenBG,
      Assets.BG.homeBackground,
      Assets.HOME.shelf,
      Assets.HOME.couch,
      Assets.BG.backgroundSun,
      Assets.BG.winter,
    ]

    try {
      await Promise.all(
        imageUrls.map(
          (url) =>
            new Promise((resolve) => {
              const img = new Image()
              img.onload = resolve
              img.onerror = resolve
              img.src = url
            })
        )
      )
    } catch (error) {
      console.error("Error preloading images:", error)
    }
  }

  const initializeProcess = async () => {
    try {
      const process = await getUserActiveProcess(userId)
      if (!mountedRef.current) return

      if (!process) {
        setState((prev) => ({ ...prev, currentProcess: null }))
        return
      }

      const [trainingParams, levelsData] = await Promise.all([
        getTrainingParameters(userId),
        getLevels(),
      ])

      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          currentProcess: process,
          trainingParameters: trainingParams,
          levels: levelsData,
        }))
      }
    } catch (error) {
      console.error("Error initializing process:", error)
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, currentProcess: null }))
      }
    }
  }

  const fetchNekoState = async () => {
    try {
      const nekoData = await getForeignNekoState(ownUserId, userId)
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, nekoState: nekoData }))
      }
    } catch (error) {
      console.error("Error fetching neko state:", error)
    }
  }

  useEffect(() => {
    if (!state.nekoState.cooldownUntil || state.nekoState.canClick) return

    const updateTimer = () => {
      if (!mountedRef.current) return

      const now = moment().tz("Europe/Moscow")
      const end = moment(state.nekoState.cooldownUntil).tz("Europe/Moscow")
      const diff = end.diff(now)

      if (diff <= 0) {
        setState((prev) => ({
          ...prev,
          nekoState: { ...prev.nekoState, canClick: true, cooldownUntil: null },
        }))
        setTimer(null)
        return
      }

      const duration = moment.duration(diff)
      const hours = Math.floor(duration.asHours())
      const minutes = duration.minutes()
      setTimer(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [state.nekoState])

  useEffect(() => {
    if (!isInitialized) return

    const initialize = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          initializeProcess(),
          preloadImages(),
          fetchNekoState(),
        ])
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, imagesLoaded: true }))
        }
      } catch (error) {
        console.error("Initialization error:", error)
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    initialize()
  }, [isInitialized])

  useVisibilityChange(() => {
    if (mountedRef.current && document.visibilityState === "visible") {
      initializeProcess()
      fetchNekoState()
    }
  })

  useWindowFocus(() => {
    if (mountedRef.current) {
      initializeProcess()
      fetchNekoState()
    }
  })

  const handleNekoClick = async () => {
    if (!state.nekoState.canClick) return

    try {
      const response = await interactWithNeko(ownUserId, userId)
      triggerEmojiReaction([Assets.Icons.balance])
      setOwnersBoost(response.owners_boost)
      setResult(response.received_coins)
      await refreshData()
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          nekoState: {
            canClick: false,
            cooldownUntil: response.cooldownUntil,
          },
        }))
      }
    } catch (error) {
      console.error("Error interacting with neko:", error)
    }
  }

  const renderScene = (content) => (
    <AnimatePresence mode="wait">
      <motion.div
        className="Home"
        key={state.currentProcess?.type || "default"}
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            filter: "blur(1px)",
            position: "absolute",
            height: "53%",
            width: "53%",
            backgroundImage: `url(${Assets.BG.winter})`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
            zIndex: 0,
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            backgroundImage: `url(${Assets.BG.homeBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "bottom right",
            zIndex: 0,
          }}
        />
        {content}
      </motion.div>
    </AnimatePresence>
  )

  if (isLoading || !isInitialized) {
    return <FullScreenSpinner />
  }

  return renderScene(
    <>
      <div
        style={{
          position: "fixed",
          textAlign: "center",
          width: "100%",
          color: "white",
          top: "12%",
        }}
      >
        <h1>{formUsername(userParameters, lang)}</h1>
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            paddingTop: 12,
          }}
        >
          <div style={{ display: "flex" }}>
            <img src={Assets.Icons.balance} width={25} alt="balance" />
            <p style={{ paddingLeft: 8 }}>
              {formatCoins(Math.floor(userParameters.total_earned))}
            </p>
          </div>
          <div style={{ display: "flex" }}>
            <img src={Assets.Icons.respect} width={25} alt="respect" />
            <p style={{ paddingLeft: 8 }}>
              {formatCoins(userParameters.respect)}
            </p>
          </div>
          <div style={{ display: "flex" }}>
            <img src={Assets.Icons.levelIcon} width={25} alt="level" />
            <p style={{ paddingLeft: 8 }}>
              {formatCoins(userParameters.level)}
            </p>
          </div>
        </div>
      </div>
      <img className="shelf1" src={Assets.HOME.shelf} alt="shelf1" />
      <img className="shelf2" src={Assets.HOME.shelf} alt="shelf2" />
      <img className="couch" src={Assets.HOME.couch} alt="couch" />
      <div style={{ position: "absolute", zIndex: 2 }}>
        <Player
          bottom={"calc(-85vh + 50px)"}
          width="39vw"
          left={"9vw"}
          top={"35vh"}
          personage={userPersonage}
          clothing={userClothing}
        />
      </div>
      <Menu hasBg={false} isForeign={true} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="HomeInventory"
      >
        {userShelf && (
          <>
            <div className="shelf-container1">
              {userShelf.flower?.shelf_link && (
                <img
                  className="shelf-flower"
                  src={userShelf.flower.shelf_link}
                  alt="flower"
                />
              )}
              {userShelf.award?.shelf_link && (
                <img
                  className="shelf-award"
                  src={userShelf.award.shelf_link}
                  alt="award"
                />
              )}
              {userShelf.event?.shelf_link && (
                <img
                  className="shelf-event"
                  src={userShelf.event.shelf_link}
                  alt="event"
                />
              )}
            </div>
            <div className="shelf-container2">
              {userShelf.neko?.shelf_link && (
                <motion.div
                  className="shelf-neko-container"
                  onClick={handleNekoClick}
                  style={{ position: "relative" }}
                >
                  <motion.img
                    layout
                    className="shelf-neko"
                    src={userShelf.neko.shelf_link}
                    alt="neko"
                    style={{
                      filter: state.nekoState.canClick
                        ? "none"
                        : "grayscale(100%)",
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  {state.nekoState.canClick && (
                    <motion.div
                      className="pulse-effect"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "46%",
                        height: "100%",
                        overflow: "hidden",
                        pointerEvents: "none",
                        filter: "blur(10px)",
                        borderRadius: "50%",
                      }}
                    >
                      <div
                        style={{
                          width: "70%",
                          height: "100%",
                          background: "#00ffb7",
                          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
                          transform: "translateY(-50%)",
                          filter: "blur(30px)",
                        }}
                      />
                    </motion.div>
                  )}
                  {!state.nekoState.canClick && timer && (
                    <motion.div
                      className="timer-overlay"
                      style={{
                        position: "absolute",
                        top: "75%",
                        left: "23%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        background: "rgba(0,0,0,0.7)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        pointerEvents: "none",
                        zIndex: 999999,
                      }}
                    >
                      {timer}
                    </motion.div>
                  )}
                </motion.div>
              )}
              {userShelf.flag?.shelf_link && (
                <img
                  className="shelf-flag"
                  src={userShelf.flag.shelf_link}
                  alt="flag"
                />
              )}
            </div>
          </>
        )}
        {result && (
          <div
            style={{
              position: "fixed",
              width: "100vw",
              height: "100vh",
              left: 0,
              top: 0,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgb(0 0 0 / 45%)",
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                borderRadius: "15px",
                textAlign: "center",
                zIndex: 10000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "auto",
                padding: "20px",
                position: "relative",
              }}
            >
              <h2
                style={{
                  fontFamily: "Oswald",
                  color: "#fff",
                  marginBottom: "11px",
                  textTransform: "uppercase",
                }}
              >
                {translations.neko[lang]}
              </h2>
              <motion.div
                initial="initial"
                animate={"final"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={Assets.Icons.shittonsmoney}
                  alt={"coins"}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "10px",
                    border: "2px solid #ff7700",
                    background:
                      "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21) 2px, rgba(57, 57, 57, 0.06) 2px, rgba(57, 57, 57, 0.06) 6px) rgba(0, 0, 0, 0.51)",
                  }}
                />
                <p
                  style={{
                    fontFamily: "Oswald",
                    color: "#fff",
                    fontSize: "28px",
                    margin: "15px 0",
                  }}
                >
                  {result} {translations.coins[lang]}
                </p>
                <p
                  style={{
                    fontFamily: "Oswald",
                    color: "#fff",
                    fontSize: "14px",
                    marginBottom: 24,
                  }}
                >
                  {translations[`boostToOwner${ownersBoost}`][lang]}
                </p>
              </motion.div>
              <Button
                onClick={() => {
                  setResult(null)
                }}
                style={{}}
                text={"OK"}
                height={25}
                width={75}
                active={true}
                color={"white"}
                fontFamily={"Oswald"}
              />
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  )
}

export default ForeignHome
