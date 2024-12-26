import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import coins30000 from "../icons/coins30000.png"
import tg300000 from "../icons/tg30000.png"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import { useEffect, useState, useRef, useCallback } from "react"
import Assets from "../../../assets"
import { claimTask, getTasks } from "../../../services/user/user"

const TaskTab = ({ userId, userParameters, setUserParameters }) => {
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
            text: "Ссылка",
            onClick: () => { window.location.href = task.link },
            active: true,
          },
          {
            text: "Проверить",
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
    <ScreenContainer withTab>
      {tasks?.map((task, index) => (
        <ItemCard
          key={index}
          ItemBottomAmount={task.reward}
          ItemIcon={Assets.Icons.shittonsmoney}
          ItemTitle={task?.title}
          ItemDescription={task?.description}
          ItemButtons={task?.buttons}
          ItemIndex={index}
        />
      ))}
    </ScreenContainer>
  )
}

export default TaskTab
