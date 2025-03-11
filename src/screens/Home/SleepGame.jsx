// components/complex/SleepGame/SleepGame.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { instance } from "../../services/instance";
import { useUser } from "../../UserContext";
import moment from "moment-timezone";
import Assets from "../../assets";

const SleepGame = ({ sleepDuration, onGameOver }) => {
  const { userId } = useUser();
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  const [gameState, setGameState] = useState({
    isPlaying: true,
    score: 0,
    survivalTime: 0,
    gameOver: false,
  });
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Fixed sizes (widths only)
  const CANVAS_WIDTH = 374; // Match maxWidth from DailyCheckInOverlay
  const CANVAS_HEIGHT = 200;
  const PLAYER_WIDTH = 30;
  const ENEMY_WIDTH = 20;
  const COIN_WIDTH = 20;
  const GROUND_Y = CANVAS_HEIGHT - 10;

  // Static game constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const SPEED = 4;
  const ENEMY_SPAWN_RATE = 0.1; // Increased for testing
  const COIN_SPAWN_RATE = 0.1; // Increased for testing

  const playerRef = useRef({
    x: 50,
    y: GROUND_Y - (PLAYER_WIDTH * 1.666), // Approx 50px height for 30:50 ratio
    vy: 0,
    jumping: false,
    image: null,
  });

  const enemiesRef = useRef([]);
  const coinsRef = useRef([]);
  const backgroundLayersRef = useRef([
    { x: 0, speed: 2, image: null, height: CANVAS_HEIGHT }, // Ground layer
    { x: 0, speed: 0.5, image: null, height: CANVAS_HEIGHT / 2 }, // Sky layer
  ]);

  // Load images with enhanced debugging
  useEffect(() => {
    console.log("Starting image loading process...");
    const playerImg = new Image();
    playerImg.src = Assets.Icons.energy || "https://via.placeholder.com/30x50.png?text=Player";
    const enemyImg = new Image();
    enemyImg.src = Assets.Icons.mood9 || "https://via.placeholder.com/20x40.png?text=Enemy";
    const coinImg = new Image();
    coinImg.src = Assets.Icons.balance || "https://via.placeholder.com/20x20.png?text=Coin";
    const groundImg = new Image();
    groundImg.src = "https://via.placeholder.com/374x200.png?text=Ground";
    const skyImg = new Image();
    skyImg.src =  "https://via.placeholder.com/374x100.png?text=Sky";

    const images = [playerImg, enemyImg, coinImg, groundImg, skyImg];
    const loadPromises = images.map((img, index) =>
      new Promise((resolve) => {
        img.onload = () => {
          console.log(`Image ${index} loaded successfully: ${img.src}, naturalWidth: ${img.naturalWidth}, naturalHeight: ${img.naturalHeight}`);
          resolve(img);
        };
        img.onerror = () => {
          console.error(`Image ${index} failed to load: ${img.src}`);
          resolve(img); // Resolve with failed image to proceed
        };
      })
    );

    Promise.all(loadPromises)
      .then(([loadedPlayer, loadedEnemy, loadedCoin, loadedGround, loadedSky]) => {
        playerRef.current.image = loadedPlayer;
        backgroundLayersRef.current[0].image = loadedGround;
        backgroundLayersRef.current[1].image = loadedSky;
        enemiesRef.current.forEach((enemy, i) => (enemy.image = loadedEnemy));
        coinsRef.current.forEach((coin, i) => (coin.image = loadedCoin));
        setImagesLoaded(true);
        console.log("All images loaded or processed, setting imagesLoaded to true");
      })
      .catch((err) => {
        console.error("Critical image loading error:", err);
        setImagesLoaded(true); // Force proceed even on error
      });
  }, []);

  // Handle jump
  const handleJump = useCallback(() => {
    if (!playerRef.current.jumping && !gameState.gameOver) {
      playerRef.current.vy = JUMP_FORCE;
      playerRef.current.jumping = true;
      console.log("Jump triggered, vy set to:", JUMP_FORCE);
    }
  }, [gameState.gameOver]);

  // Event listeners
  useEffect(() => {
    console.log("Setting up event listeners...");
    const handleKeyDown = (e) => {
      if (e.code === "Space") handleJump();
    };
    const handleClick = () => handleJump();
    const handleTouch = () => handleJump();

    window.addEventListener("keydown", handleKeyDown);
    if (canvasRef.current) {
      canvasRef.current.addEventListener("click", handleClick);
      canvasRef.current.addEventListener("touchstart", handleTouch, { passive: true });
      console.log("Event listeners attached to canvas");
    } else {
      console.error("Canvas ref is null when attaching listeners");
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("click", handleClick);
        canvasRef.current.removeEventListener("touchstart", handleTouch);
        console.log("Event listeners cleaned up");
      }
    };
  }, [handleJump]);

  // Sync with server (mocked)
  const syncWithServer = useCallback(async () => {
    console.log("Attempting server sync...");
    try {
      const timestamp = moment().tz("Europe/Moscow").valueOf();
      const response = await instance.post(`/users/${userId}/sleep-game/update`, {
        score: gameState.score,
        survivalTime: gameState.survivalTime,
        timestamp,
      });
      if (!response.data.success) {
        console.error("Server validation failed:", response.data.error);
        setGameState((prev) => ({ ...prev, gameOver: true }));
      } else {
        console.log("Server sync successful");
      }
    } catch (error) {
      console.error("Sync error:", error.message);
      setGameState((prev) => ({ ...prev, gameOver: true }));
    }
  }, [userId, gameState.score, gameState.survivalTime]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      const interval = setInterval(() => syncWithServer(), 5000);
      console.log("Server sync interval started");
      return () => {
        clearInterval(interval);
        console.log("Server sync interval cleared");
      };
    }
  }, [gameState.isPlaying, gameState.gameOver, syncWithServer]);

  // Game loop with enhanced debugging
  const gameLoop = useCallback(() => {
    console.log("Game loop running, state:", {
      isPlaying: gameState.isPlaying,
      gameOver: gameState.gameOver,
      imagesLoaded,
    });

    if (!gameState.isPlaying || gameState.gameOver || !imagesLoaded) {
      console.log("Game loop paused due to:", {
        isPlaying: gameState.isPlaying,
        gameOver: gameState.gameOver,
        imagesLoaded,
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas is null!");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Context is null!");
      return;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    console.log("Canvas cleared");

    // Parallax background
    backgroundLayersRef.current.forEach((layer, index) => {
      if (layer.image && layer.image.complete) {
        layer.x -= layer.speed;
        if (layer.x <= -CANVAS_WIDTH) layer.x = 0;
        ctx.drawImage(layer.image, layer.x, 0, CANVAS_WIDTH, layer.height);
        ctx.drawImage(layer.image, layer.x + CANVAS_WIDTH, 0, CANVAS_WIDTH, layer.height);
        console.log(`Drawing background layer ${index} at x: ${layer.x}`);
      } else {
        ctx.fillStyle = index === 0 ? "#8B4513" : "#87CEEB"; // Brown ground, blue sky
        ctx.fillRect(0, 0, CANVAS_WIDTH, layer.height);
        console.log(`Drawing fallback background layer ${index}`);
      }
    });

    // Update player
    playerRef.current.vy += GRAVITY;
    playerRef.current.y += playerRef.current.vy;

    const playerHeight = playerRef.current.image
      ? (PLAYER_WIDTH / playerRef.current.image.naturalWidth) * playerRef.current.image.naturalHeight
      : PLAYER_WIDTH * 1.666;
    if (playerRef.current.y > GROUND_Y - playerHeight) {
      playerRef.current.y = GROUND_Y - playerHeight;
      playerRef.current.vy = 0;
      playerRef.current.jumping = false;
    }

    if (playerRef.current.image && playerRef.current.image.complete) {
      ctx.drawImage(playerRef.current.image, playerRef.current.x, playerRef.current.y, PLAYER_WIDTH, undefined);
      console.log(`Drawing player at x: ${playerRef.current.x}, y: ${playerRef.current.y}, height: ${playerHeight}`);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(playerRef.current.x, playerRef.current.y, PLAYER_WIDTH, playerHeight);
      console.log(`Drawing fallback player at x: ${playerRef.current.x}, y: ${playerRef.current.y}, height: ${playerHeight}`);
    }

    // Update enemies
    enemiesRef.current = enemiesRef.current.filter((enemy) => enemy.x + ENEMY_WIDTH > 0);
    enemiesRef.current.forEach((enemy) => {
      enemy.x -= SPEED;

      if (enemy.image && enemy.image.complete) {
        const enemyHeight = (ENEMY_WIDTH / enemy.image.naturalWidth) * enemy.image.naturalHeight;
        ctx.drawImage(enemy.image, enemy.x, enemy.y, ENEMY_WIDTH, undefined);
        console.log(`Drawing enemy at x: ${enemy.x}, y: ${enemy.y}, height: ${enemyHeight}`);
      } else {
        const enemyHeight = ENEMY_WIDTH * 2;
        ctx.fillStyle = "green";
        ctx.fillRect(enemy.x, enemy.y, ENEMY_WIDTH, enemyHeight);
        console.log(`Drawing fallback enemy at x: ${enemy.x}, y: ${enemy.y}, height: ${enemyHeight}`);
      }

      const enemyHeight = enemy.image
        ? (ENEMY_WIDTH / enemy.image.naturalWidth) * enemy.image.naturalHeight
        : ENEMY_WIDTH * 2;
      if (
        playerRef.current.x < enemy.x + ENEMY_WIDTH &&
        playerRef.current.x + PLAYER_WIDTH > enemy.x &&
        playerRef.current.y < enemy.y + enemyHeight &&
        playerRef.current.y + playerHeight > enemy.y
      ) {
        setGameState((prev) => ({ ...prev, gameOver: true }));
      }
    });

    // Update coins
    coinsRef.current = coinsRef.current.filter((coin) => coin.x + COIN_WIDTH > 0);
    coinsRef.current.forEach((coin, index) => {
      coin.x -= SPEED;

      if (coin.image && coin.image.complete) {
        const coinHeight = (COIN_WIDTH / coin.image.naturalWidth) * coin.image.naturalHeight;
        ctx.drawImage(coin.image, coin.x, coin.y, COIN_WIDTH, undefined);
        console.log(`Drawing coin at x: ${coin.x}, y: ${coin.y}, height: ${coinHeight}`);
      } else {
        const coinHeight = COIN_WIDTH;
        ctx.fillStyle = "yellow";
        ctx.fillRect(coin.x, coin.y, COIN_WIDTH, coinHeight);
        console.log(`Drawing fallback coin at x: ${coin.x}, y: ${coin.y}, height: ${coinHeight}`);
      }

      const coinHeight = coin.image
        ? (COIN_WIDTH / coin.image.naturalWidth) * coin.image.naturalHeight
        : COIN_WIDTH;
      if (
        playerRef.current.x < coin.x + COIN_WIDTH &&
        playerRef.current.x + PLAYER_WIDTH > coin.x &&
        playerRef.current.y < coin.y + coinHeight &&
        playerRef.current.y + playerHeight > coin.y
      ) {
        setGameState((prev) => ({ ...prev, score: prev.score + 1 }));
        coinsRef.current.splice(index, 1);
      }
    });

    // Spawn enemies and coins
    if (Math.random() < ENEMY_SPAWN_RATE) {
      const enemyHeight = enemiesRef.current[0]?.image
        ? (ENEMY_WIDTH / enemiesRef.current[0].image.naturalWidth) * enemiesRef.current[0].image.naturalHeight
        : ENEMY_WIDTH * 2;
      enemiesRef.current.push({
        x: CANVAS_WIDTH,
        y: GROUND_Y - enemyHeight,
        image: enemiesRef.current[0]?.image || backgroundLayersRef.current[0].image,
      });
      console.log("Spawned enemy at y:", GROUND_Y - enemyHeight);
    }
    if (Math.random() < COIN_SPAWN_RATE) {
      const coinHeight = coinsRef.current[0]?.image
        ? (COIN_WIDTH / coinsRef.current[0].image.naturalWidth) * coinsRef.current[0].image.naturalHeight
        : COIN_WIDTH;
      coinsRef.current.push({
        x: CANVAS_WIDTH,
        y: GROUND_Y - coinHeight - 20,
        image: coinsRef.current[0]?.image || backgroundLayersRef.current[1].image,
      });
      console.log("Spawned coin at y:", GROUND_Y - coinHeight - 20);
    }

    // Update survival time
    const now = Date.now();
    const deltaTime = now - lastUpdateRef.current;
    lastUpdateRef.current = now;
    setGameState((prev) => ({
      ...prev,
      survivalTime: prev.survivalTime + deltaTime,
    }));

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "16px Oswald";
    ctx.fillText(`Score: ${gameState.score}`, 10, 20);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.gameOver, gameState.score, imagesLoaded]);

  // Start game
  useEffect(() => {
    console.log("Starting game loop...");
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        console.log("Game loop cleaned up");
      }
    };
  }, [gameLoop]);

  // Handle game over and reset
  const resetGame = useCallback(async () => {
    console.log("Resetting game...");
    try {
      setGameState({
        isPlaying: true,
        score: 0,
        survivalTime: 0,
        gameOver: false,
      });
      playerRef.current = {
        x: 50,
        y: GROUND_Y - (PLAYER_WIDTH * 1.666),
        vy: 0,
        jumping: false,
        image: playerRef.current.image,
      };
      enemiesRef.current = [];
      coinsRef.current = [];
      lastUpdateRef.current = Date.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      console.log("Game reset successfully");
    } catch (error) {
      console.error("Error resetting game:", error);
    }
  }, [GROUND_Y, gameLoop]);

  useEffect(() => {
    if (gameState.gameOver) {
      console.log("Game over detected, finalizing...");
      const finalizeGame = async () => {
        try {
          await instance.post(`/users/${userId}/sleep-game/finalize`, {
            finalScore: gameState.score,
            survivalTime: gameState.survivalTime,
          });
          const totalSleepSeconds = sleepDuration / 1000;
          const survivalSeconds = gameState.survivalTime / 1000;
          const elapsedSeconds = moment()
            .tz("Europe/Moscow")
            .diff(moment(state.currentProcess?.createdAt).tz("Europe/Moscow"), "seconds");
          const remainingSeconds = Math.max(0, totalSleepSeconds - survivalSeconds - elapsedSeconds);
          onGameOver(gameState.score, remainingSeconds > 0 ? remainingSeconds : 0);
          console.log("Game finalized, score:", gameState.score, "remainingSeconds:", remainingSeconds);
        } catch (error) {
          console.error("Error finalizing game:", error);
          onGameOver(gameState.score, 0);
        }
      };
      finalizeGame();
    }
  }, [gameState.gameOver, gameState.score, gameState.survivalTime, userId, sleepDuration, onGameOver]);

  return (
    <div style={{ position: "absolute", width: "100%", maxWidth: `${CANVAS_WIDTH}px`, margin: "0 auto" }}>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display: "block", border: "1px solid black" }} />
      {gameState.gameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "20px",
            background: "rgba(0, 0, 0, 0.7)",
            padding: "10px",
            borderRadius: "5px",
            textAlign: "center",
            zIndex: 9999999,
          }}
        >
          Game Over! Score: {gameState.score}
          <br />
          <button onClick={resetGame} style={{ marginTop: "10px", padding: "5px 10px", fontSize: "14px" }}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default SleepGame;