import { useCallback, useEffect, useState, useContext, memo, useMemo } from "react"
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
import { instance } from "../../../services/instance"
import { COLORS } from "../../../utils/paramBlockUtils"
import globalTranslations from "../../../globalTranslations"
import effectIconMap from "../../../effectIconMap"

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
  WHITE: "#fff",
};

// Custom hook to manage neko state fetching
const useNekoEffects = (userId, lang) => {
  const [isLoading, setIsLoading] = useState(true);
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    const fetchNekoState = async () => {
      setIsLoading(true);
      try {
        const neko = await getOwnNekoState(userId);
        setEffects([
          {
            type: "neko",
            value: neko.incomeBoostPercentage > 0 ? `+${neko.incomeBoostPercentage}%` : "0",
            title: translations.nekoEffect[lang],
            color: neko.incomeBoostPercentage > 0 ? PHONE_COLORS.GREEN : PHONE_COLORS.WHITE,
            icon: Assets.Icons.nftEffectIcon,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch neko state:", error);
        setEffects([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchNekoState();
    }
  }, [userId, lang]);

  return { isLoading, effects };
};

// Translations (moved outside to avoid re-creation)
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
    en: "You don't have any active effects",
  },
};

const StatItem = memo(({ title, iconLeft, value, color }) => (
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
        alt=""
      />
    )}
    <div style={{ flex: 1 }}>
      <p style={{ color: "#fff", fontSize: 14, margin: 0 , fontWeight: "200" }}>{title}</p>
    </div>
    <p
      style={{
        color: color || COLORS.WHITE,
        fontWeight: "bold",
        fontSize: 16,
        margin: 0,
      }}
    >
      {value}
    </p>
  </motion.div>
));

StatItem.displayName = "StatItem"; // For React DevTools

export const useCurrentEffects = (userId, lang) => {
  const [isLoading, setIsLoading] = useState(true);
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    const fetchEffects = async () => {
      setIsLoading(true);
      try {
        const response = await instance.get(`/users/${userId}/effects/current`);
        const { effects: rawEffects } = response.data;

        const summedEffects = {};

        // Sum non-autostart effects and deduplicate autostart
        Object.keys(rawEffects).forEach((category) => {
          if (category === 'neko_boost_percentage') {
            // Handle Neko boost separately
            summedEffects[category] = [{ param: 'neko_boost', value: rawEffects[category] }];
          } else {
            const effectsData = rawEffects[category];
            if (Array.isArray(effectsData) && effectsData.length > 0) {
              if (category === 'autostart') {
                // Deduplicate autostart by param
                const uniqueAutostarts = new Map();
                effectsData.forEach(({ param, value }) => {
                  if (!uniqueAutostarts.has(param)) {
                    uniqueAutostarts.set(param, value);
                  }
                });
                summedEffects[category] = Array.from(uniqueAutostarts, ([param, value]) => ({ param, value }));
              } else {
                // Sum other effects by param
                const paramSums = {};
                effectsData.forEach(({ param, value }) => {
                  paramSums[param] = (paramSums[param] || 0) + value;
                });
                summedEffects[category] = Object.entries(paramSums).map(([param, value]) => ({ param, value }));
              }
            } else if (effectsData !== null && !Array.isArray(effectsData)) {
              // Handle scalar effects (e.g., duration_decrease), though not displayed
              summedEffects[category] = [{ param, value: effectsData }];
            } else {
              summedEffects[category] = [];
            }
          }
        });

        const formattedEffects = [];

        const getEffectIcon = (category, param = 'default') => {
          const map = effectIconMap;
          if (category === 'neko_boost_percentage') {
            return map.neko_boost_percentage; // Unique icon for Neko boost
          }
          return map[category]?.[param] || Assets.Icons.energyUp;
        };

        const translations = globalTranslations.effects;
        const formatValue = (category, value) => {
          const split = category.split('_');
          const signedValue = value > 0 ? `+${value}` : (value === 0 ? value : `-${value}`);
          return split[split.length - 1] === 'percent' || category === 'neko_boost_percentage'
            ? `${Math.floor(signedValue)}%`
            : `${Math.floor(signedValue)}`;
        };

        // Format summed effects
        Object.keys(summedEffects).forEach((category) => {
          summedEffects[category].forEach(({ param, value }) => {
            // Skip scalar effects that aren’t displayed
            if (['duration_decrease', 'mood_increase', 'reward_increase', 'energy_cost_decrease', 'hunger_cost_decrease'].includes(category)) {
              return;
            }
            formattedEffects.push({
              type: category,
              param,
              value: formatValue(category, value),
              title: translations[category]?.[param]?.[lang] || category, // Fallback to category if no translation
              color: value > 0 ? COLORS.GREEN : (value === 0 ? COLORS.WHITE : COLORS.RED),
              icon: getEffectIcon(category, param),
            });
          });
        });

        setEffects(formattedEffects);
      } catch (error) {
        console.error("Failed to fetch current effects:", error);
        setEffects([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchEffects();
  }, [userId, lang]);

  return { isLoading, effects };
};

// Updated StatsModal
const StatsModal = memo(({ baseStyles, setIsStatsShown, clothing }) => {
  const { userParameters } = useUser();
  const { total_earned, level, energy_capacity, respect, id, experience } = userParameters;
  const { lang } = useSettingsProvider();
  const [activeTab, setActiveTab] = useState("stats");
  const { isLoading: isEffectsLoading, effects: currentEffects } = useCurrentEffects(id, lang);
  const [levelParameters, setLevelParameters] = useState()

  useEffect(() => {
    getLevels().then(levels => setLevelParameters(levels))
  }, [])

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  };

  const combinedEffects = [...currentEffects];
  const nextLevelExpRequired = levelParameters?.find(levelParameter => levelParameter.level === level + 1)?.experience_required
  const thisLevelExpRequired = levelParameters?.find(levelParameter => levelParameter.level === level)?.experience_required

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
            iconLeft={Assets.Icons.levelIcon}
            title={translations.level[lang]}
            value={`${experience - thisLevelExpRequired}/${nextLevelExpRequired ? nextLevelExpRequired - thisLevelExpRequired : thisLevelExpRequired}`}
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
          {isEffectsLoading ? (
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
          ) : combinedEffects.length > 0 ? (
            combinedEffects.map((effect, index) => (
              <StatItem
                key={`${effect.type}-${effect.param || index}`}
                iconLeft={effect.icon || Assets.Icons.energyUp}
                title={effect.title}
                value={effect.value}
                color={effect.color}
              />
            ))
          ) : (
            <h2 style={{ color: "#fff", textAlign: "center" }}>
              {translations.noEffects[lang]}
            </h2>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

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
      <motion.div
        key={id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: 320,
          height: 480,
          background: "rgb(32, 32, 32)",
          borderRadius: 6,
          padding: 13,
          position: "relative",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          border: "1px solid rgb(57, 57, 57)",
          overflow: "hidden",
          marginTop: 25,
        }}
      >
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
            <img src={Assets.Icons.modalClose} width={16} height={16} alt="Close" />
          </motion.div>
        </div>

        <div
          style={{
            display: "flex",
            background: "#1a1a1a",
            borderRadius: 20,
            
            marginBottom: 20,
          }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              padding: "8px 0",
              background: activeTab === "stats" ? "rgba(243,117,0,1)" : "transparent",
              border: "none",
              borderRadius: 16,
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "Oswald"
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
              background: activeTab === "effects" ? "rgba(243,117,0,1)" : "transparent",
              border: "none",
              borderRadius: 16,
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "Oswald",
            }}
            onClick={() => setActiveTab("effects")}
          >
            {translations.effects[lang]}
          </motion.button>
        </div>

        <div
          style={{
            height: 340,
            overflowY: "auto",
            padding: "0",
          }}
        >
          <TabContent />
        </div>
      </motion.div>
    </div>
  );
});

