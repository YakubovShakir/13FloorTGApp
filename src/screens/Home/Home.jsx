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
import { getUserActiveProcess } from "../../api/user"
import UserContext from "../../UserContext"

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
  const { userId, appReady } = useContext(UserContext)
  useEffect(() => {
    useTelegram.hideBackButton()

    if (appReady) {
      getUserActiveProcess(userId)
        .then(process => {
          console.log(process)
          setCurrentProcess(process)
          useTelegram?.setReady()
        })
      // Здесь получаем активный процесс при первой загрузке
    }
  }, [])

  if(currentProcess === null) {
    return (
      <div className="Home" style={{ background: `url(${Assets.BG.homeBackground})`, backgroundSize: 'cover' }}>
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

  if (currentProcess?.type === "training") {
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
          value={currentProcess.duration}
          max={currentProcess.duration}
          reverse
          rate={"20m/c"}
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
        <ProcessProgressBar activeProcess={currentProcess.type} rate={"20/с"} />
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
