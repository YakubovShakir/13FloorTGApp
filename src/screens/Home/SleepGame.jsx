import React, { useRef, useEffect, useCallback, memo } from "react";
import Assets from "../../assets/index";
import { instance } from "../../services/instance";
import { useUser } from "../../UserContext";

const SleepGame = ({ sleepDuration, onDurationUpdate, onComplete }) => {
  const canvasRef = useRef(null);
  const { userId } = useUser();
  const coinsRef = useRef([]);
  const playerRef = useRef({ x: 50, y: 180, velocityY: 0, jumping: false });
  const lastFrameTimeRef = useRef(performance.now());
  const remainingSecondsRef = useRef(sleepDuration);
  const playerJumpsRef = useRef([]);
  const pendingCollectionsRef = useRef([]);
  const coinImgRef = useRef(null);
  const playerImgRef = useRef(null);
  const serverTimeOffsetRef = useRef(0);

  const onDurationUpdateCallback = useCallback((remainingSeconds) => {
    remainingSecondsRef.current = remainingSeconds;
    onDurationUpdate(remainingSeconds);
  }, [onDurationUpdate]);

  const syncCoinsFromServer = useCallback((serverCoins) => {
    const existingCoins = coinsRef.current;
    coinsRef.current = serverCoins.map((serverCoin) => {
      const existingCoin = existingCoins.find((c) => c.id === serverCoin.id);
      return {
        ...serverCoin,
        localX: serverCoin.collected ? (serverCoin.x ?? 374) : (existingCoin?.localX ?? (serverCoin.x ?? 374)),
      };
    });
    console.log("Synced coins from server:", JSON.stringify(coinsRef.current.map(c => ({ id: c.id, localX: c.localX, y: c.y, collected: c.collected }))));
  }, []);

  useEffect(() => {
    coinImgRef.current = new Image();
    coinImgRef.current.src = Assets.Icons.energyUp;
    coinImgRef.current.onload = () => console.log("Coin image loaded:", Assets.Icons.energyUp);
    coinImgRef.current.onerror = () => console.error("Failed to load coin image:", Assets.Icons.energyUp);

    playerImgRef.current = new Image();
    playerImgRef.current.src = Assets.Icons.balance;
    playerImgRef.current.onload = () => console.log("Player image loaded:", Assets.Icons.balance);
    playerImgRef.current.onerror = () => console.error("Failed to load player image:", Assets.Icons.balance);
  }, []);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await instance.get(`/users/sleep/state/${userId}`);
        console.log("Server response:", JSON.stringify(response.data));
        if (response.data.success) {
          const serverTime = response.data.serverTime
            ? new Date(response.data.serverTime).getTime()
            : Date.now();
          if (isNaN(serverTime)) {
            console.error("Invalid server time, using client time as fallback");
            serverTime = Date.now();
          }
          const clientTime = Date.now();
          serverTimeOffsetRef.current = serverTime - clientTime;

          syncCoinsFromServer(response.data.coins);
          if (Math.abs(remainingSecondsRef.current - response.data.remainingSeconds) > 1) {
            onDurationUpdateCallback(response.data.remainingSeconds);
            remainingSecondsRef.current = response.data.remainingSeconds;
          }
          if (response.data.remainingSeconds <= 0) onComplete();
        }
      } catch (err) {
        console.error("Failed to fetch sleep game state:", err);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 10000); // Increased to 10 seconds
    return () => clearInterval(interval);
  }, [userId, onComplete, syncCoinsFromServer, onDurationUpdateCallback]);

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
    const canvas = canvasRef.current;
    const unscaledClientCoinX = coin.localX * (374 / canvas.width);
    console.log("Collecting coin:", { coinId: coin.id, playerX, playerY, clientCoinX: unscaledClientCoinX, coinLocalX: coin.localX });
    const newCollection = { coinId: coin.id, collectionToken: coin.collectionToken, playerX, playerY, jumpTime, clientCoinX: unscaledClientCoinX };
    if (!pendingCollectionsRef.current.some((c) => c.coinId === coin.id)) {
      pendingCollectionsRef.current.push(newCollection);
    }
  }, []);

  useEffect(() => {
    const processCollections = async () => {
      if (pendingCollectionsRef.current.length === 0) return;
      const collection = pendingCollectionsRef.current[0];
      try {
        const response = await instance.post(`/users/sleep/collect-coin/${userId}`, collection);
        if (response.data.success) {
          coinsRef.current = coinsRef.current.map((c) =>
            c.id === collection.coinId ? { ...c, collected: true } : c
          );
          onDurationUpdateCallback(response.data.remainingSeconds);
          if (response.data.remainingSeconds <= 0) onComplete();
        }
      } catch (err) {
        console.error("Coin collection failed:", err);
      } finally {
        pendingCollectionsRef.current.shift();
      }
    };
    processCollections();
  }, [userId, onComplete, onDurationUpdateCallback]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const player = playerRef.current;
    const gravity = 0.5;
    const COIN_SPEED = -50;
    let animationFrameId;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log("Canvas dimensions:", { width: canvas.width, height: canvas.height });

    const update = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = currentTime;

      player.velocityY += gravity * deltaTime * 60;
      player.y += player.velocityY * deltaTime * 60;
      if (player.y > canvas.height - 40) {
        player.y = canvas.height - 40;
        player.velocityY = 0;
        player.jumping = false;
      }

      const syncedTime = Date.now() + serverTimeOffsetRef.current;
      coinsRef.current.forEach((coin) => {
        if (!coin.collected) {
          const spawnTime = new Date(coin.spawnTime).getTime();
          const coinAge = (syncedTime - spawnTime) / 1000;
          const scaledX = (coin.x ?? 374) * (canvas.width / 374);
          coin.localX = isNaN(coinAge) ? scaledX : scaledX + COIN_SPEED * Math.max(0, coinAge);
        }
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#333";
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

      if (playerImgRef.current && playerImgRef.current.complete) {
        ctx.drawImage(playerImgRef.current, player.x, player.y, 40, 40);
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
        if (!coin.collected && coin.localX !== null && coin.localX > -20 && coin.localX < canvas.width) {
          if (coinImgRef.current && coinImgRef.current.complete) {
            ctx.drawImage(coinImgRef.current, coin.localX, coin.y, 20, 20);
          } else {
            ctx.fillStyle = "yellow";
            ctx.fillRect(coin.localX, coin.y, 20, 20);
          }

          console.log("Collision check:", {
            coinId: coin.id,
            playerX: player.x,
            playerY: player.y,
            coinLocalX: coin.localX,
            coinY: coin.y,
            xOverlap: player.x < coin.localX + 20 && player.x + 40 > coin.localX,
            yOverlap: player.y < coin.y + 20 && player.y + 40 > coin.y,
          });
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
        top: "26.5%",
        left: "5%",
        width: "90%",
        height: "200px",
        zIndex: 999999,
      }}
    />
  );
};

export default memo(SleepGame);