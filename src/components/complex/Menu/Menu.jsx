import IconButton from "../../simple/IconButton/IconButton"
import "./Menu.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Assets from "../../../assets"
import Button from "../../simple/Button/Button"
import { useSettingsProvider } from "../../../hooks"

const Menu = ({ screenMenu, activeName, noButton, isForeign }) => {
  const { Icons } = Assets
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState()
  const { lang , playClickSound} = useSettingsProvider()

  const translations = {
    food: {
      ru: "Еда",
      en: "Food",
    },
    shop: {
      ru: "Коллекция",
      en: "Collection",
    },
    activity: {
      ru: "Развитие",
      en: "Progress",
    },
    investment: {
      ru: "Инвестиции",
      en: "Invest",
    },
    tasks: {
      ru: "Сеть",
      en: "Social",
    },
    start: {
      ru: "Начать",
      en: "Start",
    },
    boost: {
      ru: "Бусты",
      en: "Boosts",
    },
    home: {
      ru: "Назад",
      en: "Back",
    }
  }


  
  const tabs = {

   

    care: {
      onClick: () => {
        playClickSound()
        if (currentTab === "care") {
          navigate("/#")
        } else {
          navigate("/care")
          setCurrentTab("care")
        }
      },
      notify: false,
      icon: Icons.hungry,
      title: translations.food[lang],
    },
    
    shop: {
      onClick: () => {
        playClickSound()
        if (currentTab === "shop") {
          navigate("/#")
        } else {
          navigate("/shop")
          setCurrentTab("shop")
        }
      },
      notify: false,
      icon: Icons.shopIcon,
      title: translations.shop[lang],
    },
   
    activity: {
      onClick: () => {
        playClickSound()
        if (currentTab === "activity") {
          navigate("/#")
        } else {
          navigate("/activity/works")
          setCurrentTab("activity")
        }
      },
      notify: false,
      icon: Icons.activity,
      title: translations.activity[lang],
    },

    community: {
      onClick: () => {
        playClickSound()
        if (currentTab === "community") {
          navigate("/#")
        } else {
          navigate("/investment")
          setCurrentTab("community")
        }
      },
      notify: false,
      icon: Icons.contacts,
      title: translations.investment[lang],
    },

   

    tasks: {
      onClick: () => {
        playClickSound()
        if (currentTab === "tasks") {
          navigate("/#")
        } else {
          navigate("/tasks")
          setCurrentTab("tasks")
        }
      },
      notify: false,
      icon: Icons.tasks,
      title: translations.tasks[lang],
    },
    boost: {
      onClick: () => {
        playClickSound()
        if (currentTab === "boost") {
          navigate("/#")
        } else {
          navigate("/boost")
          setCurrentTab("boost")
        }
      },
      notify: false,
      icon: Icons.donatIcon,
      title: translations.boost[lang],
    }
  }

  return (
    <div
      className={screenMenu ? "screenMenu Menu" : "Menu"}
      style={{ width: "100vw", zIndex: 99999 }}
    >
      {/* Контейнер для кнопки BigButton */}
      {!noButton && (
        <div className="MenuButtonContainer">
          <div className="MenuButtonBg">
            <Button
              className="clothing-item-equip-button"
              shadowColor={"rgb(199 80 21)"}
              width={"90px"}
              marginBottom={"5"}
              color={"rgb(255, 255, 255)"}
              height={34}
              active={true}
              fontFamily={"Anonymous pro"}
              fontWeight={"500"}
              text={isForeign ? translations.home[lang] : translations.start[lang]}
              fontSize={14}
              paddingTop={1}
              borderColor={"rgb(255, 141, 0)"}
              backdropFilter={"blur(5px)"}
              ownColor={"rgb(255, 118, 0)"}
              bgColor={"rgb(255, 118, 0)"}
              onClick={() => isForeign ? navigate("/Tasks") : navigate("/action")}
            />
          </div>
        </div>
      )}

      {/* Контейнер с иконками кнопок */}
      {!isForeign && (
        <div className="ButtonMenu">
        {Object.keys(tabs).map((tab, index) => (
          <IconButton
            color={
              activeName &&
              (activeName === tab ? "white" : "rgba(255, 255, 255, 0.4)")
            }
            key={index}
            onClick={tabs[tab].onClick}
            notify={tabs[tab].notify}
            icon={tabs[tab].icon}
            title={tabs[tab].title}
            size={50}
          />
        ))}
      </div>
      )}
    </div>
  )
}

export default Menu
