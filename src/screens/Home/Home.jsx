import React, { useEffect, useState, useContext, useRef } from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Window from "../../components/complex/Windows/Window/Window"
import Assets from "../../assets/index"
import ProcessProgressBar from "../../components/simple/ProcessProgressBar/ProcessProgressBar"
import {
  getParameters,
  getTrainingParameters,
  getUserActiveProcess,
} from "../../services/user/user"
import { stopProcess } from "../../services/process/process"
import UserContext, { useUser } from "../../UserContext"
import countPercentage from "../../utils/countPercentage"
import { updateProcessTimers } from "../../utils/updateTimers"
import { getLevels } from "../../services/levels/levels"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import FullScreenSpinner from "./FullScreenSpinner"
import getBgByCurrentProcess from "./getBgByCurrentProcess"
import moment from "moment-timezone"
import { useVisibilityChange, useWindowFocus } from "../../hooks/userActivities"
import formatTime from "../../utils/formatTime"


const Home = () => {
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
    imagesLoaded: false
  })

  const [isLoading, setIsLoading] = useState(true)

  const {
    userId,
    userParameters,
    isInitialized,
    userPersonage,
    userClothing,
    setUserParameters,
    userShelf,
  } = useContext(UserContext)

  const getUserSleepDuration = () => {
    const duration = state.levels?.find(
      (level) => level?.level === userParameters?.level
    )?.sleep_duration
    return duration
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const [progressRate, setProgressRate] = useState(null)


  const handleProcessStop = async () => {
    try {
      setState(prev => ({ ...prev, isStoppingProcess: true }))
      await stopProcess(userId)
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          currentProcess: null,
          isStoppingProcess: false
        }))
        navigate("/")
      }
    } catch (error) {
      console.error("Error stopping process:", error)
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isStoppingProcess: false }))
      }
    }
  }

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
      Assets.BG.winter
    ]

    return Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = resolve // Continue even if image fails to load
          img.src = url
        })
      })
    )
  }

  const initializeProcess = async () => {
    try {
      if (!mountedRef.current) return

      const process = await getUserActiveProcess(userId)

      // Important: Set current process to null first
      setState(prev => ({ ...prev, currentProcess: null }))

      // Wait a frame to ensure the null state is processed
      await new Promise(resolve => requestAnimationFrame(resolve))

      if (!mountedRef.current) return

      if (!process) {
        return
      }

      const [trainingParams, levelsData] = await Promise.all([
        getTrainingParameters(userId),
        getLevels()
      ])

      if (!mountedRef.current) return

      setState(prev => ({
        ...prev,
        currentProcess: process,
        trainingParameters: trainingParams,
        levels: levelsData
      }))
    } catch (error) {
      console.error("Error initializing process:", error)
      if (mountedRef.current) {
        setState(prev => ({ ...prev, currentProcess: null }))
      }
    }
  }

  const [processStartTime, setProcessStartTime] = useState(null); // Store the start time

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;  // Pad minutes
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds; // Pad seconds

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  useEffect(() => {
    let timerInterval;

    if (state.currentProcess?.active && mountedRef.current) {
      timerInterval = setInterval(() => {
        if (!mountedRef.current) return;

        const now = moment();
        const elapsedSeconds = now.diff(state.currentProcess.createdAt, 'seconds');
        console.log(processStartTime)
        const totalSeconds = state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds;
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

        const updatedProcess = {
          ...state.currentProcess,
          totalSecondsRemaining: remainingSeconds,
          formattedTime: formatTime(remainingSeconds),
          totalSeconds,
        };

        setProgressRate(updatedProcess.formattedTime); // Now this should work

        if (remainingSeconds <= 0) {
          clearInterval(timerInterval);
          // setState(prev => ({ ...prev, currentProcess: null }));
          // requestAnimationFrame(initializeProcess);
          // setProcessStartTime(null);
        } else {
          setState(prev => ({
            ...prev,
            currentProcess: updatedProcess
          }));
        }
      }, 1000);
    } else {
      clearInterval(timerInterval);
      setProcessStartTime(null);
      setProgressRate(null); // Reset progress when inactive
    }

    return () => clearInterval(timerInterval);
  }, [state.currentProcess?.active]);


  // Add a background transition effect
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
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
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            backgroundImage: state.currentProcess?.type
              ? getBgByCurrentProcess(state.currentProcess.type, state.currentProcess?.type_id)
              : `url(${Assets.BG.homeBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "bottom right",
            zIndex: 0,
          }}
        />
        {content}
      </motion.div>
    </AnimatePresence>
  )

  useEffect(() => {
    if (!isInitialized) return

    const initialize = async () => {
      setIsLoading(true)

      if (JSON.stringify(userPersonage) === "{}") {
        navigate("/learning")
        return
      }

      try {
        // Run all initialization tasks in parallel
        await Promise.all([
          initializeProcess(),
          preloadImages()
        ])

        setState(prev => ({ ...prev, imagesLoaded: true }))
      } catch (err) {
        console.error('Initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [isInitialized])

  const { refreshData } = useUser()

  useVisibilityChange(() => {
    console.log(document.visibilityState)
    if (mountedRef.current && document.visibilityState === 'visible') {
      refreshData()
      initializeProcess()
    }
  })

  useWindowFocus(() => {
    if (mountedRef.current) {
      refreshData()
      initializeProcess()
    }
  })

  const renderProcessProgressBar = (
    process,
    percentage,
    rate,
    reverse = false
  ) => (
    <ProcessProgressBar
      activeProcess={process}
      inputPercentage={percentage}
      rate={rate}
      reverse={reverse}
      onProcessStop={handleProcessStop}
      setIsLoading={setIsLoading}
    />
  )

  useEffect(() => {
    if (!isInitialized) return

    const initialize = async () => {
      if (JSON.stringify(userPersonage) === "{}") {
        navigate("/learning")
        return
      }

      try {
        await Promise.all([
          initializeProcess(),
          preloadImages()
        ])

        if (mountedRef.current) {
          setState(prev => ({ ...prev, imagesLoaded: true }))
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Initialization error:', err)
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    initialize()
  }, [])

  if (isLoading) {
    return <FullScreenSpinner />
  }

  if (!isInitialized) {
    return <FullScreenSpinner />
  } else {
    if (state?.currentProcess === null || state.currentProcess.type === 'skill' || state.currentProcess.type === 'food') {
      return renderScene(
        <>
          <HomeHeader
            onClick={() => setState(prev => ({
              ...prev,
              visibleSettingsModal: !prev.visibleSettingsModal
            }))}
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
                    <img
                      className="shelf-neko"
                      src={userShelf.neko.shelf_link}
                      alt="neko"
                    />
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
          </motion.div>
          {state.visibleWindow && (
            <Window
              title={state.currentWindow.title}
              data={state.currentWindow.data}
              tabs={state.currentWindow.tabs}
              onClose={() => setState(prev => ({ ...prev, visibleWindow: false }))}
            />
          )}
        </>
      )
    }

    if (state.currentProcess?.type === "work") {
      return renderScene(
        <>
          <HomeHeader
            onClick={() => setState(prev => ({
              ...prev,
              visibleSettingsModal: !prev.visibleSettingsModal
            }))}
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
          {renderProcessProgressBar(
            state.currentProcess,
            countPercentage(moment().diff(moment(state.currentProcess.createdAt), 'second'), state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds),
            progressRate,
            true
          )}
          <Menu noButton />
          {state.visibleWindow && (
            <Window
              title={state.currentWindow.title}
              data={state.currentWindow.data}
              tabs={state.currentWindow.tabs}
              onClose={() => setState(prev => ({ ...prev, visibleWindow: false }))}
            />
          )}
        </>
      )
    }

    if (state.currentProcess?.type === "training") {
      return renderScene(
        <>
          <HomeHeader
            onClick={() => setState(prev => ({
              ...prev,
              visibleSettingsModal: !prev.visibleSettingsModal
            }))}
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
              countPercentage(moment().diff(moment(state.currentProcess.createdAt), 'second'), state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds),
            ),
            progressRate
          )}
          <Menu noButton />
          {state.visibleWindow && (
            <Window
              title={state.currentWindow.title}
              data={state.currentWindow.data}
              tabs={state.currentWindow.tabs}
              onClose={() => setState(prev => ({ ...prev, visibleWindow: false }))}
            />
          )}
        </>
      )
    }

    if (state.currentProcess?.type === "sleep") {
      return renderScene(
        <>
          <HomeHeader
            onClick={() => setState(prev => ({
              ...prev,
              visibleSettingsModal: !prev.visibleSettingsModal
            }))}
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
            transition={{ duration: 0.3 }}
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
              state.currentProcess?.duration * 60 + state.currentProcess?.seconds,
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
              onClose={() => setState(prev => ({ ...prev, visibleWindow: false }))}
            />
          )}
        </>
      )
    }
  }
}

export default Home
