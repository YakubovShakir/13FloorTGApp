import { useState, useEffect } from "react"
import Assets from "../../../assets"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import { getFoods } from "../../../services/food/food"
import { getProcesses, startProcess } from "../../../services/process/process"
import { getParameters } from "../../../services/user/user"
import formatTime from "../../../utils/formatTime"
const FoodTab = ({ userId, userParameters, setUserParameters }) => {
  const [userEatingFoods, setUserEatingFoods] = useState(null)
  const [foods, setFoods] = useState(null)

  const { Icons } = Assets
  // Buy food
  const handleBuyFood = async (foodId) => {
    await startProcess("food", userId, foodId)
    const userParameters = await getParameters(userId)
    const userEatingFoods = await getProcesses("food", userId)
    setUserParameters(userParameters)
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

    const longEnergyRestore = food?.long_energy_restore
    const longHungryRestore = food?.long_hungry_restore
    const longMoodRestore = food?.long_mood_restore

    return [
      [
        instantHungryRestore && {
          icon: Icons.hungry,
          value: instantHungryRestore?.value + "%",
        },
        longHungryRestore && {
          icon: Icons.hungryUp,
          value: longHungryRestore?.value + "%" + "  / h",
        },
      ].filter(Boolean),

      [
        instantEnergyRestore && {
          icon: Icons.energy,
          value: instantEnergyRestore?.value + "%",
        },
        longEnergyRestore && {
          icon: Icons.energyUp,
          value:
            longEnergyRestore?.value +
            (longEnergyRestore?.percent && "%") +
            "  / h",
        },
      ].filter(Boolean),

      [
        instantMoodRestore && {
          icon: Icons.happiness,
          value: instantMoodRestore?.value + "%",
        },
        longMoodRestore && {
          icon: Icons.moodUp,
          value:
            longMoodRestore?.value +
            (longMoodRestore?.percent && "%") +
            "  / h",
        },
      ].filter(Boolean),

      [
        {
          icon: Icons.clock,
          value: formatTime(
            checkFoodIsEating(food)?.duration || food?.duration
          ),
          fillPercent:
            (checkFoodIsEating(food)?.duration / food?.duration) * 100 || false,
        },
      ],
    ]
  }
  const getItemFoodButton = (food) => {
    const price = food?.coins_price
    const enoughCoins = userParameters?.coins >= price
    const status = enoughCoins && !checkFoodIsEating(food)
    return [
      {
        text: price,
        active: status,
        icon: Icons.balance,
        shadowColor: "#0E3228",
        onClick: status && (async () => await handleBuyFood(food?.food_id)),
      },
    ]
  }
  useEffect(() => {
    getFoods().then((r) => setFoods(r))
    getProcesses("food", userId).then((r) => setUserEatingFoods(r))
    updateInformation()
  }, [])

  return (
    <ScreenContainer withTab>
      {foods?.map((food, index) => (
        <ItemCard
          key={index}
          ItemIcon={food?.link}
          ItemTitle={food?.name}
          ItemParamsBlocks={getItemFoodParams(food)}
          ItemButtons={getItemFoodButton(food)}
          ItemIndex={index}
        />
      ))}
    </ScreenContainer>
  )
}

export default FoodTab
