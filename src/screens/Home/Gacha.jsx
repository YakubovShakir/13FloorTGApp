import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Assets from "../../assets";
import { instance } from "../../services/instance";
import Button from "../../components/simple/Button/Button";
import { useUser } from "../../UserContext";
import { useSettingsProvider } from "../../hooks";


// Backend API base URL
const API_BASE_URL = "http://localhost:4444/api";

const translations = {
  buySpins: {
    en: "Buy Spins",
    ru: "Купить Спины",
  },
  spin: {
    en: "Spin!",
    ru: "Крутить!",
  },
  spinning: {
    en: "Spinning...",
    ru: "Крутим...",
  },
  close: {
    en: "X",
    ru: "X",
  },
  youWon: {
    en: 'Congratulations!',
    ru: 'Поздравляем!'
  },
  spins: {
    en: 'Spins: ',
    ru: 'Спинов: '
  },
  wheel: {
    en: 'Wheel',
    ru: 'Колесо'
  },
  lucktest: {
    en: 'Test Your Luck!',
    ru: 'Испытай свою удачу!'
  }
};


const buttonStyle = {
  width: "100%",
  height: 44,
  color: "rgb(255, 255, 255)",
  fontSize: 14,
  fontFamily: "Oswald",
};

const shineVariants = {
  shine: {
    filter: [
      "drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))",
      "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
      "drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
const GachaOverlay = () => {
  const [isActive, setIsActive] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rouletteItems, setRouletteItems] = useState([]);
  const [spinTarget, setSpinTarget] = useState(0);
  const [lastSpinPosition, setLastSpinPosition] = useState(0);
  const [itemPool, setItemPool] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const rouletteRef = useRef(null);
  const { Icons } = Assets;
  // Constants
  const SPIN_LENGTH = 100;
  const ITEM_WIDTH = 160;
  const ITEM_MARGIN = 6;
  const TOTAL_ITEM_SPACE = ITEM_WIDTH + 2 * ITEM_MARGIN;

  const { userId } = useUser();
  const { lang } = useSettingsProvider();

  // Preload images from item pool
  const preloadImages = (items) => {
    items.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  };

  // Fetch item pool from server
  const fetchItemPool = async () => {
    try {
      const response = await instance.get(`/users/${userId}/gacha/items`);
      const items = response.data.items;
      setItemPool(items);
      preloadImages(items);
      return items;
    } catch (error) {
      console.error("Error fetching item pool:", error);
      return [];
    }
  };

  // Fetch initial gacha data
  const fetchGachaData = async (pool) => {
    try {
      const response = await instance.get(`/users/${userId}/gacha/attempts`);
      setAttempts(response.data.attempts);
      setRouletteItems(generateItems(30, null, null, pool));
    } catch (error) {
      console.error("Error fetching gacha data:", error);
    }
  };

  // Buy an attempt
  const buyAttempts = async () => {
    
      try {
        const response = await instance.post('/users/request-stars-invoice-link', {
          productType: 'spin',
          userId
        })

        window.Telegram?.WebApp?.openInvoice(response.data.invoiceLink, (status) => {
          if (status === "paid") {
            setAttempts(response.data.attempts)
          }
        })
      } catch (err) {
        console.error(err)
      }
  };

  // Spin the gacha wheel
  const spinGacha = async () => {
    try {
      const response = await instance.get(`/users/${userId}/gacha/spin`);
      return response.data.wonItem;
    } catch (error) {
      console.error("Error spinning gacha:", error);
      throw error;
    }
  };

  // Generate random items from the server-fetched pool
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

  // Load data function to reuse on open
  const loadData = async () => {
    setIsLoading(true);
    setRouletteItems([]); // Reset to ensure no stale items show
    const pool = await fetchItemPool();
    await fetchGachaData(pool);
    setIsLoading(false);
  };

  // Fetch data on mount and when overlay opens
  useEffect(() => {
    if (userId && isActive) {
      loadData();
    }
  }, [userId, isActive]); // Add isActive to trigger refetch on reopen

  // Handle closing overlay and reset state
  const handleClose = () => {
    setIsActive(false);
    setSpinning(false);
    setResult(null);
    setSpinTarget(0);
    setLastSpinPosition(0);
    // Optionally reset attempts and rouletteItems if backend state persists
  };

  // Handle buying attempts
  const handleBuyAttempts = async () => {
    if (!spinning) await buyAttempts();
  };


  const { refreshData } = useUser()
  // Handle spin action
  const handleSpin = async () => {
    if (attempts <= 0 || spinning || !itemPool.length) return;

    setSpinning(true);
    setAttempts((prev) => prev - 1);
    setResult(null);
    setLastSpinPosition(0);
    setSpinTarget(0);

    try {
      const wonItem = await spinGacha();

      const winnerIndex = Math.floor(SPIN_LENGTH * 0.8);
      const containerWidth = rouletteRef.current?.offsetWidth || window.innerWidth * 0.9;

      const matchedWonItem = itemPool.find(
        (item) => item.type === wonItem.type && item.id === wonItem.id
      ) || wonItem;

      const newRoulette = generateItems(SPIN_LENGTH, matchedWonItem, winnerIndex);
      setRouletteItems(newRoulette);

      const itemCenter = winnerIndex * TOTAL_ITEM_SPACE + ITEM_WIDTH / 2;
      const targetPosition = containerWidth / 2 - itemCenter;
      setSpinTarget(targetPosition);

      setTimeout(() => {
        setSpinning(false);
        setLastSpinPosition(targetPosition);
        setResult(matchedWonItem);
        refreshData()
      }, 5000);
    } catch (error) {
      setSpinning(false);
      setAttempts((prev) => prev + 1);
    }
  };

  // Animation variants
  const rouletteVariants = {
    idle: { x: lastSpinPosition },
    spinning: {
      x: spinTarget,
      transition: {
        duration: 5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <>
      {/* Trigger button with original styles */}
      <div
        onClick={() => setIsActive(true)}
        style={{
          cursor: "pointer",
          position: "fixed",
          bottom: "13vh",
          left: "3.5vw",
          color: "white",
          border: "none",
          zIndex: 99999,
          fontSize: "14px",
          textAlign: "center",
        }}
      >
      <motion.img
          src={Assets.Icons.shittonsmoney}
          width={50}
          alt="Wheel"
          variants={shineVariants}
          animate="shine"
        />
        <p>{translations.wheel[lang]}</p>
      </div>
     
      {/* Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              
              zIndex: 9999999999999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              opacity: 1,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >


{/* Фоновый слой с градиентом */}
<div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21) 2px, rgba(57, 57, 57, 0.06) 2px, rgba(57, 57, 57, 0.06) 6px) rgb(20, 20, 20)",
                zIndex: -1, // Помещаем фон под контент
              }}
            />
           <button 
           
           onClick={handleClose}
   
    style={{
        paddingBottom: '4px',
        
        
        border: '2px solid rgb(255, 0, 0)',
        cursor: 'pointer',
        width: '35px',
        height: '35px',
        backgroundColor: 'rgba(0, 0, 0, 0.52)',
        backdropFilter: 'blur(5px)',
        color:'rgb(255, 0, 0)',
        borderRadius:' 8px',
        fontSize:' 20px',
       
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
       
    }}
>
<img
                  src={Icons.backIcon}
                  alt="Coin"
                  style={{ width: "25px", margin: "2px" }}
                />
</button>
 <p
                    style={{
                   
                      color: "white",
                      fontSize: "18px",
                      fontFamily: "Oswald",
                      zIndex: 3,
                      whiteSpace: "nowrap",
                      fontSize: "20px",
                      marginBottom: "15px"
                    }}
                  >
                    {translations.lucktest[lang]}
                  </p>

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
                {/* Roulette container */}
                <div
  style={{
    position: "relative", 
    width: "100%",
    maxWidth: "800px",
    height: "220px",
  }}
> 

 {/* Градиенты слева и справа */}
 <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "50px",
                      height: "100%",
                      background: "linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))",
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
                      background: "linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))",
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
                    style={{ display: "flex", position: "absolute", height: "100%" }}
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
                          alt={item.name[lang]}
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
                        <p style={{ color: "white", marginTop: "10px", fontSize: "14px" }}>{item.name[lang]}</p>
                      </div>
                    ))}
                  </motion.div>
                  {/* Center marker (line) */}
                {/* Верхний треугольник */}
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "0px",
      width: "25px",
      height: "15px",
      background: " rgb(206, 206, 206)",
      clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
      transform: "translateX(-50%)",
      zIndex: 2, // Чтобы треугольники были поверх градиентов
    }}
  />
  {/* Нижний треугольник */}
  <div
    style={{
      position: "absolute",
      left: "50%",
      bottom: "-1px",
      width: "25px",
      height: "15px",
      background: " rgb(206, 206, 206)",
      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
      transform: "translateX(-50%)",
      zIndex: 2,
    }}
  />
