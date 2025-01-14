import React, { useEffect, useState, useContext } from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Window from "../../components/complex/Windows/Window/Window"
import Assets from "../../assets/index"
import useTelegram from "../../hooks/useTelegram"
import ProcessProgressBar from "../../components/simple/ProcessProgressBar/ProcessProgressBar"
import {
  getParameters,
  getTrainingParameters,
  getUserActiveProcess,
} from "../../services/user/user"
import { stopProcess } from '../../services/process/process'
import UserContext from "../../UserContext"
import countPercentage from "../../utils/countPercentage"
import { updateProcessTimers } from "../../utils/updateTimers"
import { getLevels } from "../../services/levels/levels"
import { motion } from 'framer-motion'
import { useNavigate } from "react-router-dom"

export const FullScreenSpinner = ({ color = "#f37500", size = 70 }) => {
  const backgroundFrames = Array.from({ length: 60 }, (_, i) => {
    const opacity = (i + 1) / 60;
    return `#000000, ${opacity})`;
  });

  return (
    <motion.div
      initial={{ opacity: 0, backgroundColor: "transparent" }}
      animate={{ opacity: 1, backgroundColor: backgroundFrames }}
      transition={{ duration: 1, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          rotate: 360,
          scale: [0.7, 1, 0.7],
          opacity: 1
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
        style={{
          width: size,
          height: size,
          border: `5px solid ${color}`,
          borderTop: `5px solid transparent`,
          borderRadius: '50%',
        }}
      />
    </motion.div>
  );
};

const getBgByCurrentProcess = (processType) => {
  const { BG } = Assets
  const typeToBgMap = {
    'work': BG.workScreenBG,
    'sleep': BG.sleepScreenBG,
    'training': BG.trainScreenBG
  }

  const bg = typeToBgMap[processType]
  return `url(${bg || BG.homeBackground})`
}

const Home = () => {
  const navigate = useNavigate()
  const { Icons, BG } = Assets
  const [currentWindow, setCurrentWindow] = useState(null)
  const [currentProcess, setCurrentProcess] = useState(null)
  const [visibleWindow, setVisibleWindow] = useState(false)
  const [visibleSettingsModal, setVisibleSettingsModal] = useState(false)
  const [trainingParamters, setTrainingParameters] = useState(null)
  const [levels, setLevels] = useState(null)
  const [isStoppingProcess, setIsStoppingProcess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { userId, userParameters, appReady, userPersonage, userClothing, fetchParams, setUserParameters, userShelf } = useContext(UserContext)

  const getUserSleepDuration = () => {
    const duration = levels?.find(
      (level) => level?.level === userParameters?.level
    )?.sleep_duration
    return duration
  }

  useEffect(() => {
    useTelegram.hideBackButton()

    fetchParams().then(() => {
      console.log("Fetching from home")
    })

    const preloadImages = async () => {
      const imageUrls = [
        Assets.Layers.cover,
        Assets.BG.workScreenBG,
        Assets.BG.sleepScreenBG,
        Assets.BG.trainScreenBG,
        Assets.BG.homeBackground,
        Assets.HOME.shelf,
        Assets.HOME.couch,
        Assets.BG.backgroundSun
      ];

      await Promise.all(imageUrls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
      }));
    };

    preloadImages();
  }, [])

  useEffect(() => {
    if (currentProcess?.active) {
      const updateParametersFunction = async () => {
        const parameters = await getParameters(userId)
        setUserParameters(parameters.parameters)
      }

      const updater = updateProcessTimers(currentProcess, setCurrentProcess, currentProcess?.type === "work", updateParametersFunction)
      return () => clearInterval(updater)
    }
  }, [currentProcess])

  useEffect(() => {
    const initializeHome = async () => {
      if (appReady) {
        if (!userPersonage || JSON.stringify(userPersonage) === '{}') {
          navigate('/personage-create')
          return
        }

        try {
          const process = await getUserActiveProcess(userId)
          if (isStoppingProcess && !process) {
            setIsStoppingProcess(false)
            navigate('/')
            return
          }
          setCurrentProcess(process)
          useTelegram?.setReady()

          const trainingParams = await getTrainingParameters(userId)
          setTrainingParameters(trainingParams)

          const levelsData = await getLevels()
          setLevels(levelsData)
        } catch (error) {
          console.error('Error initializing home:', error)
          setIsStoppingProcess(false)
        }
      }
    }

    initializeHome()
    
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }, [appReady, isStoppingProcess])

  const handleProcessStop = async () => {
    try {
      setIsStoppingProcess(true)
      await stopProcess(userId)
      await fetchParams()
      setCurrentProcess(null)
      navigate('/')
    } catch (error) {
      console.error('Error stopping process:', error)
      setIsStoppingProcess(false)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, type: "tween" }
    },
    out: {
      opacity: 0,
      scale: 1.05,
      transition: { duration: 0.3, type: "tween" }
    }
  }

  const renderProcessProgressBar = (process, percentage, rate, reverse = false) => (
    <ProcessProgressBar
      activeProcess={process}
      inputPercentage={percentage}
      rate={rate}
      reverse={reverse}
      onProcessStop={handleProcessStop}
    />
  )
  
  const renderScene = (content) => (
    <motion.div
      className="Home"
      key={currentProcess?.type || 'default'}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <motion.div
        style={{   
          filter: 'blur(1px)',
          position: 'absolute',
          height: '53%',
          width: '53%',
          backgroundImage: `url(${Assets.BG.winter})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
          zIndex: 0,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          backgroundImage: currentProcess?.type
            ? getBgByCurrentProcess(currentProcess.type)
            : `url(${Assets.BG.homeBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "bottom right",
          zIndex: 0,
        }}
      />
      {content}
    </motion.div>
  );

  if (isLoading) {
    return <FullScreenSpinner />
  }

  if (currentProcess === null) {
    return renderScene(
      <>
        <HomeHeader
          onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
        />
        <img className="shelf1" src={Assets.HOME.shelf} alt="shelf1" />
        <img className="shelf2" src={Assets.HOME.shelf} alt="shelf2" />
        <img className="couch" src={Assets.HOME.couch} alt="couch" />
        <div style={{ position: 'absolute', zIndex: 2 }}>
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
        {!currentProcess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="HomeInventory"
          >
            {userShelf && (
              <>
                <div className="shelf-container1">
                  <img className="shelf-flower" src={userShelf.flower?.shelf_link} alt="flower" />
                  <img className="shelf-award" src={userShelf.award?.shelf_link} alt="award" />
                  <img className="shelf-event" src={userShelf.event?.shelf_link} alt="event" />
                </div>
                <div className="shelf-container2">
                  <img className="shelf-neko" src={userShelf.neko?.shelf_link} alt="neko" />
                  <img className="shelf-flag" src={userShelf.flag?.shelf_link} alt="flag" />
                </div>
              </>
            )}
          </motion.div>
        )}
        {visibleWindow && (
          <Window
            title={currentWindow.title}
            data={currentWindow.data}
            tabs={currentWindow.tabs}
            onClose={setVisibleWindow}
          />
        )}
      </>
    )
  }

  if (currentProcess?.type === "work") {
    return renderScene(
      <>
        <HomeHeader
          onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
        />
        <Player
          bottom="calc(-1vh + 141px)"
          width="37vw"
          left={"9vw"}
          top={"35vh"}
          personage={userPersonage}
          clothing={userClothing}
        />
        {renderProcessProgressBar(
          currentProcess,
          countPercentage(currentProcess?.seconds, 60),
          undefined,
          true
        )}
        <Menu noButton/>
        {visibleWindow && (
          <Window
            title={currentWindow.title}
            data={currentWindow.data}
            tabs={currentWindow.tabs}
            onClose={setVisibleWindow}
          />
        )}
      </>
    )
  }

  if (currentProcess?.type === "training") {
    return renderScene(
      <>
        <HomeHeader
          onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
        />
        <Player
          bottom="calc(-1vh + 141px)"
          width="37vw"
          left={"9vw"}
          top={"35vh"}
          personage={userPersonage}
          clothing={userClothing}
        />
        {renderProcessProgressBar(
          currentProcess,
          countPercentage(
            currentProcess?.duration * 60 + currentProcess?.seconds,
            trainingParamters?.duration * 60
          ),
          trainingParamters?.mood_profit
        )}
        <Menu noButton/>
        {visibleWindow && (
          <Window
            title={currentWindow.title}
            data={currentWindow.data}
            tabs={currentWindow.tabs}
            onClose={setVisibleWindow}
          />
        )}
      </>
    )
  }

  if (currentProcess?.type === "sleep") {
    return renderScene(
      <>
        <HomeHeader
          onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
        />
        <Player
          bottom={"calc(-71vh + 50px)"}
          width="81vw"
          left={"5vw"}
          top={"55vmax"}
          personage={userPersonage}
          clothing={userClothing}
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
          currentProcess,
          countPercentage(
            (currentProcess?.duration * 60 + currentProcess?.seconds),
            getUserSleepDuration() * 60
          ),
          "Time"
        )}
        <Menu noButton/>
        {visibleWindow && (
          <Window
            title={currentWindow.title}
            data={currentWindow.data}
            tabs={currentWindow.tabs}
            onClose={setVisibleWindow}
          />
        )}
      </>
    )
  }
}

export default Home