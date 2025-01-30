import { useState, useEffect } from "react"
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
import { useUser } from "../../../UserContext"
export const WorkTab = ({
  modalData,
  setModalData,
  setUserParameters,
  setVisibleModal,
  userId,
  borderColor,
}) => {

  const { lang } = useSettingsProvider()
  const { userParameters } = useUser()
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
      ru: 'м',
      en: 'm'
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
    hungryDecrease: {
      ru: 'Расход голода',
      en: 'Satiety consumption '
    },
    moodDecrease: {
      ru: 'Расход настроения',
      en: 'Mood consumption'
    },
    energyDecrease: {
      ru: 'Расход энергии',
      en: 'Consumes energy'
    },
    respectRequired: {
      ru: 'Минимальный Респект',
      en: 'Minimum respect'
    },
    requiredLevel: {
      ru: 'Необходимый уровень',
      en: 'Required level'
    }
  }

  const [skills, setSkills] = useState(null) // List of skills

  const [works, setWorks] = useState(null) // List of works
  const [activeProcess, setActiveProcess] = useState(null) // Current work status if exist
  const [userLearnedSkills, setUserLearnedSkills] = useState(null) // User learning at this time skills

  const { Icons } = Assets
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

  // Buy work
  const handleBuyWork = async (workId) => {
    await buyWork(userId, workId)
    setVisibleModal(false)
  }

  const setWorkModalData = (work) => {
    const requiredRespect = userParameters?.respect >= work?.respect_required
    const isNextLevelWork = work?.work_id === userParameters?.work_id + 1
    const requiredSkill = work?.skill_id_required ? checkLearnedSkill(work?.skill_id_required) : true

    const enoughBalance = userParameters?.coins >= work?.coins_price

    const buyStatus =
      requiredRespect &&
      requiredSkill &&
      isNextLevelWork &&
      enoughBalance && userParameters.level >= work.requiredLevel
    const data = {
      type: "work",
      id: work?.work_id,
      title: work?.name[lang] || work?.name,
      image: work?.link,
      blocks: [
        {
          icon: Icons.balance,
          text: translations.cost[lang],
          value: work?.coins_price,
          fillPercent: "100%",
          fillBackground: 
          userParameters?.coins < work?.coins_price
            ? "#4E1010" // red
            : "#0E3228", // green
        },
        {
          icon: Icons.levelIcon,
          text: translations.requiredLevel[lang],
          value: work?.requiredLevel,
          fillPercent: "100%",
          fillBackground:
            userParameters?.level < work?.requiredLevel
              ? "#4E1010" // red
              : "#0E3228", // green
        },
        work?.skill_id_required && {
          icon: skills?.find(
            (skill) => skill?.skill_id === work?.skill_id_required
          )?.link,
          text: skills?.find(
            (skill) => skill?.skill_id === work?.skill_id_required
          )?.name[lang],
          fillPercent: "100%",
          fillBackground: !checkLearnedSkill(work?.skill_id_required)
            ? "#4E1010" // red
            : "#0E3228", // green
        },
        {
          icon: Icons.respect,
          text: translations.respectRequired[lang],
          value: work?.respect_required,
          fillPercent: "100%",
          fillBackground:
            userParameters?.respect < work?.respect_required
              ? "#4E1010" // red
              : "#0E3228", // green
        },

        {
          icon: Icons.hungryDecrease,
          text: translations.hungryDecrease[lang],
          value: (work?.hungry_cost_in_hour) + "/" + translations.hour[lang],
        },
        {
          icon: Icons.moodDecrease,
          text: translations.moodDecrease[lang],
          value: (work?.mood_cost_in_hour) + "/" + translations.hour[lang],
        },
        {
          icon: Icons.energyDecrease,
          text: translations.energyDecrease[lang],
          value: (work?.energy_cost_in_hour) + "/" + translations.hour[lang],
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
    const requiredLevel = userParameters?.level >= work?.requiredLevel
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
        [
          {
            value: work?.coins_in_hour + " / " + translations.hour[lang],
            icon: Icons.balance,
          },
        ],
        [
          {
            value: translations.noBoosts[lang],
            icon: Icons?.boosterArrow,
          },
        ],
      ]
    }

    return [
      [
        {
          value: work?.coins_in_hour + " / " + translations.hour[lang],
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
          text: translations.currentWork[lang],
          icon: buyStatus && Icons.balance,
          active: true,
          bg: activeWork
            ? "rgb(18, 18, 18)"
            : "rgb(18, 18, 18)",
          shadowColor: activeWork ? "rgb(32, 32, 32)" : "rgb(32, 32, 32)",
          borderColor: activeWork ? "rgb(73 73 73)" : "rgb(73 73 73)",
          border: `1px solid rgb(32, 32, 32)`,
          color:'rgb(0, 255, 183)',
          ownColor:'rgb(255, 118, 0)',
         
        },
      ];
    }

    return [
      {
        text: buyStatus ? work?.coins_price : translations.unlock[lang],
        onClick: () => {
          setModalData(setWorkModalData(work))
          setVisibleModal(true)
        },
        icon: buyStatus && Icons.balance,
        active: buyStatus,
        shadowColor: buyStatus && "rgb(199, 80, 21)",
        borderColor: "rgb(255, 141, 0)",
      },
    ]
  }
  useEffect(() => {
    getWorks().then((r) => {
      setWorks(r.filter(work => work.requiredLevel <= userParameters.level))
    })
    getSkills().then((r) => setSkills(r)) // Get list of skills
    getActiveProcess(userId).then((r) => setActiveProcess(r))
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
    updateInformation()
  }, [])

  return (
    <ScreenContainer withTab>
      {/* User main work card*/}

      {works?.sort((a, b) => a.work_id - b.work_id).map((work, index) => (
        <ItemCard
          key={index}
          ItemIcon={work?.link}
          ItemTitle={work?.name[lang]}
          ItemParamsBlocks={getItemWorkParams(work?.work_id)}
          ItemButtons={getItemWorkButton(work?.work_id)}
          ItemIndex={index}
        />
      ))}
    </ScreenContainer>
  )
}

export default WorkTab
