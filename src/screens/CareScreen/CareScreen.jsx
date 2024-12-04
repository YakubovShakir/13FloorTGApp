import { useEffect, useState, useContext } from "react"
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
import formatTime from "../../utils/formatTime"
import { getFoods } from "../../services/food/food"
import { getBoosts } from "../../services/boost/boost"
import { getParameters } from "../../services/user/user"
import { getLevels } from "../../services/levels/levels"
import {
  startProcess,
  getProcesses,
  getActiveProcess,
  stopProcess,
} from "../../services/process/process"

const CareScreen = () => {
  const [activeTab, setActiveTab] = useState("foods")
  const [userEatingFoods, setUserEatingFoods] = useState(null)
  const [foods, setFoods] = useState(null)
  const [boosts, setBoosts] = useState(null)
  const [activeProcess, setActiveProcess] = useState(null)
  const [levels, setLevels] = useState(null)
  const { userParameters, setUserParameters, userId } = useContext(UserContext)
  const navigate = useNavigate()
  const { Icons } = Assets
  const tabs = [
    { icon: foodTab, callback: () => setActiveTab("foods") },
    { icon: boost, callback: () => setActiveTab("boosts") },
    { icon: Icons.InWorkIcon, callback: () => setActiveTab(null) },
  ]

  const handleBuyFood = async (foodId) => {
    await startProcess("food", userId, foodId)
    const userParameters = await getParameters(userId)
    const userEatingFoods = await getProcesses("food", userId)
    //update States
    setUserParameters(userParameters)
    setUserEatingFoods(userEatingFoods)
  }
  const handleStartSleep = async () => {
    await startProcess("sleep", userId)

    const sleepProcess = await getActiveProcess(userId)
    setActiveProcess(sleepProcess)
  }
  const handleStopSleep = async () => {
    await stopProcess(userId)
    setActiveProcess(null)
  }
  const updateInformation = () => {
    try {
      setInterval(() => {
        getProcesses("food", userId).then((r) => setUserEatingFoods(r))
      }, 30000)
    } catch (e) {
      console.log("Error when updateInfromation", e)
    }
  }
  const getItemSleepParams = () => {
    const userSleepDuration = levels?.find(
      (level) => level?.level === userParameters?.level
    )?.sleep_duration

    return [
      [
        {
          icon: Icons.clock,
          value: userSleepDuration,
          fillPercent:
            activeProcess?.type === "sleep"
              ? (activeProcess?.duration / userSleepDuration) * 100
              : null,
        },
      ],
      [
        {
          icon: Icons.boosterArrow,
          value: "Усилений нет",
        },
      ],
    ]
  }

  const getItemSleepButton = () => {
    const userSleepDuration = levels?.find(
      (level) => level?.level === userParameters?.level
    )?.sleep_duration

    return [
      {
        text: activeProcess?.type === "sleep" ? "Стоп" : "Начать",
        active: true,
        bg:
          activeProcess?.type === "sleep"
            ? "linear-gradient(90deg, rgba(233,27,27,1) 0%, rgba(119,1,1,1) 100%)"
            : "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)",
        shadowColor: "#AF370F",
        onClick:
          activeProcess?.type === "sleep"
            ? () => handleStopSleep()
            : () => handleStartSleep(),
      },
    ]
  }

  useEffect(() => {
    useTelegram.setBackButton(() => navigate("/"))
    getFoods().then((r) => setFoods(r))
    getBoosts().then((r) => setBoosts(r))
    getProcesses("food", userId).then((r) => setUserEatingFoods(r))
    getActiveProcess(userId).then((process) => setActiveProcess(process))
    getLevels().then((levels) => setLevels(levels))
    updateInformation()
  }, [])

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
                      value: formatTime(
                        userEatingFoods?.find(
                          (f) => f.type_id === food?.food_id
                        )?.duration || food?.duration
                      ),
                      fillPercent:
                        (userEatingFoods?.find(
                          (f) => f.type_id === food?.food_id
                        )?.duration /
                          food?.duration) *
                          100 || false,
                    },
                  ],
                ]}
                ItemButtons={[
                  {
                    text: food.coins_price,
                    active:
                      userParameters?.coins >= food?.coins_price &&
                      !userEatingFoods?.some(
                        (f) => f?.type_id === food?.food_id
                      ),
                    icon: Icons.balance,
                    shadowColor: "#0E3228",
                    onClick:
                      userParameters?.coins >= food?.coins_price &&
                      (async () => {
                        await handleBuyFood(food?.food_id)
                      }),
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
              ItemIcon={sleepIcon}
              ItemTitle={"Долгий сон"}
              ItemParamsBlocks={getItemSleepParams()}
              ItemButtons={getItemSleepButton()}
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
