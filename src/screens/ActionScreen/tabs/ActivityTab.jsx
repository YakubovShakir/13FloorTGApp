import { useState, useEffect } from "react"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import Assets from "../../../assets"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import sleepIcon from "./../../../assets/IMG/icons/sleepIcon.png"
import { instance } from "../../../services/instance"
import {
  getProcesses,
  startProcess,
  getActiveProcess,
  stopProcess,
} from "../../../services/process/process"
import { getParameters } from "../../../services/user/user"
import { getLevels } from "../../../services/levels/levels"
import { buyBoost, getBoosts, getUserBoosts, useBoost } from "../../../services/boost/boost"
import { updateProcessTimers } from "../../../utils/updateTimers"
import formatTime from "../../../utils/formatTime"
import countPercentage from "../../../utils/countPercentage"

const BoostTab = ({ userId, userParameters, setUserParameters }) => {
  const [boosts, setBoosts] = useState(null)
  const [levels, setLevels] = useState(null)
  const [activeProcess, setActiveProcess] = useState(null)
  const [userBoosts, setUserBoosts] = useState(null)
  const { Icons } = Assets

  const handleStartSleep = async () => {
    await startProcess("sleep", userId)

    const sleepProcess = await getActiveProcess(userId)
    setActiveProcess(sleepProcess)
  }
  const handleStopSleep = async () => {
    await stopProcess(userId)
    setActiveProcess(null)
  }

  const getItemSleepParams = () => {
    const userSleepDuration = levels?.find(
      (level) => level?.level === userParameters?.level
    )?.sleep_duration
    return [
      [
        {
          icon: Icons.clock,
          value:
            activeProcess?.type === "sleep" && (activeProcess?.duration || activeProcess?.seconds)
              ? formatTime(activeProcess?.duration, activeProcess?.seconds)
              : userSleepDuration,
          fillPercent:
            activeProcess?.type === "sleep" && activeProcess?.duration
              ? countPercentage(
                  activeProcess?.duration * 60,
                  userSleepDuration * 60
                )
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
    return [
      {
        text: activeProcess?.type === "sleep" ? "Стоп" : "Начать",
        active: true,
        
        onClick:
          activeProcess?.type === "sleep"
            ? () => handleStopSleep()
            : () => {
                handleStartSleep();
                navigation.navigate('MainScreen'); // Переход на основной экран
              },
      },
    ];
  };
  const getItemBoostParams = (boost) => {
    const boostDuration = boost?.duration
    return [
      [
        boostDuration && {
          icon: Icons.clock,
          value: boostDuration,
        },
      ].filter(Boolean),
    ]
  }

  const handleBuyBoost = async (boostId) => {
    await buyBoost(userId, boostId)
    const userParameters = await getParameters(userId)

    setUserParameters(userParameters.parameters)
    const userBoosts = await getUserBoosts(userId)
    setUserBoosts(userBoosts)
  }

  const handleUseBoost = async (boostId) => {
    await useBoost(userId,boostId)
    const userBoosts = await getUserBoosts(userId)
    const parameters = await getParameters(userId)

    setUserBoosts(userBoosts)
    setUserParameters(parameters.parameters)
  }
  const checkUserHaveBoost = (boostId) => {
    return userBoosts?.find((boost) => boost?.boost_id === boostId) || false
  }
  const getUserBoostAmount = (boostId) => userBoosts?.filter((boost) => boost?.boost_id === boostId)?.length
  const getItemBoostButton = (boost) => { 
    const starsPrice =  boost.stars_price
    const buyBoostStatus = userParameters?.coins >= starsPrice
    const useBoostStatus = checkUserHaveBoost(boost?.boost_id)
   return [
      {
        text: boost.stars_price,
        active: buyBoostStatus,
        onClick: buyBoostStatus && (() => handleBuyBoost(boost?.boost_id)),
        icon: Icons.starsIcon,
      },
      {
        text: "Принять",
        active: useBoostStatus,
        onClick: useBoostStatus && (()=> handleUseBoost(boost?.boost_id))
      },
    ]
  }
  useEffect(() => {
    getBoosts().then((r) => setBoosts(r))
    getActiveProcess(userId).then((process) => setActiveProcess(process))
    getLevels().then((levels) => setLevels(levels))
    getUserBoosts(userId).then((boosts) => setUserBoosts(boosts) )
  }, [])

  const handleStarsBuy = async (item) => {
    try {
      const response = await instance.post('/users/request-stars-invoice-link', {
          productType: 'clothes',
          id: item.id
      }).then(res => res.data.invoiceLink)
      WebApp.openInvoice(response, (status) => {
        setIsLoading(true)
        if(status === "paid") {}
        setIsLoading(false)
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (activeProcess?.type === "sleep") {
      const updater = updateProcessTimers(activeProcess, setActiveProcess)

      return () => clearInterval(updater)
    }
  }, [activeProcess])

  return (
    <temCard>
      <ItemCard
        ItemIcon={sleepIcon}
        ItemTitle={"Долгий сон"}
        ItemDescription="Сон поможет восстановить энергию!"
        ItemParamsBlocks={getItemSleepParams()}
        ItemButtons={getItemSleepButton()}
        ItemIndex={0}
      
      />
     
    </temCard>
  )
}

export default BoostTab
