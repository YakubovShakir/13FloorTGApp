import { useEffect, useState } from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import burger from "./assets/img/burger.png"
import Menu from "../../components/complex/Menu/Menu"
import foodTab from "./assets/img/foodTab.png"
import store from "./assets/img/store.png"
import boost from "./assets/img/boost.png"
import Assets from "../../assets"
import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBody"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import ScreenContainer from "../../components/section/ScreenContainer/ScreenContainer"
import useTelegram from "../../hooks/useTelegram"
import { useNavigate } from "react-router-dom"
import ItemCard from "../../components/simple/ItemCard/ItemCard"

const CareScreen = () => {
  const [activeTab, setActiveTab] = useState(null)
  const navigate = useNavigate()
  const { Icons } = Assets
  const tabs = [
    { icon: foodTab, callback: () => console.log("foodTab") },
    { icon: boost, callback: () => console.log("BoostTab") },
    { icon: store, callback: () => console.log("StoreTab") },
  ]
  const playerBalance = 1000
  const FoodList = [
    {
      icon: burger,
      title: "Бургер",
      recoveryParameters: [
        [
          {
            icon: Icons.hungry,
            value: 5,
          },
          
          { icon: Icons.hungry, value: 5 },
        ],
        [
          {
            icon: Icons.happiness,
            value: 5,
          },
          
          { icon: Icons.happiness, value: 5 },
        ],
        
        [{ icon: Icons.clock, value: "540 min" }],
      ],
      buttons: [
        { price: 100, active: playerBalance > 100, icon: Icons.balance },
      ],
    },
    {
      icon: burger,
      title: "Бургер",
      recoveryParameters: [
        [
          {
            icon: Icons.hungry,
            value: 5,
          },
          
          { icon: Icons.hungry, value: 5 },
        ],
        [
          {
            icon: Icons.happiness,
            value: 5,
          },
          
          { icon: Icons.happiness, value: 5 },
        ],
        
        [{ icon: Icons.clock, value: "540 min" }],
      ],
      buttons: [
        { price: 100, active: playerBalance > 100, icon: Icons.balance },
      ],
    },
  ]

  const BoostList = [{}]

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])
  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody>
        <ScreenTabs tabs={tabs} />
        <ScreenContainer withTab>
          {FoodList.map((food, index) => (
            <ItemCard
              key={index}
              ItemIcon={food.icon}
              ItemTitle={food.title}
              ItemParamsBlocks={food.recoveryParameters}
              ItemButtons={food.buttons}
              ItemIndex={index}
            />
          ))}
        </ScreenContainer>
      </ScreenBody>
      <Menu screenMenu activeName={"care"} />
    </Screen>
  )
}

export default CareScreen
