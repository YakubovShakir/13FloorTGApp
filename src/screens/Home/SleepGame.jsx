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
  const accumulatedTimeRef = useRef(0);
  const remainingSecondsRef = useRef(sleepDuration);
  const playerJumpsRef = useRef([]);
  const pendingTimeUpdatesRef = useRef([]);
  const coinImgRef = useRef(null);
  const playerImgRef = useRef(null);
  const serverTimeOffsetRef = useRef(0);
  const lastSyncTimeRef = useRef(0);
  const workerRef = useRef(null);

  const FIXED_TIME_STEP = 1 / 60;
  const COIN_SPEED = -50; // Must match server

  const onDurationUpdateCallback = useCallback((remainingSeconds) => {
    remainingSecondsRef.current = remainingSeconds;
    onDurationUpdate(remainingSeconds);
  }, [onDurationUpdate]);

  const syncCoinsFromServer = useCallback((serverCoins) => {
    if (!Array.isArray(serverCoins)) {
      console.warn("Invalid serverCoins data:", serverCoins);
      coinsRef.current = [{ id: 1, x: 374, y: 100, spawnTime: new Date().toISOString(), collected: false, localX: 374 }];
    } else {
      const syncedTime = Date.now() + serverTimeOffsetRef.current;
      coinsRef.current = serverCoins.map((serverCoin) => {
        const spawnTime = new Date(serverCoin.spawnTime).getTime();
        const coinAge = (syncedTime - spawnTime) / 1000;
        const scaledX = (serverCoin.x ?? 374) * (canvasRef.current?.width / 374 || 1);
        const localX = serverCoin.collected ? scaledX : scaledX + COIN_SPEED * Math.max(0, coinAge);
        return { ...serverCoin, localX: isNaN(localX) ? scaledX : localX };
      });
    }
    console.log("Synced coins:", coinsRef.current.map(c => ({ id: c.id, localX: c.localX, y: c.y, collected: c.collected })));
  }, []);

  useEffect(() => {
    coinImgRef.current = new Image();
    coinImgRef.current.src = Assets.Icons.energyUp;
    coinImgRef.current.onload = () => console.log("Coin image loaded");
    coinImgRef.current.onerror = () => console.error("Failed to load coin image");

    playerImgRef.current = new Image();
    playerImgRef.current.src = Assets.Icons.balance;
    playerImgRef.current.onload = () => console.log("Player image loaded");
    playerImgRef.current.onerror = () => console.error("Failed to load player image");
  }, []);

  useEffect(() => {
    let syncInterval;
    const setupWorker = () => {
      if (typeof Worker !== "undefined") {
        try {
          const worker = new Worker("/sleepGameWorker.mjs");
          workerRef.current = worker;
          worker.onmessage = (event) => {
            const { type, data, message } = event.data;
            if (type === "log") console.log(`Worker log: ${message}`);
            else if (type === "sync") {
              console.log("Worker sync data:", data);
              syncCoinsFromServer(data.coins);
              pendingTimeUpdatesRef.current.push(data.remainingSeconds);
              serverTimeOffsetRef.current = new Date(data.serverTime).getTime() - Date.now();
              if (data.remainingSeconds <= 0) onComplete();
            }
          };
          worker.onerror = (error) => {
            console.error("Worker error:", error.message);
            setupFallback();
          };
          worker.postMessage({ type: "init", userId });
          worker.postMessage({ type: "syncRequest", userId });
          syncInterval = setInterval(() => worker.postMessage({ type: "syncRequest", userId }), 10000);
        } catch (e) {
          console.error("Worker init error:", e.message);
          setupFallback();
        }
      } else {
        console.warn("Web Workers not supported");
        setupFallback();
      }
    };

    const setupFallback = () => {
      syncInterval = setInterval(async () => {
        try {
          const response = await instance.get(`/users/sleep/state/${userId}`);
          if (response.data.success) {
            syncCoinsFromServer(response.data.coins);
            pendingTimeUpdatesRef.current.push(response.data.remainingSeconds);
            serverTimeOffsetRef.current = new Date(response.data.serverTime).getTime() - Date.now();
            if (response.data.remainingSeconds <= 0) onComplete();
          }
        } catch (err) {
          console.error("Fallback fetch failed:", err);
        }
      }, 10000);
    };

    setupWorker();
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [userId, onComplete, syncCoinsFromServer]);

  const handleJump = useCallback(async () => {
    const player = playerRef.current;
    if (!player.jumping) {
      player.velocityY = -12;
      player.jumping = true;
      const jumpTime = new Date().toISOString();
      try {
        await instance.post(`/users/sleep/jump/${userId}`, { y: player.y, time: jumpTime });
        playerJumpsRef.current.push({ time: jumpTime, y: player.y });
      } catch (err) {
        console.error("Jump record failed:", err);
      }
    }
  }, [userId]);

  const collectCoinLocally = useCallback((coinId) => {
    coinsRef.current = coinsRef.current.map((coin) =>
      coin.id === coinId ? { ...coin, collected: true } : coin
    );
    console.log(`Coin ${coinId} collected locally`);
  }, []);

  const sendCollectionRequest = useCallback((collection) => {
    const syncedTime = Date.now() + serverTimeOffsetRef.current;
    const spawnTime = new Date(collection.spawnTime).getTime();
    const coinAge = (syncedTime - spawnTime) / 1000;
    const clientCoinX = collection.x + COIN_SPEED * coinAge;
    const updatedCollection = {
      ...collection,
      clientCoinX,
      collectionTime: new Date(syncedTime).toISOString(), // Send exact time
    };
    console.log("Sending collection:", updatedCollection);
    instance.post(`/users/sleep/collect-coin/${userId}`, updatedCollection)
      .then(response => {
        if (response.data.success) {
          console.log(`Coin ${collection.coinId} collected`);
          const latestRemainingSeconds = pendingTimeUpdatesRef.current[pendingTimeUpdatesRef.current.length - 1];
          if (latestRemainingSeconds !== undefined) {
            onDurationUpdateCallback(latestRemainingSeconds);
            pendingTimeUpdatesRef.current = [];
          }
        }
      })
      .catch(err => console.error("Collection failed:", err));
  }, [userId, onDurationUpdateCallback]);

  const triggerServerSync = useCallback(() => {
    if (workerRef.current) workerRef.current.postMessage({ type: "syncRequest", userId });
  }, [userId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const player = playerRef.current;
    const gravity = 0.5;
    let animationFrameId;

    canvas.width = 374;
    canvas.height = 200;
    canvas.style.width = "90%";
    canvas.style.height = "auto";
    console.log("Canvas dimensions:", { width: canvas.width, height: canvas.height });

    const update = (currentTime) => {
      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = currentTime;
      accumulatedTimeRef.current += deltaTime;

      while (accumulatedTimeRef.current >= FIXED_TIME_STEP) {
        player.velocityY += gravity * FIXED_TIME_STEP * 60;
        player.y += player.velocityY * FIXED_TIME_STEP * 60;
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
            coin.localX = scaledX + COIN_SPEED * Math.max(0, coinAge);
          }
        });

        accumulatedTimeRef.current -= FIXED_TIME_STEP;
      }

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

      coinsRef.current.forEach((coin) => {
        if (!coin.collected && coin.localX >= -20 && coin.localX <= canvas.width) {
          if (coinImgRef.current && coinImgRef.current.complete) {
            ctx.drawImage(coinImgRef.current, coin.localX, coin.y, 20, 20);
          } else {
            ctx.fillStyle = "yellow";
            ctx.fillRect(coin.localX, coin.y, 20, 20);
          }

          const playerLeft = player.x;
          const playerRight = player.x + 40;
          const playerTop = player.y;
          const playerBottom = player.y + 40;
          const coinLeft = coin.localX;
          const coinRight = coin.localX + 20;
          const coinTop = coin.y;
          const coinBottom = coin.y + 20;

          const xOverlap = playerRight > coinLeft && playerLeft < coinRight;
          const yOverlap = playerBottom > coinTop && playerTop < coinBottom;

          if (xOverlap && yOverlap) {
            console.log(`Collision detected: coin ${coin.id}`);
            collectCoinLocally(coin.id);
            const lastJumpTime = playerJumpsRef.current[playerJumpsRef.current.length - 1]?.time || null;
            const collection = {
              coinId: coin.id,
              collectionToken: coin.collectionToken,
              playerX: player.x,
              playerY: player.y,
              jumpTime: lastJumpTime,
              x: coin.x,
              spawnTime: coin.spawnTime,
            };
            sendCollectionRequest(collection);
            triggerServerSync();
          }
        }
      });

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    canvas.addEventListener("click", handleJump);
    window.addEventListener("keydown", (e) => { if (e.code === "Space") handleJump(); });

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("click", handleJump);
      window.removeEventListener("keydown", handleJump);
    };
  }, [handleJump, collectCoinLocally, sendCollectionRequest, triggerServerSync]);

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
        height: "auto",
        zIndex: 999999,
      }}
    />
  );
};

export default memo(SleepGame);