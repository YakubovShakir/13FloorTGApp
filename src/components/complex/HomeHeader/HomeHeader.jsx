import { useCallback, useEffect, useState, useContext } from "react";
import PlayerIndicators from "../PlayerIndicators/PlayerIndicators";
import Assets from "../../../assets";
import { SwiperSlide, Swiper } from "swiper/react";
import { Pagination } from "swiper/modules";
import { getLevels } from "../../../services/levels/levels";
import { disconnectUserWallet, getUserActiveProcess, saveUserWallet } from "../../../services/user/user";
import "./HomeHeader.css";
import "swiper/css";
import "swiper/css/pagination";
import UserContext from "../../../UserContext";
import { useSettingsProvider } from "../../../hooks";
import { THEME, useTonConnectModal, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useTonAddress } from "@tonconnect/ui-react";

const walletTranslations = {
  telegram: {
    ru: 'Подключить через Telegram',
    en: 'Connect via Telegram'
  },
  connecting: {
    ru: 'Подключение...',
    en: 'Connecting...'
  },
  connected: {
    ru: 'Подключено',
    en: 'Connected'
  }
};

const TelegramWalletConnection = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { lang } = useSettingsProvider();
  const [tonConnectUI, setOptions] = useTonConnectUI()
  const { userId, userParameters } = useContext(UserContext)
  const [wallet, setWallet] = useState(useTonWallet())
  const [friendlyAddress, setFriendlyAddress] = useState(useTonAddress(true))
  const [isDisconnectModalVisible, setIsDisconnectModalVisible] = useState(false)

  tonConnectUI.uiOptions = {
    uiPreferences: {
      theme: THEME.DARK
    },
    language: lang
  }
  
  // tonConnectUI.disconnect()

  useEffect(() => {
    if(wallet !== null && userParameters.hasWallet === false) {
      saveUserWallet(userId, wallet)
    }
  }, [userParameters])

  // tonConnectUI.disconnect()
  useEffect(() =>
    tonConnectUI.onStatusChange(async w => {
      if(w) {
        setWallet(w)
        const x = await saveUserWallet(userId, w.account.address)
        console.log(x)
        return
      }

      try {
        await disconnectUserWallet(userId)
        setWallet(null)
      } catch(err) {
        console.log('Error disconnecting wallet')
      }
    }), [tonConnectUI, userId]);

  const { open } = useTonConnectModal()
  const getButtonText = () => {
    if (!wallet) return walletTranslations.telegram[lang];
    return friendlyAddress.slice(0,4) + '...' + friendlyAddress.slice(-4)
  };

  // console.log(wallet?.account.address)

  return (
    <>
       <Bar
          title={getButtonText()}
          iconLeft={Assets.Icons.telegram || Assets.Icons.wallets}
          onClick={wallet === null ? open : () => setIsDisconnectModalVisible(true)}
          isChecked={wallet !== null}
          isLoading={isConnecting}
        />
    </>
  );
};

const Bar = ({ title, onClick, iconLeft, iconRight, isChecked }) => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '8px 8px',
      background: '#121212',
      borderRadius: 8,
      borderBottom: 'solid 1px #7575753b',
      boxShadow: '0px 0px 8px 2px rgba(0, 0, 0, 0.24) inset'
    },
    icon: {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
      color: 'white'
    },
    text: {
      flexGrow: 1,
      marginLeft: '16px',
      textAlign: 'left',
      color: 'white',
      fontSize: '12px'
    },
    loading: {
      animation: 'spin 1s linear infinite',
    }
  };

  const { isSoundEnabled, toggleSound, isMusicEnabled, toggleMusic } = useSettingsProvider(); // Access context values

  const getCorrectIsChecked = () => {
    if (title === 'Music') return isMusicEnabled
    if (title === 'Sounds') return isSoundEnabled
    return isChecked
  }

  const getCorrectOnClick = () => {
    if (title === 'Music') return toggleMusic
    if (title === 'Sounds') return toggleSound
    return onClick
  }

  const handleClick = async () => {
    const clickHandler = getCorrectOnClick()
    if (clickHandler) {
      await clickHandler()
    }
  };

  return (
    <div style={styles.container} onClick={handleClick}>
      <div style={styles.icon}>
        {iconLeft && <img style={styles.icon} src={iconLeft} />}
      </div>
      <p style={styles.text}>{title}</p>
      <div onClick={handleClick}>
        {iconRight && <img src={iconRight} style={{ height: 26, width: 26 }} />}
      </div>
      {!iconRight && (
        <div
          style={{
            borderRadius: 5,
            border: '1px solid rgb(57, 57, 57)',
            height: 26,
            width: 26,
            display: 'flex',
            alignContent: 'center',
            alignItems: 'center',
            padding: 1,
          }}
        >
          {getCorrectIsChecked() === true ? <img style={styles.icon} src={Assets.Icons.checkboxChecked} /> : null}
        </div>
      )}
    </div>
  );
}

