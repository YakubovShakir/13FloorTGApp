import { useCallback, useEffect, useState, useContext } from "react"
import PlayerIndicators from "../PlayerIndicators/PlayerIndicators"
import Assets from "../../../assets"
import { motion, AnimatePresence } from "framer-motion"
import { getLevels } from "../../../services/levels/levels"
import {
  disconnectUserWallet,
  getOwnNekoState,
  getUserActiveProcess,
  saveUserWallet,
} from "../../../services/user/user"
import "./HomeHeader.css"
import "swiper/css"
import "swiper/css/pagination"
import UserContext, { useUser } from "../../../UserContext"
import { useSettingsProvider } from "../../../hooks"
import {
  THEME,
  useTonConnectModal,
  useTonConnectUI,
  useTonWallet,
  useTonAddress,
} from "@tonconnect/ui-react"
import { formatCoins } from "../../../utils/formatCoins"
import { formUsername } from "../../../utils/formUsername"

const walletTranslations = {
  telegram: {
    ru: "Подключить через Telegram",
    en: "Connect via Telegram",
  },
  connecting: {
    ru: "Подключение...",
    en: "Connecting...",
  },
  connected: {
    ru: "Подключено",
    en: "Connected",
  },
}

const TelegramWalletConnection = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const { lang, playClickSound } = useSettingsProvider()
  const [tonConnectUI, setOptions] = useTonConnectUI()
  const { userId, userParameters } = useContext(UserContext)
  const wallet = useTonWallet()
  const friendlyAddress = useTonAddress(true)

  tonConnectUI.uiOptions = {
    uiPreferences: {
      theme: THEME.DARK,
    },
    language: lang,
  }

  useEffect(() => {
    if (wallet !== null && userParameters.hasWallet === false) {
      saveUserWallet(userId, wallet)
    }
  }, [userParameters, wallet])

  useEffect(() => {
    const handleStatusChange = async (w) => {
      setIsConnecting(true)
      try {
        if (w) {
          const x = await saveUserWallet(userId, w.account.address)
          console.log(x)
        } else {
          await disconnectUserWallet(userId)
        }
      } catch (err) {
        console.log("Error handling wallet connection:", err)
      } finally {
        setIsConnecting(false)
      }
    }

    tonConnectUI.onStatusChange(handleStatusChange)
  }, [tonConnectUI, userId])

  const { open } = useTonConnectModal()
  const [isDisconnectModalVisible, setIsDisconnectModalVisible] =
    useState(false)

  const getButtonText = () => {
    if (!wallet || !friendlyAddress) return walletTranslations.telegram[lang]
    return `${friendlyAddress.slice(0, 4)}...${friendlyAddress.slice(-4)}`
  }

  const translations = {
    yes: {
      ru: "Да",
      en: "Yes",
    },
    no: {
      ru: "Нет",
      en: "No",
    },
    confirm: {
      ru: `Вы действительно хотите отключить кошелёк ${
        friendlyAddress
          ? `${friendlyAddress.slice(0, 4)}...${friendlyAddress.slice(-4)}`
          : ""
      }`,
      en: `Do you really want to disconnect wallet ${
        friendlyAddress
          ? `${friendlyAddress.slice(0, 4)}...${friendlyAddress.slice(-4)}`
          : ""
      }`,
    },
  }

  return (
    <>
      <Bar
        title={getButtonText()}
        iconLeft={Assets.Icons.telegram || Assets.Icons.wallets}
        onClick={() => {
          playClickSound() // Добавляем звук
          wallet === null ? open() : setIsDisconnectModalVisible(true)
        }}
        isChecked={wallet !== null}
        isLoading={isConnecting}
      />
      {isDisconnectModalVisible && (
        <div className="modal" style={{ zIndex: 99999999 }}>
          <div className="modal-content">
            <p>{translations.confirm[lang]}</p>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  playClickSound()
                  setIsDisconnectModalVisible(false)
                  tonConnectUI.disconnect()
                }}
                style={{
                  border: "2px solid rgb(0, 255, 115)",
                  color: "rgb(0, 255, 115)",
                }}
              >
                {translations.yes[lang]}
              </button>
              <button
                onClick={() => setIsDisconnectModalVisible(false)}
                style={{
                  color: "rgb(255, 0, 0)",
                  border: "2px solid rgb(255, 0, 0)",
                }}
              >
                {translations.no[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const Bar = ({ title, onClick, iconLeft, iconRight, isChecked }) => {
  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      padding: "8px 8px",
      background: "#121212",
      borderRadius: 8,
      borderBottom: "solid 1px #7575753b",
      boxShadow: "0px 0px 8px 2px rgba(0, 0, 0, 0.24) inset",
    },
    icon: {
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      color: "white",
    },
    text: {
      flexGrow: 1,
      marginLeft: "16px",
      textAlign: "left",
      color: "white",
      fontSize: "12px",
    },
    loading: {
      animation: "spin 1s linear infinite",
    },
  }

  const {
    isSoundEnabled,
    toggleSound,
    isMusicEnabled,
    toggleMusic,
    playClickSound,
  } = useSettingsProvider() // Access context values

  const getCorrectIsChecked = () => {
    if (title === "Music") return isMusicEnabled
    if (title === "Sounds") return isSoundEnabled
    return isChecked
  }

  const getCorrectOnClick = () => {
    if (title === "Music") return toggleMusic
    if (title === "Sounds") return toggleSound
    return onClick
  }

  const handleClick = async () => {
    const clickHandler = getCorrectOnClick()
    if (clickHandler) {
      await clickHandler()
    }
  }

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
            border: "1px solid rgb(57, 57, 57)",
            height: 26,
            width: 26,
            display: "flex",
            alignContent: "center",
            alignItems: "center",
            padding: 1,
          }}
        >
          {getCorrectIsChecked() === true ? (
            <img style={styles.icon} src={Assets.Icons.checkboxChecked} />
          ) : null}
        </div>
      )}
    </div>
  )
}

