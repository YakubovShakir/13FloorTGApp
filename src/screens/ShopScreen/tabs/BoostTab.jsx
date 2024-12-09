import { useState, useEffect } from "react"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import Assets from "../../../assets"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import sleepIcon from "./../../../assets/IMG/icons/sleepIcon.png"
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

  useEffect(() => {
    if (activeProcess?.type === "sleep") {
      const updater = updateProcessTimers(activeProcess, setActiveProcess)

      return () => clearInterval(updater)
    }
  }, [activeProcess])
  useEffect(()=> {
    console.log(userBoosts)
  }, [userBoosts])
  return (
    <ScreenContainer withTab>
      {boosts?.map((boost, index) => (
        <ItemCard
          key={index}
          ItemIcon={boost?.link}
          ItemTitle={boost.name}
          ItemDescription={boost?.description}
          ItemParamsBlocks={getItemBoostParams(boost)}
          ItemButtons={getItemBoostButton(boost)}
          ItemAmount={getUserBoostAmount(boost?.boost_id)}
          ItemIndex={index + 1}
        />
      ))}
    </ScreenContainer>
  )
}

export default BoostTab