export const SettingsModal = ({
  baseStyles,
  setIsSettingsShown
}) => {
  const {
    isSoundEnabled,
    toggleSound,
    toggleMusic,
    isMusicEnabled,
    lang,
    setLang
  } = useSettingsProvider();

  const translations = {
    settings: {
      ru: 'Настройки',
      en: 'Settings'
    },
    music: {
      ru: 'Музыка',
      en: 'Music'
    },
    sound: {
      ru: 'Звуки',
      en: 'Sounds'
    },
    language: {
      ru: 'Язык',
      en: 'Language'
    },
    wallet: {
      ru: 'Подключить кошелек',
      en: 'Connect wallet'
    }
  }

  return (
    <div
      style={{
        ...baseStyles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        zIndex: 999999
      }}
    >
      <div
        style={{
          border: "1px solid rgb(57, 57, 57)",
          position: "absolute",
          background: "#202020",
          zIndex: 6,
          height: 270,
          width: 280,
          borderRadius: 6,
          backgroundSize: "cover",
        }}
      >
        <div onClick={() => setIsSettingsShown(false)}>
          <img
            src={Assets.Icons.modalClose}
            width={16}
            height={16}
            style={{ position: "absolute", right: 17, top: 15 }}
          />
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 270,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "end",
            paddingBottom: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: '90%' }}>
            <p
              style={{
                fontFamily: "Anonymous pro",
                fontWeight: "500",
                color: "white",
                textAlign: "left",
                marginBottom: 19,
                fontSize: 18,

              }}
            >
              {translations.settings[lang]}
            </p>
            <div style={{ display: "flex", justifyContent: "center", width: '100%', flexDirection: 'column', rowGap: 8 }}>
              <Bar title={translations.music[lang]} iconLeft={Assets.Icons.musics} onClick={() => toggleMusic()} isChecked={isMusicEnabled} />
              <Bar title={translations.sound[lang]} iconLeft={Assets.Icons.sounds} onClick={() => toggleSound()} isChecked={isSoundEnabled} />
              <Bar title={translations.language[lang]} iconLeft={Assets.Icons.languages} iconRight={lang === 'ru' ? Assets.Icons.rusIcon : Assets.Icons.engIcon} onClick={() => setLang(lang === 'en' ? 'ru' : 'en')} />
              <TelegramWalletConnection />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatsBar = ({ title, iconLeft, value }) => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '8px 8px',
      background: '#121212',
      borderRadius: 8,
      borderBottom: 'solid 1px #7575753b',
      boxShadow: '0px 0px 8px 2px rgba(0, 0, 0, 0.24) inset'
    },
    icon: {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
      color: 'white'
    },
    text: {
      flexGrow: 1,
      marginLeft: '16px',
      textAlign: 'left',
      color: 'white',
      fontSize: '12px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>
        {iconLeft && <img style={styles.icon} src={iconLeft} />}
      </div>
      <p style={styles.text}>{title}</p>
      <div>
        <p style={{ fontWeight: 'bold', color: 'white' }}>{value}</p>
      </div>
    </div>
  );
};

