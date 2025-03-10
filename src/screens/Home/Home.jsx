import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Window from "../../components/complex/Windows/Window/Window"
import Assets from "../../assets/index"
import ProcessProgressBar from "../../components/simple/ProcessProgressBar/ProcessProgressBar"
import {
  getOwnNekoState,
  getServerTime,
  getTrainingParameters,
  getUserActiveProcess,
} from "../../services/user/user"
import UserContext, { useUser } from "../../UserContext"
import countPercentage from "../../utils/countPercentage"
import { getLevels } from "../../services/levels/levels"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import FullScreenSpinner from "./FullScreenSpinner"
import getBgByCurrentProcess from "./getBgByCurrentProcess"
import moment from "moment-timezone"
import { useVisibilityChange, useWindowFocus } from "../../hooks/userActivities"
import formatTime from "../../utils/formatTime"
import { checkCanStop, stopProcess } from "../../services/process/process"
import {
  canStartSleeping,
  canStartTraining,
  canStartWorking,
} from "../../utils/paramDep"
import GachaOverlay from "./Gacha"
import DailyCheckInOverlay from "./DailyCheckInOverlay"
import SleepGame from "./SleepGame"

// Mock API calls for neko
const mockGetNekoState = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const canClick = Math.random() > 0.5
      const cooldownUntil = canClick
        ? null
        : moment().tz("Europe/Moscow").add(2, "hours").valueOf()

      resolve({
        canClick,
        cooldownUntil,
      })
    }, 500)
  })
}

// Pre-load audio files
const COIN_SOUND = new Audio(
  "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/coin.mp3"
)
const ALARM_SOUND = new Audio(
  "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/alarm.mp3"
)

COIN_SOUND.load()
ALARM_SOUND.load()

