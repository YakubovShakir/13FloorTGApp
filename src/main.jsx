import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { SettingsProvider } from "./hooks.jsx"
import { UserProvider } from "./UserContext.jsx"

createRoot(document.getElementById("root")).render(
  <SettingsProvider>
    <UserProvider>
      <App />
    </UserProvider>
  </SettingsProvider>
)
