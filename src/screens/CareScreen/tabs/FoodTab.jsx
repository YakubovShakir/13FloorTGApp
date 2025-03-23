import { useState, useEffect, useRef } from "react";
import moment from "moment-timezone";
import Assets from "../../../assets";
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainerFood";
import ItemCard from "../../../components/simple/ItemCard/ItemCard";
import { getFoods } from "../../../services/food/food";
import { getProcesses, startProcess, checkCanStop } from "../../../services/process/process";
import { getParameters } from "../../../services/user/user";
import formatTime from "../../../utils/formatTime";
import countPercentage from "../../../utils/countPercentage";
import { useSettingsProvider } from "../../../hooks";

const TICK_INTERVAL = 1000; // 1 second tick

const FoodTab = ({ userId, userParameters, setUserParameters }) => {
  const [userEatingFoods, setUserEatingFoods] = useState([]);
  const [foods, setFoods] = useState(null);
  const { lang } = useSettingsProvider();
  const { Icons } = Assets;
  const timerRef = useRef(null);
  const lastTickRef = useRef(0);
  const timerLockRef = useRef(false);

  const handleBuyFood = async (foodId) => {
    await startProcess("food", userId, foodId);
    const userParameters = await getParameters(userId);
    const userEatingFoodsRaw = await getProcesses("food", userId);
    const userEatingFoods = initializeFoodTimers(userEatingFoodsRaw);
    setUserParameters(userParameters.parameters);
    setUserEatingFoods(userEatingFoods);
  };

  const initializeFoodTimers = (foodsList) => {
    return foodsList.map(food => {
      const foodData = foods?.find(f => f.food_id === food.type_id);
      const totalSeconds = food.base_duration_in_seconds || (foodData ? foodData.duration * 60 : 60);
      const processStart = moment(food.createdAt).tz("Europe/Moscow");
      const elapsedSeconds = moment().diff(processStart, "seconds");
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
      return {
        ...food,
        totalSeconds,
        remainingSeconds,
        formattedTime: formatTime(
          Math.floor(remainingSeconds / 60),
          remainingSeconds % 60
        ) || "0:00",
        justCompleted: false,
      };
    });
  };

  const calculateTime = (foods) => {
    return foods.map(food => {
      const remainingSeconds = Math.max(0, food.remainingSeconds - 1);
      const justCompleted = remainingSeconds === 0 && food.remainingSeconds > 0;
      return {
        ...food,
        remainingSeconds,
        formattedTime: formatTime(
          Math.floor(remainingSeconds / 60),
          remainingSeconds % 60
        ) || "0:00",
        justCompleted,
      };
    });
  };

  const setupTimer = () => {
    if (timerLockRef.current) {
      console.log("Timer already running, skipping start");
      return;
    }
    if (timerRef.current) {
      console.log("Clearing existing timer");
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!userEatingFoods || userEatingFoods.length === 0) {
      console.log("No eating foods, timer not started");
      return;
    }

    timerLockRef.current = true;
    console.log("Starting timer for foods:", userEatingFoods);

    const tick = () => {
      const now = Date.now();
      if (now - lastTickRef.current < TICK_INTERVAL - 100) {
        return; // Debounce
      }
      lastTickRef.current = now;

      setUserEatingFoods(prev => {
        if (!prev || prev.length === 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            timerLockRef.current = false;
          }
          return prev;
        }

        const updatedFoods = calculateTime(prev);
        console.log(`Tick at ${new Date().toISOString()}:`, updatedFoods);

        const completedFoods = updatedFoods.filter(food => food.justCompleted);
        if (completedFoods.length > 0) {
          console.log("Completing foods:", completedFoods);
          Promise.all(
            completedFoods.map(food => {
              console.log(`Calling checkCanStop for food type_id: ${food.type_id}`);
              return checkCanStop(userId, food.type_id, null, 'food');
            })
          )
          .then(() => {
            console.log("checkCanStop completed, refreshing data");
            getProcesses("food", userId).then(raw => setUserEatingFoods(initializeFoodTimers(raw)));
            getParameters(userId).then(res => setUserParameters(res.parameters));
          })
          .catch(error => {
            console.error("Failed to stop completed foods:", error);
            getProcesses("food", userId).then(raw => setUserEatingFoods(initializeFoodTimers(raw)));
          });
        }

        const activeFoods = updatedFoods.filter(food => food.remainingSeconds > 0);
        if (!activeFoods.length && timerRef.current) {
          console.log("All foods completed, stopping timer");
          clearInterval(timerRef.current);
          timerRef.current = null;
          timerLockRef.current = false;
        }

        return updatedFoods;
      });
    };

    tick(); // Immediate first tick
    timerRef.current = setInterval(tick, TICK_INTERVAL);
  };

  const updateInformation = () => {
    try {
      getProcesses("food", userId).then((rawFoods) => {
        const updatedFoods = initializeFoodTimers(rawFoods);
        setUserEatingFoods(updatedFoods);
        if (updatedFoods.length > 0) {
          setupTimer(); // Restart timer only if there are active foods
        }
      });
    } catch (e) {
      console.log("Error when updateInformation", e);
    }
  };

  const checkFoodIsEating = (food) => {
    const eatingFood = userEatingFoods?.find(
      (eatingFood) => eatingFood?.type_id === food?.food_id
    );
    console.log(`Checking if ${food?.food_id} is eating:`, eatingFood);
    return eatingFood;
  };

  const getItemFoodParams = (food) => {
    const instantEnergyRestore = food?.instant_energy_restore;
    const instantHungryRestore = food?.instant_hungry_restore;
    const instantMoodRestore = food?.instant_mood_restore;
    const instantMoodCost = food?.instant_mood_cost;

    const longEnergyRestore = food?.long_energy_restore;
    const longHungryRestore = food?.long_hungry_restore;
    const longMoodRestore = food?.long_mood_restore;

    const eatingFood = checkFoodIsEating(food);
    return [
      [
        instantHungryRestore && {
          icon: Icons.hungry,
          value: "+" + instantHungryRestore?.value + "%",
        },
        longHungryRestore && {
          icon: Icons.hungryUp,
          value: "+" + longHungryRestore?.value + "%/h",
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
          value: "+" + longEnergyRestore?.value + (longEnergyRestore?.percent ? "" : "") + "/h",
        },
        instantMoodRestore && {
          icon: Icons.happiness,
          value: "+" + instantMoodRestore?.value + "%",
        },
        longMoodRestore && {
          icon: Icons.moodUp,
          value: "+" + longMoodRestore?.value + (longMoodRestore?.percent ? "%" : "") + "/h",
        },
      ].filter(Boolean),
      [
        {
          icon: Icons.clock,
          value: eatingFood
            ? eatingFood.formattedTime
            : formatTime(food?.duration),
          fillPercent: eatingFood
            ? countPercentage(eatingFood.remainingSeconds, eatingFood.totalSeconds)
            : null,
        },
      ],
    ].filter((param) => param.length > 0);
  };

  const getItemFoodButton = (food) => {
    const price = food?.coins_price;
    const enoughCoins = userParameters?.coins >= price;
    const isEating = checkFoodIsEating(food);
    const status = enoughCoins && !isEating && userParameters.level >= food.user_level_require;
    return [
      {
        text: price,
        active: status,
        icon: Icons.balance,
        onClick: status ? async () => await handleBuyFood(food?.food_id) : null,
      },
    ];
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const foodList = await getFoods();
        setFoods(foodList.filter(food => userParameters.level >= food.user_level_require));
        updateInformation();
      } catch (e) {
        console.log("Error fetching initial data:", e);
      }
    };

    fetchInitialData();
    const syncInterval = setInterval(updateInformation, 30000); // Sync every 30s

    return () => {
      clearInterval(syncInterval);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        timerLockRef.current = false;
      }
    };
  }, [userId]);

  useEffect(() => {
    console.log("userEatingFoods updated:", userEatingFoods);
    if (userEatingFoods && userEatingFoods.length > 0 && !timerRef.current) {
      setupTimer();
    }
  }, [userEatingFoods]);

  return (
    <ScreenContainer>
      {foods?.map((food, index) => (
        <ItemCard
          key={food.food_id}
          ItemIcon={food?.link}
          ItemDescription={food?.description[lang]}
          ItemTitle={food?.name[lang]}
          ItemParamsBlocks={getItemFoodParams(food)}
          ItemButtons={getItemFoodButton(food)}
          ItemIndex={index}
        />
      ))}
    </ScreenContainer>
  );
};

export default FoodTab;