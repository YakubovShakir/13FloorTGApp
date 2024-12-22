import { useContext, useEffect } from "react"
import { Route, Routes, MemoryRouter, useNavigate } from "react-router-dom"
import { isMobile } from 'react-device-detect';
import "./App.css"
import Home from "./screens/Home/Home"
import useTelegram from "./hooks/useTelegram"
import CareScreen from "./screens/CareScreen/CareScreen"
import ActivityScreen from "./screens/ActivityScreen/ActivityScreen"
import PersonageCreationScreen from './screens/PersonageCreation/PersonageCreation'
import UserContext, { UserProvider } from "./UserContext"
import ShopScreen from './screens/ShopScreen/ShopScreen'
import TaskScreen from "./screens/TaskScreen/TaskScreen"
import ActionScreen from "./screens/ActionScreen/ActionScreen";
function App() {
  useEffect(() => {
    if (isMobile) {
      useTelegram.setFullScreen();
    }
    useTelegram.setHeaderColor("#00000");
  }, []);

  return (
    <>
      <MemoryRouter>
        <Routes>
          {/* <Route index element={<StartCustomize />} /> */}
          <Route index element={<Home/>}/>
          <Route path="/personage-create" element={<PersonageCreationScreen />} />
          {/* <Route index element={<PersonageCreationScreen />} /> */}
          <Route path="/care" element={<CareScreen />} />
          <Route path="/shop" element={<ShopScreen />} />
          <Route path="/activity/:type" element={<ActivityScreen />} />
          <Route path="/tasks" element={<TaskScreen />} />
          <Route path="/action" element={<ActionScreen/>} />
        </Routes>
      </MemoryRouter>
    </>
  )
}

export default App
