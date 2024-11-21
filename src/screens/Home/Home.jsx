import React, { useEffect, useState } from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Window from "../../components/complex/Windows/Window/Window"
import InventoryCell from "../../components/simple/InventoryCell/InventoryCell"
import Assets from "../../assets/index"
import useTelegram from "../../hooks/useTelegram"
const Home = () => {
  const { Icons, BG } = Assets
  const [currentWindow, setCurrentWindow] = useState(null)
  const [visibleWindow, setVisibleWindow] = useState(false)
  const [inventoryEdit, setInventoryEdit] = useState(false)
  
  useEffect(()=>{ 
    useTelegram.hideBackButton()
    useTelegram?.setReady()
  }
  , [])
  return (
    <div
      className="Home"
      style={{ backgroundImage: `url(${BG.homeBackground})` }}
    >
 
      <HomeHeader
        onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
      />
      <Player width="40%" left={"9%"} top={"30%"} />
      <img className="HomePatImg" src={Icons.accessory.patCat}  alt="Pat" />
      
     
      <Menu/>
      {/* <div className="HomeInventory">
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
      </div> */}
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
