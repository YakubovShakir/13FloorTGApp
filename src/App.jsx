import { useEffect, useState } from "react"
import { Route, Routes, MemoryRouter, BrowserRouter } from "react-router-dom"
import "./App.css"
import Home from "./screens/Home/Home"
import StartCustomize from "./screens/StartCustomize/StartCustomize"
import useTelegram from "./hooks/useTelegram"
import CareScreen from "./screens/CareScreen/CareScreen"

function App() {
  useEffect(() => {
    useTelegram.waitReady(),
      useTelegram.setFullScreen(),
      useTelegram.setHeaderColor("#2F292B")
  }, [])

  return (
    <>
      <MemoryRouter>
        <Routes>
          {/* <Route index element={<StartCustomize />} /> */}
          <Route index element={<Home />} />
          <Route path="/care" element={<CareScreen />} />
        </Routes>
      </MemoryRouter>
    </>
  )
}

export default App
