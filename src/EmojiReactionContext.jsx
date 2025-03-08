import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

console.log("EmojiReactionHook.js loaded");

const EmojiReactionContext = createContext();

const EmojiReactionOverlay = ({ emojis, isActive, onComplete }) => {
  console.log("EmojiReactionOverlay rendered", { emojis, isActive });
  const [reactions, setReactions] = useState([]);

  const spawnReactions = (count) => {
    if (!emojis || emojis.length === 0) {
      console.log("No emojis provided to spawnReactions");
      return [];
    }
    return Array.from({ length: count }, () => {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const randomX = Math.random() * (window.innerWidth - 35); // Adjust for 35px width
      const id = Date.now() + Math.random();
      console.log("Spawning reaction:", { id, image: randomEmoji, x: randomX });
      return { id, image: randomEmoji, x: randomX };
    });
  };

  useEffect(() => {
    console.log("useEffect triggered", { isActive, emojis });
    if (!isActive || !emojis || emojis.length === 0) return;

    const initialReactions = spawnReactions(30); // More icons for rush
    console.log("Setting initial reactions:", initialReactions);
    setReactions(initialReactions);

    const interval = setInterval(() => {
      console.log("Interval tick");
      setReactions((prev) => {
        const filtered = prev.filter((r) => r.id > Date.now() - 2000);
        const newReactions = spawnReactions(10); // Even more for density
        const updated = [...filtered, ...newReactions];
        console.log("Updated reactions:", updated);
        return updated;
      });
    }, 150); // Faster interval for rapid effect

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
    visible: { opacity: 1, transition: { duration: 0.75 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const emojiVariants = {
    initial: { y: 0, opacity: 1 },
    animate: {
      y: window.innerHeight, // Full screen height for clear fall
      opacity: 0,
      transition: {
        duration: 1.5, // Rapid fall
        ease: "linear",
      },
    },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
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
            background: "rgba(255, 0, 0, 0.1)",
          }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
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
                  left: reaction.x,
                  width: "35px", // Smaller size
                  height: "35px",
                }}
                onError={(e) => console.log("Image failed to load:", reaction.image)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
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