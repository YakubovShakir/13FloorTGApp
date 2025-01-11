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
import { useSettingsProvider } from "../../hooks"

const translations = {
  tasks: {
    ru: 'Задания',
    en: 'Tasks'
  }
}

const TaskScreen = () => {
  const [activeTab] = useState("task")

  const { userParameters, setUserParameters, userId } = useContext(UserContext)
  const navigate = useNavigate()
  const { lang } = useSettingsProvider()

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])
  
  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody activity={translations.tasks[lang]}>
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
