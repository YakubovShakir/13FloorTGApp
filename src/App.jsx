import { useCallback, useContext, useEffect, useState } from "react"
import { Route, Routes, MemoryRouter, useNavigate } from "react-router-dom"
import { isMobile } from "react-device-detect"
import "./App.css"
import Home from "./screens/Home/Home"
import useTelegram from "./hooks/useTelegram"
import CareScreen from "./screens/CareScreen/CareScreen"
import ActivityScreen from "./screens/ActivityScreen/ActivityScreen"
import PersonageCreationScreen from "./screens/PersonageCreation/PersonageCreation"
import UserContext, { UserProvider } from "./UserContext"
import ShopScreen from "./screens/ShopScreen/ShopScreen"
import TaskScreen from "./screens/SocialsScreen/SocialsScreen"
import ActionScreen from "./screens/ActionScreen/ActionScreen"
import InvestmentScreen from "./screens/Investment/InvestmentScreen"
import { SettingsProvider, useSettingsProvider } from "./hooks"
import Learning from "./screens/Learning/Learning"
import BoostTab from "./screens/CareScreen/tabs/BoostTab"
import { TonConnectUIProvider } from "@tonconnect/ui-react"
import ForeignHome from "./screens/Home/ForeignHome"
import { config } from "dotenv"
import { NotificationProvider, useNotification } from "./NotificationContext"
import WebApp from "@twa-dev/sdk"
import { submitProfileData } from "./services/user/user"
import GachaOverlay from "./screens/Home/Gacha"
import DailyCheckInOverlay from "./screens/Home/DailyCheckInOverlay"
import { isTMA, postEvent } from "@telegram-apps/sdk"
import { EmojiReactionProvider } from "./EmojiReactionContext"

// BlockerMessage component
const BlockerMessage = () => (
  <div
    style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      backgroundColor: "black",
    }}
  >
    <div
      style={{
        maxWidth: "400px",
        width: "100%",
        padding: "24px",
        color: "white",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          marginBottom: "16px",
          padding: "12px",
          borderRadius: "6px",
          color: "white",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            fontWeight: "800",
            color: "rgb(243, 117, 0)",
          }}
        >
          Access Restricted
        </h3>
        <p style={{ margin: 0, fontSize: "14px" }}>
          This dApp is only available on Telegram mobile app.
        </p>
      </div>
      <p
        style={{
          margin: "16px 0",
          color: "#4b5563",
          fontSize: "14px",
        }}
      >
        Please open this dApp using Telegram mobile app on iOS or Android.
      </p>
    </div>
  </div>
)

