import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

console.log("EmojiReactionHook.js loaded");

const EmojiReactionContext = createContext();

const EmojiReactionOverlay = ({ emojis, isActive, onComplete }) => {
  const [reactions, setReactions] = useState([]);
  const spawnCountRef = useRef(0);

  console.log("EmojiReactionOverlay rendered", { emojis, isActive, reactions });

  const spawnReactions = (count) => {
    if (!emojis || emojis.length === 0 || spawnCountRef.current >= 50) {
      console.log("Spawn limit reached or no emojis:", { count, emojis });
      return [];
    }
    const newReactions = Array.from({ length: Math.min(count, 50 - spawnCountRef.current) }, () => {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const randomX = Math.random() * (window.innerWidth - 50); // Full width
      const randomY = Math.random() * (window.innerHeight - 50); // Full height
      const size = 25 + Math.random() * 25; // 25-50px
      spawnCountRef.current += 1;
      return { 
        id: Date.now() + Math.random(), 
        image: randomEmoji, 
        x: randomX, 
        y: randomY, 
        size 
      };
    });
    console.log("Spawning reactions:", newReactions);
    return newReactions;
  };

  useEffect(() => {
    console.log("useEffect triggered", { isActive, emojis });
    if (!isActive || !emojis || emojis.length === 0) return;

    spawnCountRef.current = 0;
    const initialReactions = spawnReactions(20);
    console.log("Initial reactions set:", initialReactions);
    setReactions(initialReactions);

    const interval = setInterval(() => {
      setReactions(prev => {
        const filtered = prev.filter(r => r.id > Date.now() - 1500);
        const newReactions = spawnReactions(5);
        const updated = [...filtered, ...newReactions];
        console.log("Updated reactions:", updated);
        return updated;
      });
    }, 200);

    const timeout = setTimeout(() => {
      console.log("Timeout triggered, stopping animation");
      clearInterval(interval);
      setReactions([]);
      onComplete();
    }, 2000);

    return () => {
      console.log("Cleaning up effect");
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, emojis, onComplete]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const emojiVariants = {
    initial: { opacity: 0, scale: 0.5 }, // Start small and invisible
    animate: {
      opacity: [0, 1, 0], // Fade in then out
      scale: 1, // Grow to full size
      y: -50, // Slight upward drift
      transition: { duration: 1.5, ease: "easeOut" },
    },
    exit: { opacity: 0 },
  };

  return (
    <div>
      {isActive && (
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 9999,
          }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <AnimatePresence>
            {reactions.map((reaction) => (
              <motion.img
                key={reaction.id}
                src={reaction.image}
                variants={emojiVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                  position: "absolute",
                  left: `${reaction.x}px`,
                  top: `${reaction.y}px`,
                  width: `${reaction.size}px`,
                  height: `${reaction.size}px`,
                }}
                onLoad={() => console.log("Image loaded:", reaction.image)}
                onError={() => console.error("Image failed:", reaction.image)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

const EmojiReactionProvider = ({ children }) => {
  console.log("EmojiReactionProvider rendered");
  const [isActive, setIsActive] = useState(false);
  const [currentEmojis, setCurrentEmojis] = useState([]);

  const triggerEmojiReaction = (emojis) => {
    console.log("triggerEmojiReaction called with:", emojis);
    if (!emojis || emojis.length === 0) {
      console.log("No emojis provided, skipping");
      return;
    }
    setCurrentEmojis(emojis);
    setIsActive(true);
  };

  const handleComplete = () => {
    console.log("handleComplete called");
    setIsActive(false);
    setCurrentEmojis([]);
  };

  return (
    <EmojiReactionContext.Provider value={{ triggerEmojiReaction }}>
      {children}
      <EmojiReactionOverlay
        emojis={currentEmojis}
        isActive={isActive}
        onComplete={handleComplete}
      />
    </EmojiReactionContext.Provider>
  );
};

const useEmojiReaction = () => {
  console.log("useEmojiReaction hook called");
  const context = useContext(EmojiReactionContext);
  if (!context) {
    console.error("useEmojiReaction must be used within an EmojiReactionProvider");
    throw new Error("useEmojiReaction must be used within an EmojiReactionProvider");
  }
  return context.triggerEmojiReaction;
};

export { EmojiReactionProvider, useEmojiReaction };