const Home = () => {
  console.log("Home Component Rendered")

  const navigate = useNavigate()
  const mountedRef = useRef(false)

  const [state, setState] = useState({
    currentWindow: null,
    currentProcess: null,
    visibleWindow: false,
    visibleSettingsModal: false,
    trainingParameters: null,
    levels: null,
    isStoppingProcess: false,
    imagesLoaded: false,
    hasIconAnimated: true,
    nekoState: { canClick: false, cooldownUntil: null },
  })

  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [timer, setTimer] = useState(null)

  const {
    userId,
    userParameters,
    isInitialized,
    userPersonage,
    userClothing,
    userShelf,
  } = useContext(UserContext)

  const getUserSleepDuration = useCallback(() => {
    return state.levels?.find((level) => level?.level === userParameters?.level)
      ?.sleep_duration
  }, [state.levels, userParameters?.level])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const [progressRate, setProgressRate] = useState(null)

  const preloadImages = useCallback(async () => {
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

    const imagePromises = imageUrls.map((url, index) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          setLoadingProgress((prev) => prev + 100 / imageUrls.length)
          resolve()
        }
        img.onerror = () => {
          setLoadingProgress((prev) => prev + 100 / imageUrls.length)
          resolve()
        }
        img.src = url
      })
    })

    return Promise.all(imagePromises)
  }, [])

  const calculateInitialTime = useCallback((process) => {
    if (!process?.createdAt) return null
    const moscowNow = moment().tz("Europe/Moscow")
    const processStart = moment(process.createdAt).tz("Europe/Moscow")
    const elapsedSeconds = moscowNow.diff(processStart, "seconds")
    const totalSeconds =
      process.target_duration_in_seconds || process.base_duration_in_seconds
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
    return formatTime(Math.floor(remainingSeconds / 60), remainingSeconds % 60)
  }, [])

  const initializeProcess = useCallback(async () => {
    try {
      const process = await getUserActiveProcess(userId)
      if (!mountedRef.current) return

      if (!process) {
        setState((prev) => ({ ...prev, currentProcess: null }))
        setProgressRate(null)
        return
      }

      const [trainingParams, levelsData] = await Promise.all([
        getTrainingParameters(userId),
        getLevels(),
      ])

      if (!mountedRef.current) return

      const initialTime = calculateInitialTime(process)
      setProgressRate(initialTime)

      setState((prev) => ({
        ...prev,
        currentProcess: { ...process, formattedTime: initialTime },
        trainingParameters: trainingParams,
        levels: levelsData,
      }))
    } catch (error) {
      console.error("Error initializing process:", error)
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, currentProcess: null }))
        setProgressRate(null)
      }
    }
  }, [userId, calculateInitialTime])

  const fetchNekoState = async () => {
    try {
      const nekoData = await getOwnNekoState(userId)
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
      setLoadingProgress(0)
      try {
        await Promise.all([
          preloadImages(),
          initializeProcess(),
          fetchNekoState(),
        ])
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, imagesLoaded: true }))
        }
      } catch (err) {
        console.error("Initialization error:", err)
      } finally {
        if (mountedRef.current) setIsLoading(false)
      }
    }

    initialize()
  }, [isInitialized, navigate, userPersonage, preloadImages, initializeProcess])

  const canContinue = (processType) => {
    if (processType === "training")
      return canStartTraining(userParameters) && userParameters?.mood < 100
    if (processType === "work") return canStartWorking(userParameters)
    if (processType === "sleep") return canStartSleeping(userParameters)
  }

  useEffect(() => {
    let timerInterval, driftCorrectionInterval

    const isActive = state.currentProcess?.active
    const currentProcessCreatedAt = state.currentProcess?.createdAt
    const processId = state.currentProcess?.id

    const updateTimer = (displayTime) => {
      const processStart = moment(currentProcessCreatedAt).tz("Europe/Moscow")
      const elapsedSeconds = displayTime.diff(processStart, "seconds")
      const totalSeconds =
        state.currentProcess.target_duration_in_seconds ||
        state.currentProcess.base_duration_in_seconds
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
      const formattedTime = formatTime(
        Math.floor(remainingSeconds / 60),
        remainingSeconds % 60
      )

      setProgressRate(formattedTime)

      if (remainingSeconds === 0 || !canContinue(state.currentProcess?.type)) {
        handleProcessCompletion()
        clearInterval(timerInterval)
        clearInterval(driftCorrectionInterval)
      } else {
        setState((prev) => {
          if (prev.currentProcess?.id === processId) {
            return {
              ...prev,
              currentProcess: {
                ...prev.currentProcess,
                totalSecondsRemaining: remainingSeconds,
                formattedTime,
                totalSeconds,
              },
            }
          }
          return prev
        })
      }
    }

    const initializeTimer = async () => {
      try {
        const serverTime = await getServerTime()
        if (!serverTime) throw new Error("Failed to get server time")

        let startTime = serverTime.tz("Europe/Moscow")
        let lastSyncTime = moment()
        let accumulatedDrift = 0
        let displayTime = startTime.clone()

        updateTimer(displayTime)

        timerInterval = setInterval(() => {
          const now = moment()
          const timeSinceLastSync = now.diff(lastSyncTime, "milliseconds")
          displayTime = startTime
            .clone()
            .add(timeSinceLastSync + accumulatedDrift, "milliseconds")
          updateTimer(displayTime)
        }, 1000)

        driftCorrectionInterval = setInterval(async () => {
          try {
            const newServerTime = await getServerTime()
            if (!newServerTime) return

            const newStartTime = newServerTime.tz("Europe/Moscow")
            const now = moment()
            const expectedTime = startTime.clone().add(now.diff(lastSyncTime))
            const currentDrift = newStartTime.diff(expectedTime)

            accumulatedDrift = currentDrift
            startTime = newStartTime
            lastSyncTime = now
          } catch (error) {
            console.error("Drift correction failed:", error)
          }
        }, 5 * 60 * 1000)
      } catch (error) {
        console.error("Error initializing timer:", error)
        const localTime = moment().tz("Europe/Moscow")
        updateTimer(localTime)
        timerInterval = setInterval(
          () => updateTimer(moment().tz("Europe/Moscow")),
          1000
        )
      }
    }

    if (
      isActive &&
      mountedRef.current &&
      currentProcessCreatedAt &&
      state.currentProcess?.type !== "sleep"
    ) {
      initializeTimer()
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval)
      if (driftCorrectionInterval) clearInterval(driftCorrectionInterval)
    }
  }, [
    state.currentProcess?.active,
    state.currentProcess?.createdAt,
    state.currentProcess?.id,
    state.currentProcess?.type,
  ])

  const completionInProgressRef = useRef(false)

  const handleConfirmClose = async () => {
    setIsLoading(true)
    try {
      await stopProcess(userId)
      setState((prev) => ({ ...prev, currentProcess: null }))
    } catch (error) {
      console.error("Error stopping process:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessCompletion = async () => {
    if (completionInProgressRef.current) return
    completionInProgressRef.current = true

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(true)

      while (true) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500))
          await checkCanStop(userId)
          break
        } catch (err) {
          if (err.status === 404) break
          const waitTime = err.response?.data?.seconds_left * 1000 || 1000
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }

      if (mountedRef.current) {
        setTimeout(() => {
          setIsLoading(false)
          setState((prev) => ({ ...prev, currentProcess: null }))
          refreshData()
        }, 750)
      }
    } finally {
      completionInProgressRef.current = false
    }
  }

  const { refreshData } = useUser()

  useVisibilityChange(() => {
    if (mountedRef.current && document.visibilityState === "visible") {
      refreshData()
      initializeProcess()
      fetchNekoState()
    }
  })

  useWindowFocus(() => {
    if (mountedRef.current) {
      refreshData()
      initializeProcess()
      fetchNekoState()
    }
  })

  const renderProcessProgressBar = (
    process,
    percentage,
    rate,
    reverse = false
  ) => {
    return (
      <ProcessProgressBar
        activeProcess={process}
        rate={rate}
        reverse={reverse}
        handleConfirmClose={handleConfirmClose}
      />
    )
  }

  const renderScene = (content) => (
    <AnimatePresence mode="wait">
      <motion.div
        className="Home"
        key={state.currentProcess?.type || "default"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          backgroundColor: isLoading ? "#f0f0f0" : "transparent",
        }}
      >
        {state.imagesLoaded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                backgroundImage:
                  state.currentProcess?.type &&
                  state.currentProcess?.type !== "default" &&
                  state.currentProcess?.active
                    ? getBgByCurrentProcess(
                        state.currentProcess.type,
                        state.currentProcess?.type_id
                      )
                    : `url(${Assets.BG.homeBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "bottom right",
                zIndex: 0,
              }}
            />
          </>
        )}
        {content}
      </motion.div>
    </AnimatePresence>
  )

  if (isLoading) {
    return <FullScreenSpinner progress={loadingProgress} />
  }

  if (!isInitialized) {
    return <FullScreenSpinner progress={loadingProgress} />
  }

  const homeContent = (
    <>
      <GachaOverlay userId={userId} />
      <DailyCheckInOverlay />
      <HomeHeader
        onClick={() =>
          setState((prev) => ({
            ...prev,
            visibleSettingsModal: !prev.visibleSettingsModal,
          }))
        }
      />
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
      <Menu hasBg={false} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        className="HomeInventory"
      >
        {userShelf && (
          <>
            <div className="shelf-container1">
              {userShelf.flower?.shelf_link && (
                <motion.img
                  layout
                  className="shelf-flower"
                  src={userShelf.flower.shelf_link}
                  alt="flower"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
              {userShelf.award?.shelf_link && (
                <motion.img
                  layout
                  className="shelf-award"
                  src={userShelf.award.shelf_link}
                  alt="award"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
              {userShelf.event?.shelf_link && (
                <motion.img
                  layout
                  className="shelf-event"
                  src={userShelf.event.shelf_link}
                  alt="event"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
            </div>
            <div className="shelf-container2">
              {userShelf.neko?.shelf_link && (
                <motion.div
                  className="shelf-neko-container"
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
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
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
                        height: "100%", // Уменьшили высоту, так как теперь не нужно компенсировать маску
                        overflow: "hidden", // Обрезаем нижнюю часть для полукруга
                        pointerEvents: "none",
                        filter: "blur(10px)",
                        borderRadius: "50%",
                      }}
                    >
                      <div
                        style={{
                          width: "70%",
                          height: "100%", // Полный круг внутри контейнера
                          background: "#00ffb7", // Жёлтый цвет
                          borderRadius: "50% 50% 0 0 / 100% 100% 0 0", // Полукруг сверху
                          transform: "translateY(-50%)", // Сдвигаем вверх, чтобы видна была только верхняя половина
                          filter: "blur(30px)", // Размытие для всех краёв
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
                <motion.img
                  layout
                  className="shelf-flag"
                  src={userShelf.flag.shelf_link}
                  alt="flag"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
            </div>
          </>
        )}
      </motion.div>
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentWindow.data}
          tabs={state.currentWindow.tabs}
          onClose={() =>
            setState((prev) => ({ ...prev, visibleWindow: false }))
          }
        />
      )}
    </>
  )

  const workContent = (
    <>
      <HomeHeader
        onClick={() =>
          setState((prev) => ({
            ...prev,
            visibleSettingsModal: !prev.visibleSettingsModal,
          }))
        }
      />
      <Player
        bottom="calc(-1vh + 141px)"
        width="39vw"
        left={"9vw"}
        top={"35vh"}
        personage={userPersonage}
        clothing={userClothing}
        work
      />
      {state.currentProcess &&
        renderProcessProgressBar(
          state.currentProcess,
          countPercentage(
            moment()
              .tz("Europe/Moscow")
              .diff(
                moment(state.currentProcess?.createdAt).tz("Europe/Moscow"),
                "second"
              ),
            state.currentProcess?.target_duration_in_seconds ||
              state.currentProcess?.base_duration_in_seconds
          ),
          progressRate,
          true
        )}
      <Menu noButton />
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentWindow.data}
          tabs={state.currentWindow.tabs}
          onClose={() =>
            setState((prev) => ({ ...prev, visibleWindow: false }))
          }
        />
      )}
    </>
  )

  const trainingContent = (
    <>
      <HomeHeader
        onClick={() =>
          setState((prev) => ({
            ...prev,
            visibleSettingsModal: !prev.visibleSettingsModal,
          }))
        }
      />
      <Player
        bottom="calc(-1vh + 141px)"
        width="39vw"
        left={"9vw"}
        top={"35vh"}
        personage={userPersonage}
        clothing={userClothing}
        training
      />
      {renderProcessProgressBar(
        state.currentProcess,
        countPercentage(
          moment()
            .tz("Europe/Moscow")
            .diff(
              moment(state.currentProcess?.createdAt).tz("Europe/Moscow"),
              "second"
            ),
          state.currentProcess?.target_duration_in_seconds ||
            state.currentProcess?.base_duration_in_seconds
        ),
        progressRate
      )}
      <Menu noButton />
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentWindow.data}
          tabs={state.currentWindow.tabs}
          onClose={() =>
            setState((prev) => ({ ...prev, visibleWindow: false }))
          }
        />
      )}
    </>
  )

  const sleepContent = (
    <>
      <HomeHeader
        onClick={() =>
          setState((prev) => ({
            ...prev,
            visibleSettingsModal: !prev.visibleSettingsModal,
          }))
        }
      />
      {/* <div style={{ position: "relative", width: "100%", maxWidth: "374px", margin: "0 auto", top: "20vh" }}>
        <SleepGame
          sleepDuration={getUserSleepDuration() * 60} // In seconds
          onGameOver={(score, survivalTime) => {
            // Adjust sleep progress based on survival time
            const totalSleepSeconds = getUserSleepDuration() * 60;
            const survivalSeconds = survivalTime / 1000; // Convert to seconds
            const elapsedSeconds = moment()
              .tz("Europe/Moscow")
              .diff(moment(state.currentProcess?.createdAt).tz("Europe/Moscow"), "seconds");
            const remainingSeconds = Math.max(0, totalSleepSeconds - survivalSeconds - elapsedSeconds);

            if (remainingSeconds <= 0) {
              handleProcessCompletion();
            } else {
              setState((prev) => ({
                ...prev,
                currentProcess: {
                  ...prev.currentProcess,
                  totalSecondsRemaining: remainingSeconds,
                },
              }));
              setProgressRate(formatTime(Math.floor(remainingSeconds / 60), remainingSeconds % 60));
            }
          }}
        />
      </div> */}
      <Player
        bottom={"calc(-468px )"}
        width="81vw"
        left={"5vw"}
        top={"55vmax"}
        personage={userPersonage}
        clothing={userClothing}
        sleep
      />
      {renderProcessProgressBar(
        state.currentProcess,
        countPercentage(
          moment()
            .tz("Europe/Moscow")
            .diff(
              moment(state.currentProcess?.createdAt).tz("Europe/Moscow"),
              "second"
            ),
          getUserSleepDuration() * 60
        ),
        progressRate
      )}
      <Menu noButton />
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentWindow.data}
          tabs={state.currentWindow.tabs}
          onClose={() =>
            setState((prev) => ({ ...prev, visibleWindow: false }))
          }
        />
      )}
    </>
  )

  if (
    state?.currentProcess === null ||
    state.currentProcess.type === "skill" ||
    state.currentProcess.type === "food"
  ) {
    return renderScene(homeContent)
  }
  if (state.currentProcess?.type === "work") return renderScene(workContent)
  if (state.currentProcess?.type === "training")
    return renderScene(trainingContent)
  if (state.currentProcess?.type === "sleep") return renderScene(sleepContent)
}

export default Home