// Memoize StatsModal and only re-render if critical props change
StatsModal.displayName = "StatsModal";

const HomeHeader = ({ screenHeader }) => {
  const { userId, userParameters, userPersonage, userClothing } = useContext(UserContext);
  const [levels, setLevels] = useState();
  const [isSettingsShown, setIsSettingsShown] = useState(false);
  const [isStatsShown, setIsStatsShown] = useState(false);
  const [nekoEffects, setNekoEffects] = useState(null); // Store neko effects
  const [isNekoLoading, setIsNekoLoading] = useState(true); // Loading state for neko
  const [activeProcess, setActiveProcess] = useState();
  const { playClickSound } = useSettingsProvider();

  const { Icons } = Assets;

  // Memoize baseStyles to prevent recreation
  const baseStyles = useMemo(
    () => ({
      position: "fixed",
      height: "100vh",
      width: "100vw",
      backgroundColor: "black",
      zIndex: 10,
      top: 0,
      left: 0,
    }),
    []
  );

  const handleSettingsPress = () => {
    playClickSound();
    setIsSettingsShown(!isSettingsShown);
  };

  const getLevelWidth = () => {
    if (userParameters && levels) {
      const { level, experience: earned } = userParameters;
      const nextLevelRequirement = levels?.find(
        (level) => level?.level === userParameters?.level + 1
      )?.experience_required;
      const thisLevelRequirement =
        level > 0
          ? levels?.find((level) => level?.level === userParameters?.level)
              ?.experience_required
          : 0;

      return (
        ((earned - thisLevelRequirement) /
          (nextLevelRequirement - thisLevelRequirement)) *
        100
      );
    }
    return null;
  };

  useEffect(() => {
    console.log(window.Telegram?.WebApp.safeAreaInset?.top);
    getLevels().then((levels) => setLevels(levels));
  }, [userId]); // Re-fetch if userId changes

  const getEnergyIcon = (energy, energy_capacity) => {
    const percent = Math.floor((energy / energy_capacity) * 100);
    if (percent >= 50) return Assets.Icons.energy100;
    if (percent >= 9) return Assets.Icons.energy50;
    return Assets.Icons.energy9;
  };

  const getMoodIcon = (mood) => {
    if (mood >= 50) return Assets.Icons.mood100;
    if (mood >= 9) return Assets.Icons.mood50;
    return Assets.Icons.mood9;
  };

  const getHungerIcon = (hunger) => {
    if (hunger >= 50) return Assets.Icons.hungry100;
    if (hunger >= 9) return Assets.Icons.hungry50;
    return Assets.Icons.hungry9;
  };

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
                style={{ width: getLevelWidth() + "%" }}
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
              <span style={{ fontFamily: "Oswald" }}>
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
            <img src={Assets.Icons.settings} height={25} alt="Settings" />
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
          baseStyles={baseStyles}
          setIsSettingsShown={setIsSettingsShown}
        />
      )}
      {isStatsShown && (
        <StatsModal
          baseStyles={baseStyles}
          setIsStatsShown={setIsStatsShown}
          clothing={userClothing}
          nekoEffects={nekoEffects} // Pass pre-fetched neko data
          isNekoLoading={isNekoLoading} // Pass loading state
        />
      )}
    </>
  );
};

export default HomeHeader
