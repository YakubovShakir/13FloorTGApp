import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import UserContext, { UserProvider } from "./UserContext.jsx"
import { config } from "dotenv"
import App from "./App.jsx"
import "./index.css"
import { NotificationProvider } from "./NotificationContext.jsx"

config()

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NotificationProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </NotificationProvider>
  </StrictMode>
)
