import { useEffect, useState, useContext } from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBodyCollection"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import useTelegram from "../../hooks/useTelegram"
import { useNavigate } from "react-router-dom"
import UserContext from "../../UserContext"
import CoinsTab from "./tabs/CoinsTab"
import InventoryTab from "./tabs/InventoryTab"
import NftTab from "./tabs/NftTab"
import { useSettingsProvider } from "../../hooks"

const translations = {
  clothes: {
    ru: 'Покупай И используй НОВЫЕ ВЕЩИ, ЭТО ПРИБАВИТ ТЕБЕ РЕСПЕКТ!',
    en: 'Buy AND use NEW CLOTHES, IT WILL ADD RESPECT TO YOU!'
  },
  collection: {
    ru: 'Коллекция',
    en: 'Collection'
  },
  shop: {
    ru: 'Магазин',
    en: 'Shop',
  },
  nft: {
    ru: 'NFT',
    en: 'NFT',
  }
}

const ShopScreen = () => {
  const [activeTab, setActiveTab] = useState("inventory")

  const { userParameters, setUserParameters, userId } = useContext(UserContext)
  const navigate = useNavigate()
  const { lang } = useSettingsProvider()

  const tabs = [
    { label: translations.collection[lang], callback: () => setActiveTab("inventory") },
    { label: translations.shop[lang], callback: () => setActiveTab("coins") },
    { label: translations.nft[lang], callback: () => setActiveTab("nft") },
  ]

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])

  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody activity={translations.clothes[lang]}>
        <ScreenTabs tabs={tabs} />

        {activeTab === "inventory" && (
           <InventoryTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
         />
        )}

        {/* Food Tab */}
        {activeTab === "coins" && (
          <CoinsTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
          />
        )}
         {/* NFT Tab */}
         {activeTab === "nft" && (
          <NftTab
            userId={userId}
            userParameters={userParameters}
            setUserParameters={setUserParameters}
          />
        )}
      </ScreenBody>
    </Screen>
  )
}

export default ShopScreen;
