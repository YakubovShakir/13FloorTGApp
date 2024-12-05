import IconButton from "../../simple/IconButton/IconButton"
import "./Menu.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Assets from "../../../assets"

const Menu = ({ screenMenu, activeName }) => {
  const { Icons } = Assets
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState()
  const tabs = {
    care: {
      onClick: () => navigate("/care"),
      notify: true,
      icon: Icons.care,
      title: "Забота",
    },
    shop: {
      onClick: () => navigate("/shop"),
      notify: false,
      icon: Icons.shopIcon,
      title: "Магазин",
    },
    activity: {
      onClick: () => navigate("/activity"),
      notify: true,
      icon: Icons.activity,
      title: "Активности",
    },
    tasks: {
      onClick: () => navigate("/care"),
      notify: true,
      icon: Icons.InWorkIcon,
      title: "Задания",
    },
    community: {
      onClick: () => navigate("/care"),
      notify: true,
      icon: Icons.InWorkIcon,
      title: "Сообщество",
    },
  }
  return (
    <div className={screenMenu ? "screenMenu Menu" : "Menu" } style={{ width: '100vw', border: 'solid rgba(255,255,255, 0.15) .005px'}} >
      {Object.keys(tabs).map((tab, index) => (
        <IconButton
          color={activeName && (activeName === tab ? "white" : "rgba(255, 255, 255, 0.4)")}
          key={index}
          onClick={tabs[tab].onClick}
          notify={tabs[tab].notify}
          icon={tabs[tab].icon}
          title={tabs[tab].title}
          size={45}
        />
      ))}
    </div>
  )
}

export default Menu
