import { useEffect, useState, useContext } from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Menu from "../../components/complex/Menu/Menu"
import foodTab from "./assets/img/foodTab.png"
import boost from "./assets/img/boost.png"
import Assets from "../../assets"
import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBodyFood"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import useTelegram from "../../hooks/useTelegram"
import { useNavigate } from "react-router-dom"
import UserContext from "../../UserContext"
import FoodTab from "./tabs/FoodTab"
import BoostTab from "./tabs/BoostTab"
import InventoryTab from "./tabs/InventoryTab"
import { useSettingsProvider } from "../../hooks"

const translations = {
  food: {
    ru: 'У голодного персонажа быстрее снижается настроение',
    en: 'A hungry characters mood drops faster'
  }
}

const CareScreen = () => {
  const [activeTab, setActiveTab] = useState("foods")

  const { userParameters, setUserParameters, userId } = useContext(UserContext)
  const navigate = useNavigate()
  const { lang } = useSettingsProvider()

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])

  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody activity={translations.food[lang]}>
        {/* Food Tab */}
        {activeTab === "foods" && (
          <FoodTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
          />
        )}
      </ScreenBody>
    </Screen>
  )
}

export default CareScreen
