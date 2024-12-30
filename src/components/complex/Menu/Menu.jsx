import IconButton from "../../simple/IconButton/IconButton"
import "./Menu.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Assets from "../../../assets"
import Button from "../../simple/Button/Button"

const Menu = ({ screenMenu, activeName, hasBg = true }) => {
  const { Icons } = Assets
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState();

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
      icon: Icons.hungry,
      title: "Еда",
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
      title: "Коллекция",
    },
    activity: {
      onClick: () => {
        if (currentTab === 'activity') {
          navigate('/#');
        } else {
          navigate("/activity/works");
          setCurrentTab('activity');
        }
      },
      notify: false,
      icon: Icons.activity,
      title: "Развитие",
    },

    community: {
      onClick: () => {
        if (currentTab === 'community') {
          navigate('/#');
        } else {
          navigate("/investment");
          setCurrentTab('community');
        }
      },
      notify: false,
      icon: Icons.contacts,
      title: "Инвестиции",
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
  };

  return (
    <div className={screenMenu ? "screenMenu Menu" : "Menu"} style={{ width: '100vw', zIndex: 99999 }}>
      {/* Контейнер для кнопки BigButton */}
      <div className="MenuButtonContainer">
        <Button
          className="clothing-item-equip-button"
          shadowColor={"#22c7a3"}
          width={"16%"}
          marginBottom={"5"}
          color={"rgb(255, 255, 255)"}
          height={34}
          active={true}
          fontFamily={"Anonymous pro"}
          fontWeight={"500"}
          text={"Начать"}
          fontSize={14}
          paddingTop={1}
          borderColor={"#22c7a3"}
          backdropFilter={"blur(5px)"}
          ownColor={"#22c7a32d"}
          bgColor={"#22c7a32d"}
          onClick={() => navigate('/action')}
        />
      </div>

      {/* Контейнер с иконками кнопок */}
      <div className="ButtonMenu">
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
    </div>
  )
}

export default Menu
