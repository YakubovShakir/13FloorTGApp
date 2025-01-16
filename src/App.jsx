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

import { mountMiniApp, mockTelegramEnv, parseInitData } from '@telegram-apps/sdk';
import Learning from "./screens/Learning/Learning";

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

const initializeTelegramSDK = async () => {
  try {
    // Attempt to initialize the real Telegram environment
    console.log("Initializing Telegram environment");
    const [miniApp] = mountMiniApp();
    await miniApp.ready();
  } catch (error) {
    // In case of an error, initialize a mock environment
    console.error('Error initializing Telegram:', error);

    const initDataRaw = new URLSearchParams([
      ['user', JSON.stringify({
        id: 99281932,
        first_name: 'Andrew',
        last_name: 'Rogue',
        username: 'rogue',
        language_code: 'en',
        is_premium: true,
        allows_write_to_pm: true,
      })],
      ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
      ['auth_date', '1716922846'],
      ['start_param', 'debug'],
      ['chat_type', 'sender'],
      ['chat_instance', '8428209589180549439'],
    ]).toString();

    mockTelegramEnv({
      themeParams: {
        accentTextColor: '#6ab2f2',
        bgColor: '#17212b',
        buttonColor: '#5288c1',
        buttonTextColor: '#ffffff',
        destructiveTextColor: '#ec3942',
        headerBgColor: '#fcb69f',
        hintColor: '#708499',
        linkColor: '#6ab3f3',
        secondaryBgColor: '#232e3c',
        sectionBgColor: '#17212b',
        sectionHeaderTextColor: '#6ab3f3',
        subtitleTextColor: '#708499',
        textColor: '#f5f5f5',
      },
      initData: parseInitData(initDataRaw),
      initDataRaw,
      version: '7.4',
      platform: 'tdesktop',
    });

    console.log('Mock Telegram environment initialized');
  }
};

// Initialize SDK
initializeTelegramSDK();

function App() {
  useTelegram.setFullScreen();

  return (
    // <TelegramPlatformCheck>
     <SettingsProvider>
      <MemoryRouter>
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
          </Routes>
        </MemoryRouter>
     </SettingsProvider>
    // </TelegramPlatformCheck>
  )
}

export default App
