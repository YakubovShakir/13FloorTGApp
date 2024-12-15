import { useEffect, useState, useContext } from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Menu from "../../components/complex/Menu/Menu"
import foodTab from "./assets/img/foodTab.png"
import boost from "./assets/img/boost.png"
import Assets from "../../assets"
import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBody"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import useTelegram from "../../hooks/useTelegram"
import { useNavigate } from "react-router-dom"
import UserContext from "../../UserContext"
import FoodTab from "./tabs/FoodTab"
import BoostTab from "./tabs/BoostTab"
import InventoryTab from "./tabs/InventoryTab"

const CareScreen = () => {
  const [activeTab, setActiveTab] = useState("foods")

  const { userParameters, setUserParameters, userId } = useContext(UserContext)
  const navigate = useNavigate()
  const { Icons } = Assets
  const tabs = [
    { icon: foodTab, callback: () => setActiveTab("foods") },
   
    { icon: Icons.inventoryIcon, callback: () => setActiveTab("inventory") },
  ]

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])

  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody activity={'Еда'}>
        <ScreenTabs tabs={tabs} />

        {/* Food Tab */}
        {activeTab === "foods" && (
          <FoodTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
          />
        )}

        

        {activeTab === "inventory" && (
           <InventoryTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
         />
        )}
        {/* Store Data */}
      </ScreenBody>
    </Screen>
  )
}

export default CareScreen
