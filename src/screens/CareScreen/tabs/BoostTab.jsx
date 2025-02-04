import { useState, useEffect, useContext } from "react"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainerBoost"

import Assets from "../../../assets"
import ItemCard from "../../../components/simple/ItemCard/ItemCardBoost"
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
import { updateProcessesTimers, updateProcessTimers } from "../../../utils/updateTimers"
import formatTime, { getMinutesAndSeconds } from "../../../utils/formatTime"
import countPercentage from "../../../utils/countPercentage"
import { useSettingsProvider } from "../../../hooks"
import HomeHeader from "../../../components/complex/HomeHeader/HomeHeader"
import ScreenBody from "../../../components/section/ScreenBody/ScreenBodyFood"
import UserContext from "../../../UserContext"
import moment from "moment-timezone"



const BoostTab = ({ }) => {
  const { userId, userParameters } = useContext(UserContext)
  const { lang } = useSettingsProvider()
  const [boosts, setBoosts] = useState(null)
  const [levels, setLevels] = useState(null)
  const [activeProcess, setActiveProcess] = useState(null)
  const [userBoosts, setUserBoosts] = useState(null)
  const [userBoostProcesses, setUserBoostProcesses] = useState(null)
  const { Icons } = Assets

  const translations = {
    take: {
      ru: 'Использовать',
      en: 'Use'
    }
  }

  const getItemBoostParams = (boost) => {
    const boostProcess = userBoostProcesses?.find((p) => p.type_id === boost.boost_id)
    const boostProcessDuration = boostProcess ? (boostProcess.target_duration_in_seconds || boostProcess.base_duration_in_seconds) / 60 : boost.duration
    const { duration, seconds } = boostProcess ? getMinutesAndSeconds(Math.max(0, boostProcessDuration * 60 - moment().diff(moment(boostProcess.createdAt), 'seconds'))) : getMinutesAndSeconds(boost.duration * 60)
    const boostDuration = boostProcess ? formatTime(duration, seconds) : formatTime(boost.duration)
    console.log(boostDuration)
    return [
      [
        boostDuration && {
          icon: Icons.clock,
          value: boostDuration,
          fillPercent: boostProcess && Math.max(0, 100 - countPercentage(
            moment().diff(moment(boostProcess.createdAt), 'seconds'),
            boostProcessDuration * 60
          )),
        },
      ].filter(Boolean),
    ]
  }

  const { refreshData } = useContext(UserContext)

  const handleBuyBoost = async (boostId) => {
    await buyBoost(userId, boostId)
    // const userParameters = await getParameters(userId)

    // setUserParameters(userParameters.parameters)
    const userBoosts = await getUserBoosts(userId)
    setUserBoosts(userBoosts)
    await refreshData()
  }

  const handleUseBoost = async (boostId) => {
    await useBoost(userId, boostId)
    const userBoosts = await getUserBoosts(userId)

    setUserBoosts(userBoosts)
    // setUserParameters(parameters.parameters)
    await refreshData()
    const boostProcesses = await getProcesses('boost', userId)
    setUserBoostProcesses(boostProcesses)
  }
  const checkUserHaveBoost = (boostId) => {
    return userBoosts?.find((boost) => boost?.boost_id === boostId) || false
    // return true
  }

  const getUserBoostAmount = (boostId) => userBoosts?.filter((boost) => boost?.boost_id === boostId)?.length
  const getItemBoostButton = (boost) => {
    const starsPrice = boost.stars_price
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
        text: translations.take[lang],
        active: useBoostStatus,
        onClick: useBoostStatus && (() => handleUseBoost(boost?.boost_id))
      },
    ]
  }
  useEffect(() => {
    getBoosts().then((r) => setBoosts(r))
    getActiveProcess(userId).then((process) => setActiveProcess(process))
    getUserBoosts(userId).then((boosts) => setUserBoosts(boosts))
    getProcesses('boost', userId).then((processes) => setUserBoostProcesses(processes))
    console.log(userBoostProcesses)
  }, [])

  useEffect(() => {
    if (userBoostProcesses && userBoostProcesses.length > 0) {
      const interval = updateProcessesTimers(userBoostProcesses, setUserBoostProcesses, () => {
        getActiveProcess(userId).then((process) => setActiveProcess(process))
        getUserBoosts(userId).then((boosts) => setUserBoosts(boosts))
        getProcesses('boost', userId).then((processes) => setUserBoostProcesses(processes))
      })

      return () => clearInterval(interval)
    }
  }, [userBoostProcesses])

  const handleStarsBuy = async (item) => {
    try {
      const response = await instance.post('/users/request-stars-invoice-link', {
        productType: 'boost',
        id: item.id
      }).then(res => res.data.invoiceLink)
      window.Telegram?.WebApp?.openInvoice(response, (status) => {
        if (status === "paid") {
          return
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (activeProcess?.type === "boost") {
      const updater = updateProcessTimers(activeProcess, setActiveProcess)

      return () => clearInterval(updater)
    }
  }, [activeProcess])

  return (
    <ScreenContainer withTab>
      <HomeHeader />
      {/* <ItemCard
        ItemIcon={sleepIcon}
        ItemTitle={"Долгий сон"}
        ItemParamsBlocks={getItemSleepParams()}
        ItemButtons={getItemSleepButton()}
        ItemIndex={0}
      /> */}
      <ScreenBody activity={lang === 'ru' ? 'Бусты' : 'Boosts'}>
        <div style={{ paddingTop: 20 }}>
          {boosts?.map((boost, index) => (
            <ItemCard
              key={index}
              ItemIcon={boost?.link}
              ItemTitle={boost.name[lang]}
              ItemDescription={boost?.description[lang]}
              ItemParamsBlocks={getItemBoostParams(boost)}
              ItemButtons={getItemBoostButton(boost)}
              ItemBottomAmount={getUserBoostAmount(boost?.boost_id)}
              ItemIndex={index + 1}
              handleStarsBuy={() => handleStarsBuy({ id: boost.boost_id, productType: 'boosts' })}
            />
          ))}
        </div>
      </ScreenBody>
    </ScreenContainer>
  )
}

export default BoostTab
