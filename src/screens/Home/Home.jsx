import React, { useState } from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import ProcessBar from "../../components/simple/ProcessBar/ProcessBar"
import SettingsModal from "../../components/complex/Modals/SettingsModal/SettingsModal"
import Window from "../../components/complex/Windows/Window/Window"
import WelcomeModal from "../../components/complex/Modals/WelcomeModal/WelcomeModal"
import Assets from "../../assets/index"

const Home = () => {
  const { Icons,BG } = Assets
  const [visibleSettingsModal, setVisibleSettingsModal] = useState(false)
  const [currentWindow, setCurrentWindow] = useState(null)
  const [visibleWindow, setVisibleWindow] = useState(false)
  const [visibleWelcomeModal, setVisibleWelcomeModal] = useState(true)
  return (
    <div className="Home" style={{backgroundImage: `url(${BG.homeBackground})`}}>
      {visibleWelcomeModal && (
        <WelcomeModal onClose={() => setVisibleWelcomeModal(false)}/>
      )}
      <HomeHeader
        onClick={() => setVisibleSettingsModal(!visibleSettingsModal)}
      />
      <Player width="54%" left={"8%"} top={"17%"}/>
      {visibleSettingsModal && (
        <SettingsModal
          playerName="Nickol"
          totalIncome="231313112"
          respect="5050"
          status="Leader Status"
          onClose={setVisibleSettingsModal}
        />
      )}
      <ProcessBar
        icon={Icons.training}
        title="Силовая тренировка"
        timeLeft="5:00"
        lineColor="#FCBA04"
        barWidth={"80%"}
        top={"82%"}
        left={"10%"}
      />
      <Menu
        setCurrentWindow={setCurrentWindow}
        setVisibleWindow={setVisibleWindow}
      />
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
