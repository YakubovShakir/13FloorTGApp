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
import { useNotification } from "../../NotificationContext"
import { useSettingsProvider } from "../../hooks"
import { checkCanStop, stopProcess } from "../../services/process/process"
import { canStartSleeping, canStartTraining, canStartWorking } from "../../utils/paramDep"

// Pre-load audio files
const COIN_SOUND = new Audio(
  "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/coin.mp3"
)
const ALARM_SOUND = new Audio(
  "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/alarm.mp3"
)

// Ensure audio files are loaded
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
  })

  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0) // For image loading progress

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
      Assets.BG.winter, // Ensure Assets.BG.winter is here
    ]

    const imagePromises = imageUrls.map((url, index) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        const imageName = url.split("/").pop() // Extract image name for logging

        console.log(`[Preload Image] Start loading: ${imageName}`) // LOG - Start loading

        img.onload = () => {
          setLoadingProgress((prevProgress) => {
            const newProgress = prevProgress + 100 / imageUrls.length
            return newProgress
          })
          console.log(`[Preload Image] Loaded successfully: ${imageName}`) // LOG - Loaded success
          resolve()
        }
        img.onerror = () => {
          console.error(`[Preload Image] Failed to load: ${imageName}`) // LOG - Load failed
          setLoadingProgress((prevProgress) => {
            const newProgress = prevProgress + 100 / imageUrls.length
            return newProgress
          })
          resolve() // Resolve even on error
        }
        img.src = url
        console.log(`[Preload Image] Set src for: ${imageName} to ${url}`) // LOG - Set src
      })
    })

    return Promise.all(imagePromises)
  }, [])

  const calculateInitialTime = useCallback((process) => {
    if (!process?.createdAt) return null;

    const moscowNow = moment().tz("Europe/Moscow");
    const processStart = moment(process.createdAt).tz("Europe/Moscow");
    const elapsedSeconds = moscowNow.diff(processStart, "seconds");
    
    const totalSeconds = process.target_duration_in_seconds || 
                        process.base_duration_in_seconds;
    
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    
    return formatTime(
      Math.floor(remainingSeconds / 60),
      remainingSeconds % 60
    );
  }, []);

  const initializeProcess = useCallback(async () => {
    console.log("initializeProcess - Start")
    try {
      if (!mountedRef.current) return

      const process = await getUserActiveProcess(userId)
      console.log("initializeProcess - getUserActiveProcess result:", process)

      if (!mountedRef.current) return

      if (!process) {
        console.log("initializeProcess - No active process found")
        setState((prev) => ({ ...prev, currentProcess: null }))
        setProgressRate(null)
        return
      }

      const [trainingParams, levelsData] = await Promise.all([
        getTrainingParameters(userId),
        getLevels(),
      ])

      if (!mountedRef.current) return

      const initialTime = calculateInitialTime(process);
      setProgressRate(initialTime);

      setState((prev) => ({
        ...prev,
        currentProcess: {
          ...process,
          formattedTime: initialTime,
        },
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

  const canContinue = (processType) => {
    if(processType === 'training') {
      return canStartTraining(userParameters) && userParameters?.mood < 100
    }

    if(processType === 'work') {
      return canStartWorking(userParameters)
    }

    if(processType === 'sleep') {
      return canStartSleeping(userParameters)
    }
  }

  useEffect(() => {
    let timerInterval
    let driftCorrectionInterval

    const isActive = state.currentProcess?.active
    const currentProcessCreatedAt = state.currentProcess?.createdAt
    const processId = state.currentProcess?.id

    const updateTimer = (displayTime) => {
      const processStart = moment(currentProcessCreatedAt).tz("Europe/Moscow")
      const elapsedSeconds = displayTime.diff(processStart, "seconds")
      
      const totalSeconds = state.currentProcess.target_duration_in_seconds ||
                          state.currentProcess.base_duration_in_seconds
      
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
      
      const formattedTime = formatTime(
        Math.floor(remainingSeconds / 60),
        remainingSeconds % 60
      )

      setProgressRate(formattedTime)

      if (remainingSeconds === 0 || !canContinue(state.currentProcess?.type)) {
        console.log("Timer useEffect - Process completed")
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
                formattedTime: formattedTime,
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
        // Get initial server time
        const serverTime = await getServerTime()
        if (!serverTime) {
          throw new Error("Failed to get server time")
        }

        let startTime = serverTime.tz("Europe/Moscow") // Base time from server
        let lastSyncTime = moment() // Time of last sync
        let accumulatedDrift = 0 // Track accumulated time drift
        let displayTime = startTime.clone() // Time used for display/calculations

        // Initial update
        updateTimer(displayTime)

        // Regular timer updates
        timerInterval = setInterval(() => {
          const now = moment()
          const timeSinceLastSync = now.diff(lastSyncTime, "milliseconds")
          displayTime = startTime.clone().add(timeSinceLastSync + accumulatedDrift, "milliseconds")
          updateTimer(displayTime)
        }, 1000)

        // Periodic server sync (every 5 minutes)
        driftCorrectionInterval = setInterval(async () => {
          try {
            const newServerTime = await getServerTime()
            if (!newServerTime) return

            const newStartTime = newServerTime.tz("Europe/Moscow")
            const now = moment()
            
            // Calculate current drift
            const expectedTime = startTime.clone().add(now.diff(lastSyncTime))
            const currentDrift = newStartTime.diff(expectedTime)
            
            // Update tracking variables
            accumulatedDrift = currentDrift
            startTime = newStartTime
            lastSyncTime = now

            console.log(
              "Timer drift correction:",
              "currentDrift:", currentDrift,
              "accumulatedDrift:", accumulatedDrift
            )
          } catch (error) {
            console.error("Drift correction failed:", error)
          }
        }, 5 * 60 * 1000) // 5 minutes

      } catch (error) {
        console.error("Error initializing timer:", error)
        // Fallback to local time if server time fails
        const localTime = moment().tz("Europe/Moscow")
        updateTimer(localTime)
        
        timerInterval = setInterval(() => {
          updateTimer(moment().tz("Europe/Moscow"))
        }, 1000)
      }
    }

    if (isActive && mountedRef.current && currentProcessCreatedAt) {
      initializeTimer()
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
      if (driftCorrectionInterval) {
        clearInterval(driftCorrectionInterval)
      }
      console.log("Timer useEffect - Cleanup - intervals cleared")
    }
  }, [
    state.currentProcess?.active,
    state.currentProcess?.createdAt,
    state.currentProcess?.id,
  ])

  const completionInProgressRef = useRef(false)

  const handleConfirmClose = async () => {
    setIsLoading(true)
    try {
      await stopProcess(userId)
      setState((prev) => {
        return {
          ...prev,
          currentProcess: null,
        }
      })
      console.log("handleConfirmClose - Stopping process")
    } catch (error) {
      console.error("Error stopping process:", error)
    } finally {
      setIsLoading(false)
      console.log("handleConfirmClose - ended")
    }
  }

  const handleProcessCompletion = async () => {
    // Prevent multiple simultaneous executions
    if (completionInProgressRef.current) {
      console.log("Process completion already in progress, skipping")
      return
    }

    try {
      completionInProgressRef.current = true
      console.log("handleProcessCompletion - started")

      // try {
      //     await playSound(state.currentProcess?.type)
      // } catch (err) {
      //     console.error('Error playing sound:', err);
      // }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsLoading(true)

      // Wait for process to be stoppable
      while (true) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500))
          await checkCanStop(userId)
          break
        } catch (err) {
          console.log("checkCanStop error:", err)
          if (err.status === 404) {
            console.log("Process not found, breaking loop")
            break
          }
          const waitTime = err.response?.data?.seconds_left * 1000 || 1000
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }

      // Only proceed with cleanup if component is still mounted
      if (mountedRef.current) {
        setTimeout(() => {
          setIsLoading(false)
          setState((prevState) => ({ ...prevState, currentProcess: null }))
          refreshData()
        }, 750)
      }
    } finally {
      completionInProgressRef.current = false
      console.log("handleProcessCompletion - completed")
    }
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
          backgroundColor: isLoading ? "#f0f0f0" : "transparent", // Placeholder background
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
                backgroundImage: `url(${Assets.BG.winter})`, // Explicitly target winter background
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

  useEffect(() => {
    if (!isInitialized) return

    const initialize = async () => {
      setIsLoading(true)
      setLoadingProgress(0) // Reset progress at start
      console.log(
        "Home Initialize useEffect - Start - isInitialized:",
        isInitialized
      )

      if (JSON.stringify(userPersonage) === "{}") {
        navigate("/learning")
        return
      }

      try {
        await preloadImages() // Await image preloading first
        setState((prev) => ({ ...prev, imagesLoaded: true }))
        console.log("Home Initialize useEffect - Images preloaded")
        await initializeProcess() // Then initialize process
        console.log("Home Initialize useEffect - Process initialized")
      } catch (err) {
        console.error("Initialization error:", err)
      } finally {
        setIsLoading(false)
        console.log("Home Initialize useEffect - setIsLoading(false)")
      }
      console.log("Home Initialize useEffect - End")
    }

    initialize()
  }, [isInitialized, navigate, userPersonage, preloadImages, initializeProcess])

  const { refreshData } = useUser()

  // !REFOCUS
  useVisibilityChange(() => {
    console.log(
      "Visibility Change Hook - visibilityState:",
      document.visibilityState
    )
    if (mountedRef.current && document.visibilityState === "visible") {
      console.log(
        "Visibility Change Hook - document visible - calling initializeProcess"
      )
      refreshData()
      initializeProcess()
    } else {
      console.log(
        "Visibility Change Hook - document not visible, or component unmounted - NOT calling initializeProcess"
      )
    }
  })

  useWindowFocus(() => {
    console.log("Window Focus Hook - window focused")
    if (mountedRef.current) {
      console.log(
        "Window Focus Hook - window focused - calling initializeProcess"
      )
      refreshData()
      initializeProcess()
    } else {
      console.log(
        "Window Focus Hook - window not focused or component unmounted - NOT calling initializeProcess"
      )
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

  if (isLoading) {
    return <FullScreenSpinner progress={loadingProgress} /> // Show loading spinner with progress
  }

  if (!isInitialized) {
    return <FullScreenSpinner progress={loadingProgress} />
  } else {
    const homeContent = (
      <>
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
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }} // Smoother easeOut
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
                  <motion.img
                    layout
                    className="shelf-neko"
                    src={userShelf.neko.shelf_link}
                    alt="neko"
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
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
        <Player
          bottom={"calc(-468px )"}
          width="81vw"
          left={"5vw"}
          top={"55vmax"}
          personage={userPersonage}
          clothing={userClothing}
          sleep
        />
        <motion.img
          src={Assets.Layers.cover}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            bottom: 0,
            zIndex: 0,
          }}
          alt="cover"
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

    if (state.currentProcess?.type === "work") {
      return renderScene(workContent)
    }

    if (state.currentProcess?.type === "training") {
      return renderScene(trainingContent)
    }

    if (state.currentProcess?.type === "sleep") {
      return renderScene(sleepContent)
    }
  }
}

export default Home
