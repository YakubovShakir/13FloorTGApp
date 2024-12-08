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
    await startProcess("skill", userId, skill?.skill_id)
    const userParameters = await getParameters(userId)
    const userLearningSkills = await getProcesses("skill", userId)

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

  // Get status for buy skill
  const getSkillBuyStatus = (skill) => {
    const coins = userParameters?.coins >= skill?.coins_price
    const learned = checkLearnedSkill(skill?.skill_id)
    const learning = checkLearningSkill(skill?.skill_id)
    const requiredSkill = checkLearnedSkill(skill?.skill_id_required)

    if (coins && !learned && !learning && requiredSkill) return true
  }

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
    const bottomButtonOnClick =
      getSkillBuyStatus(skill) && (() => handleBuySkill(skill))

    const data = {
      type: "skill",
      id: skill?.skill_id,
      title: skill?.name,
      image: skill?.link,
      blocks: [
        {
          icon: Icons.balance,
          text: "Стоимость",
          value: skill?.coins_price,
        },
        {
          icon: Icons.clock,
          text: null,
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
        skill?.skill_id_required && {
          icon: skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)
            ?.link,
          text: skills?.find((sk) => sk?.skill_id === skill?.skill_id_required)
            ?.name,
          fillPercent: "100%",
          fillBackground: !checkLearnedSkill(skill?.skill_id_required)
            ? "#4E1010" // red
            : "#0E3228", // green
        },
      ].filter(Boolean),
      buttons: [
        {
          icon: !(learned || learning) && Icons.balance,
          text:
            (learned && "Изучено") ||
            (learning && "Ускорить") ||
            skill?.coins_price,
          onClick: bottomButtonOnClick,
          active: checkActiveSkillButton(skill),
          bg:
            (learned &&
              "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 50%)") ||
            (learning &&
              "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)"),
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

    if (requiredSkill) accessStatus &&= checkLearnedSkill(requiredSkill)

    const accessBar = {
      icon: accessStatus ? Icons.unlockedIcon : Icons.lockedIcon,
      value: accessStatus ? "Доступно" : "Недоступно",
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
          (learned && "Изучено") ||
          (learning && "Ускорить") ||
          skill?.coins_price,
        onClick: () => {
          setModalData(setSkillModalData(skill))
          setVisibleModal(true)
        },
        active: checkActiveSkillButton(skill),
        bg:
          (learned &&
            "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 50%)") ||
          (learning &&
            "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)"),
      },
    ]
  }

  // Start training process
  const handleStartTraining = async () => {
    await startProcess("training", userId)
    const activeProcess = await getActiveProcess(userId)
    setActiveProcess(activeProcess)
  }

  // Get parameters for static training card
  const getItemTrainingParams = () => {
    const activeTraining = activeProcess?.type === "training"
    return [
      [
        {
          icon: Icons.clock,
          value:
            activeTraining &&
            (activeProcess?.duration || activeProcess?.seconds)
              ? formatTime(activeProcess?.duration, activeProcess?.seconds)
              : formatTime(trainingParamters?.duration),
          fillPercent:
            activeTraining &&
            (activeProcess?.duration || activeProcess?.seconds)
              ? countPercentage(
                  activeProcess?.duration * 60 + activeProcess?.seconds,
                  trainingParamters?.duration * 60
                )
              : false,
        },
      ],
      [
        {
          icon: Icons.boosterArrow,
          value: "Усилений нет",
        },
      ],
    ]
  }

  // Get button for static training card
  const getItemTrainingButton = () => {
    return [
      {
        text: activeProcess?.type === "training" ? "В процессе" : "Начать",
        active: true,
        bg: "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)",
        shadowColor: "#AF370F",
        onClick:
          activeProcess?.type !== "training" && (() => handleStartTraining()),
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
    getSkills().then((r) => setSkills(r)) // Get list of skills
    getProcesses("skill", userId).then((r) => setUserLearningSkills(r)) // Get current learning skills
    getActiveProcess(userId).then((r) => setActiveProcess(r)) // Get active training if exist
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
    getTrainingParameters(userId).then((r) => setTrainingParameters(r)) // Get user training parameters
    updateInformation() // Start interval update info
  }, [])

  return (
    <ScreenContainer withTab>
      {/* User training static card*/}
      {trainingParamters && (
        <ItemCard
          ItemIcon={Icons.training}
          ItemTitle={"Тренировка"}
          ItemParamsBlocks={getItemTrainingParams()}
          ItemButtons={getItemTrainingButton()}
          ItemIndex={0}
        />
      )}

      {/* List of skills*/}
      {skills?.map((skill, index) => (
        <ItemCard
          key={index}
          ItemIcon={skill?.link}
          ItemTitle={skill.name}
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
