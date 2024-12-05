import React, { useEffect, useState, useContext } from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Window from "../../components/complex/Windows/Window/Window"
import InventoryCell from "../../components/simple/InventoryCell/InventoryCell"
import Assets from "../../assets/index"
import useTelegram from "../../hooks/useTelegram"
import ProcessProgressBar from "../../components/simple/ProcessProgressBar/ProcessProgressBar"
import {
  getTrainingParameters,
  getUserActiveProcess,
} from "../../services/user/user"
import UserContext from "../../UserContext"
import countPercentage from "../../utils/countPercentage"
import { updateProcessTimers } from "../../utils/updateTimers"
import { getLevels } from "../../services/levels/levels"
const getBgByCurrentProcess = (processType) => {
  const { BG } = Assets
  const typeToBgMap = {
    work: BG.workScreenBG,
    sleep: BG.sleepScreenBG,
    training: BG.trainScreenBG,
  }

  const bg = typeToBgMap[processType]

  return `url(${bg || BG.homeBackground})`
}

const Home = () => {
  const { Icons, BG } = Assets
  const [currentWindow, setCurrentWindow] = useState(null)
  const [currentProcess, setCurrentProcess] = useState(null)
  const [visibleWindow, setVisibleWindow] = useState(false)
  const [inventoryEdit, setInventoryEdit] = useState(false)
  const [trainingParamters, setTrainingParameters] = useState(null)
  const [levels, setLevels] = useState(null)

  const { userId, userParameters, appReady } = useContext(UserContext)

  const getUserSleepDuration = () => {
    const duration = levels?.find(
      (level) => level?.level === userParameters?.level
    )?.sleep_duration
    console.log(
      duration,
      "leel",
      currentProcess?.duration,
      currentProcess?.seconds
    )
    return duration
  }
  useEffect(() => {
    useTelegram.hideBackButton()

    if (appReady) {
      getUserActiveProcess(userId).then((process) => {
        setCurrentProcess(process)
        useTelegram?.setReady()
      })
      getTrainingParameters(userId).then((r) => setTrainingParameters(r)) // Get user training parameters
      getLevels().then((levels) => setLevels(levels))
      // Здесь получаем активный процесс при первой загрузке
    }
  }, [])
  useEffect(() => {
    if (currentProcess?.active) {
      console.log(currentProcess)
      const updater = updateProcessTimers(currentProcess, setCurrentProcess)
      return () => clearInterval(updater)
    }
  }, [currentProcess])

  if (currentProcess === null) {
    return (
      <div
        className="Home"
        style={{
          background: `url(${Assets.BG.homeBackground})`,
          backgroundSize: "cover",
        }}
      >
        <HomeHeader
          onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
        />
        <Player width="40%" left={"9%"} top={"35%"} />
        {!currentProcess && (
          <img className="HomePatImg" src={Icons.accessory.patCat} alt="Pat" />
        )}

        <Menu />
        {!currentProcess && (
          <div className="HomeInventory">
            <div className="HomeInventoryHigh">
              <InventoryCell
                active={inventoryEdit}
                aspectRatio={"1"}
                width={"30%"}
                icon={Icons.accessory.flowerPot}
              />
              <InventoryCell
                active={inventoryEdit}
                aspectRatio={"1"}
                width={"30%"}
              />
              <InventoryCell
                active={inventoryEdit}
                aspectRatio={"1"}
                width={"30%"}
                icon={Icons.accessory.framedPhoto}
              />
              <InventoryCell
                active={inventoryEdit}
                aspectRatio={"1"}
                width={"30%"}
              />
              <InventoryCell
                active={inventoryEdit}
                aspectRatio={"1"}
                width={"30%"}
                icon={Icons.accessory.flowerVase}
              />
              <InventoryCell
                active={inventoryEdit}
                aspectRatio={"1"}
                width={"30%"}
              />
            </div>
            <div className="HomeInventoryBottom">
              <InventoryCell
                active={inventoryEdit}
                aspectRatio={"0.6"}
                width={"46%"}
              />

              <InventoryCell
                active={inventoryEdit}
                aspectRatio={"0.6"}
                width={"46%"}
                icon={Icons.accessory.goldenCat}
              />
            </div>
          </div>
        )}
        {visibleWindow && (
          <Window
            title={currentWindow.title}
            data={currentWindow.data}
            tabs={currentWindow.tabs}
            onClose={setVisibleWindow}
          />
        )}
        {/* 
      <HomeHeader/> 
      <Player/>
      <PlayerProcessBar/>
      <BottomMenu/>
          */}
      </div>
    )
  }

  if (currentProcess?.type === "work") {
    return (
      <div
        className="Home"
        style={{ backgroundImage: getBgByCurrentProcess(currentProcess.type) }}
      >
        <HomeHeader
          onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
        />
        <Player width="43%" left={"9%"} top={"34%"} />
        <ProcessProgressBar activeProcess={currentProcess.type} />
        <Menu />
        {visibleWindow && (
          <Window
            title={currentWindow.title}
            data={currentWindow.data}
            tabs={currentWindow.tabs}
            onClose={setVisibleWindow}
          />
        )}
      </div>
    )
  }

  if (currentProcess?.type === "training" && trainingParamters) {
    return (
      <div
        className="Home"
        style={{ backgroundImage: getBgByCurrentProcess(currentProcess.type) }}
      >
        <HomeHeader
          onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
        />
        <Player width="40%" left={"9%"} top={"35%"} />
        <ProcessProgressBar
          activeProcess={currentProcess.type}
          inputPercentage={countPercentage(
            currentProcess?.duration * 60 + currentProcess?.seconds,
            trainingParamters?.duration * 60
          )}
          rate={trainingParamters?.mood_profit}
        />
        <Menu />
        {visibleWindow && (
          <Window
            title={currentWindow.title}
            data={currentWindow.data}
            tabs={currentWindow.tabs}
            onClose={setVisibleWindow}
          />
        )}
      </div>
    )
  }

  if (currentProcess?.type === "sleep") {
    return (
      <div
        className="Home"
        style={{ backgroundImage: getBgByCurrentProcess(currentProcess.type) }}
      >
        <HomeHeader
          onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
        />
        <Player width="80%" left={"9%"} top={"45%"} />
        <img
          src={Assets.Layers.cover}
          style={{
            position: "absolute",
            width: "100%",
            height: "110%",
            bottom: 0,
            zIndex: 2,
          }}
        />
        {/* проп reverse отвечает на направление прогресс-бара */}
        <ProcessProgressBar
          inputPercentage={countPercentage(
            (currentProcess?.duration * 60 + currentProcess?.seconds) ,
              getUserSleepDuration() *
              60
          )}
          activeProcess={currentProcess.type}
          rate={"Full Recovery Energy"}
        />
        <Menu />
        {visibleWindow && (
          <Window
            title={currentWindow.title}
            data={currentWindow.data}
            tabs={currentWindow.tabs}
            onClose={setVisibleWindow}
          />
        )}
      </div>
    )
  }
}
export default Home
