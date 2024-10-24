import IconButton from "../../simple/IconButton/IconButton"
import Assets from "../../../assets"
import "./Menu.css"

import ActivityTraining from "../ActivityTraining/ActivityTraining"
import ActivityWork from "../ActivityWork/ActivityWork"

import CareHungry from "../CareHungry/CareHungry"
import CareHappiness from "../CareHappiness/CareHappiness"
import CareStore from "../CareStore/CareStore"

import InvestWindow from "../Windows/InvestWindow/InvestWindow"


const Menu = ({ setCurrentWindow, setVisibleWindow }) => {
  const buttonWidth = "20%"
  const { Icons } = Assets
  return (
    <div className="Menu">
      <IconButton
        onClick={() => {
          setCurrentWindow({
            title: "Забота",
            data: {
              hungry: <CareHungry />,
              happiness: <CareHappiness />,
              energy: <ActivityTraining />,
              store: <CareStore />,
              starStore: <ActivityTraining />,
            },
            tabs: {
              hungry: Icons.hungry,
              happiness: Icons.happiness,
              energy: Icons.energy,
              store: Icons.store,
              starStore: Icons.starStore,
            },
          })
          setVisibleWindow(true)
        }}
        notify={true}
        width={buttonWidth}
        icon={Icons.care}
        title="Забота"
      />
      <IconButton
        onClick={() => {
          setCurrentWindow({
            title: "Инвестиции",
            data: <InvestWindow />,
          }),
            setVisibleWindow(true)
        }}
        notify={true}
        width={buttonWidth}
        icon={Icons.balance}
        title="Инвестиции"
      />
      <IconButton
        onClick={() => {
          setCurrentWindow({
            title: "Активности",
            data: {
              work: <ActivityWork />,
              training: <ActivityTraining />,
              learning: <ActivityTraining />,
              social: <ActivityTraining />,
            },
            tabs: {
              work: Icons.balance,
              training: Icons.training,
              learning: Icons.book,
              social: Icons.phone,
            },
          }),
            setVisibleWindow(true)
        }}
        width={buttonWidth}
        icon={Icons.activity}
        title="Активности"
      />
      <IconButton
        onClick={() => {
          setCurrentWindow({
            title: "Забота",
            data: {
              work: <ActivityTraining />,
              training: <ActivityTraining />,
              learning: <ActivityTraining />,
              social: <ActivityTraining />,
            },
            tabs: {
              work: Icons.balance,
              training: Icons.training,
              learning: Icons.book,
              social: Icons.phone,
            },
          }),
            setVisibleWindow(true)
        }}
        notify={true}
        width={buttonWidth}
        icon={Icons.tasks}
        title="Задания"
      />
      <IconButton
        onClick={() => {
          setCurrentWindow({
            title: "Забота",
            data: {
              work: <ActivityTraining />,
              training: <ActivityTraining />,
              learning: <ActivityTraining />,
              social: <ActivityTraining />,
            },
            tabs: {
              work: Icons.balance,
              training: Icons.training,
              learning: Icons.book,
              social: Icons.phone,
            },
          }),
            setVisibleWindow(true)
        }}
        notify={true}
        width={buttonWidth}
        icon={Icons.contacts}
        title="Сообщество"
      />
    </div>
  )
}

export default Menu
