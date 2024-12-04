import IconButton from "../../simple/IconButton/IconButton"
import "./Menu.css"
import { useNavigate } from "react-router-dom"
import Assets from "../../../assets"

const Menu = ({ screenMenu, activeName }) => {
  const { Icons } = Assets
  const navigate = useNavigate()
  const tabs = {
    care: {
      onClick: () => navigate("/care"),
      notify: false,
      icon: Icons.care,
      title: "Забота",
    },
    investment: {
      onClick: () => navigate("/#"),
      notify: false,
      icon: Icons.shopIcon,
      title: "Магазин",
    },
    activity: {
      onClick: () => navigate("/activity"),
      notify: false,
      icon: Icons.activity,
      title: "Активности",
    },
    tasks: {
      onClick: () => navigate("/care"),
      notify: false,
      icon: Icons.tasks,
      title: "Задания",
    },
    community: {
      onClick: () => navigate("/care"),
      notify: false,
      icon: Icons.contacts,
      title: "Сообщество",
    },
  }
  return (
    <div className={screenMenu ? "screenMenu Menu" : "Menu" }>
      {Object.keys(tabs).map((tab, index) => (
        <IconButton
          color={activeName && (activeName === tab ? "white" : "rgba(255, 255, 255, 0.4)")}
          key={index}
          onClick={tabs[tab].onClick}
          notify={tabs[tab].notify}
          icon={tabs[tab].icon}
          title={tabs[tab].title}
        />
      ))}
    </div>
  )
}

export default Menu
