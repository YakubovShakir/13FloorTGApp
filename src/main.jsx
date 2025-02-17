import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import UserContext, { UserProvider } from "./UserContext.jsx"
import App from "./App.jsx"
import "./index.css"
import { NotificationProvider } from "./NotificationContext.jsx"
import { SettingsProvider } from "./hooks.jsx"

// config()

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <SettingsProvider>
      <NotificationProvider>

        <App />
      </NotificationProvider>
    </SettingsProvider>
  </UserProvider>
)
