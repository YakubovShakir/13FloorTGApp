import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import Assets from "../../../assets"
import { useEffect, useState } from "react"
import { getSkills, getUserConstantEffects, getUserSkills } from "../../../services/skill/skill"
import {
  updateProcessTimers,
  updateProcessesTimers,
} from "../../../utils/updateTimers"
import {
  getTrainingParameters,
  getParameters,
} from "../../../services/user/user"
import {
  getProcesses,
  startProcess,
  getActiveProcess,
} from "../../../services/process/process"
import formatTime, { getMinutesAndSeconds } from "../../../utils/formatTime"
import countPercentage from "../../../utils/countPercentage.js"
import { useSettingsProvider } from "../../../hooks"
import { useUser } from "../../../UserContext.jsx"
import moment from "moment-timezone"

const SkillTab = ({
  modalData,
  setModalData,
  setVisibleModal,
  userParameters,
  userId,
}) => {
  const [skills, setSkills] = useState(null) // List of skills
  const [effects, setEffects] = useState(null)
  const [userLearningSkills, setUserLearningSkills] = useState(null) //  User already Learned skills
  const [userLearnedSkills, setUserLearnedSkills] = useState(null) // User learning at this time skills
  const [trainingParamters, setTrainingParameters] = useState(null) // User training parameters
  const [activeProcess, setActiveProcess] = useState(null) //  User active training


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
    learning: {
      ru: 'Изучается..',
      en: 'Learning..'
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
    trainingDesc: {
      ru: "Хорошая тренировка поднимает настроение!",
      en: "A good workout lifts your mood!"
    },
    duration: {
      ru: 'Длительность',
      en: 'Duration'
    },
    requiredLevel: {
      ru: 'Необходимый уровень',
      en: 'Required level'
    }
  }

  const { Icons } = Assets
  // Return skill if it already learned
  const checkLearnedSkill = (skillId) => {
    const learned = userLearnedSkills?.find(
      (skill) => skill?.skill_id === skillId
    )
    return learned && skills?.find((skill) => skill?.skill_id === skillId)
  }
  // Return skill if it in study
  const checkLearningSkill = (skillId) => {
    const learning = userLearningSkills?.find(
      (skill) => skill?.type_id === skillId
    )
    return learning && skills?.find((skill) => skill?.skill_id === skillId)
  }

  const checkLearningEffect = (effectId) => {
    const learning = userLearningSkills?.find(
      (skill) => skill?.type_id === effectId && skill?.sub_type === 'constant_effects'
    )

    return learning
  }

  const { refreshData } = useUser()

  // Handle buy skill
  const handleBuySkill = async (skill, sub_type) => {
    await startProcess("skill", userId, skill?.skill_id || skill.id, sub_type)
    getSkills().then((r) => {
      setSkills(r.filter(skill => skill.requiredLevel <= userParameters.level))
    }) // Get list of skills
    getProcesses("skill", userId).then((r) => setUserLearningSkills(r)) // Get current learning skills
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
    getUserConstantEffects(userId).then((r) => {
      setEffects(r)
    }) // Get list of user constant effects
    setVisibleModal(false)
  }

  useEffect(() => {
    if (!modalData) return;

    if (modalData?.type === "skill") {
      if (modalData?.sub_type === 'constant_effects') {
        const learning = userLearningSkills?.find(
          (skill) => skill?.type_id === modalData?.id && skill.sub_type === 'constant_effects'
        )
        
        if (learning && effects?.work_duration_decrease?.current) {
          const updatedModalData = setEffectModalData(effects.work_duration_decrease.current)
          if (updatedModalData) {
            setModalData(updatedModalData)
          }
        }
      } else {
        const learning = userLearningSkills?.find(
          (skill) => skill?.type_id === modalData?.id
        )

        if (learning) {
          const learningSkill = skills?.find(
            (skill) => skill?.skill_id === learning?.type_id
          )
          setModalData(setSkillModalData(learningSkill))
        }
      }
    }
  }, [userLearningSkills, effects])


  const getButtonInfo = (skill) => {
    const learning = checkLearningSkill(skill?.skill_id)
    const learned = checkLearnedSkill(skill?.skill_id)
    const icon = learned || learning ? null : Icons.balance

    let text = skill?.coins_price

    if (learning) text = translations.learning[lang]
    if (learned) text = translations.learned[lang]

    return {
      text,
      icon,
    }
  }

  const getEffectButtonInfo = (effect) => {
    const learning = checkLearningEffect(effect?.next?.id)
    const icon = learning ? null : Icons.balance

    let text = effect?.next?.price

    if (learning) text = translations.learning[lang]

    return {
      text,
      icon,
    }
  }

  // Build modal data for skill card
  const setSkillModalData = (skill) => {
    const learned = checkLearnedSkill(skill?.skill_id)
    const learning = userLearningSkills?.find(
      (sk) => sk?.type_id === skill?.skill_id
    )

    const bottomButtonOnClick = () => handleBuySkill(skill)

    const data = {
      type: "skill",
      id: skill?.skill_id,
      sub_type: null,
      title: skill?.name[lang] || skill?.name,
      image: skill?.link,
      blocks: [
        {
          icon: Icons.balance,
          text: translations.cost[lang],
          value: skill?.coins_price,
          fillPercent: '100%',
          fillBackground: userParameters?.coins < skill?.coins_price
            ? "#4E1010" // red
            : "#0E3228", // green

        },
        {
          icon: Icons.levelIcon,
          text: translations.requiredLevel[lang],
          value: skill?.requiredLevel,
          fillPercent: "100%",
          fillBackground:
            userParameters?.level < skill?.requiredLevel
              ? "#4E1010" // red
              : "#0E3228", // green
        },
        skill?.skill_id_required && {
          icon: skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)
            ?.link,
          text: skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)?.name[lang],
          fillPercent: "100%",
          fillBackground: !checkLearnedSkill(skill?.skill_id_required)
            ? "#4E1010" // red
            : "#0E3228", // green
        },
        {
          icon: Icons.clock,
          text: translations.duration[lang],
          fillPercent:
            learning?.duration || learning?.seconds
              ? countPercentage(
                learning?.duration * 60 + learning?.seconds,
                skill?.duration * 60
              )
              : false,
          value:
            learning?.duration || learning?.seconds
              ? formatTime(learning?.duration, learning?.seconds)
              : formatTime(skill?.duration),
        },
      ].filter(Boolean),
      buttons: [
        // Убираем пока ускорить
        {
          ...getButtonInfo(skill),
          onClick: !(learning || learned) && bottomButtonOnClick,
          active: !(learning || learned) && (skill?.skill_id_required ? checkLearnedSkill(skill?.skill_id_required) : true) && userParameters?.level >= skill?.requiredLevel && userParameters.coins >= skill.coins_price,
        },
      ],
    }
    return data
  }

    // Build modal data for skill card
    const setEffectModalData = (effect) => {
      if (!effect) return null;
  
      const learning = userLearningSkills?.find(
        (sk) => sk?.type_id === effect?.next?.id && sk?.sub_type === 'constant_effects'
      )
      
      const bottomButtonOnClick = () => handleBuySkill(effect, 'constant_effects')
      
      return {
        type: "skill",
        sub_type: 'constant_effects',
        id: effect?.next?.id,
        title: effect?.next?.name?.[lang],
        image: effect?.next?.link,
        blocks: [
          {
            icon: Icons.balance,
            text: translations.cost[lang],
            value: effect?.next?.price,
            fillPercent: '100%',
            fillBackground: userParameters?.coins < effect?.next?.price
              ? "#4E1010" 
              : "#0E3228",
          },
          {
            icon: Icons.levelIcon,
            text: translations.requiredLevel[lang],
            value: effect?.next?.required_level,
            fillPercent: "100%",
            fillBackground:
              userParameters?.level < effect?.next?.required_level
                ? "#4E1010"
                : "#0E3228",
          },
          {
            icon: Icons.clock,
            text: translations.duration[lang],
            fillPercent:
              learning?.duration || learning?.seconds
                ? countPercentage(
                  learning?.duration * 60 + learning?.seconds,
                  effect?.next?.duration * 60
                )
                : false,
            value: formatTime(effect?.next?.duration)
          }
        ].filter(Boolean),
        buttons: [
          {
            ...getEffectButtonInfo(effect),
            onClick: !learning && bottomButtonOnClick,
            active: !learning && userParameters?.level >= effect?.required_level && userParameters.coins >= effect?.price,
          },
        ],
      }
    }

  // Get parameters for skill card
  const getItemSkillParamsBlock = (skill) => {
    const learned = checkLearnedSkill(skill?.skill_id)
    if (learned) return []

    const requiredSkill = skill?.skill_id_required

    const learning = userLearningSkills?.find(
      (sk) => sk?.type_id === skill?.skill_id
    )
    const { duration, seconds } = learning ? getMinutesAndSeconds(Math.max(0, learning?.target_duration_in_seconds || learning?.base_duration_in_seconds - moment().diff(moment(learning?.createdAt), 'seconds'))) : getMinutesAndSeconds(skill.duration * 60)
    const timerBar = {
      icon: Icons.clock,
      fillPercent: learning ? Math.abs(countPercentage(
        duration * 60 + seconds,
        learning?.target_duration_in_seconds || learning?.base_duration_in_seconds || skill.duration * 60
      )) - 100: 0,
      value: formatTime(duration, seconds),
    }
    const learnedRequiredSkill = skill.skill_id_required ? checkLearnedSkill(skill.skill_id_required) : true

    let accessStatus = !(learned || learning) && learnedRequiredSkill && userParameters?.coins >= skill.coins_price && userParameters.level >= skill.requiredLevel

    if (learned) accessStatus = false

    if (requiredSkill) accessStatus && checkLearnedSkill(requiredSkill)

    const accessBar = {
      icon: accessStatus ? Icons.unlockedIcon : Icons.lockedIcon,
      value: accessStatus ? translations.available[lang] : translations.unavailable[lang],
    }

    return [[timerBar], [accessBar]]
  }

  const getItemEffectsParamsBlock = (effect) => {
    const learning = userLearningSkills?.find(
      (sk) => sk?.type_id === effect?.next?.id && sk?.sub_type === 'constant_effects'
    )

    const { duration, seconds } = learning ? getMinutesAndSeconds(learning?.target_duration_in_seconds || learning?.base_duration_in_seconds) : getMinutesAndSeconds(effect.next.duration * 60)
    const timerBar = {
      icon: Icons.clock,
      fillPercent: learning ? Math.abs(countPercentage(
        moment().diff(moment(learning?.createdAt), 'seconds'),
        learning?.target_duration_in_seconds || learning?.base_duration_in_seconds || effect.duration * 60
      ) - 100) : 0,
      value: learning ? formatTime(learning.duration, learning.seconds) : formatTime(duration, seconds),
    }

    let accessStatus = !learning && userParameters?.coins >= effect.price && userParameters.level >= effect.required_level

    const accessBar = {
      icon: accessStatus ? Icons.unlockedIcon : Icons.lockedIcon,
      value: accessStatus ? translations.available[lang] : translations.unavailable[lang],
    }

    return [[timerBar], [accessBar]]
  }

  // Get button for skill card
  const getItemSkillButton = (skill) => {
    const learned = checkLearnedSkill(skill?.skill_id)
    const learning = checkLearningSkill(skill?.skill_id)
    const learnedRequiredSkill = skill.skill_id_required ? checkLearnedSkill(skill.skill_id_required) : true

    const active = !(learned || learning) && learnedRequiredSkill && userParameters?.coins >= skill.coins_price && userParameters.level >= skill.requiredLevel

    return [
      {
        ...getButtonInfo(skill),
        onClick: () => {
          setModalData(setSkillModalData(skill))
          setVisibleModal(true)
        },
        active,
      },
    ]
  }

    // Get button for skill card
    const getItemEffectButton = (effect) => {
      const learning = checkLearningEffect(effect?.next?.id)
  
      const active = !learning && userParameters?.coins >= effect.next.price && userParameters.level >= effect.next.required_level
  
      return [
        {
          ...getEffectButtonInfo(effect),
          onClick: () => {
            setModalData(setEffectModalData(effect))
            setVisibleModal(true)
          },
          active,
        },
      ]
    }

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const updater = updateProcessesTimers(
      userLearningSkills,
      setUserLearningSkills,
      () => {
        getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
        getUserConstantEffects(userId).then((r) => {
          setEffects(r)
        })
      }
    )
    
    return () => clearInterval(updater)
  }, [isInitialized, userLearningSkills])

  useEffect(() => {
    getUserConstantEffects(userId).then((r) => {
      setEffects(r)
    }).catch(r => console.log('error', r)) // Get list of user constant effects
    getSkills().then((r) => {
      setSkills(r.filter(skill => skill.requiredLevel <= userParameters.level))
    }) // Get list of skills
    getProcesses("skill", userId).then((r) => setUserLearningSkills(r)) // Get current learning skills
    getActiveProcess(userId).then((r) => setActiveProcess(r)) // Get active training if exist
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
      setIsInitialized(true)
  }, [])

  return (
    <ScreenContainer withTab>
      {/* List of skills*/}
      {skills?.filter((a) => checkLearningSkill(a.skill_id)).map((skill, index) => (
        <ItemCard
          key={index}
          ItemIcon={skill?.link}
          ItemTitle={skill.name[lang]}
          ItemDescription={skill?.description && skill?.description[lang]}
          ItemParamsBlocks={getItemSkillParamsBlock(skill)}
          ItemButtons={getItemSkillButton(skill)}
          ItemIndex={index + 1}
        />
      ))}
      {skills?.filter((a) => !checkLearningSkill(a.skill_id) && !checkLearnedSkill(a.skill_id)).map((skill, index) => (
        <ItemCard
          key={index}
          ItemIcon={skill?.link}
          ItemTitle={skill.name[lang]}
          ItemDescription={skill?.description && skill?.description[lang]}
          ItemParamsBlocks={getItemSkillParamsBlock(skill)}
          ItemButtons={getItemSkillButton(skill)}
          ItemIndex={index + 1}
        />
      ))}
        
    {effects ? Object.keys(effects).map(key => {
        const effect = effects[key];

        // Check if the effect object exists and has the necessary data
        if (effect && (effect.current || effect.next)) {
          const displayEffect = effect.current || effect.next; // Prioritize current, fallback to next

          return (
            <ItemCard
              ItemIcon={displayEffect.link}
              ItemTitle={displayEffect.name[lang]} // Fallback to key if names are missing
              ItemDescription={displayEffect.description[lang]} // Empty string if no description
              ItemParamsBlocks={getItemEffectsParamsBlock(effect)}
              ItemButtons={getItemEffectButton(effect)}
              ItemBottomAmount={(lang === 'en' ? 'Level ' : 'Уровень ') + (effect.current?.level || 0)}
              ItemIndex={1} // Calculate index dynamically
            />
          );
        }
        return null; // Return null if the effect data is missing to avoid rendering issues
      }) : null}

      {skills?.filter((a) => !checkLearningSkill(a.skill_id) && checkLearnedSkill(a.skill_id)).map((skill, index) => (
        <ItemCard
          key={index}
          ItemIcon={skill?.link}
          ItemTitle={skill.name[lang]}
          ItemDescription={skill?.description && skill?.description[lang]}
          ItemParamsBlocks={getItemSkillParamsBlock(skill)}
          ItemButtons={getItemSkillButton(skill)}
          ItemIndex={index + 1}
        />
      ))}
    
    
    </ScreenContainer>
  )
}

export default SkillTab
