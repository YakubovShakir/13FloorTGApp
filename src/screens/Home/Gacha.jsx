import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Assets from "../../assets";
import Button from "../../components/simple/Button/Button";
// Sample item pool
const itemPool = [
  { id: 1, name: "Knife", image: "https://via.placeholder.com/100/FF0000/FFFFFF?text=Knife", rarity: "common" },
  { id: 2, name: "Gun", image: "https://via.placeholder.com/100/00FF00/FFFFFF?text=Gun", rarity: "rare" },
  { id: 3, name: "Skin", image: "https://via.placeholder.com/100/0000FF/FFFFFF?text=Skin", rarity: "epic" },
];

const GachaOverlay = ({ userId }) => {
  // const [isActive, setIsActive] = useState(false);
  // const [attempts, setAttempts] = useState(0);
  // const [spinning, setSpinning] = useState(false);
  // const [result, setResult] = useState(null);
  // const [rouletteItems, setRouletteItems] = useState([]);
  // const [spinTarget, setSpinTarget] = useState(0);
  // const [lastSpinPosition, setLastSpinPosition] = useState(0);
  // const rouletteRef = useRef(null);

  // // Constants
  // const SPIN_LENGTH = 100; // Long sequence for infinite spin feel
  // const ITEM_WIDTH = 160;
  // const ITEM_MARGIN = 6; // 6px each side as per original
  // const TOTAL_ITEM_SPACE = ITEM_WIDTH + 2 * ITEM_MARGIN; // 172px

  // // Mock API calls
  // const mockFetchGachaData = () =>
  //   new Promise((resolve) =>
  //     setTimeout(() => resolve({ data: { attempts: 3 } }), 1000)
  //   );
  // const mockBuyAttempts = () =>
  //   new Promise((resolve) =>
  //     setTimeout(() => resolve({ data: { attempts: attempts + 1 } }), 500)
  //   );
  // const mockSpinGacha = () =>
  //   new Promise((resolve) =>
  //     setTimeout(() => {
  //       const wonItem = itemPool[Math.floor(Math.random() * itemPool.length)];
  //       resolve({ data: { wonItem } });
  //     }, 200)
  //   );

  // // Generate random items from the pool
  // const generateItems = (count, wonItem = null, winnerIndex = null) => {
  //   return Array.from({ length: count }, (_, i) => {
  //     if (wonItem && i === winnerIndex) {
  //       return { ...wonItem, uniqueId: Math.random() };
  //     }
  //     return {
  //       ...itemPool[Math.floor(Math.random() * itemPool.length)],
  //       uniqueId: Math.random(),
  //     };
  //   });
  // };

  // // Fetch initial data and pre-populate
  // useEffect(() => {
  //   const fetchGachaData = async () => {
  //     const response = await mockFetchGachaData();
  //     setAttempts(response.data.attempts);
  //     setRouletteItems(generateItems(30)); // Pre-populate with 30 items
  //   };
  //   fetchGachaData();
  // }, [userId]);

  // // Handle buying attempts
  // const handleBuyAttempts = async () => {
  //   try {
  //     const response = await mockBuyAttempts();
  //     setAttempts(response.data.attempts);
  //   } catch (error) {
  //     console.error("Error buying attempts:", error);
  //   }
  // };

  // // Handle spin action
  // const handleSpin = async () => {
  //   if (attempts <= 0 || spinning) return;

  //   // Reset for a fresh spin
  //   setSpinning(true);
  //   setAttempts((prev) => prev - 1);
  //   setResult(null);
  //   setLastSpinPosition(0); // Reset to start for new spin
  //   setSpinTarget(0); // Reset target temporarily

  //   const response = await mockSpinGacha();
  //   const wonItem = response.data.wonItem;

  //   // Spin parameters
  //   const winnerIndex = Math.floor(SPIN_LENGTH * 0.8); // 80% mark, index 80
  //   const containerWidth = rouletteRef.current?.offsetWidth || window.innerWidth * 0.9;

  //   // Generate new spin sequence with winner
  //   const newRoulette = generateItems(SPIN_LENGTH, wonItem, winnerIndex);
  //   setRouletteItems(newRoulette);

  //   // Calculate exact stop position
  //   const itemCenter = winnerIndex * TOTAL_ITEM_SPACE + ITEM_WIDTH / 2; // Center of the won item
  //   const targetPosition = containerWidth / 2 - itemCenter; // Move to center under marker
  //   setSpinTarget(targetPosition);

  //   // Stop spinning after 5 seconds and preserve position
  //   setTimeout(() => {
  //     setSpinning(false);
  //     setLastSpinPosition(targetPosition); // Save the final position
  //     setResult(wonItem);
  //   }, 5000);
  // };

  // // Animation variants
  // const rouletteVariants = {
  //   idle: { x: lastSpinPosition },
  //   spinning: {
  //     x: spinTarget,
  //     transition: {
  //       duration: 5,
  //       ease: [0.25, 0.1, 0.25, 1], // Smooth start and stop
  //     },
  //   },
  // };

  // return (
  //   <>
  //     {/* Trigger button with original styles */}
  //     <div
  //       onClick={() => setIsActive(true)}
  //       style={{
  //         cursor: "pointer",
  //         position: "fixed",
  //         bottom: "13vh",
  //         left: "3.5vw",
  //         color: "white",
  //         border: "none",
  //         zIndex: 99999,
  //         fontSize: "14px",
  //         textAlign: "center",
  //       }}
  //     >
  //       <img src={Assets.Icons.shittonsmoney} width={45} alt="Wheel" />
  //       <p>Wheel</p>
  //     </div>

  //     {/* Overlay */}
  //     <AnimatePresence>
  //       {isActive && (
  //         <motion.div
  //           style={{
  //             position: "fixed",
  //             top: 0,
  //             left: 0,
  //             width: "100vw",
  //             height: "100vh",
  //             background: "rgba(0, 0, 0, 0.45)",
  //             zIndex: 9999,
  //             display: "flex",
  //             justifyContent: "center",
  //             alignItems: "center",
  //             flexDirection: "column",
  //             opacity: 1,
  //           }}
  //           initial={{ opacity: 0 }}
  //           animate={{ opacity: 1 }}
  //           exit={{ opacity: 0 }}
  //           transition={{ duration: 0.3 }}
  //         >
  //           {/* Roulette container */}
  //           <div
  //             ref={rouletteRef}
  //             style={{
  //               width: "90%",
  //               maxWidth: "800px",
  //               height: "220px",
  //               overflow: "hidden",
  //               background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
  //               borderRadius: "12px",
  //               position: "relative",
  //               boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
  //               border: "1px solid rgba(255, 255, 255, 0.1)",
  //             }}
  //           >
  //             <motion.div
  //               key={spinning ? "spinning" : "idle"} // Force re-render on spin state change
  //               style={{ display: "flex", position: "absolute", height: "100%" }}
  //               variants={rouletteVariants}
  //               initial="idle" // Start from lastSpinPosition
  //               animate={spinning ? "spinning" : "idle"}
  //             >
  //               {rouletteItems.map((item) => (
  //                 <div
  //                   key={item.uniqueId}
  //                   style={{
  //                     width: "160px",
  //                     height: "220px",
  //                     flexShrink: 0,
  //                     display: "flex",
  //                     flexDirection: "column",
  //                     justifyContent: "center",
  //                     alignItems: "center",
  //                     background: "rgba(40, 40, 40, 0.9)",
  //                     margin: "0 6px",
  //                     borderRadius: "8px",
  //                     boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
  //                     border: "1px solid rgba(255, 255, 255, 0.05)",
  //                   }}
  //                 >
  //                   <img
  //                     src={item.image}
  //                     alt={item.name}
  //                     style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
  //                   />
  //                   <p style={{ color: "white", marginTop: "10px", fontSize: "14px" }}>{item.name}</p>
  //                 </div>
  //               ))}
  //             </motion.div>
  //             {/* Center marker (line) */}
  //             <div
  //               style={{
  //                 position: "absolute",
  //                 left: "50%",
  //                 top: "10px",
  //                 bottom: "10px",
  //                 width: "4px",
  //                 background: "linear-gradient(to bottom, transparent, #ff4444, transparent)",
  //                 transform: "translateX(-50%)",
  //                 borderRadius: "2px",
  //               }}
  //             />
  //           </div>

  //           {/* Controls with original styles */}
  //           <div
  //             style={{
  //               marginTop: "30px",
  //               color: "white",
  //               textAlign: "center",
  //               fontFamily: "Arial, sans-serif",
  //             }}
  //           >
  //             <p style={{ fontSize: "18px", marginBottom: "15px" }}>Attempts: {attempts}</p>
  //             <div style={{ display: "flex", gap: "15px", width: '100vw', alignItems: 'center', justifyContent: 'center' }}>
  //               <Button
  //                 icon={Assets.Icons.starsIcon}
  //                 text={'Buy Attempt'}
  //                 onClick={handleBuyAttempts}
  //                 active={spinning}
  //                 width={'25%'}
  //                 height={45}
  //                 onMouseEnter={(e) => !spinning && (e.target.style.transform = "scale(1.05)")}
  //                 onMouseLeave={(e) => !spinning && (e.target.style.transform = "scale(1)")}
  //               >
                  
  //               </Button>
  //               <button
  //                 onClick={handleSpin}
  //                 disabled={attempts <= 0 || spinning}
  //                 style={{
  //                   padding: "12px 24px",
  //                   fontSize: "16px",
  //                   cursor: attempts <= 0 || spinning ? "not-allowed" : "pointer",
  //                   background: attempts <= 0 || spinning
  //                     ? "#666"
  //                     : "linear-gradient(45deg, #ff4444, #ff6666)",
  //                   color: "white",
  //                   border: "none",
  //                   borderRadius: "8px",
  //                   boxShadow: "0 4px 15px rgba(255, 68, 68, 0.3)",
  //                   fontWeight: "bold",
  //                   transition: "transform 0.2s",
  //                 }}
  //                 onMouseEnter={(e) => attempts > 0 && !spinning && (e.target.style.transform = "scale(1.05)")}
  //                 onMouseLeave={(e) => attempts > 0 && !spinning && (e.target.style.transform = "scale(1)")}
  //               >
  //                 {spinning ? "Spinning..." : "Spin"}
  //               </button>
  //               <button
  //                 onClick={() => setIsActive(false)}
  //                 style={{
  //                   padding: "12px 24px",
  //                   fontSize: "16px",
  //                   cursor: "pointer",
  //                   background: "linear-gradient(45deg, #555, #777)",
  //                   color: "white",
  //                   border: "none",
  //                   borderRadius: "8px",
  //                   boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
  //                   fontWeight: "bold",
  //                   transition: "transform 0.2s",
  //                 }}
  //                 onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
  //                 onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
  //               >
  //                 Close
  //               </button>
  //             </div>
  //           </div>

  //           {/* Result modal with original styles */}
  //           {result && (
  //             <motion.div
  //               initial={{ opacity: 0, scale: 0.5 }}
  //               animate={{ opacity: 1, scale: 1 }}
  //               transition={{ duration: 0.5 }}
  //               style={{
  //                 position: "fixed",
  //                 top: "50%",
  //                 left: "50%",
  //                 transform: "translate(-50%, -50%)",
  //                 background: "linear-gradient(135deg, #ffffff, #e0e0e0)",
  //                 padding: "30px",
  //                 borderRadius: "15px",
  //                 textAlign: "center",
  //                 boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
  //                 border: "1px solid rgba(255, 255, 255, 0.2)",
  //                 zIndex: 10000,
  //                 width: "300px",
  //               }}
  //             >
  //               <h2 style={{ fontFamily: "Arial, sans-serif", color: "#333", marginBottom: "20px" }}>You Won!</h2>
  //               <img
  //                 src={result.image}
  //                 alt={result.name}
  //                 style={{ width: "120px", height: "120px", borderRadius: "10px" }}
  //               />
  //               <p style={{ fontFamily: "Arial, sans-serif", color: "#555", fontSize: "18px", margin: "15px 0" }}>{result.name}</p>
  //               <Button
  //                 onClick={() => setResult(null)}
  //               >
  //                 OK
  //               </Button>
  //             </motion.div>
  //           )}
  //         </motion.div>
  //       )}
  //     </AnimatePresence>
  //   </>
  // );

  return null
};

export default GachaOverlay;