export const SettingsModal = ({ baseStyles, setIsSettingsShown }) => {
  const {
    isSoundEnabled,
    toggleSound,
    toggleMusic,
    isMusicEnabled,
    lang,
    setLang,
    playClickSound,
  } = useSettingsProvider()

  const translations = {
    settings: {
      ru: "Настройки",
      en: "Settings",
    },
    music: {
      ru: "Музыка",
      en: "Music",
    },
    sound: {
      ru: "Звуки",
      en: "Sounds",
    },
    language: {
      ru: "Язык",
      en: "Language",
    },
    wallet: {
      ru: "Подключить кошелек",
      en: "Connect wallet",
    },
  }

  return (
    <div
      style={{
        ...baseStyles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        zIndex: 999999,
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
        <div
          onClick={() => {
            playClickSound() // Добавляем звук
            setIsSettingsShown(false)
          }}
        >
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
          <div
            style={{ display: "flex", flexDirection: "column", width: "90%" }}
          >
            <p
              style={{
                fontFamily: "Oswald",
                fontWeight: "500",
                color: "white",
                textAlign: "left",
                marginBottom: 13,
                fontSize: 18,
              }}
            >
              {translations.settings[lang]}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                flexDirection: "column",
                rowGap: 8,
              }}
            >
              <Bar
                title={translations.music[lang]}
                iconLeft={Assets.Icons.musics}
                onClick={() => toggleMusic()}
                isChecked={isMusicEnabled}
              />
              <Bar
                title={translations.sound[lang]}
                iconLeft={Assets.Icons.sounds}
                onClick={() => toggleSound()}
                isChecked={isSoundEnabled}
              />
              <Bar
                title={translations.language[lang]}
                iconLeft={Assets.Icons.languages}
                iconRight={
                  lang === "ru" ? Assets.Icons.rusIcon : Assets.Icons.engIcon
                }
                onClick={() => setLang(lang === "en" ? "ru" : "en")}
              />
              <TelegramWalletConnection />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PHONE_COLORS = {
  RED: "#FF3333",
  GREEN: "#00FF00",
  WHITE: '#fff'
}
export const StatsModal = ({ baseStyles, setIsStatsShown, clothing }) => {
  const { userParameters, userPersonage } = useUser()
  const { total_earned, level, energy_capacity, respect } = userParameters
  const { lang } = useSettingsProvider()
  const [activeTab, setActiveTab] = useState("stats")
  const [isLoading, setIsLoading] = useState(true)
  const [effects, setEffects] = useState([])

  useEffect(() => {
    const lol = async () => {
      const neko = await getOwnNekoState(userParameters.id)
      setEffects((prev) => [
        ...prev,
        {
          type: "neko",
          value: neko.incomeBoostPercentage > 0 ? "+" + neko.incomeBoostPercentage + "%" : '0',
          title: translations.nekoEffect[lang],
          color:  neko.incomeBoostPercentage > 0 ? PHONE_COLORS.GREEN : PHONE_COLORS.WHITE,
          icon: Assets.Icons.nftEffectIcon
        },
      ])
      setIsLoading(false)
    }
    lol()
  }, [])

  const translations = {
    level: { ru: "Уровень", en: "Level" },
    respect: { ru: "Уважение", en: "Respect" },
    total: { ru: "Всего заработано", en: "Total earned" },
    energy: { ru: "Макс. энергии", en: "Energy capacity" },
    stats: { ru: "Статистика", en: "Stats" },
    effects: { ru: "Эффекты", en: "Effects" },
    nekoEffect: { ru: "Увеличение дохода в час", en: "Hourly income increase" },
    noEffects: {
      ru: "У вас нет активных эффектов",
      en: `You don't have any active effects`,
    },
  }

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  }

  const StatItem = ({ title, iconLeft, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px",
        background: "rgb(18, 18, 18)",
        borderRadius: 8,
        marginBottom: 8,
        borderBottom: "1px solid rgba(117, 117, 117, 0.23)",
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 8px 2px inset",
      }}
    >
      {iconLeft && (
        <img
          src={iconLeft}
          style={{ width: 24, height: 24, marginRight: 12 }}
        />
      )}
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontSize: 14, margin: 0 }}>{title}</p>
      </div>
      <p
        style={{
          color: color || "#00ff00",
          fontWeight: "bold",
          fontSize: 16,
          margin: 0,
        }}
      >
        {value}
      </p>
    </motion.div>
  )

  const TabContent = () => (
    <AnimatePresence mode="wait">
      {activeTab === "stats" ? (
        <motion.div
          key="stats"
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <StatItem
            iconLeft={Assets.Icons.boosterArrow}
            title={translations.level[lang]}
            value={level}
          />
          <StatItem
            iconLeft={Assets.Icons.respect}
            title={translations.respect[lang]}
            value={respect}
          />
          <StatItem
            iconLeft={Assets.Icons.balance}
            title={translations.total[lang]}
            value={formatCoins(total_earned)}
          />
          <StatItem
            iconLeft={Assets.Icons.energy}
            title={translations.energy[lang]}
            value={energy_capacity}
          />
        </motion.div>
      ) : (
        <motion.div
          key="effects"
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {effects.length > 0 ? (
            effects.map((effect) => (
              <StatItem
                key={Math.floor(Math.random() * 100) + effect.title}
                iconLeft={effect.icon || Assets.Icons.energyUp}
                title={effect.title}
                value={effect.value}
                color={effect.color}
              />
            ))
          ) : (
            <h2>{translations.noEffects[lang]}</h2>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div
      style={{
        ...baseStyles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        zIndex: 999999,
      }}
    >
      {/* Smartphone container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: 320,
          height: 480,
          background: "0% 0% / cover rgb(32, 32, 32)",
          borderRadius: 6,
          padding: 13,
          position: "relative",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          border: "1px solid rgb(57, 57, 57)",
          overflow: "hidden",
          marginTop: 25
        }}
      >

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontFamily: "Oswald",
              fontWeight: "500",
              color: "#fff",
              fontSize: 20,
              margin: 0,
            }}
          >
            {formUsername(userParameters, lang)}
          </p>
          <motion.div
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsStatsShown(false)}
          >
            <img src={Assets.Icons.modalClose} width={16} height={16} />
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            background: "#1a1a1a",
            borderRadius: 20,
            padding: 4,
            marginBottom: 20,
          }}
         
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              padding: "8px 0",
              background: activeTab === "stats" ? "rgba(243,117,0,1) " : "transparent",
              border: "none",
              borderRadius: 16,
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("stats")}
          >
            {translations.stats[lang]}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              padding: "8px 0",
              background: activeTab === "effects" ? "rgba(243,117,0,1) " : "transparent",
              border: "none",
              borderRadius: 16,
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("effects")}
          >
            {translations.effects[lang]}
          </motion.button>
        </div>

        {/* Content */}
        <div
          style={{
            height: 400,
            overflowY: "auto",
            padding: "0",
          }}
        >
          {isLoading ? (
            <motion.div
              variants={loadingVariants}
              animate="animate"
              style={{
                width: 50,
                height: 50,
                border: "5px solid #333",
                borderTop: "5px solid #00ff00",
                borderRadius: "50%",
                margin: "150px auto",
              }}
            />
          ) : (
            <TabContent />
          )}
        </div>
      </motion.div>
    </div>
  )
}

const HomeHeader = ({ screenHeader }) => {
  const { userId, userParameters, userPersonage, userClothing } =
    useContext(UserContext)
  const [levels, setLevels] = useState()
  const [isSettingsShown, setIsSettingsShown] = useState(false)
  const [isStatsShown, setIsStatsShown] = useState(false)
  const [levelSpan, setLevelSpan] = useState(null)
  const [activeProcess, setActiveProcess] = useState()
  const { playClickSound } = useSettingsProvider()

  const { Icons } = Assets

  const handleSettingsPress = () => {
    playClickSound()
    setIsSettingsShown(!isSettingsShown)
  }

  const getLevelByNumber = (number) => {
    return levels?.find((level) => level?.level === number)
  }

  const getLevelWidth = () => {
    if (userParameters && levels) {
      const { level, experience: earned } = userParameters
      const nextLevelRequirement = levels?.find(
        (level) => level?.level === userParameters?.level + 1
      )?.experience_required
      const thisLevelRequirement =
        level > 0
          ? levels?.find((level) => level?.level === userParameters?.level)
              ?.experience_required
          : 0

      return (
        ((earned - thisLevelRequirement) /
          (nextLevelRequirement - thisLevelRequirement)) *
        100
      )
    }

    return null
  }

  useEffect(() => {
    console.log(window.Telegram?.WebApp.safeAreaInset?.top)
    getLevels().then((levels) => setLevels(levels))
    getUserActiveProcess(userId).then((activeProcess) =>
      setActiveProcess(activeProcess)
    )
  }, [])

  const getEnergyIcon = (energy, energy_capacity) => {
    const percent = Math.floor((energy / energy_capacity) * 100)

    if (percent >= 50) {
      return Assets.Icons.energy100
    }

    if (percent >= 9) {
      return Assets.Icons.energy50
    }

    if (percent < 9) {
      return Assets.Icons.energy9
    }
  }

  const getMoodIcon = (mood) => {
    if (mood >= 50) {
      return Assets.Icons.mood100
    }
    if (mood >= 9) {
      return Assets.Icons.mood50
    }
    if (mood < 9) {
      return Assets.Icons.mood9
    }
  }

  const getHungerIcon = (hunger) => {
    if (hunger >= 50) {
      return Assets.Icons.hungry100
    }

    if (hunger >= 9) {
      return Assets.Icons.hungry50
    }

    if (hunger < 9) {
      return Assets.Icons.hungry9
    }
  }

  return (
    <>
      <div
        className="HomeHeader"
        style={{
          borderRadius: screenHeader && "0",
          paddingTop: (window.Telegram?.WebApp.safeAreaInset?.top || 0) + 47.5,
        }}
      >
        <div className="HomeHeaderTopRow">
          <div
            className="HomeHeaderLevel"
            onClick={() => setIsStatsShown(true)}
          >
            <span style={{ fontFamily: "Oswald", fontWeight: "100" }}>
              {userPersonage?.name}
            </span>
            <div className="FillBarProgres">
              <span
                style={{
                  fontFamily: "Oswald",
                  fontWeight: "700",
                  marginTop: "-3px",
                }}
              >
                {userParameters.level}
              </span>

              <div
                className="HomeHeaderLevelCapacity"
                style={{
                  width: getLevelWidth() + "%",
                }}
              />
            </div>
          </div>
          <div className="HomeHeaderIncome">
            <div>
              <img src={Icons.balance} alt="Coin" />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginLeft: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "Oswald",
                }}
              >
                {userParameters.coins &&
                  formatCoins(Math.floor(userParameters?.coins))}
              </span>
            </div>
          </div>
          <div className="HomeHeaderRespect">
            <img src={Icons.respect} alt="RespectIcon" />

            <span>{userParameters?.respect}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 2.5,
            }}
            onClick={handleSettingsPress}
          >
            <img src={Assets.Icons.settings} height={25}></img>
          </div>
        </div>
        <div className="HomeHeaderBottomRow">
          <PlayerIndicators
            indicators={[
              {
                icon: getEnergyIcon(
                  userParameters.energy,
                  userParameters.energy_capacity
                ),
                percentFill: Math.floor(
                  (userParameters?.energy / userParameters?.energy_capacity) *
                    100
                ),
                width: "35%",
                value: `${Math.floor(userParameters?.energy)}/${
                  userParameters?.energy_capacity
                }`,
              },
              {
                icon: getHungerIcon(userParameters.hungry),
                percentFill: Math.floor(userParameters?.hungry),
                width: "28%",
              },
              {
                icon: getMoodIcon(userParameters.mood),
                percentFill: Math.floor(userParameters?.mood),
                width: "28%",
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
  )
}

export default HomeHeader
