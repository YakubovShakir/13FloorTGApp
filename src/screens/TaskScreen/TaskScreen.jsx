import "./TaskScreen.css"
import Screen from "../../components/section/Screen/Screen"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import ScreenBody from "../../components/section/ScreenBody/ScreenBody"
import Menu from "../../components/complex/Menu/Menu"
import Assets from "../../assets"
import { useEffect, useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import UserContext from "../../UserContext"
import useTelegram from "../../hooks/useTelegram"
import taskTabIcon from "./icons/taskTab.png"
import TaskTab from "./tabs/TaskTab"
const TaskScreen = () => {
  const [activeTab, setActiveTab] = useState("task")

  const { userParameters, setUserParameters, userId } = useContext(UserContext)
  const navigate = useNavigate()
  const { Icons } = Assets

  const tabs = [
    { icon: taskTabIcon, callback: () => setActiveTab("task") },
    { icon: taskTabIcon, callback: () => setActiveTab("ivent") },
  ]
  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])
  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])
  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody activity={'Задания'}>
        <ScreenTabs tabs={tabs} />
        {/* Task Tab */}

        {activeTab === "task" && (
          <TaskTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
          />
        )}
      </ScreenBody>
    </Screen>
  )
}

export default TaskScreen
