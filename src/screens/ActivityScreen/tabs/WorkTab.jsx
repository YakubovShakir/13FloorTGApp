import { useState, useEffect, useContext } from "react"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import Assets from "../../../assets"
import { getUserSkills } from "../../../services/skill/skill"
import { getWorks, buyWork, switchWork } from "../../../services/work/work"
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
import UserContext, { useUser } from "../../../UserContext"
import globalTranslations from "../../../globalTranslations"
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
    noBoosts: 
    { ru: "Открыто", 
      en: "Done" },
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
    },
    unlocked: {
      ru: 'Завершённая',
      en: 'Completed'
    },
    choose: {
      ru: 'Выбрать',
      en: 'Choose'
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

  const { refreshData } = useContext(UserContext)

  // Buy work
  const handleBuyWork = async (workId) => {
    await buyWork(userId, workId)
    await refreshData()
    setVisibleModal(false)
  }

  //Switch work
  const handleSwitchWork = async (workId) => {
    await switchWork(userId, workId)
    await refreshData()
    setVisibleModal(false)
  }

  const setWorkModalData = (work) => {
    const currentWork = getWorkById(userParameters?.current_work_id || userParameters?.work_id);
    const isFinished = work?.work_id <= userParameters?.work_id;
    const isCurrentWork = work?.work_id === currentWork?.work_id;
    const requiredRespect = userParameters?.respect >= work?.respect_required;
    const requiredSkill = work?.skill_id_required ? checkLearnedSkill(work?.skill_id_required) : true;
    const requiredLevel = userParameters?.level >= work?.requiredLevel;
    const isNextLevelWork = work?.work_id === userParameters?.work_id + 1;
    const enoughBalance = userParameters?.coins >= work?.coins_price;
  
    const buyStatus =
      requiredRespect &&
      requiredSkill &&
      requiredLevel &&
      isNextLevelWork &&
      enoughBalance;
  
    const buttonStyle = {
      width: "100%",
      height: 44,
      shadowColor: "rgb(199, 80, 21)",
      color: "rgb(255, 255, 255)",
      ownColor: "rgb(255, 118, 0)",
      bg: "rgb(255, 118, 0)",
      fontSize: 14,
      fontFamily: "Oswald",
      fontWeight: "normal",
      borderColor: "rgb(255, 141, 0)",
      background: "rgb(255, 118, 0)",
      border: "1px solid rgb(255, 141, 0)",
    };
  
    const currentWorkButtonStyle = {
      width: "100%",
      height: 44,
      shadowColor: "rgb(32, 32, 32)",
      color: "rgb(0, 255, 183)",
      ownColor: "rgb(255, 118, 0)",
      bg: "rgb(18, 18, 18)",
      fontSize: 14,
      fontFamily: "Oswald",
      fontWeight: "normal",
      borderColor: "rgb(73, 73, 73)",
      background: "rgb(18, 18, 18)",
      border: "1px solid rgb(32, 32, 32)",
    };
  
    const handleChooseClick = () => {
      handleSwitchWork(work?.work_id);
    };
  
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
          fillBackground: isFinished || enoughBalance ? "#00ff00" : "#ff0000",
        },
        {
          icon: Icons.levelIcon,
          text: translations.requiredLevel[lang],
          value: work?.requiredLevel,
          fillPercent: "100%",
          fillBackground: isFinished || requiredLevel ? "#00ff00" : "#ff0000",
        },
        work?.skill_id_required && {
          icon: skills?.find(
            (skill) => skill?.skill_id === work?.skill_id_required
          )?.link,
          text: globalTranslations.skills.requiredSkill[lang],
          value: skills?.find(
            (skill) => skill?.skill_id === work?.skill_id_required
          )?.name[lang],
          fillPercent: "100%",
          fillBackground: isFinished || requiredSkill ? "#00ff00" : "#ff0000",
        },
        {
          icon: Icons.respect,
          text: translations.respectRequired[lang],
          value: work?.respect_required,
          fillPercent: "100%",
          fillBackground: isFinished || requiredRespect ? "#00ff00" : "#ff0000",
        },
        {
          icon: Icons.hungryDecrease,
          text: translations.hungryDecrease[lang],
          value: Math.floor(work?.hungry_cost_per_minute * 60) + "/" + translations.hour[lang],
        },
        {
          icon: Icons.moodDecrease,
          text: translations.moodDecrease[lang],
          value: Math.floor(work?.mood_cost_per_minute * 60) + "/" + translations.hour[lang],
        },
        {
          icon: Icons.energyDecrease,
          text: translations.energyDecrease[lang],
          value: Math.floor(work?.energy_cost_per_minute * 60) + "/" + translations.hour[lang],
        },
      ].filter(Boolean),
      buttons: [
        {
          ...(isCurrentWork ? currentWorkButtonStyle : buttonStyle),
          text: isFinished
            ? isCurrentWork
              ? translations.currentWork[lang]
              : translations.choose[lang]
            : buyStatus
            ? work?.coins_price
            : translations.unavailable[lang],
          icon: buyStatus ? Icons.balance : null,
          active: isFinished ? !isCurrentWork : buyStatus,
          onClick: isFinished
            ? isCurrentWork
              ? undefined
              : handleChooseClick
            : buyStatus
            ? () => handleBuyWork(work?.work_id)
            : undefined,
          onPress: isFinished
            ? isCurrentWork
              ? undefined
              : handleChooseClick
            : buyStatus
            ? () => handleBuyWork(work?.work_id)
            : undefined, // Fallback for Button component
        },
      ],
    };
  
    return data;
  };

  const getItemWorkParams = (workId) => {
    const work = getWorkById(workId)
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

    if (userParameters?.work_id >= workId) {
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
    const work = getWorkById(workId);
    const currentWork = getWorkById(userParameters?.current_work_id || userParameters?.work_id);
    const requiredRespect = userParameters?.respect >= work?.respect_required;
    const requiredSkill = work?.skill_id_required ? checkLearnedSkill(work?.skill_id_required) : true;
    const requiredLevel = userParameters?.level >= work?.work_id;
    const isNextLevelWork = workId === userParameters?.work_id + 1;
    const enoughBalance = userParameters?.coins >= work?.coins_price;
    
    const buyStatus =
      requiredRespect &&
      requiredSkill &&
      requiredLevel &&
      isNextLevelWork &&
      enoughBalance;
  
    const baseButtonStyle = {
      width: "100%",
      height: 44,
      shadowColor: "rgb(199, 80, 21)",
      color: "rgb(255, 255, 255)",
      ownColor: "rgb(255, 118, 0)",
      bg: "rgb(255, 118, 0)", // Changed bgColor to bg to match your provided code
      fontSize: 14,
      fontFamily: "Oswald",
      fontWeight: "normal",
      borderColor: "rgb(255, 141, 0)",
      background: "rgb(255, 118, 0)",
      border: "1px solid rgb(255, 141, 0)",
    };
  
    const currentWorkStyle = {
      width: "100%",
      height: 44,
      shadowColor: "rgb(32, 32, 32)",
      color: "rgb(0, 255, 183)",
      ownColor: "rgb(255, 118, 0)",
      bg: "rgb(18, 18, 18)",
      fontSize: 14,
      fontFamily: "Oswald",
      fontWeight: "normal",
      borderColor: "rgb(73, 73, 73)",
      background: "rgb(18, 18, 18)",
      border: "1px solid rgb(32, 32, 32)",
    };
  
    if (workId <= userParameters?.work_id) {
      return [
        {
          ...(currentWork?.work_id === workId ? currentWorkStyle : baseButtonStyle),
          text: currentWork?.work_id === workId ? translations.currentWork[lang] : translations.choose[lang],
          onClick: () => {
            setModalData(setWorkModalData(work));
            setVisibleModal(true);
          },
          active: true,
        },
      ];
    }
  
    return [
      {
        text: buyStatus ? work?.coins_price : translations.unlock[lang],
        onClick: () => {
          setModalData(setWorkModalData(work));
          setVisibleModal(true);
        },
        icon: buyStatus && Icons.balance,
        active: buyStatus,
        shadowColor: buyStatus && "rgb(199, 80, 21)",
        borderColor: "rgb(255, 141, 0)",
        color: buyStatus ? "rgb(255, 255, 255)" : undefined,
        ownColor: buyStatus ? "rgb(255, 118, 0)" : undefined,
        bg: buyStatus ? "rgb(255, 118, 0)" : undefined,
        background: buyStatus ? "rgb(255, 118, 0)" : undefined,
        border: buyStatus ? "1px solid rgb(255, 141, 0)" : undefined,
        fontSize: 14,
        fontFamily: "Oswald",
        fontWeight: "normal",
      },
    ];
  };

  useEffect(() => {  
    refreshData().catch()
    getWorks().then((r) => setWorks(r))
    getSkills().then((r) => setSkills(r)) // Get list of skills
    getActiveProcess(userId).then((r) => setActiveProcess(r))
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
    // updateInformation()
  }, [])

  return (
    <ScreenContainer withTab>
      {/* User main work card*/}
      {works?.sort((a, b) => a.work_id - b.work_id).filter(work => work.work_id < userParameters.work_id).map((work, index) => (
        <ItemCard
          key={index}
          ItemIcon={work?.link}
          ItemTitle={work?.name[lang]}
          ItemParamsBlocks={getItemWorkParams(work?.work_id)}
          ItemButtons={getItemWorkButton(work?.work_id)}
          ItemIndex={index}
          ItemDescription={work?.description[lang]}
        />
      ))}
      {works?.sort((a, b) => a.work_id - b.work_id).filter(work => work.work_id >= userParameters.work_id).map((work, index) => (
        <ItemCard
          key={index}
          ItemIcon={work?.link}
          ItemTitle={work?.name[lang]}
          ItemParamsBlocks={getItemWorkParams(work?.work_id)}
          ItemButtons={getItemWorkButton(work?.work_id)}
          ItemIndex={index}
          ItemDescription={work?.description[lang]}
        />
      ))}

    </ScreenContainer>
  )
}

export default WorkTab
