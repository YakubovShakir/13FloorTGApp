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
export const WorkTab = ({
  modalData,
  setModalData,
  setUserParameters,
  setVisibleModal,
  userParameters,
  userId,
}) => {
  const [skills, setSkills] = useState(null) // List of skills
  const [activeButton, setActiveButton] = useState(null);
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
  // Start work process
  const handleStartWork = async () => {
    console.log("start work")
    await startProcess("work", userId)

    const activeProcess = await getActiveProcess(userId)
    setActiveProcess(activeProcess)
  }

  // Stop work process
  const handleStopWork = async () => {
    await stopProcess(userId)
    setActiveProcess(null)
  }
  const handleButtonClick = (workId) => {
    setActiveButton(workId); // Устанавливаем активную кнопку
  };

  // Buy work
  const handleBuyWork = async (workId) => {
    await buyWork(userId, workId)
    const userParameters = await getParameters(userId)
    setUserParameters(userParameters.parameters)
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
          text: "Стоимость",
          value: work?.coins_price,
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
          text: (work?.hungry_cost_in_hour / 60).toFixed(2) + " / m",
        },
        {
          icon: Icons.moodDecrease,
          text: (work?.mood_cost_in_hour / 60).toFixed(2) + " / m",
        },
        {
          icon: Icons.energyDecrease,
          text: (work?.energy_cost_in_hour / 60).toFixed(2) + " / m",
        },
      ].filter(Boolean),
      buttons: [
        {
          text: buyStatus ? work?.coins_price : "Недоступно ",
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

    if (currentWork?.work_id === workId) {
      return [
        [
          {
            value: work?.coins_in_hour + " /  h",
            icon: Icons.balance,
          },
        ],
        [
          {
            value: "Усилений нет",
            icon: Icons?.boosterArrow,
          },
        ],
      ]
    }

    return [
      [
        {
          value: work?.coins_in_hour + " /  h",
          icon: Icons.balance,
        },
      ],
      [
        {
          value: buyStatus ? "Доступно" : "Недоступно",
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
          text: activeWork ? "Стоп" : "Начать",
          onClick:
            activeWork
              ? async () => await handleStopWork()
              : async () => {
                  await handleStartWork();
                  navigation.navigate('MainScreen'); // Переход на основной экран сразу после начала работы
                },
          icon: buyStatus && Icons.balance,
          active: true,
          bg: activeWork
            ? "linear-gradient(90deg, rgba(233,27,27,1) 0%, rgba(119,1,1,1) 100%)"
            : "linear-gradient(180deg, rgba(233,78,27,1) 0%, rgba(243,117,0,1) 100%)",
          shadowColor: activeWork ? "#4E1010" : "#AF370F",
        }
      ]
      
    }

    return [
      {
        text: buyStatus ? work?.coins_price : "Инфо",
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
    getWorks().then((r) => {
      console.log('works', r[0])
      setWorks(r)
    })
    getSkills().then((r) => setSkills(r)) // Get list of skills
    getActiveProcess(userId).then((r) => setActiveProcess(r))
    getUserSkills(userId).then((r) => setUserLearnedSkills(r)) // Get list of user skills
    updateInformation()
  }, [])

  return (
    <temCard >
      {/* User main work card*/}

      {userParameters?.work_id !== 0 && <ItemCard
        ItemIcon={getWorkById(userParameters?.work_id)?.link}
        ItemDescription="Отправляйся на работу, что бы заработать монет!"
        ItemTitle={getWorkById(userParameters?.work_id)?.name}
        ItemParamsBlocks={getItemWorkParams(userParameters?.work_id)}
        ItemButtons={getItemWorkButton(userParameters?.work_id)}
        ItemIndex={0}
      />}

     
    </temCard>
  )
}

export default WorkTab
