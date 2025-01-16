import { useContext, useEffect, useState } from "react"
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
import InvestmentScreen from "./screens/Investment/InvestmentScreen";
import { SettingsProvider } from "./hooks";
import Learning from "./screens/Learning/Learning";
import BoostTab from "./screens/CareScreen/tabs/BoostTab";

const BlockerMessage = () => (
  <div style={{
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: 'black'
  }}>
    <div style={{
      maxWidth: '400px',
      width: '100%',
      padding: '24px',
      color: 'white',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <div style={{
        marginBottom: '16px',
        padding: '12px',
        borderRadius: '6px',
        color: 'white',
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'rgb(243, 117, 0)' }}>
          Access Restricted
        </h3>
        <p style={{ margin: 0, fontSize: '14px' }}>
          This dApp is only available on Telegram mobile app.
        </p>
      </div>
      
      <p style={{ 
        margin: '16px 0',
        color: '#4b5563',
        fontSize: '14px'
      }}>
        Please open this dApp using Telegram mobile app on iOS or Android.
      </p>
    </div>
  </div>
);

const TelegramPlatformCheck = ({ children }) => {
  const [shouldBlock, setShouldBlock] = useState(true);

  useEffect(() => {
    const checkPlatform = () => {
      const tg = window.Telegram?.WebApp;
      
      if (!tg) {
        setShouldBlock(true);
        return;
      }

      const platform = (tg.platform || '').toLowerCase();
      // Only allow ios and android explicitly
      const isMobileApp = /^(android|ios)$/.test(platform);
      
      setShouldBlock(!isMobileApp);

      if (!isMobileApp) {
        setTimeout(() => {
          tg.close();
        }, 5000);
      }
    };

    checkPlatform();
  }, []);

  if (shouldBlock) {
    return <BlockerMessage />;
  }

  return children;
};

function App() {
  
  return (
    // <TelegramPlatformCheck>
     <SettingsProvider>
      <MemoryRouter>
      <UserProvider>
          <Routes>
            {/* <Route index element={<StartCustomize />} /> */}
            <Route index path="/" exact element={<Home/>}/>
            <Route path="/learning/:slideIndex?" element={<Learning/>}/>
            <Route path="/personage-create" element={<PersonageCreationScreen />} />
            {/* <Route index element={<PersonageCreationScreen />} /> */}
            <Route path="/care" element={<CareScreen />} />
            <Route path="/shop" element={<ShopScreen />} />
            <Route path="/activity/:type" element={<ActivityScreen />} />
            <Route path="/tasks" element={<TaskScreen />} />
            <Route path="/action" element={<ActionScreen/>} />
            <Route path="/investment" element={<InvestmentScreen/>} />
            <Route path="/boost" element={<BoostTab/>} />
          </Routes>
          </UserProvider>
        </MemoryRouter>
     </SettingsProvider>
    // </TelegramPlatformCheck>
  )
}

export default App
