import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import Assets from "../../../assets"
import { useContext, useEffect, useState } from "react"
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
import { useSettingsProvider } from "../../../hooks.jsx"
import { canStartTraining } from "../../../utils/paramDep.js"
import { getDurationAndColor } from "../../../utils/paramBlockUtils.js"
import UserContext from "../../../UserContext.jsx"
import { useNavigate } from "react-router-dom"


const SkillTab = () => {
  const [skills, setSkills] = useState(null) // List of skills
  const [userLearningSkills, setUserLearningSkills] = useState(null) // User already Learned skills
  const [userLearnedSkills, setUserLearnedSkills] = useState(null) // User learning at this time skills
  const [trainingParamters, setTrainingParameters] = useState(null) // User training parameters
  const [activeProcess, setActiveProcess] = useState(null) // User active training

  const { userParameters, userId } = useContext(UserContext)
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
    }
  }

  const { Icons } = Assets
  // Check if the training button should be active
  const checkTrainingButtonActive = () => {
    // If user's mood is 100%, disable the button
    return canStartTraining(userParameters);
  }

  const navigate = useNavigate()

  // Handle start training
  const handleStartTraining = async () => {
    if (checkTrainingButtonActive()) {
      await startProcess("training", userId);
      navigate('/')
    }
  };

  // Get parameters for static training card
  const getItemTrainingParams = () => {
    const trainingDurationInSeconds = trainingParamters?.duration * 60
    console.log(userParameters)
    return [
      [
        {
          icon: Icons.clock,
          ...getDurationAndColor('training', trainingDurationInSeconds, userParameters)
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

  // Get button for static training card
  const getItemTrainingButton = () => {
    const canStart = canStartTraining(userParameters)
    return [
      {
        text: activeProcess?.type === "training" ? translations.inProgress[lang] : translations.start[lang],
        active: canStart, // Set button active status based on mood
        onClick: canStart && (() => {
          handleStartTraining();
        }),
      },
    ];
  };

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
    <>
      {trainingParamters && (
        <ItemCard
          ItemIcon={Icons.training}
          ItemTitle={translations.training[lang]}
          ItemDescription={translations.trainingDesc[lang]}
          ItemParamsBlocks={getItemTrainingParams()}
          ItemButtons={getItemTrainingButton()}
          ItemIndex={0}
        />
      )}
    </>
  )
}

export default SkillTab
