import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Assets from "../../assets";
import { instance } from "../../services/instance";
import Button from "../../components/simple/Button/Button";
import { useUser } from "../../UserContext";
import { useSettingsProvider } from "../../hooks";
import globalTranslations from "../../globalTranslations";
import { useNavigate } from "react-router-dom";

const translations = globalTranslations.gacha;

const buttonStyle = {
  width: "100%",
  height: 44,
  color: "rgb(255, 255, 255)",
  fontSize: 14,
  fontFamily: "Oswald",
};

const GachaOverlay = () => {
  const [isActive, setIsActive] = useState(true);
  const [attempts, setAttempts] = useState(0); // Always a number
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [burnedTo, setBurnedTo] = useState(null);
  const [rouletteItems, setRouletteItems] = useState([]);
  const [spinTarget, setSpinTarget] = useState(0);
  const [lastSpinPosition, setLastSpinPosition] = useState(0);
  const [itemPool, setItemPool] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBurning, setIsBurning] = useState(false);
  const rouletteRef = useRef(null);
  const { Icons } = Assets;
  const SPIN_LENGTH = 100;
  const ITEM_WIDTH = 160;
  const ITEM_MARGIN = 6;
  const TOTAL_ITEM_SPACE = ITEM_WIDTH + 2 * ITEM_MARGIN;

  const { userId, refreshData } = useUser();
  const { lang } = useSettingsProvider();

  const preloadImages = (items) => {
    items.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  };

  const fetchItemPool = async () => {
    try {
      const response = await instance.get(`/users/${userId}/gacha/items`);
      const items = response.data.items || [];
      setItemPool(items);
      preloadImages(items);
      return items;
    } catch (error) {
      console.error("Error fetching item pool:", error);
      return [];
    }
  };

  const fetchGachaData = async (pool) => {
    try {
      const response = await instance.get(`/users/${userId}/gacha/attempts`);
      // Ensure attempts is a number, default to 0 if invalid
      const fetchedAttempts = Number(response.data.attempts) || 0;
      setAttempts(fetchedAttempts);
      setRouletteItems(generateItems(30, null, null, pool));
    } catch (error) {
      console.error("Error fetching gacha data:", error);
      setAttempts(0); // Fallback to 0 on error
    }
  };

  const buyAttempts = async () => {
    try {
      const response = await instance.post("/users/request-stars-invoice-link", {
        productType: "spin",
        userId,
      });
      window.Telegram?.WebApp?.openInvoice(response.data.invoiceLink, (status) => {
        if (status === "paid") {
          setAttempts((prev) => prev + 1); // Increment attempts by 1
        }
      });
    } catch (err) {
      console.error("Error buying attempts:", err);
    }
  };

  const spinGacha = async () => {
    try {
      const response = await instance.get(`/users/${userId}/gacha/spin`);
      return response.data;
    } catch (error) {
      console.error("Error spinning gacha:", error);
      throw error;
    }
  };

  const generateItems = (count, wonItem = null, winnerIndex = null, pool = itemPool) => {
    if (!pool.length) return [];
    return Array.from({ length: count }, (_, i) => {
      if (wonItem && i === winnerIndex) {
        return { ...wonItem, uniqueId: Math.random() };
      }
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      return { ...randomItem, uniqueId: Math.random() };
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    setRouletteItems([]);
    const pool = await fetchItemPool();
    await fetchGachaData(pool);
    setIsLoading(false);
  };

  useEffect(() => {
    if (userId && isActive) {
      loadData();
    }
  }, [userId, isActive]);

  const handleClose = () => {
    setSpinning(false);
    setResult(null);
    setBurnedTo(null);
    setSpinTarget(0);
    setLastSpinPosition(0);
    setIsBurning(false);
  };

  const handleBuyAttempts = async () => {
    if (!spinning) await buyAttempts();
  };

  const handleSpin = async () => {
    if (attempts <= 0 || spinning || !itemPool.length) return;

    setSpinning(true);
    setAttempts((prev) => Math.max(0, prev - 1)); // Ensure it never goes below 0 or becomes NaN
    setResult(null);
    setBurnedTo(null);
    setLastSpinPosition(0);
    setSpinTarget(0);

    try {
      const { wonItem, burnedTo } = await spinGacha();

      const winnerIndex = Math.floor(SPIN_LENGTH * 0.8);
      const containerWidth = rouletteRef.current?.offsetWidth || window.innerWidth * 0.9;

      const matchedWonItem =
        itemPool.find((item) => item.type === wonItem.type && item.id === wonItem.id) || wonItem;

      const newRoulette = generateItems(SPIN_LENGTH, matchedWonItem, winnerIndex);
      setRouletteItems(newRoulette);

      const itemCenter = winnerIndex * TOTAL_ITEM_SPACE + ITEM_WIDTH / 2;
      const targetPosition = containerWidth / 2 - itemCenter;
      setSpinTarget(targetPosition);

      setTimeout(() => {
        setSpinning(false);
        setLastSpinPosition(targetPosition);
        setResult(matchedWonItem);
        if (burnedTo) {
          setBurnedTo(burnedTo);
          setIsBurning(true);
          setTimeout(() => {
            setIsBurning(false);
          }, 3000);
        }
        refreshData();
      }, 5000);
    } catch (error) {
      setSpinning(false);
      setAttempts((prev) => Math.max(0, prev + 1)); // Restore attempts safely
    }
  };

  const rouletteVariants = {
    idle: { x: lastSpinPosition },
    spinning: {
      x: spinTarget,
      transition: { duration: 5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const burnAnimationVariants = {
    initial: { opacity: 1, scale: 1 },
    burn: {
      opacity: [1, 0, 1, 0],
      scale: [1, 1.2, 1, 1.2],
      transition: {
        duration: 2,
        times: [0, 0.25, 0.5, 0.75],
        repeat: 1,
        ease: "easeInOut",
      },
    },
    final: { opacity: 1, scale: 1 },
  };

  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background:
                "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21) 2px, rgba(57, 57, 57, 0.06) 2px, rgba(57, 57, 57, 0.06) 6px) rgb(20, 20, 20)",
              zIndex: 9999999999999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ width: "100%", zIndex: -1 }}>
              <button
                onClick={!spinning ? () => { handleClose(); navigate('/'); } : undefined}
                style={{
                  paddingBottom: "4px",
                  position: "absolute",
                  left: "13px",
                  border: "2px solid rgb(255, 0, 0)",
                  cursor: "pointer",
                  width: "35px",
                  height: "35px",
                  backgroundColor: "rgba(0, 0, 0, 0.52)",
                  backdropFilter: "blur(5px)",
                  color: "rgb(255, 0, 0)",
                  borderRadius: "8px",
                  fontSize: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={Icons.backIcon}
                  alt="Back"
                  style={{ width: "25px", margin: "2px" }}
                />
              </button>
              <p
                style={{
                  paddingTop: "3px",
                  textTransform: "uppercase",
                  color: "white",
                  fontSize: "20px",
                  fontFamily: "Oswald",
                  zIndex: 3,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  marginBottom: "15px",
                }}
              >
                {translations.lucktest[lang]}
              </p>
            </div>

            {isLoading || !rouletteItems.length ? (
              <div
                style={{
                  color: "white",
                  fontSize: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "5px solid #fff",
                    borderTop: "5px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <p>Loading...</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "800px",
                    height: "220px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "50px",
                      height: "100%",
                      background:
                        "linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "50px",
                      height: "100%",
                      background:
                        "linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    ref={rouletteRef}
                    style={{
                      width: "100%",
                      maxWidth: "800px",
                      height: "220px",
                      overflow: "hidden",
                      background: "rgb(0 0 0)",
                      borderRadius: "0px",
                      position: "relative",
                      borderBottom: "1px solid rgb(206, 206, 206)",
                      borderTop: "1px solid rgb(206, 206, 206)",
                    }}
                  >
                    <motion.div
                      key={spinning ? "spinning" : "idle"}
                      style={{
                        display: "flex",
                        position: "absolute",
                        height: "100%",
                      }}
                      variants={rouletteVariants}
                      initial="idle"
                      animate={spinning ? "spinning" : "idle"}
                    >
                      {rouletteItems.map((item) => (
                        <div
                          key={item.uniqueId}
                          style={{
                            width: "160px",
                            height: "220px",
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "0 6px",
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name?.[lang] || item.type}
                            style={{
                              maxWidth: "90%",
                              maxHeight: "90%",
                              objectFit: "contain",
                              boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
                              border: "1px solid rgba(255, 255, 255, 0.05)",
                              borderRadius: "8px",
                              background: "rgba(40, 40, 40, 0.9)",
                            }}
                          />
                          <p
                            style={{
                              color: "white",
                              marginTop: "10px",
                              fontSize: "14px",
                            }}
                          >
                            {item.name?.[lang] ||
                              `${item.amount} ${translations[item.type]?.[lang]}`}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "0px",
                        width: "25px",
                        height: "15px",
                        background: "rgb(206, 206, 206)",
                        clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
                        transform: "translateX(-50%)",
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: "-1px",
                        width: "25px",
                        height: "15px",
                        background: "rgb(206, 206, 206)",
                        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                        transform: "translateX(-50%)",
                        zIndex: 2,
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "30px",
                    color: "white",
                    textAlign: "center",
                    fontFamily: "Oswald",
                  }}
                >
                  <p style={{ fontSize: "18px", marginBottom: "15px" }}>
                    {translations.spins[lang]}: {attempts >= 0 ? attempts : 0}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      onClick={handleSpin}
                      active={!(attempts <= 0 || spinning)}
                      style={buttonStyle}
                      width={100}
                      text={
                        spinning
                          ? translations.spinning[lang]
                          : translations.spin[lang]
                      }
                      color={"white"}
                      fontWeight={"800"}
                      textTransform={"uppercase"}
                      fontFamily={"Oswald"}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      width: "100vw",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 25,
                    }}
                  >
                    <Button
                      icon={Assets.Icons.starsIcon}
                      onClick={handleBuyAttempts}
                      active={!spinning}
                      text={translations.buySpins[lang]}
                      style={buttonStyle}
                      width={150}
                      color={"white"}
                      fontWeight={"800"}
                      fontSize={14}
                      iconStyles={{ marginLeft: 2 }}
                      fontFamily={"Oswald"}
                    />
                  </div>
                </div>

                {result && (
                  <div
                    style={{
                      position: "fixed",
                      width: "100vw",
                      height: "100vh",
                      zIndex: 999999999999999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgb(0 0 0 / 45%)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        borderRadius: "15px",
                        textAlign: "center",
                        zIndex: 10000,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "auto",
                        padding: "20px",
                        position: "relative",
                      }}
                    >
                      <h2
                        style={{
                          fontFamily: "Oswald",
                          color: "#fff",
                          marginBottom: "11px",
                          textTransform: "uppercase",
                        }}
                      >
                        {translations.youWon[lang]}
                      </h2>
                      <motion.div
                        variants={burnedTo && isBurning ? burnAnimationVariants : {}}
                        initial="initial"
                        animate={burnedTo && isBurning ? "burn" : "final"}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={
                            isBurning && burnedTo
                              ? burnedTo.image || Assets.Icons[burnedTo.type]
                              : result.image
                          }
                          alt={
                            isBurning && burnedTo
                              ? burnedTo.type
                              : result.name[lang]
                          }
                          style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "10px",
                            border: "2px solid #ff7700",
                            background:
                              "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21) 2px, rgba(57, 57, 57, 0.06) 2px, rgba(57, 57, 57, 0.06) 6px) rgba(0, 0, 0, 0.51)",
                          }}
                        />
                        <p
                          style={{
                            fontFamily: "Oswald",
                            color: "#fff",
                            fontSize: "28px",
                            margin: "15px 0",
                          }}
                        >
                          {isBurning && burnedTo
                            ? `${translations.burnedTo[lang]} ${burnedTo.amount} ${
                                translations[burnedTo.type][lang]
                              }${burnedTo.name ? ` (${burnedTo.name})` : ""}`
                            : result.name[lang] ||
                              `${result.amount} ${translations[result.type][lang]}`}
                        </p>
                      </motion.div>
                      <Button
                        onClick={() => {
                          setResult(null);
                          setBurnedTo(null);
                        }}
                        style={buttonStyle}
                        text={"OK"}
                        height={25}
                        width={75}
                        active={true}
                        color={"white"}
                        fontFamily={"Oswald"}
                      />
                    </motion.div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = spinnerStyles;
  document.head.appendChild(styleSheet);
}

export default GachaOverlay;