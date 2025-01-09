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
import { duration } from "moment-timezone"


const SkillTab = ({
  modalData,
  setModalData,
  setUserParameters,
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

  // Handle buy skill
  const handleBuySkill = async (skill) => {
    console.log(skill)
    await startProcess("skill", userId, skill?.skill_id)
    const userParameters = await getParameters(userId)
    const userLearningSkills = await getProcesses("skill", userId)
    console.log(userLearningSkills)

    setUserParameters(userParameters)
    setUserLearningSkills(userLearningSkills)
  }

  useEffect(() => {
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


  // Check active status (color) for skill card
  const checkActiveSkillButton = (skill) => {
    if (checkLearningSkill(skill?.skill_id)) return true
    if (checkLearnedSkill(skill?.skill_id)) return false
    if (userParameters?.coins < skill?.coins_price) return false
    if (skill?.skill_id_required) {
      if (!checkLearnedSkill(skill?.skill_id_required)) return false
    }
    return true
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
        skill?.skill_id_required && {
          icon: skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)
            ?.link,
          text: skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)
            ?.translations.name[lang] || skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)
            ?.translations.name[lang],
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
        {
          icon: !(learned || learning) && Icons.balance,
          text:
            (translations.learned[lang] && translations.learned[lang]) ||
            (translations.learning[lang] && translations.boost[lang]) ||
            skill?.coins_price,
          onClick: bottomButtonOnClick,
          active: checkActiveSkillButton(skill),
          
            
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

    let accessStatus = userParameters?.coins >= skill?.coins_price

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

    return [
      {
        icon: !(learned || learning) && Icons.balance,
        text:
          (translations.learned[lang] && translations.learned[lang]) ||
          (translations.learning[lang] && translations.boost[lang]) ||
          skill?.coins_price,
        onClick: () => {
          setModalData(setSkillModalData(skill))
          setVisibleModal(true)
        },
        active: checkActiveSkillButton(skill),
        
      },
    ]
  }



  // Interval update information
  const updateInformation = () => {
    try {
      setInterval(async () => {
        const learningSkills = await getProcesses("skill", userId) // Learning at time skills
        const learnedSkills = await getUserSkills(userId) // Already learned skills
        const trainingStatus = await getActiveProcess(userId) // Check current training status

        setUserLearningSkills(learningSkills)
        setUserLearnedSkills(learnedSkills)
        setActiveProcess(trainingStatus)
      }, 30000)
    } catch (e) {
      console.log("Error when updateInfromation", e)
    }
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
    updateInformation() // Start interval update info
  }, [])

  return (
    <ScreenContainer withTab>
   

      {/* List of skills*/}
      {skills?.map((skill, index) => (
        <ItemCard
          key={index}
          ItemIcon={skill?.link}
          ItemTitle={skill.name[lang]}
          ItemDescription={skill?.description}
          ItemParamsBlocks={getItemSkillParamsBlock(skill)}
          ItemButtons={getItemSkillButton(skill)}
          ItemIndex={index + 1}
        />
      ))}
    </ScreenContainer>
  )
}

export default SkillTab
