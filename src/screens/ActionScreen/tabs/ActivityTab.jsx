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
import { useSettingsProvider } from "../../../hooks.jsx"

const BoostTab = ({ userId, userParameters, setUserParameters }) => {
  const [boosts, setBoosts] = useState(null)
  const [levels, setLevels] = useState(null)
  const [activeProcess, setActiveProcess] = useState(null)
  const [userBoosts, setUserBoosts] = useState(null)
  const { Icons } = Assets

  const { lang } = useSettingsProvider()
  
  const translations = {
    start: {
      ru: 'Начать',
      en: 'Start'
    },
    stop: {
      ru: 'Стоп',
      en: 'Stop'
    },
    available: {
      ru: 'Доступно',
      en: 'Available'
    },
    unavailable: {
      ru: 'Недоступно',
      en: 'Unavailable'
    },
    cost: {
      ru: 'Стоимость',
      en: 'Cost'
    },
    hour: {
      ru: 'ЧАС',
      en: 'HOUR'
    },
    minute: {
      ru: 'м.',
      en: 'm.'
    },
    currentWork: {
      ru: 'Текущая работа',
      en: 'Current work'
    },
    unlock: {
      ru: 'Открыть',
      en: 'Unlock'
    },
    noBoosts: {
      ru: 'Усилений нет',
      en: 'No boosts'
    },
    learned: {
      ru: 'Изучено',
      en: 'Learned'
    },
    boost: {
      ru: 'Ускорить',
      en: 'Boost'
    },
    sleep: {
      ru: 'Сон',
      en: 'Sleep'
    },
    inProgress: {
      ru: 'В процессе',
      en: 'In progress'
    },
    sleepDesc: {
      ru: "Сон поможет восстановить энергию!",
      en: "Sleep will help restore energy!"
    }
  }

  const handleStartSleep = async () => {
    if (userParameters.energy >= userParameters.energy_capacity) {
      return; // Если энергия уже полная, не начинаем процесс
    }
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
              : formatTime(userSleepDuration),
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
          value: translations.noBoosts[lang],
        },
      ],
    ]
  }

  const getItemSleepButton = () => {
    const isEnergyFull = userParameters.energy >= userParameters.energy_capacity
    return [
      {
        text: activeProcess?.type === "sleep" ? translations.inProgress[lang] : translations.start[lang],
        active: !isEnergyFull, // Кнопка активна только если энергия не полная
        onClick: () => {
          if (!isEnergyFull) { // Если энергия не полная, то кнопка активна
            if (activeProcess?.type === "sleep") {
              handleStopSleep(); // Остановить процесс
            } else {
              handleStartSleep(); // Запустить процесс
            }
            window.location.href = window.location.origin
          }
          // Если энергия полная, кнопка неактивна, и ничего не происходит
        },
      }
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

  return (
    <>
      <ItemCard
        ItemIcon={sleepIcon}
        ItemTitle={translations.sleep[lang]}
        ItemDescription={translations.sleepDesc[lang]}
        ItemParamsBlocks={getItemSleepParams()}
        ItemButtons={getItemSleepButton()}
        ItemIndex={0}
      />
    </>
  )
}

export default BoostTab
