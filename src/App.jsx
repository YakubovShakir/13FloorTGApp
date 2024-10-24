import { useEffect, useState } from "react"
import { Route, Routes, MemoryRouter } from "react-router-dom"
import "./App.css"
import Home from "./screens/Home/Home"
import StartCustomize from "./screens/StartCustomize/StartCustomize"
import useTelegram from "./hooks/useTelegram"

function App() {
  useEffect(() => {
    useTelegram.waitReady,
      useTelegram.setFullScreen,
      useTelegram.setHeaderColor("#3B3537")
  }, [])

  return (
    <>
      <MemoryRouter>
        <Routes>
          <Route index element={<StartCustomize />} />
          <Route path="home" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </>
  )
}

export default App
