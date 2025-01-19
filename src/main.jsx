import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import UserContext, { UserProvider } from "./UserContext.jsx"
import App from "./App.jsx"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>
)
