import IconButton from "../../simple/IconButton/IconButton"
import "./Menu.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Assets from "../../../assets"

const Menu = ({ screenMenu, activeName, hasBg = true }) => {
  const { Icons } = Assets
  const navigate = useNavigate()
  const[currentTab, setCurrentTab] = useState();

  const tabs = {
    care: {
      onClick: () => {
        if (currentTab === 'care') {
          navigate('/#');
        } else {
          navigate("/care");
          setCurrentTab('care');
        }
      },
      notify: false,
      icon: Icons.care,
      title: "Забота",
    },
    shop: {
      onClick: () => {
        if (currentTab === 'shop') {
          navigate('/#');
        } else {
          navigate("/shop");
          setCurrentTab('shop');
        }
      },
      notify: false,
      icon: Icons.shopIcon,
      title: "Магазин",
    },
    activity: {
      onClick: () => {
        if (currentTab === 'activity') {
          navigate('/#');
        } else {
          navigate("/activity");
          setCurrentTab('activity');
        }
      },
      notify: false,
      icon: Icons.activity,
      title: "Активности",
    },
    tasks: {
      onClick: () => {
        if (currentTab === 'tasks') {
          navigate('/#');
        } else {
          navigate("/tasks");
          setCurrentTab('tasks');
        }
      },
      notify: false,
      icon: Icons.tasks,
      title: "Задания",
    },
    community: {
      onClick: () => {
        if (currentTab === 'community') {
          navigate('/#');
        } else {
          navigate("/care");
          setCurrentTab('community');
        }
      },
      notify: false,
      icon: Icons.contacts,
      title: "Сообщество",
    },
  };
  return (
    <div className={screenMenu ? "screenMenu Menu" : "Menu"} style={{ width: '100vw',  zIndex: 99999 }} >
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
