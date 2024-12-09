import ItemCard from "../../../components/simple/ItemCard/ItemCard"
import coins30000 from "../icons/coins30000.png"
import tg300000 from "../icons/tg30000.png"
import ScreenContainer from "../../../components/section/ScreenContainer/ScreenContainer"
import { useEffect, useState } from "react"
const TaskTab = ({ userId, userParameters, setUserParameters }) => {
  const [tasks, setTasks] = useState(null)
  useEffect(() => {
    setTasks([
      {
        title: "Подписаться на Youtube",
        icon: coins30000,
        description: "Подпишись на наш канал, и забирай награду",
        buttons: [
          {
            text: "Ссылка",
            onClick: () =>
              (window.location.href = "https://www.youtube.com/@13thFloorGame"),
            active: true,
          },
          {
            text: "Проверить",
            onClick: () => console.log("CHECK sub"),
            active: true,
          },
        ],
      },
      {
        title: "Подписаться на Bad Day, Buddy?",
        icon: tg300000,
        description: "Подпишись на наш канал, и забирай награду",
        buttons: [
          {
            text: "Ссылка",
            onClick: () =>
              (window.location.href = "https://t.me/Game_13thFloor"),
            active: true,
          },
          {
            text: "Проверить",
            onClick: () => console.log("CHECK sub"),
            active: true,
          },
        ],
      },
      {
        title: "Подписаться на Телеграм",
        icon: coins30000,
        description: "Подпишись на наш канал, и забирай награду",
        buttons: [
          {
            text: "Ссылка",
            onClick: () =>
              (window.location.href = "https://t.me/Game_13thFloor"),
            active: true,
          },
          {
            text: "Проверить",
            onClick: () => console.log("CHECK sub"),
            active: true,
          },
        ],
      },
    ])
  }, [])

  return (
    <ScreenContainer withTab>
      {tasks?.map((task, index) => (
        <ItemCard
          ItemIcon={task?.icon}
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
