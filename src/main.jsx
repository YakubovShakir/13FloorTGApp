import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import UserContext, { UserProvider } from "./UserContext.jsx"
import App from "./App.jsx"
import "./index.css"
import { NotificationProvider } from "./NotificationContext.jsx"
import { SettingsProvider } from "./hooks.jsx"
import { EmojiReactionProvider } from "./EmojiReactionContext.jsx"
require("buffer");
// config()

createRoot(document.getElementById("root")).render(
  <SettingsProvider>
    <UserProvider>
      <EmojiReactionProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </EmojiReactionProvider>
    </UserProvider>
  </SettingsProvider>
)
