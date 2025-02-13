import { useState, useEffect, useContext } from "react"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import Assets from "../../../assets"
import { getUserSkills } from "../../../services/skill/skill"
import { getWorks, buyWork } from "../../../services/work/work"
import { getParameters } from "../../../services/user/user"
import {
  getProcesses,
  getActiveProcess,
  stopProcess,
  startProcess,
} from "../../../services/process/process"
import { getSkills } from "../../../services/skill/skill"
import { a } from "framer-motion/client"
import { useSettingsProvider } from "../../../hooks"
import formatTime from "../../../utils/formatTime"
import UserContext from "../../../UserContext"
import { useNavigate } from "react-router-dom"

export const WorkTab = ({
  isActionScreen,
  modalData,
  setModalData,
  setUserParameters,
  setVisibleModal,
  userParameters,
  userId,
  borderColor,
}) => {
  const [skills, setSkills] = useState(null) // List of skills
  const [activeButton, setActiveButton] = useState(null);
  const [works, setWorks] = useState(null) // List of works
  const [activeProcess, setActiveProcess] = useState(null) // Current work status if exist
  const [userLearnedSkills, setUserLearnedSkills] = useState(null) // User learning at this time skills
  const navigate = useNavigate()
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
    training: {
      ru: 'Тренировка',
      en: 'Training'
    },
    inProgress: {
      ru: 'В процессе',
      en: 'In progress'
    },
    workDesc: {
      ru: "Отпрявляйся на работу, что бы заработать немного монет!",
      en: "Go to work to earn some coins!"
    }
  }

  const { Icons } = Assets
  const { refreshData } = useContext(UserContext)
  // Return skill if it already learned
  const checkLearnedSkill = (skillId) => {
    const learned = userLearnedSkills?.find(
      (skill) => skill?.skill_id === skillId
    )
    return learned && skills?.find((skill) => skill?.skill_id === skillId)
  }
  // Get work
  const getWorkById = (workId) => {
    return works?.find((work) => work?.work_id === workId)
  }
  // Start work process
  const handleStartWork = async () => {
    await startProcess("work", userId)

    const activeProcess = await getActiveProcess(userId)
    setActiveProcess(activeProcess)
  }

  // Stop work process
  const handleStopWork = async () => {
    await stopProcess(userId)
    setActiveProcess(null)
  }

  // Buy work
  const handleBuyWork = async (workId) => {
    await buyWork(userId, workId)
    await refreshData()
    setVisibleModal(false)
  }

  const setWorkModalData = (work) => {
    const requiredRespect = userParameters?.respect >= work?.respect_required
    const requiredLevel = userParameters?.level >= work?.work_id
    const isNextLevelWork = work?.work_id === userParameters?.work_id + 1
    const requiredSkill = work?.skill_id_required ? checkLearnedSkill(work?.skill_id_required) : true

    const enoughBalance = userParameters?.coins >= work?.coins_price

    const buyStatus =
      requiredRespect &&
      requiredSkill &&
      requiredLevel &&
      isNextLevelWork &&
      enoughBalance

    const data = {
      type: "work",
      id: work?.work_id,
      title: work?.name,
      image: work?.link,
      blocks: [
        {
          icon: Icons.balance,
          text: work?.coins_price,
          fillPercent: '100%',
          fillBackground: userParameters?.coins < work?.coins_price
            ? "#4E1010" // red
            : "#0E3228", // green
        },
        work?.skill_id_required && {
          icon: skills?.find(
            (skill) => skill?.skill_id === work?.skill_id_required
          )?.link,
          text: skills?.find(
            (skill) => skill?.skill_id === work?.skill_id_required
          )?.name,
          fillPercent: "100%",
          fillBackground: !checkLearnedSkill(work?.skill_id_required)
            ? "#4E1010" // red
            : "#0E3228", // green
        },
        {
          icon: Icons.respect,
          text: work?.respect_required,
          fillPercent: "100%",
          fillBackground:
            userParameters?.respect < work?.respect_required
              ? "#4E1010" // red
              : "#0E3228", // green
        },

        {
          icon: Icons.hungryDecrease,
          text: (work?.hungry_cost_in_hour / 60).toFixed(2) + " / " + translations.minute[lang],
        },
        {
          icon: Icons.moodDecrease,
          text: (work?.mood_cost_in_hour / 60).toFixed(2) + " / " + translations.minute[lang],
        },
        {
          icon: Icons.energyDecrease,
          text: (work?.energy_cost_in_hour / 60).toFixed(2) + " / " + translations.minute[lang],
        },
      ].filter(Boolean),
      buttons: [
        {
          text: buyStatus ? work?.coins_price : translations.unavailable[lang],
          icon: buyStatus && Icons.balance,
          active: buyStatus,
          onClick: buyStatus && (() => handleBuyWork(work?.work_id)),
        },
      ],
    }

    return data
  }

  // Interval update information
  const updateInformation = () => {
    try {
      setInterval(async () => {
        const learnedSkills = await getUserSkills(userId) // Already learned skills
        const userActiveProcess = await getActiveProcess(userId)
        setUserLearnedSkills(learnedSkills)
        setActiveProcess(userActiveProcess)
      }, 30000)
    } catch (e) {
      console.log("Error when updateInfromation", e)
    }
  }

  const getItemWorkParams = (workId) => {

    const work = getWorkById(workId)
    const currentWork = getWorkById(userParameters?.work_id)
    const requiredRespect = userParameters?.respect >= work?.respect_required
    const requiredSkill = checkLearnedSkill(work?.skill_id_required)
    const requiredLevel = userParameters?.level >= work?.work_id
    const isNextLevelWork = workId === userParameters?.work_id + 1
    const enoughBalance = userParameters?.coins >= work?.coins_price
    const buyStatus =
      requiredRespect &&
      requiredSkill &&
      requiredLevel &&
      isNextLevelWork &&
      enoughBalance

      const workDurationBase = Math.floor(work?.duration * 60);
      const workDuration = Math.floor(work?.duration * (1 - (userParameters.work_duration_decrease || 0) / 100) * 60);
      const timeDiff = workDurationBase - workDuration
    const workIncome = Math.floor(work?.coins_in_hour / 3600 * workDurationBase)

    const workAdditionalIncome = Math.floor(userParameters.work_hourly_income_increase / 3600 * workDurationBase)

    const minutes = Math.floor(workDuration / 60);
    const seconds = workDuration % 60;
    if (currentWork?.work_id === workId) {
      return [
        [
          {
            value: workIncome,
            adder: workAdditionalIncome,
            icon: Icons.balance,
          },
        ],
        [
          {
            value: formatTime(minutes, seconds),
            substractor: timeDiff,
            icon: Icons.clock,
          },
        ],
        // [
        //   {
        //     value: translations.noBoosts[lang],
        //     icon: Icons?.boosterArrow,
        //   },
        // ],
      ]
    }

    return [
      [
        {
          value: work?.coins_in_hour + "/h",
          icon: Icons.balance,
        },
      ],
      [
        {
          value: buyStatus ? translations.available[lang] : translations.unavailable[lang],
          icon: buyStatus ? Icons.unlockedIcon : Icons.lockedIcon,
        },
      ],
    ]
  }

  const getItemWorkButton = (workId) => {
    const work = getWorkById(workId)
    const isActive = activeButton === workId; // Проверяем, активна ли кнопка
    const currentWork = getWorkById(userParameters?.work_id)
    const activeWork = activeProcess?.type === "work"
    const requiredRespect = userParameters?.respect >= work?.respect_required
    const requiredSkill = work?.skill_id_required ? checkLearnedSkill(work?.skill_id_required) : true
    const requiredLevel = userParameters?.level >= work?.work_id
    const isNextLevelWork = workId === userParameters?.work_id + 1
    const enoughBalance = userParameters?.coins >= work?.coins_price

    const buyStatus =
      requiredRespect &&
      requiredSkill &&
      requiredLevel &&
      isNextLevelWork &&
      enoughBalance
    if (currentWork?.work_id === workId) {
      return [
        {
          text: activeWork ?  translations.inProgress[lang] : translations.start[lang],
          onClick:
            activeWork
              ? async () => await handleStopWork()
              : async () => {
                  await handleStartWork();
                  navigate('/')
                },
          icon: buyStatus && Icons.balance,
          active: Math.floor(userParameters?.energy) > 0,
        }
      ]
      
    }

    return [
      {
        text: buyStatus ? work?.coins_price : "Открыть",
        onClick: () => {
          setModalData(setWorkModalData(work))
          setVisibleModal(true)
        },
        icon: buyStatus && Icons.balance,
        active: buyStatus ,
        shadowColor: buyStatus && "rgb(243, 117, 0)",
       
      },
    ]
  }



  useEffect(() => {
    refreshData().then()
    getWorks().then((r) => {
      setWorks(r)
    })
    getSkills().then((r) => setSkills(r)) // Get list of skills
    getActiveProcess(userId).then((r) => setActiveProcess(r))
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
    updateInformation()
  }, [])

  return (
    <>
      {/* User main work card*/}

      {userParameters?.work_id !== 0 && <ItemCard
        ItemIcon={getWorkById(userParameters?.work_id)?.link}
        ItemDescription={translations.workDesc[lang]}
        ItemTitle={getWorkById(userParameters?.work_id)?.name[lang]}
        ItemParamsBlocks={getItemWorkParams(userParameters?.work_id)}
        ItemButtons={getItemWorkButton(userParameters?.work_id)}
        ItemIndex={0}
      
      />}

     
    </>
  )
}

export default WorkTab