function App() {
  const [shouldBlock, setShouldBlock] = useState(false)

  // Hash manipulation useEffect (unchanged)
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes("tgWebAppVersion=8.2")) {
      const newHash = hash
        ? `${hash}&tgWebAppVersion=8.2`
        : "#tgWebAppVersion=8.2"
      window.history.replaceState(null, "", newHash)
    }
  }, [])

  // Telegram SDK initialization and platform check useEffect
  useEffect(() => {
    if (import.meta.env.VITE_NODE_ENV === "test") {
      return
    }

    const initTelegramApp = () => {
      if (!window.Telegram?.WebApp) {
        console.warn("Telegram WebApp not available yet")
        return false
      }

      const platform = (window.Telegram.WebApp.platform || "").toLowerCase()
      const isMobileApp = /^(android|ios)$/.test(platform)

      if (!isMobileApp) {
        setShouldBlock(true) // Show block screen for non-iOS/Android
        return true // Stop further initialization
      }

      try {
        window.Telegram.WebApp.ready() // Signal readiness
        postEvent("web_app_expand")
        setTimeout(() => postEvent("web_app_request_fullscreen"), 100) // Delay fullscreen
        console.log("Telegram WebApp initialized successfully")
      } catch (err) {
        console.error("Error initializing Telegram events:", err)
      }
      return true
    }

    if (!initTelegramApp()) {
      const interval = setInterval(() => {
        if (initTelegramApp()) {
          clearInterval(interval)
        }
      }, 50) // Check every 50ms
      return () => clearInterval(interval)
    }
  }, [])

  const { userParameters } = useContext(UserContext)
  const [notificationsSent, setNotificationsSent] = useState({
    moodBelow49: false,
    hungryBelow49: false,
    moodBelow9: false,
    hungryBelow9: false,
    allZero: false,
  })

  const resetNotifications = useCallback(() => {
    setNotificationsSent({
      moodBelow49: false,
      hungryBelow49: false,
      moodBelow9: false,
      hungryBelow9: false,
      allZero: false,
    })
  }, [])

  const { showNotification } = useNotification()
  const { lang } = useSettingsProvider()

  const checkAndSendNotifications = useCallback(() => {
    const translations = {
      allCritical: {
        ru: "Критическое состояние. Работа и другие действия получают большой штраф",
        en: "Critical condition. Work and other activities have big penalty",
      },
      moodBelow9: {
        ru: "Настроение ниже 9%! Теперь вы получаете большой штраф к доходу",
        en: "The mood is below 9%! Now you get a big penalty to the income",
      },
      moodBelow49: {
        ru: "Настроение ниже 49%! Теперь вы получаете небольшой штраф к доходу",
        en: "The mood is below 49%! Now you get a small penalty to the income",
      },
      hungryBelow9: {
        ru: "Уровень голода ниже 9%. Теперь вы получаете большой штраф к настроению",
        en: "The hunger rate is below 9%. Now you get a big mood penalty",
      },
      hungryBelow49: {
        ru: "Уровень голода ниже 49%. Теперь вы получаете небольшой штраф к настроению",
        en: "The hunger rate is below 49%! Now you get a small mood penalty",
      },
    }

    if (!userParameters) return

    const { mood, hungry } = userParameters
    const updatedNotificationsSent = { ...notificationsSent }
    let hasChanged = false

    const handleNotification = (key) => {
      const message = translations[key][lang] || translations[key].en
      if (!message) {
        console.warn(
          `Translation not found for key "${key}" and language "${lang}"`
        )
        return
      }
      console.log("Sending notification for", key)
      showNotification(message)
      updatedNotificationsSent[key] = true
      hasChanged = true
    }

    if (mood === 0 && hungry === 0) {
      if (!notificationsSent.allZero) {
        handleNotification("allCritical")
        updatedNotificationsSent.moodBelow9 = false
        updatedNotificationsSent.moodBelow49 = false
        updatedNotificationsSent.hungryBelow9 = false
        updatedNotificationsSent.hungryBelow49 = false
      }
    } else {
      if (mood <= 9 && !notificationsSent.moodBelow9) {
        handleNotification("moodBelow9")
      } else if (mood <= 49 && !notificationsSent.moodBelow49 && mood > 9) {
        handleNotification("moodBelow49")
      } else if (mood > 49) {
        updatedNotificationsSent.moodBelow9 = false
        updatedNotificationsSent.moodBelow49 = false
        if (notificationsSent.moodBelow9 || notificationsSent.moodBelow49)
          hasChanged = true
      }

      if (hungry <= 9 && !notificationsSent.hungryBelow9) {
        handleNotification("hungryBelow9")
      } else if (
        hungry <= 49 &&
        !notificationsSent.hungryBelow49 &&
        hungry > 9
      ) {
        handleNotification("hungryBelow49")
      } else if (hungry > 49) {
        updatedNotificationsSent.hungryBelow9 = false
        updatedNotificationsSent.hungryBelow49 = false
        if (notificationsSent.hungryBelow9 || notificationsSent.hungryBelow49)
          hasChanged = true
      }
    }

    if (hasChanged) {
      setNotificationsSent(updatedNotificationsSent)
    }
  }, [
    userParameters,
    notificationsSent,
    resetNotifications,
    showNotification,
    lang,
  ])

  useEffect(() => checkAndSendNotifications(), [userParameters])

  const { userId } = useContext(UserContext)
  useEffect(() => {
    const submitUserData = async () => {
      try {
        await submitProfileData(userId, WebApp)
      } catch (err) {
        console.error("Error submitting user data:", err)
      }
    }
    submitUserData()
  }, [userId])

  if (shouldBlock) {
    return <BlockerMessage />
  }

  return (
    <TonConnectUIProvider
      manifestUrl={
        import.meta.env.VITE_NODE_ENV === "test"
          ? "https://test.13thfloorgame.io/tonconnect-manifest.json"
          : "https://game.13thfloorgame.io/tonconnect-manifest.json"
      }
    >
          <EmojiReactionProvider>
            <NotificationProvider>
              <MemoryRouter>
                <Routes>
                  <Route path="/" index element={<Home />} />
                  <Route path="/learning/:slideIndex?" element={<Learning />} />
                  <Route
                    path="/personage-create"
                    element={<PersonageCreationScreen />}
                  />
                  <Route path="/care" element={<CareScreen />} />
                  <Route path="/shop" element={<ShopScreen />} />
                  <Route path="/activity/:type" element={<ActivityScreen />} />
                  <Route path="/tasks/:tab?" element={<TaskScreen />} />
                  <Route path="/action" element={<ActionScreen />} />
                  <Route path="/investment" element={<InvestmentScreen />} />
                  <Route path="/boost" element={<BoostTab />} />
                  <Route
                    path="/foreign-user/:userId"
                    element={<ForeignHome />}
                  />
                  <Route path="/gacha" element={<GachaOverlay />} />
                  <Route
                    path="/daily-rewards"
                    element={<DailyCheckInOverlay />}
                  />
                </Routes>
              </MemoryRouter>
            </NotificationProvider>
          </EmojiReactionProvider>
    </TonConnectUIProvider>
  )
}

export default App
