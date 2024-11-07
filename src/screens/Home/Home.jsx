import React, { useEffect, useState } from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Window from "../../components/complex/Windows/Window/Window"
import WelcomeModal from "../../components/complex/Modals/WelcomeModal/WelcomeModal"
import InventoryCell from "../../components/simple/InventoryCell/InventoryCell"
import Assets from "../../assets/index"
import useTelegram from "../../hooks/useTelegram"
const Home = () => {
  const { Icons, BG } = Assets
  const [currentWindow, setCurrentWindow] = useState(null)
  const [visibleWindow, setVisibleWindow] = useState(false)
  const [visibleWelcomeModal, setVisibleWelcomeModal] = useState(false)
  const [inventoryEdit, setInventoryEdit] = useState(true)
  
  useEffect(()=> useTelegram.hideBackButton(), [])
  return (
    <div
      className="Home"
      style={{ backgroundImage: `url(${BG.homeBackground})` }}
    >
      {visibleWelcomeModal && (
        <WelcomeModal onClose={() => setVisibleWelcomeModal(false)} />
      )}
      <HomeHeader
        onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
      />
      <Player width="40%" left={"9%"} top={"30%"} />
      <img className="HomePatImg" src={Icons.accessory.patCat}  alt="Pat" />
      
     
      <Menu screenMenu/>
      <div className="HomeInventory">
        <div className="HomeInventoryHigh">
          <InventoryCell active={inventoryEdit} aspectRatio={"1"} width={"30%"} icon={Icons.accessory.flowerPot} />
          <InventoryCell active={inventoryEdit} aspectRatio={"1"} width={"30%"} />
          <InventoryCell active={inventoryEdit} aspectRatio={"1"} width={"30%"} icon={Icons.accessory.framedPhoto}/>
          <InventoryCell active={inventoryEdit} aspectRatio={"1"} width={"30%"}  />
          <InventoryCell active={inventoryEdit} aspectRatio={"1"} width={"30%"}icon={Icons.accessory.flowerVase} />
          <InventoryCell active={inventoryEdit} aspectRatio={"1"} width={"30%"} />
        </div>
        <div className="HomeInventoryBottom">
          <InventoryCell active={inventoryEdit} aspectRatio={"0.6"} width={"46%"} />

          <InventoryCell active={inventoryEdit} aspectRatio={"0.6"} width={"46%"} icon={Icons.accessory.goldenCat} />
        </div>
      </div>
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
export default Home
