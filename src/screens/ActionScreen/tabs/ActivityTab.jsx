import { useState, useEffect } from "react"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import Assets from "../../../assets"
import { getActiveProcess, startProcess, stopProcess } from "../../../services/process/process"
import { getWorks } from "../../../services/work/work"
import { getParameters } from "../../../services/user/user"

export const CareScreen = ({ userId, userParameters }) => {
  const [works, setWorks] = useState(null) // Состояние для работ
  const [activeWorkProcess, setActiveWorkProcess] = useState(null) // Состояние для работы
  const [sleepProcess, setSleepProcess] = useState(null) // Состояние для сна
  const [trainingProcess, setTrainingProcess] = useState(null) // Состояние для тренировки
  const { Icons } = Assets

  // Старт работы
  const handleStartWork = async () => {
    await startProcess("work", userId)
    setActiveProcess("work") // Активируем работу
  }

  // Стоп работы
  const handleStopWork = async () => {
    await stopProcess(userId)
    setActiveWorkProcess(null) // Останавливаем процесс работы
  }

  // Старт сна
  const handleStartSleep = async () => {
    await startProcess("sleep", userId)
    setActiveProcess("sleep") // Активируем сон
  }

  // Стоп сна
  const handleStopSleep = async () => {
    await stopProcess(userId)
    setSleepProcess(null) // Останавливаем процесс сна
  }

  // Старт тренировки
  const handleStartTraining = async () => {
    await startProcess("training", userId)
    setActiveProcess("training") // Активируем тренировку
  }

  // Стоп тренировки
  const handleStopTraining = async () => {
    await stopProcess(userId)
    setTrainingProcess(null) // Останавливаем процесс тренировки
  }

  // Устанавливаем активный процесс, остановив остальные
  const setActiveProcess = (processType) => {
    // Останавливаем все процессы, чтобы только один был активен
    if (processType === "work") {
      setActiveWorkProcess("work")
      setSleepProcess(null)
      setTrainingProcess(null)
    } else if (processType === "sleep") {
      setActiveWorkProcess(null)
      setSleepProcess("sleep")
      setTrainingProcess(null)
    } else if (processType === "training") {
      setActiveWorkProcess(null)
      setSleepProcess(null)
      setTrainingProcess("training")
    }
  }

  // Получаем работу по id
  const getWorkById = (workId) => {
    return works?.find((work) => work?.work_id === workId)
  }

  // Параметры работы
  const getItemWorkParams = (workId) => {
    const work = getWorkById(workId)
    return [
      [
        {
          value: work?.coins_in_hour + " /  h",
          icon: Icons.balance,
        },
      ],
    ]
  }

  // Параметры сна
  const getItemSleepParams = () => {
    return [
      [
        {
          value: "8 ч", // Например, можно привязать к данным из состояния
          icon: Icons.sleep,
        },
      ],
    ]
  }

  // Параметры тренировки
  const getItemTrainingParams = () => {
    return [
      [
        {
          value: "1 ч", // Например, можно привязать к данным из состояния
          icon: Icons.training,
        },
      ],
    ]
  }

  // Кнопки для работы
  const getItemWorkButton = (workId) => {
    const activeWork = activeWorkProcess === "work" // Проверяем активен ли процесс работы
    return [
      {
        text: activeWork ? "Стоп" : "Начать",
        onClick: activeWork ? handleStopWork : handleStartWork,
        icon: Icons.balance,
        active: true,
        bg: activeWork
        ? "linear-gradient(rgb(18, 4, 2) 0%, rgba(233, 27, 27, 0.12) 100%)"
        : "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)",
        shadowColor: activeWork ? "rgb(255, 12, 0)" : "rgb(243, 117, 0)",
      },
    ]
  }

  // Кнопки для сна
  const getItemSleepButton = () => {
    const activeSleep = sleepProcess === "sleep" // Проверяем активен ли процесс сна
    return [
      {
        text: activeSleep ? "Стоп" : "Начать",
        onClick: activeSleep ? handleStopSleep : handleStartSleep,
        icon: Icons.sleep,
        active: true,
        bg: activeSleep
          ? "linear-gradient(rgb(18, 4, 2) 0%, rgba(233, 27, 27, 0.12) 100%)"
          : "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)",
        shadowColor: activeSleep ? "rgb(255, 12, 0)" : "rgb(243, 117, 0)",
      },
    ]
  }

  // Кнопки для тренировки
  const getItemTrainingButton = () => {
    const activeTraining = trainingProcess === "training" // Проверяем активен ли процесс тренировки
    return [
      {
        text: activeTraining ? "Стоп" : "Начать",
        onClick: activeTraining ? handleStopTraining : handleStartTraining,
        icon: Icons.training,
        active: true,
        bg: activeTraining
        ? "linear-gradient(rgb(18, 4, 2) 0%, rgba(233, 27, 27, 0.12) 100%)"
        : "linear-gradient(rgb(18, 4, 2) 0%, rgba(243, 117, 0, 0.2) 100%)",
        shadowColor: activeTraining ? "rgb(255, 12, 0)" : "rgb(243, 117, 0)",
      },
    ]
  }

  useEffect(() => {
    getWorks().then((r) => setWorks(r)) // Загружаем доступные работы
    getActiveProcess(userId).then((process) => {
      if (process?.type === "work") {
        setActiveWorkProcess("work")
      } else if (process?.type === "sleep") {
        setSleepProcess("sleep")
      } else if (process?.type === "training") {
        setTrainingProcess("training")
      }
    }) // Получаем активные процессы
  }, [userId])

  return (
    <ScreenContainer withTab>
      {/* Карточка для работы */}
      {userParameters?.work_id !== 0 && (
        <ItemCard
          ItemIcon={getWorkById(userParameters?.work_id)?.link}
          ItemDescription="Отправляйся на работу, что бы заработать монет!"
          ItemTitle={getWorkById(userParameters?.work_id)?.name}
          ItemParamsBlocks={getItemWorkParams(userParameters?.work_id)}
          ItemButtons={getItemWorkButton(userParameters?.work_id)}
          ItemIndex={0}
        />
      )}

      {/* Карточка для тренировки */}
      <ItemCard
        ItemIcon={Icons.training}
        ItemTitle="Тренировка"
        ItemDescription="Хорошая тренировка поднимает настроение!"
        ItemParamsBlocks={getItemTrainingParams()}
        ItemButtons={getItemTrainingButton()}
        ItemIndex={1}
      />

      {/* Карточка для сна */}
      <ItemCard
        ItemIcon={Icons.sleep}
        ItemTitle="Сон"
        ItemDescription="Сон поможет восстановить энергию!"
        ItemParamsBlocks={getItemSleepParams()}
        ItemButtons={getItemSleepButton()}
        ItemIndex={2}
      />
    </ScreenContainer>
  )
}

export default CareScreen
