import { useEffect, useState, useContext} from "react"
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
import sleepIcon from "./../../assets/IMG/icons/sleepIcon.png"
import { useNavigate } from "react-router-dom"
import ItemCard from "../../components/simple/ItemCard/ItemCard"
import UserContext from "../../UserContext"

import { getFoods, buyFood} from "../../api/foods/foods"
import { getBoosts } from "../../api/boosts"
import { getParameters, getUserProcesses } from "../../api/user"

const CareScreen = () => {
  const [activeTab, setActiveTab] = useState("foods")
  const [userEatingFoods, setUserEatingFoods] = useState(null)
  const [foods, setFoods] = useState(null)
  const [boosts, setBoosts] = useState(null)
  const {userParameters, setUserParameters, userId} = useContext(UserContext)

  const navigate = useNavigate()
  const { Icons } = Assets
  const tabs = [
    { icon: foodTab, callback: () => setActiveTab("foods") },
    { icon: boost, callback: () => setActiveTab("boosts") },
    { icon: Icons.InWorkIcon, callback: () => setActiveTab(null) },
  ]

  const handleBuyFood = async (foodId) => {
    await buyFood(userId, foodId)
    const userParameters = await getParameters(userId)
    const userEatingFoods = await getUserProcesses(userId, 'food')
    //update States
    setUserParameters(userParameters)
    setUserEatingFoods(userEatingFoods)

  }


  const updateInformation = () => {
    try {
        setInterval(()=> {
            console.log("Обновляю еду пользователя")

            getUserProcesses(userId, 'food').then((r) => setUserEatingFoods(r))
          }, 30000)
    }
    catch (e) {
        console.log("Error when updateInfromation", e)
    }
  }

  const userSleep = {
    icon: sleepIcon,
    title: "Долгий сон",
    params: [
      [
        {
          icon: Icons.clock,
          value: "2 м",
        },
      ],
      [
        {
          icon: Icons.boosterArrow,
          value: "Усилений нет",
        },
      ],
    ],
    buttons: [
      {
        text: "Начать",
        active: true,
        bg: "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)",
        shadowColor: "#AF370F",
      },
    ],
  }
  const validFoodDuration = (foodTime) => {
    let hours = foodTime / 60 > 1 ? Math.round(foodTime/ 60) + "h ": false
    let minuts = Math.round(foodTime % 60)
    return (hours || "") + (minuts + "m" || "")
  }
  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
    getFoods().then((r) => setFoods(r))
    getBoosts().then((r) => setBoosts(r))
    getUserProcesses(userId, 'food').then((r) => setUserEatingFoods(r))
    updateInformation()
  }, [])

  useEffect(() => {
    console.log(userEatingFoods)
  }, [userEatingFoods])
  return (
    <Screen>
      <HomeHeader screenHeader />
      <ScreenBody>
        <ScreenTabs tabs={tabs} />

        {activeTab === "foods" && (
          <ScreenContainer withTab>
            {foods?.map((food, index) => (
              <ItemCard
                key={index}
                ItemIcon={food?.link}
                ItemTitle={food?.name}
                ItemParamsBlocks={[
                  [
                    food["instant_hungry_restore"] !== null && {
                      icon: Icons.hungry,
                      value: food?.instant_hungry_restore?.value + "%",
                    },
                    food["long_hungry_restore"] !== null && {
                      icon: Icons.hungryUp,
                      value: food?.long_hungry_restore?.value + "%" + "/ч",
                    },
                  ].filter(Boolean),
                  [
                    food["instant_energy_restore"] !== null && {
                      icon: Icons.energy,
                      value: food?.instant_energy_restore?.value + "%",
                    },
                    food["long_energy_restore"] !== null && {
                      icon: Icons.energyUp,
                      value:
                        food?.long_energy_restore?.value +
                        (food?.long_energy_restore?.percent && "%") +
                        "/ч",
                    },
                  ].filter(Boolean),
                  [
                    food["instant_mood_restore"] !== null && {
                      icon: Icons.happiness,
                      value: food?.instant_mood_restore?.value + "%",
                    },
                    food["long_mood_restore"] !== null && {
                      icon: Icons.moodUp,
                      value:
                        food?.long_mood_restore?.value +
                        (food?.long_mood_restore?.percent && "%") +
                        "/ч",
                    },
                  ].filter(Boolean),
                  [
                    {
                      icon: Icons.clock,
                      value: validFoodDuration(userEatingFoods?.find((f) => f.type_id === food?.food_id)?.duration || food?.duration),
                      fillPercent: (userEatingFoods?.find((f) => f.type_id === food?.food_id)?.duration / food?.duration) * 100 || false 
                    },
                  ],
                ]}
                ItemButtons={[
                  {
                    text: food.coins_price,
                    active: userParameters?.coins >= food?.coins_price && !userEatingFoods?.some((f) => f?.type_id === food?.food_id ),
                    icon: Icons.balance,
                    shadowColor: "#0E3228",
                    onClick: userParameters?.coins >= food?.coins_price 
                    && 
                    (async () => {
                      await handleBuyFood(food?.food_id)
                    })
                  },
                ]}
                ItemIndex={index}
              />
            ))}
          </ScreenContainer>
        )}
        {/* Boosts Data */}
        {activeTab === "boosts" && (
          <ScreenContainer withTab>
            <ItemCard
              ItemIcon={userSleep.icon}
              ItemTitle={userSleep.title}
              ItemParamsBlocks={userSleep.params}
              ItemButtons={userSleep.buttons}
              ItemIndex={0}
            />
            {boosts?.map((boost, index) => (
              <ItemCard
              key={index}
                ItemIcon={boost?.link}
                ItemTitle={boost.name}
                ItemDescription={boost?.description}
                ItemParamsBlocks={[
                  [
                    boost["duration"] !== null && {
                      icon: Icons.clock,
                      value: boost.duration,
                    },
                  ].filter(Boolean),
                ]}
                ItemButtons={[
                  {
                    text: boost.stars_price,
                    active: true,
                    icon: starsIcon,

                  },
                  {
                    text: "Принять",
                    active: false,

                  },
                ]}
                ItemIndex={index + 1}
              />
            ))}
          </ScreenContainer>
        )}
        {/* Store Data */}
      </ScreenBody>
      <Menu screenMenu activeName={"care"} />
    </Screen>
  )
}

export default CareScreen