export const StatsModal = ({
  baseStyles,
  setIsStatsShown,
  userParameters,
  personage,
  clothing
}) => {
  const { total_earned, level, energy_capacity, respect } = userParameters;
  const { lang } = useSettingsProvider()

  const translations = {
    level: {
      ru: 'Уровень',
      en: 'Level'
    },
    respect: {
      ru: 'Уважение',
      en: 'Respect'
    },
    total: {
      ru: 'Всего заработано',
      en: 'Total earned'
    },
    energy: {
      ru: 'Макс. энергии',
      en: 'Energy capacity'
    },
    stats: {
      ru: 'Статистика',
      en: 'Stats of'
    }
  }

  return (
    <div
      style={{
        ...baseStyles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        zIndex: 999999
      }}
    >
      <div
        style={{
          border: "1px solid rgb(57, 57, 57)",
          position: "absolute",
          background: "rgb(32, 32, 32)",
          zIndex: 6,
          height: 260,
          width: 280,
          borderRadius: 6,
          backgroundSize: "cover",

        }}
      >
        <div onClick={() => setIsStatsShown(false)}>
          <img
            src={Assets.Icons.modalClose}
            width={16}
            height={16}
            style={{ position: "absolute", right: 17, top: 15 }}
          />
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 260,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "end",
            paddingBottom: "20px",
          }}
        >


          <div style={{ display: "flex", flexDirection: "column", width: '90%', }}>
            <p
              style={{
                fontFamily: "Anonymous pro",
                fontWeight: "500",
                color: "white",
                textAlign: "Left",
                marginBottom: 19,
                fontSize: 16,

              }}
            >
              {translations.stats[lang]} {personage.name}
            </p>
            <div style={{ display: "flex", justifyContent: "center", width: '100%', flexDirection: 'column', rowGap: 8 }}>
              <StatsBar iconLeft={Assets.Icons.boosterArrow} title={translations.level[lang]} value={level} />
              <StatsBar iconLeft={Assets.Icons.respect} title={translations.respect[lang]} value={respect} />
              <StatsBar iconLeft={Assets.Icons.balance} title={translations.total[lang]} value={total_earned} />
              <StatsBar iconLeft={Assets.Icons.energy} title={translations.energy[lang]} value={energy_capacity} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const HomeHeader = ({ screenHeader }) => {

  const { userId, userParameters, userPersonage, userClothing } = useContext(UserContext);
  const [levels, setLevels] = useState();
  const [isSettingsShown, setIsSettingsShown] = useState(false);
  const [isStatsShown, setIsStatsShown] = useState(false)
  const [activeProcess, setActiveProcess] = useState();
  const { Icons } = Assets;

  const handleSettingsPress = () => {
    setIsSettingsShown(!isSettingsShown)
  }

  const getLevelByNumber = (number) => {
    return levels?.find((level) => level?.level === number);
  };

  const getUserLevelProgress = () => {
    if (userParameters?.level === 15) {
      return (
        getLevelByNumber(15)?.required_earned +
        " / " +
        getLevelByNumber(15)?.required_earned
      );
    }
    return (
      userParameters?.total_earned +
      " / " +
      getLevelByNumber(userParameters?.level + 1)?.required_earned
    );
  };

  useEffect(() => {
    getLevels().then((levels) => setLevels(levels));
    getUserActiveProcess(userId).then((activeProcess) => setActiveProcess(activeProcess));
  }, []);

  return (
    <>
      <div className="HomeHeader" style={{ borderRadius: screenHeader && "0" }}>
        <div className="HomeHeaderTopRow">
          <div className="HomeHeaderLevel" onClick={() => setIsStatsShown(true)}>

            <span style={{ fontFamily: "Anonymous pro", fontWeight: "100" }}>
              {userPersonage?.name}
            </span>
            <div className="FillBarProgres">
              <span style={{ fontFamily: "Anonymous pro", fontWeight: "100" }}>
                {userParameters?.level}
              </span>


              <div
                className="HomeHeaderLevelCapacity"
                style={{
                  width:
                    (userParameters?.total_earned /
                      levels?.find(
                        (level) => level?.level === userParameters?.level + 1
                      )?.required_earned) *
                    100 +
                    "%",
                }}
              />
            </div>
          </div>
          <div className="HomeHeaderIncome">
            <div>
              <img src={Icons.balance} alt="Coin" />
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", marginLeft: 10 }}>
              <span style={{ fontSize: 20, fontFamily: "Anonymous pro", fontWeight: "lighter" }}>
                {userParameters?.coins}
              </span>

            </div>
          </div>
          <div className="HomeHeaderRespect">

            <img src={Icons.respect} alt="RespectIcon" />

            <span>{userParameters?.respect}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2.5 }} onClick={handleSettingsPress}>
            <img src={Assets.Icons.settings} height={25}></img>
          </div>
        </div>
        <div className="HomeHeaderBottomRow">
          <PlayerIndicators
            indicators={[
              {
                icon: Icons.energy,
                percentFill: Math.floor((userParameters?.energy / userParameters?.energy_capacity) * 100),
                width: "30%",
              },
              {
                icon: Icons.hungry,
                percentFill: Math.floor(userParameters?.hungry),
                width: "30%",
              },
              {
                icon: Icons.happiness,
                percentFill: Math.floor(userParameters?.mood),
                width: "30%",
              },
            ]}
          />
        </div>
      </div>
      {isSettingsShown && (
        <SettingsModal
          baseStyles={{
            position: "fixed",
            height: "100vh",
            width: "100vw",
            backgroundColor: "black",
            zIndex: 10,
            top: 0,
            left: 0,

          }}
          setIsSettingsShown={setIsSettingsShown}
        />
      )}

      {isStatsShown && (
        <StatsModal
          baseStyles={{
            position: "fixed",
            height: "100vh",
            width: "100vw",
            backgroundColor: "black",
            zIndex: 10,
            top: 0,
            left: 0,
          }}
          setIsStatsShown={setIsStatsShown}
          userParameters={userParameters}
          personage={userPersonage}
          clothing={userClothing}
        />
      )}
    </>
  );
};

export default HomeHeader;
