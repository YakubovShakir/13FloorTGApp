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
import CoinsTab from "./tabs/CoinsTab"
import BoostTab from "./tabs/BoostTab"
import StarsTab from "./tabs/StarsTab"

const ShopScreen = () => {
  const [activeTab, setActiveTab] = useState("coins")

  const { userParameters, setUserParameters, userId } = useContext(UserContext)
  const navigate = useNavigate()
  const { Icons } = Assets
  const tabs = [
    { icon: Icons.balance, callback: () => setActiveTab("coins") },
    { icon: Icons.starsIcon, callback: () => setActiveTab("stars") },
    { icon: Assets.Icons.arrowIcon, callback: () => setActiveTab("boosts"), w: 100, h: 100 },
  ]

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])

  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody activity={'Магазин'}>
        <ScreenTabs tabs={tabs} />

        {/* Food Tab */}
        {activeTab === "coins" && (
          <CoinsTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
          />
        )}

        {activeTab === "stars" && (
          <StarsTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
          />
        )}

        {/* Boosts Tab  */}
        {activeTab === "boosts" && (
          <BoostTab
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

export default ShopScreen;
