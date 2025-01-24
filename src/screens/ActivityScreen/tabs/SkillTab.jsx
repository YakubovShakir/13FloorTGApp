import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import Assets from "../../../assets"
import { useEffect, useState } from "react"
import { getSkills, getUserSkills } from "../../../services/skill/skill"
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
import formatTime from "../../../utils/formatTime"
import countPercentage from "../../../utils/countPercentage.js"
import { useSettingsProvider } from "../../../hooks"
import { useUser } from "../../../UserContext.jsx"

const SkillTab = ({
  modalData,
  setModalData,
  setVisibleModal,
  userParameters,
  userId,
}) => {
  const [skills, setSkills] = useState(null) // List of skills
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

  const { refreshData } = useUser()

  // Handle buy skill
  const handleBuySkill = async (skill) => {
    await startProcess("skill", userId, skill?.skill_id)
    getProcesses("skill", userId).then(learningSkills => setUserLearningSkills(learningSkills)) // Learning at time skills
    getUserSkills(userId).then(learnedSkills => setUserLearnedSkills(learnedSkills))
    getActiveProcess(userId).then(trainingStatus => setActiveProcess(trainingStatus))
    setUserLearningSkills(userLearningSkills)
  }

  useEffect(() => {
    refreshData()
    if (modalData?.type === "skill") {
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
  }, [userLearningSkills])

  const getButtonInfo = (skill) => {
    const learning = checkLearningSkill(skill.skill_id)
    const learned = checkLearnedSkill(skill.skill_id)
    const icon = learned || learning ? null : Icons.balance

    let text = skill.coins_price

    if (learning) text = translations.learning[lang]
    if (learned) text = translations.learned[lang]

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

      title: skill?.name[lang] || skill?.name,
      image: skill?.link,
      blocks: [
        {
          icon: Icons.balance,
          text: translations.cost[lang],
          value: skill?.coins_price,
          fillPercent: '100%',
          fillBackground: userParameters?.coins < skill.coins_price
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
          active: !(learning || learned) && (skill.skill_id_required ? checkLearnedSkill(skill.skill_id_required) : true) && userParameters.level >= skill.requiredLevel,
        },
      ],
    }
    return data
  }

  // Get parameters for skill card
  const getItemSkillParamsBlock = (skill) => {
    const learned = checkLearnedSkill(skill?.skill_id)
    if (learned) return []

    const requiredSkill = skill?.skill_id_required

    const learning = userLearningSkills?.find(
      (sk) => sk?.type_id === skill?.skill_id
    )
    const timerBar = {
      icon: Icons.clock,
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

  useEffect(() => {
    const updater = updateProcessesTimers(
      userLearningSkills,
      setUserLearningSkills
    )
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills

    return () => clearInterval(updater)
  }, [userLearningSkills])

  useEffect(() => {
    if (activeProcess?.type === "training") {
      const updater = updateProcessTimers(activeProcess, setActiveProcess)
      return () => clearInterval(updater)
    }
  }, [activeProcess])
  useEffect(() => {
    getSkills().then((r) => {
      setSkills(r)
    }) // Get list of skills
    getProcesses("skill", userId).then((r) => setUserLearningSkills(r)) // Get current learning skills
    getActiveProcess(userId).then((r) => setActiveProcess(r)) // Get active training if exist
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
    getTrainingParameters(userId).then((r) => setTrainingParameters(r)) // Get user training parameters
  }, [])

  return (
    <ScreenContainer withTab>


      {/* List of skills*/}
      {  }
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
