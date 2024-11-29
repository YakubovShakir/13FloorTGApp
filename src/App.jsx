import { useEffect, useState } from "react"
import { Route, Routes, MemoryRouter, BrowserRouter } from "react-router-dom"
import "./App.css"
import Home from "./screens/Home/Home"

import useTelegram from "./hooks/useTelegram"
import CareScreen from "./screens/CareScreen/CareScreen"
import ActivityScreen from "./screens/ActivityScreen/ActivityScreen"
import PersonageCreationScreen from './screens/PersonageCreation/PersonageCreation'
import { UserProvider } from "./UserContext"
import StartCustomize from './screens/StartCustomize/StartCustomize'

function App() {
  useEffect(() => {
      useTelegram.setFullScreen(),
      useTelegram.setHeaderColor("#2F292B")
  }, [])

  return (
    <>
    <UserProvider>
      <MemoryRouter>
        <Routes>
          {/* <Route index element={<StartCustomize />} /> */}
          <Route index element={<Home />} />
          <Route path="/care" element={<CareScreen />} />
          <Route path="/activity" element={<ActivityScreen />} />
        </Routes>
      </MemoryRouter>
      </UserProvider>
    </>
  )
}

export default App
