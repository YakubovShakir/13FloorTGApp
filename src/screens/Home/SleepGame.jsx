import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import Assets from "../../assets/index";
import { instance } from "../../services/instance";
import { useUser } from "../../UserContext";

const SleepGame = ({ sleepDuration, onComplete }) => {
  const canvasRef = useRef(null);
  const { userId } = useUser();
  const coinsRef = useRef([]);
  const playerRef = useRef({ x: 50, y: 180, velocityY: 0, jumping: false });
  const lastFrameTimeRef = useRef(performance.now());
  const remainingSecondsRef = useRef(sleepDuration);
  const playerJumpsRef = useRef([]);
  const [pendingCollections, setPendingCollections] = useState([]);
  const coinImgRef = useRef(null);

  const syncCoinsFromServer = useCallback((serverCoins) => {
    const existingCoins = coinsRef.current;
    coinsRef.current = serverCoins.map((serverCoin) => {
      const existingCoin = existingCoins.find((c) => c.id === serverCoin.id);
      return {
        ...serverCoin,
        localX: serverCoin.collected ? serverCoin.x : existingCoin?.localX ?? serverCoin.x,
      };
    });
    console.log("Synced coins from server:", JSON.stringify(coinsRef.current));
  }, []);

  useEffect(() => {
    coinImgRef.current = new Image();
    coinImgRef.current.src = Assets.Icons.energyUp;
    coinImgRef.current.onload = () => console.log("Coin image loaded:", Assets.Icons.energyUp);
    coinImgRef.current.onerror = () => console.error("Failed to load coin image:", Assets.Icons.energyUp);
  }, []);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await instance.get(`/users/sleep/state/${userId}`);
        if (response.data.success) {
          syncCoinsFromServer(response.data.coins);
          remainingSecondsRef.current = response.data.remainingSeconds;
          playerJumpsRef.current = response.data.playerJumps;
          if (response.data.remainingSeconds <= 0) onComplete();
        }
      } catch (err) {
        console.error("Failed to fetch sleep game state:", err);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 5000);
    return () => clearInterval(interval);
  }, [userId, onComplete, syncCoinsFromServer]);

  const handleJump = useCallback(async () => {
    const player = playerRef.current;
    if (!player.jumping) {
      player.velocityY = -12;
      player.jumping = true;
      try {
        const jumpTime = new Date().toISOString();
        await instance.post(`/users/sleep/jump/${userId}`, { y: player.y, time: jumpTime });
        playerJumpsRef.current.push({ time: jumpTime, y: player.y });
      } catch (err) {
        console.error("Failed to record jump:", err);
      }
    }
  }, [userId]);

  const collectCoin = useCallback((coin, playerX, playerY, jumpTime) => {
    setPendingCollections((prev) => {
      if (prev.some((c) => c.coinId === coin.id)) return prev;
      return [...prev, { coinId: coin.id, collectionToken: coin.collectionToken, playerX, playerY, jumpTime, clientCoinX: coin.localX }];
    });
  }, []);

  useEffect(() => {
    const processCollections = async () => {
      if (pendingCollections.length === 0) return;
      const collection = pendingCollections[0];
      try {
        const response = await instance.post(`/users/sleep/collect-coin/${userId}`, collection);
        if (response.data.success) {
          remainingSecondsRef.current = response.data.remainingSeconds;
          coinsRef.current = coinsRef.current.map((c) =>
            c.id === collection.coinId ? { ...c, collected: true } : c
          );
          if (response.data.remainingSeconds <= 0) onComplete();
        }
      } catch (err) {
        console.error("Coin collection failed:", err);
      } finally {
        setPendingCollections((prev) => prev.slice(1));
      }
    };
    processCollections();
  }, [pendingCollections, onComplete, userId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const player = playerRef.current;
    const gravity = 0.5;
    const COIN_SPEED = -50;
    let animationFrameId;

    // Set canvas size and log it
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log("Canvas dimensions:", { width: canvas.width, height: canvas.height });

    const playerImg = new Image();
    playerImg.src = Assets.Icons.balance;

    const update = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = currentTime;

      // Player physics
      player.velocityY += gravity * deltaTime * 60;
      player.y += player.velocityY * deltaTime * 60;
      if (player.y > canvas.height - 20) {
        player.y = canvas.height - 20;
        player.velocityY = 0;
        player.jumping = false;
      }

      // Update coin positions
      coinsRef.current.forEach((coin) => {
        if (!coin.collected) {
          const spawnTime = new Date(coin.spawnTime).getTime();
          const coinAge = (Date.now() - spawnTime) / 1000; // Use Date.now() for consistency
          const scaledX = coin.x * (canvas.width / 374); // Scale to canvas width
          coin.localX = scaledX + COIN_SPEED * Math.max(0, coinAge);
          console.log(`Coin ${coin.id}: spawnTime=${spawnTime}, Date.now()=${Date.now()}, coinAge=${coinAge}, scaledX=${scaledX}, localX=${coin.localX}`);
        }
      });

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#333";
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

      if (playerImg.complete) {
        ctx.drawImage(playerImg, player.x, player.y, 40, 40);
      } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(player.x, player.y, 40, 40);
      }

      console.log("Rendering coins:", JSON.stringify(coinsRef.current.map(c => ({
        id: c.id,
        localX: c.localX,
        y: c.y,
        collected: c.collected
      }))));
      coinsRef.current.forEach((coin) => {
        if (!coin.collected && coin.localX > -20 && coin.localX < canvas.width) {
          if (coinImgRef.current && coinImgRef.current.complete) {
            ctx.drawImage(coinImgRef.current, coin.localX, coin.y, 20, 20);
          } else {
            ctx.fillStyle = "yellow";
            ctx.fillRect(coin.localX, coin.y, 20, 20);
          }

          if (
            player.x < coin.localX + 20 &&
            player.x + 40 > coin.localX &&
            player.y < coin.y + 20 &&
            player.y + 40 > coin.y
          ) {
            const lastJumpTime = playerJumpsRef.current[playerJumpsRef.current.length - 1]?.time;
            collectCoin(coin, player.x, player.y, lastJumpTime);
          }
        }
      });

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    canvas.addEventListener("click", handleJump);
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") handleJump();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("click", handleJump);
      window.removeEventListener("keydown", handleJump);
    };
  }, [handleJump, collectCoin]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "1px solid #fff",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        position: "fixed",
        top: "25%",
        left: "5%",
        width: "90%",
        height: "200px",
        zIndex: 999999,
      }}
    />
  );
};

export default memo(SleepGame);