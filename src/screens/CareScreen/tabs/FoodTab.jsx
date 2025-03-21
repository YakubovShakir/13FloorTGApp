import { useState, useEffect } from "react"
import Assets from "../../../assets"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainerFood"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import { getFoods } from "../../../services/food/food"
import { getProcesses, startProcess } from "../../../services/process/process"
import { getParameters } from "../../../services/user/user"
import formatTime from "../../../utils/formatTime"
import countPercentage from "../../../utils/countPercentage"
import { updateProcessesTimers } from "../../../utils/updateTimers"
import { useSettingsProvider } from "../../../hooks"


const FoodTab = ({ userId, userParameters, setUserParameters }) => {
  const [userEatingFoods, setUserEatingFoods] = useState(null)
  const [foods, setFoods] = useState(null)
  const { lang } = useSettingsProvider()
  
  // const [hasUpdatedTimers, setHasUpdatedTimers] = useState(false)
  const { Icons } = Assets
  // Buy food
  const handleBuyFood = async (foodId) => {
    await startProcess("food", userId, foodId)
    const userParameters = await getParameters(userId)
    const userEatingFoods = await getProcesses("food", userId)
    setUserParameters(userParameters.parameters)
    setUserEatingFoods(userEatingFoods)
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
  const checkFoodIsEating = (food) => {
    return userEatingFoods?.find(
      (eatingFood) => eatingFood?.type_id === food?.food_id
    )
  }
  const getItemFoodParams = (food) => {
    const instantEnergyRestore = food?.instant_energy_restore
    const instantHungryRestore = food?.instant_hungry_restore
    const instantMoodRestore = food?.instant_mood_restore
    const instantMoodCost = food?.instant_mood_cost

    const longEnergyRestore = food?.long_energy_restore
    const longHungryRestore = food?.long_hungry_restore
    const longMoodRestore = food?.long_mood_restore

    const eatingFood = checkFoodIsEating(food)
    return [
      [
        instantHungryRestore && {
          
          icon: Icons.hungry,
          value: "+" + instantHungryRestore?.value + "%",
        },
        longHungryRestore && {
          icon: Icons.hungryUp,
          value: "+" + longHungryRestore?.value + "%" + "/h",
        },
        instantEnergyRestore && {
          icon: Icons.energy,
          value: "+" + instantEnergyRestore?.value + "",
        },
        instantMoodCost && {
          icon: Icons.moodDecrease,
          value: "-" + instantMoodCost?.value + "%",
        },
        longEnergyRestore && {
          icon: Icons.energyUp,
          value:
            "+" +
            longEnergyRestore?.value +
            (longEnergyRestore?.percent ? "" : "") +
            "/h",
        },
        instantMoodRestore && {
          icon: Icons.happiness,
          value:"+" + instantMoodRestore?.value + "%",
        },
        longMoodRestore && {
          
          icon: Icons.moodUp,
          value:"+" +
            longMoodRestore?.value +
            (longMoodRestore?.percent && "%") +
            "/h",
        },
      ].filter(Boolean),

      // [
      //   instantEnergyRestore && {
      //     icon: Icons.energy,
      //     value: instantEnergyRestore?.value + "%",
      //   },
      //   longEnergyRestore && {
      //     icon: Icons.energyUp,
      //     value:
      //       longEnergyRestore?.value +
      //       (longEnergyRestore?.percent && "%") +
      //       "  / h",
      //   },
      // ].filter(Boolean),

      // [
      //   instantMoodRestore && {
      //     icon: Icons.happiness,
      //     value: instantMoodRestore?.value + "%",
      //   },
      //   longMoodRestore && {
      //     icon: Icons.moodUp,
      //     value:
      //       longMoodRestore?.value +
      //       (longMoodRestore?.percent && "%") +
      //       "  / h",
      //   },
      // ].filter(Boolean),

      [
        {
          icon: Icons.clock,
          value:
            eatingFood?.duration || eatingFood?.seconds
              ? formatTime(eatingFood?.duration, eatingFood?.seconds)
              : formatTime(food?.duration),
          fillPercent:
            eatingFood?.duration || eatingFood?.seconds
              ? countPercentage(
                  eatingFood?.duration * 60 + eatingFood?.seconds,
                  food?.duration * 60
                )
              : null,
        },
      ],
    ].filter((param) => param.length > 0)
  }
  const getItemFoodButton = (food) => {
    const price = food?.coins_price
    const enoughCoins = userParameters?.coins >= price
    const status = enoughCoins && !checkFoodIsEating(food) && userParameters.level >= food.user_level_require
    return [
      {
        text: price,
        active: status,
        icon: Icons.balance,
       
        onClick: status && (async () => await handleBuyFood(food?.food_id)),
      },
    ]
  }

  useEffect(() => {

    const updater = updateProcessesTimers(userEatingFoods, setUserEatingFoods, updateInformation)
    return () => clearInterval(updater)
  }, [userEatingFoods])

  useEffect(() => {
    getFoods().then((r) => setFoods(r.filter(food => userParameters.level >= food.user_level_require)))
    getProcesses("food", userId).then((r) => setUserEatingFoods(r))

    updateInformation()
  }, [])

  return (
    <ScreenContainer>
      {foods?.map((food, index) => (
        <ItemCard
          key={index}
          ItemIcon={food?.link}
          ItemTitle={food?.name[lang]}
          ItemParamsBlocks={getItemFoodParams(food)}
          ItemButtons={getItemFoodButton(food)}
          ItemIndex={index}
        />
      ))}
    </ScreenContainer>
  )
}

export default FoodTab
