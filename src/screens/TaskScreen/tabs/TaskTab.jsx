import ItemCard from "../../../components/simple/ItemCard/ItemCardTask"
import coins30000 from "../icons/coins30000.png"
import tg300000 from "../icons/tg30000.png"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import { useEffect, useState, useRef, useCallback } from "react"
import Assets from "../../../assets"
import { claimTask, getTasks } from "../../../services/user/user"
import { useSettingsProvider } from "../../../hooks"

const TaskTab = ({ userId, userParameters, setUserParameters }) => {


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
    check: {
      ru: 'Проверить',
      en: 'Check'
    },
    link: {
      ru: '🔗',
      en: '🔗'
    },
   
  }




  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState(null)
  const currentUserId = useRef(userId)

  const fetchTasks = useCallback(async () => {
    if (!currentUserId.current) return

    setIsLoading(true)
    try {
      const fetchedTasks = await getTasks(currentUserId.current)
      let socialTasks = fetchedTasks.social_tasks
      socialTasks = socialTasks.map(task => {
        return {
          ...task,
          buttons: task.is_complete ? [] : [{
            text: translations.link[lang],
            onClick: () => { window.location.href = task.link },
            active: true,
          },
          {
            text: translations.check[lang],
            onClick: () => handleTaskClaim(task.id),
            active: true,
          },]
        }
      })
      setTasks([
        ...socialTasks.sort((a, b) => Number(a.is_complete) - Number(b.is_complete))
      ])
    } catch (error) {
      console.log('Failed getting tasks')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleTaskClaim = async (taskId) => {
    try {
      await claimTask(currentUserId.current, taskId)
      await fetchTasks()
    } catch (error) {
      console.log('Failed claiming task')
    }
  }

  useEffect(() => {
    currentUserId.current = userId
    fetchTasks()
  }, []) // Remove userId dependency

  return (
    <ScreenContainer >
      {tasks?.map((task, index) => (
        <ItemCard
          key={index}
          ItemBottomAmount={task.reward}
          ItemIcon={Assets.Icons.shittonsmoney}
          ItemTitle={task?.title[lang]}
          ItemDescription={task?.description[lang]}
          ItemButtons={task?.buttons}
          ItemIndex={index}
        />
      ))}
    </ScreenContainer>
  )
}

export default TaskTab