</div>
                </div>
                

                {/* Controls with custom Button */}
                <div
                  style={{
                    marginTop: "30px",
                    color: "white",
                    textAlign: "center",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  <p style={{ fontSize: "18px", marginBottom: "15px" }}>{translations.spins[lang]}{attempts}</p>
                  <div style={{ display: "flex", gap: "15px", flex: 1, justifyContent: "center" }}>
                    <Button
                      onClick={handleSpin}
                      active={!(attempts <= 0 || spinning)}
                      style={buttonStyle}
                      width={100}
                      text={spinning ? translations.spinning[lang] : translations.spin[lang]}
                      color={"white"}
                      fontWeight={"200"}
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
                      width={125}
                      color={"white"}
                      fontWeight={"200"}
                      fontSize={14}
                      iconStyles={{ marginLeft: 10 }}
                    />
                  </div>
                </div>

                {/* Result modal with original styles */}
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
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        transform: "translate(-50%, -50%)",
                        background: "linear-gradient(135deg, #ffffff, #e0e0e0)",
                        padding: "30px",
                        borderRadius: "15px",
                        textAlign: "center",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        zIndex: 10000,
                        width: "300px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <h2 style={{ fontFamily: "Arial, sans-serif", color: "#333", marginBottom: "20px" }}>
                        {translations.youWon[lang]}
                      </h2>
                      <img
                        src={result.image}
                        alt={result.name[lang]}
                        style={{ width: "120px", height: "120px", borderRadius: "10px" }}
                      />
                      <p style={{ fontFamily: "Arial, sans-serif", color: "#555", fontSize: "18px", margin: "15px 0" }}>
                        {result.name[lang]}
                      </p>
                      <Button
                        onClick={() => setResult(null)}
                        style={buttonStyle}
                        text={"OK"}
                        height={45}
                        width={75}
                        active={true}
                        color={"white"}
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

// CSS for spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject spinner styles into the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = spinnerStyles;
  document.head.appendChild(styleSheet);
}

export default GachaOverlay;