import React, { useEffect, useState, useContext } from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import ProcessProgressBar from "../../components/simple/ProcessProgressBar/ProcessProgressBar"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Window from "../../components/complex/Windows/Window/Window"
import Assets from "../../assets/index"
import {
  getTrainingParameters,
  getUserActiveProcess,
} from "../../services/user/user"
import UserContext from "../../UserContext"
import countPercentage from "../../utils/countPercentage"
import { getLevels } from "../../services/levels/levels"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import FullScreenSpinner from "./FullScreenSpinner"
import getBgByCurrentProcess from "./getBgByCurrentProcess"

const Home = () => {
  const navigate = useNavigate()
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

  // Combine all loading states into one
  const [isLoading, setIsLoading] = useState(true)

  const {
    userId,
    userParameters,
    isInitialized,
    userPersonage,
    userClothing,
    fetchParams,
    setUserParameters,
    userShelf,
  } = useContext(UserContext)

  const getUserSleepDuration = () => {
    const duration = state.levels?.find(
      (level) => level?.level === userParameters?.level
    )?.sleep_duration
    return duration
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
      const process = await getUserActiveProcess(userId)
      
      if (!process) {
        setState(prev => ({ ...prev, currentProcess: null }))
        return
      }

      const [trainingParams, levelsData] = await Promise.all([
        getTrainingParameters(userId),
        getLevels()
      ])
      
      setState(prev => ({
        ...prev,
        currentProcess: process,
        trainingParameters: trainingParams,
        levels: levelsData
      }))
    } catch (error) {
      console.error("Error initializing process:", error)
      setState(prev => ({ ...prev, currentProcess: null }))
    }
  }

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
          fetchParams(),
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
  }, [isInitialized, userPersonage, userId])

  // Early return for loading state
  if (isLoading) {
    return <FullScreenSpinner />
  }

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
    />
  )

  const renderScene = (content) => (
    <AnimatePresence mode="wait">
      <motion.div
        className="Home"
        key={state.currentProcess?.type || "default"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
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
            backgroundImage: state.currentProcess?.type
              ? getBgByCurrentProcess(state.currentProcess.type)
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

  
  if (!isInitialized) {
    return <FullScreenSpinner />
  } else {
    if (state.currentProcess === null) {
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
              width="37vw"
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
              onClose={() => setState(prev => ({...prev, visibleWindow: false}))}
            />
          )}
        </>
      )
    }
  
    // if (currentProcess?.type === "work") {
    //   return renderScene(
    //     <>
    //       <HomeHeader
    //         onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
    //       />
    //       <Player
    //         bottom="calc(-1vh + 141px)"
    //         width="37vw"
    //         left={"9vw"}
    //         top={"35vh"}
    //         personage={userPersonage}
    //         clothing={userClothing}
    //       />
    //       {renderProcessProgressBar(
    //         currentProcess,
    //         countPercentage(currentProcess?.seconds, 60),
    //         undefined,
    //         true
    //       )}
    //       <Menu noButton />
    //       {visibleWindow && (
    //         <Window
    //           title={currentWindow.title}
    //           data={currentWindow.data}
    //           tabs={currentWindow.tabs}
    //           onClose={setVisibleWindow}
    //         />
    //       )}
    //     </>
    //   )
    // }
  
    // if (currentProcess?.type === "training") {
    //   return renderScene(
    //     <>
    //       <HomeHeader
    //         onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
    //       />
    //       <Player
    //         bottom="calc(-1vh + 141px)"
    //         width="37vw"
    //         left={"9vw"}
    //         top={"35vh"}
    //         personage={userPersonage}
    //         clothing={userClothing}
    //       />
    //       {renderProcessProgressBar(
    //         currentProcess,
    //         countPercentage(
    //           currentProcess?.duration * 60 + currentProcess?.seconds,
    //           trainingParamters?.duration * 60
    //         ),
    //         trainingParamters?.mood_profit
    //       )}
    //       <Menu noButton />
    //       {visibleWindow && (
    //         <Window
    //           title={currentWindow.title}
    //           data={currentWindow.data}
    //           tabs={currentWindow.tabs}
    //           onClose={setVisibleWindow}
    //         />
    //       )}
    //     </>
    //   )
    // }
  
    // if (currentProcess?.type === "sleep") {
    //   return renderScene(
    //     <>
    //       <HomeHeader
    //         onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
    //       />
    //       <Player
    //         bottom={"calc(-71vh + 50px)"}
    //         width="81vw"
    //         left={"5vw"}
    //         top={"55vmax"}
    //         personage={userPersonage}
    //         clothing={userClothing}
    //       />
    //       <motion.img
    //         src={Assets.Layers.cover}
    //         initial={{ opacity: 0 }}
    //         animate={{ opacity: 1 }}
    //         transition={{ duration: 0.3 }}
    //         style={{
    //           position: "absolute",
    //           width: "100%",
    //           height: "100%",
    //           bottom: 0,
    //           zIndex: 0,
    //         }}
    //         alt="cover"
    //       />
    //       {renderProcessProgressBar(
    //         currentProcess,
    //         countPercentage(
    //           currentProcess?.duration * 60 + currentProcess?.seconds,
    //           getUserSleepDuration() * 60
    //         ),
    //         "Time"
    //       )}
    //       <Menu noButton />
    //       {visibleWindow && (
    //         <Window
    //           title={currentWindow.title}
    //           data={currentWindow.data}
    //           tabs={currentWindow.tabs}
    //           onClose={setVisibleWindow}
    //         />
    //       )}
    //     </>
    //   )
    // }
  }
}

export default Home
