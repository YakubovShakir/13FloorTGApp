import React, { useCallback, useContext, useEffect, useState, lazy, Suspense } from "react"
import { Route, Routes, MemoryRouter } from "react-router-dom"
import "./App.css"
import UserContext from "./UserContext"
import { useSettingsProvider } from "./hooks"
import { TonConnectUIProvider } from "@tonconnect/ui-react"
import { useNotification } from "./NotificationContext"
import WebApp from "@twa-dev/sdk"
import { submitProfileData } from "./services/user/user"
import { postEvent } from "@telegram-apps/sdk"
import FullScreenSpinner from "./screens/Home/FullScreenSpinner"

// Lazy-loaded components
const Home = lazy(() => import("./screens/Home/Home"))
const CareScreen = lazy(() => import("./screens/CareScreen/CareScreen"))
const ActivityScreen = lazy(() => import("./screens/ActivityScreen/ActivityScreen"))
const PersonageCreationScreen = lazy(() => import("./screens/PersonageCreation/PersonageCreation"))
const ShopScreen = lazy(() => import("./screens/ShopScreen/ShopScreen"))
const TaskScreen = lazy(() => import("./screens/SocialsScreen/SocialsScreen"))
const ActionScreen = lazy(() => import("./screens/ActionScreen/ActionScreen"))
const InvestmentScreen = lazy(() => import("./screens/Investment/InvestmentScreen"))
const Learning = lazy(() => import("./screens/Learning/Learning"))
const BoostTab = lazy(() => import("./screens/CareScreen/tabs/BoostTab"))
const ForeignHome = lazy(() => import("./screens/Home/ForeignHome"))
const GachaOverlay = lazy(() => import("./screens/Home/Gacha"))
const DailyCheckInOverlay = lazy(() => import("./screens/Home/DailyCheckInOverlay"))

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "white", textAlign: "center", padding: "20px" }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the app or contact support.</p>
        </div>
      )
    }
    return this.props.children
  }
}

// BlockerMessage Component
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
      <p style={{ margin: "16px 0", color: "#4b5563", fontSize: "14px" }}>
        Please open this dApp using Telegram mobile app on iOS or Android.
      </p>
    </div>
  </div>
)

// Debounce utility
const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

function App() {
  const [shouldBlock, setShouldBlock] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Hash manipulation
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes("tgWebAppVersion=8.2")) {
      const newHash = hash ? `${hash}&tgWebAppVersion=8.2` : "#tgWebAppVersion=8.2"
      window.history.replaceState(null, "", newHash)
    }
  }, [])

  // Telegram SDK initialization with timeout
  useEffect(() => {
    if (import.meta.env.VITE_NODE_ENV === "test") {
      setIsInitialized(true)
      return
    }

    let attempts = 0
    const maxAttempts = 100 // 5 seconds at 50ms intervals

    const initTelegramApp = () => {
      if (!window.Telegram?.WebApp) {
        console.warn(`Telegram WebApp not available yet, attempt ${attempts}/${maxAttempts}`)
        return false
      }

      const platform = (window.Telegram.WebApp.platform || "").toLowerCase()
      console.log("Detected platform:", platform)
      const isMobileApp = /^(android|ios)$/.test(platform)

      if (!isMobileApp) {
        console.log("Non-mobile platform detected, blocking access")
        setShouldBlock(true)
        return true
      }

      try {
        window.Telegram.WebApp.ready()
        postEvent("web_app_expand")
        setTimeout(() => postEvent("web_app_request_fullscreen"), 100)
        console.log("Telegram WebApp initialized successfully")
        setIsInitialized(true)
        return true
      } catch (err) {
        console.error("Error initializing Telegram events:", err)
        return false
      }
    }

    if (!initTelegramApp()) {
      const interval = setInterval(() => {
        attempts++
        if (initTelegramApp() || attempts >= maxAttempts) {
          clearInterval(interval)
          if (attempts >= maxAttempts) {
            console.error("Failed to initialize Telegram WebApp after max attempts")
            setShouldBlock(true) // Fallback to block screen
          }
        }
      }, 50)
      return () => clearInterval(interval)
    }
  }, [])

  const { userParameters, userId } = useContext(UserContext)
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
        console.warn(`Translation not found for key "${key}" and language "${lang}"`)
        return
      }
      console.log("Sending notification:", key, message)
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
        if (notificationsSent.moodBelow9 || notificationsSent.moodBelow49) hasChanged = true
      }

      if (hungry <= 9 && !notificationsSent.hungryBelow9) {
        handleNotification("hungryBelow9")
      } else if (hungry <= 49 && !notificationsSent.hungryBelow49 && hungry > 9) {
        handleNotification("hungryBelow49")
      } else if (hungry > 49) {
        updatedNotificationsSent.hungryBelow9 = false
        updatedNotificationsSent.hungryBelow49 = false
        if (notificationsSent.hungryBelow9 || notificationsSent.hungryBelow49) hasChanged = true
      }
    }

    if (hasChanged) {
      setNotificationsSent(updatedNotificationsSent)
    }
  }, [userParameters, notificationsSent, resetNotifications, showNotification, lang])

  const debouncedCheckNotifications = useCallback(debounce(checkAndSendNotifications, 500), [
    checkAndSendNotifications,
  ])

  useEffect(() => {
    if (isInitialized) debouncedCheckNotifications()
  }, [userParameters, isInitialized])

  useEffect(() => {
    if (!isInitialized || !userId) return

    const submitUserData = async () => {
      try {
        await submitProfileData(userId, WebApp)
        console.log("User data submitted successfully")
      } catch (err) {
        console.error("Error submitting user data:", err)
      }
    }
    submitUserData()
  }, [userId, isInitialized])

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
      <MemoryRouter>
        <ErrorBoundary>
          <Suspense fallback={<div style={{ color: "white", textAlign: "center" }}><FullScreenSpinner/></div>}>
            <Routes>
              <Route path="/" index element={<Home />} />
              <Route path="/learning/:slideIndex?" element={<Learning />} />
              <Route path="/personage-create" element={<PersonageCreationScreen />} />
              <Route path="/care" element={<CareScreen />} />
              <Route path="/shop" element={<ShopScreen />} />
              <Route path="/activity/:type" element={<ActivityScreen />} />
              <Route path="/tasks/:tab?" element={<TaskScreen />} />
              <Route path="/action" element={<ActionScreen />} />
              <Route path="/investment" element={<InvestmentScreen />} />
              <Route path="/boost" element={<BoostTab />} />
              <Route path="/foreign-user/:userId" element={<ForeignHome />} />
              <Route path="/gacha" element={<GachaOverlay />} />
              <Route path="/daily-rewards" element={<DailyCheckInOverlay />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </MemoryRouter>
    </TonConnectUIProvider>
  )
}

export default App