import { useEffect, useState } from "react"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import burger from "./assets/img/burger.png"
import Menu from "../../components/complex/Menu/Menu"
import foodTab from "./assets/img/foodTab.png"
import store from "./assets/img/store.png"
import starsIcon from "./../../assets/IMG/icons/starsIcon.png"
import boost from "./assets/img/boost.png"
import Assets from "../../assets"
import Screen from "../../components/section/Screen/Screen"
import ScreenBody from "../../components/section/ScreenBody/ScreenBody"
import ScreenTabs from "../../components/section/ScreenTabs/ScreenTabs"
import ScreenContainer from "../../components/section/ScreenContainer/ScreenContainer"
import useTelegram from "../../hooks/useTelegram"
import boosterArrow from "./../../assets/IMG/icons/boosterArrow.png"
import sleepIcon from "./../../assets/IMG/icons/sleepIcon.png"
import { useNavigate } from "react-router-dom"
import ItemCard from "../../components/simple/ItemCard/ItemCard"

const CareScreen = () => {
  const [activeTab, setActiveTab] = useState("foods")
  const navigate = useNavigate()
  const { Icons } = Assets
  const tabs = [
    { icon: foodTab, callback: () => setActiveTab("foods") },
    { icon: boost, callback: () => setActiveTab("boosts") },
    { icon: Icons.InWorkIcon, callback: () => setActiveTab(null) },
  ]
  const playerBalance = 1000

  const foods = [
    {
      icon: burger,
      title: "Бургер",
      params: [
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
        {
          text: 100,
          active: playerBalance > 100,
          icon: Icons.balance,
          shadowColor: "rgba(9,98,78,1)",
        },
      ],
    },
    {
      icon: burger,
      title: "Бургер",
      params: [
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
        {
          text: 100,
          active: playerBalance > 100,
          icon: Icons.balance,
          shadowColor: "rgba(9,98,78,1)",
        },
      ],
    },
  ]
  const boosts = [
    {
      icon: sleepIcon,
      title: "Долгий сон",
      params: [
        [
          {
            icon: Icons.clock,
            value: "2 m",
          },
        ],
        [
          {
            icon: boosterArrow,
            value: "Усилений нет",
          },
        ],
      ],
      buttons: [
        {
          text: "Начать",
          active: false,
          bg: "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)",
          shadowColor: "rgba(243,117,0,1)",
        },
      ],
    },
    {
      icon: sleepIcon,
      title: "Долгий сон",
      params: [
        [
          {
            icon: Icons.clock,
            value: "2 m",
          },
        ],
        [
          {
            icon: boosterArrow,
            value: "Усилений нет",
          },
        ],
      ],
      buttons: [
        {
          text: "Начать",
          active: true,
          bg: "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)",
          shadowColor: "rgba(243,117,0,1)",
        },
        {
          text: "140",
          active: true,
          icon: starsIcon,
          shadowColor: "rgba(9,98,78,1)",
        },
      ],
    },
  ]

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
  }, [])
  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody>
        <ScreenTabs tabs={tabs} />
        <ScreenContainer withTab>
          {/* Foods Data */}
          {activeTab === "foods" &&
            foods.map((tabData, index) => (
              <ItemCard
                key={index}
                ItemIcon={tabData.icon}
                ItemTitle={tabData.title}
                ItemParamsBlocks={tabData.params}
                ItemButtons={tabData.buttons}
                ItemIndex={index}
              />
            ))}

          {/* Boosts Data */}
          {activeTab === "boosts" &&
            boosts.map((tabData, index) => (
              <ItemCard
                key={index}
                ItemIcon={tabData.icon}
                ItemTitle={tabData.title}
                ItemParamsBlocks={tabData.params}
                ItemButtons={tabData.buttons}
                ItemIndex={index}
              />
            ))}
          {/* Store Data */}
        </ScreenContainer>
      </ScreenBody>
      <Menu screenMenu activeName={"care"} />
    </Screen>
  )
}

export default CareScreen
