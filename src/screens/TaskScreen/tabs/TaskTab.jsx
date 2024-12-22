import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import coins30000 from "../icons/coins30000.png"
import tg300000 from "../icons/tg30000.png"
import taskIcon from "../icons/taskIcon.png"

import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import { useEffect, useState } from "react"
import { claimTaskReward, fetchTaskIsCompleted, getTasks, getUserTasks } from "../../../services/task/task"
import { getParameters } from "../../../services/user/user"
const TaskTab = ({ userId, userParameters, setUserParameters }) => {
  const [tasks, setTasks] = useState(null)
  const [userTasks, setUserTasks] = useState(null)
  const [ftasks, setFtasks] = useState(null)

  useEffect(() => {
    getTasks().then((tasks) => setTasks(tasks))
  }, [])

  useEffect(() => {
    const promises = tasks?.map((task) => fetchTaskIsCompleted(task?.id, userId))
    console.log("promises", promises)
    if (promises) {
      Promise.all(promises).then(() => {
        getUserTasks(userId).then((tasks) => {
          setUserTasks(tasks)})
      } )
    }
   
  }, [tasks])

  useEffect(() => console.log("USER tasks", userTasks), [userTasks])

  const checkTaskIsClaimed = (taskId) => {
    if (
      userTasks?.find((task) => task?.task_id === taskId)?.status === "claimed"
    )
      return true
  }
  const checkTaskIsCompleted = (taskId) => {
    if (
      userTasks?.find((task) => task?.task_id === taskId)?.status ===
      "completed"
    )
      return true
  }

  const handleClaimTaskReward = async (taskId) => {
    console.log("Give ", taskId, userId)
    await claimTaskReward(taskId, userId)
    const tasks = await getUserTasks(userId)
    const parameters = await getParameters(userId)
    setUserTasks(tasks)
    setUserParameters(parameters.parameters)
  }

  const getTaskButtons = async () => {}
  // useEffect(() => {
  //   setTasks([
  //     {
  //       title: "Подписаться на Youtube",
  //       icon: coins30000,
  //       description: "Подпишись на наш канал, и забирай награду",
  //       buttons: [
  //         {
  //           text: "Ссылка",
  //           onClick: () =>
  //             (window.location.href = "https://www.youtube.com/@13thFloorGame"),
  //           active: true,
  //         },
  //         {
  //           text: "Проверить",
  //           onClick: () => console.log("CHECK sub"),
  //           active: true,
  //         },
  //       ],
  //     },
  //     {
  //       title: "Подписаться на Bad Day, Buddy?",
  //       icon: tg300000,
  //       description: "Подпишись на наш канал, и забирай награду",
  //       buttons: [
  //         {
  //           text: "Ссылка",
  //           onClick: () =>
  //             (window.location.href = "https://t.me/Game_13thFloor"),
  //           active: true,
  //         },
  //         {
  //           text: "Проверить",
  //           onClick: () => console.log("CHECK sub"),
  //           active: true,
  //           fontSize: "10px"
  //         },
  //       ],
  //     },
  //     {
  //       title: "Подписаться на Телеграм",
  //       icon: coins30000,
  //       description: "Подпишись на наш канал, и забирай награду",
  //       buttons: [
  //         {
  //           text: "Ссылка",
  //           onClick: () =>
  //             (window.location.href = "https://t.me/Game_13thFloor"),
  //           active: true,
  //         },
  //         {
  //           text: "Проверить",
  //           onClick: () => console.log("CHECK sub"),
  //           active: true,
  //         },
  //       ],
  //     },
  //   ])
  // }, [])

  return (
    <ScreenContainer withTab>
      {tasks?.map((task, index) => (
        <ItemCard
          ItemIcon={taskIcon}
          ItemTitle={task?.name_ru}
          ItemDescription={task?.descr_ru}
          ItemButtons={[
            {
              text: checkTaskIsClaimed(task?.id) ? "Выполнено": checkTaskIsCompleted(task?.id) ? "Получить" :  "Не выполнено",
              onClick: () => checkTaskIsCompleted(task?.id) && handleClaimTaskReward(task?.id, userId),
              active: true,
            },
          ]}
          ItemIndex={index}
        />
      ))}
    </ScreenContainer>
  )
}

export default TaskTab
