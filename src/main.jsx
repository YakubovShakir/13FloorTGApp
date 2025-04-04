import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { SettingsProvider } from "./hooks.jsx"
import { UserProvider } from "./UserContext.jsx"
import { EmojiReactionProvider } from "./EmojiReactionContext.jsx"
import { NotificationProvider } from "./NotificationContext.jsx"

createRoot(document.getElementById("root")).render(
  <EmojiReactionProvider>
    <NotificationProvider>
      <SettingsProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </SettingsProvider>
    </NotificationProvider>
  </EmojiReactionProvider>
)
