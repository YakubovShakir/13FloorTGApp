import React, { useRef, useEffect, useCallback, memo } from "react";
import Assets from "../../assets/index";
import { instance } from "../../services/instance";
import { useUser } from "../../UserContext";

const SleepGame = ({ sleepDuration: initialSleepDuration, onDurationUpdate, onComplete }) => {
  const canvasRef = useRef(null);
  const { userId } = useUser();
  const coinsRef = useRef([]);
  const playerRef = useRef({ x: 50, y: 180, velocityY: 0, jumping: false });
  const lastFrameTimeRef = useRef(performance.now());
  const accumulatedTimeRef = useRef(0);
  const remainingSecondsRef = useRef(initialSleepDuration);
  const playerJumpsRef = useRef([]);
  const coinImgRef = useRef(null);
  const playerImgRef = useRef(null);
  const serverTimeOffsetRef = useRef(0);
  const workerRef = useRef(null);
  const pendingCollectionsRef = useRef([]);
  const lastTimerUpdateRef = useRef(performance.now());
  const syncPendingRef = useRef(false);
  const lastSyncTimeRef = useRef(0); // Track last sync timestamp

  const FIXED_TIME_STEP = 1 / 60;
  const COIN_SPEED = -50;

  const syncCoinsFromServer = useCallback((serverCoins, serverTime) => {
    if (!Array.isArray(serverCoins)) {
      coinsRef.current = [{ id: 1, x: 374, y: 100, spawnTime: new Date().toISOString(), collected: false, localX: 374 }];
    } else {
      const syncedTime = serverTime; // Use server-provided time directly
      coinsRef.current = serverCoins.map((serverCoin) => {
        const spawnTime = new Date(serverCoin.spawnTime).getTime();
        const coinAge = (syncedTime - spawnTime) / 1000;
        const localX = (serverCoin.x ?? 374) + COIN_SPEED * Math.max(0, coinAge);
        return { ...serverCoin, localX: isNaN(localX) ? serverCoin.x : localX };
      });
    }
  }, []);

  useEffect(() => {
    coinImgRef.current = new Image();
    coinImgRef.current.src = Assets.Icons.energyUp;
    playerImgRef.current = new Image();
    playerImgRef.current.src = Assets.Icons.balance;

    const checkImages = () => {
      if (coinImgRef.current.complete && playerImgRef.current.complete) {
        console.log("Images preloaded");
      } else {
        setTimeout(checkImages, 100);
      }
    };
    checkImages();
  }, []);

  useEffect(() => {
    const setupWorker = () => {
      if (typeof Worker !== "undefined") {
        const worker = new Worker("/sleepGameWorker.js");
        workerRef.current = worker;
        worker.onmessage = (event) => {
          const { type, data } = event.data;
          if (type === "sync") {
            syncCoinsFromServer(data.coins, new Date(data.serverTime).getTime());
            remainingSecondsRef.current = data.remainingSeconds; // Ensure update
            onDurationUpdate(data.remainingSeconds); // Force update
            lastSyncTimeRef.current = Date.now();
            if (data.remainingSeconds <= 0) onComplete();
            syncPendingRef.current = false;
          } else if (type === "collection") {
            if (data.success) {
              remainingSecondsRef.current = data.remainingSeconds;
              onDurationUpdate(data.remainingSeconds); // Explicitly update on collection
            }
            syncPendingRef.current = false;
          }
        };
        worker.onerror = (error) => {
          console.error("Worker error:", error.message);
          setupFallback();
        };
        worker.postMessage({ type: "init", userId });
        worker.postMessage({ type: "syncRequest", userId }); // Initial sync
      } else {
        setupFallback();
      }
    };

    const setupFallback = () => {
      const fetchSync = () => {
        if (syncPendingRef.current) return;
        syncPendingRef.current = true;
        setTimeout(async () => {
          try {
            const response = await instance.get(`/users/sleep/state/${userId}`);
            if (response.data.success) {
              syncCoinsFromServer(response.data.coins, new Date(response.data.serverTime).getTime());
              remainingSecondsRef.current = response.data.remainingSeconds;
              onDurationUpdate(response.data.remainingSeconds);
              lastSyncTimeRef.current = Date.now();
              if (response.data.remainingSeconds <= 0) onComplete();
            }
          } catch (err) {
            console.error("Fallback fetch failed:", err);
          } finally {
            syncPendingRef.current = false;
          }
        }, 0);
      };
      fetchSync(); // Initial sync
    };

    setupWorker();
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, [userId, onComplete, onDurationUpdate, syncCoinsFromServer]);

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
  }, []);

  const queueCollection = useCallback((collection) => {
    const syncedTime = Date.now() + serverTimeOffsetRef.current;
    const spawnTime = new Date(collection.spawnTime).getTime();
    const coinAge = (syncedTime - spawnTime) / 1000;
    const clientCoinX = collection.x + COIN_SPEED * coinAge;
    const updatedCollection = {
      ...collection,
      clientCoinX,
      collectionTime: new Date(syncedTime).toISOString(),
    };
    pendingCollectionsRef.current.push(updatedCollection);
  }, []);

  const processPendingCollections = useCallback(() => {
    if (pendingCollectionsRef.current.length > 0 && !syncPendingRef.current) {
      syncPendingRef.current = true;
      const collections = [...pendingCollectionsRef.current];
      pendingCollectionsRef.current = [];
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "collectCoins", userId, collections });
      } else {
        setTimeout(() => {
          collections.forEach((collection) => {
            instance.post(`/users/sleep/collect-coin/${userId}`, collection)
              .then(response => {
                if (response.data.success) {
                  remainingSecondsRef.current = response.data.remainingSeconds;
                  onDurationUpdate(response.data.remainingSeconds);
                }
              })
              .catch(err => console.error("Collection failed:", err));
          });
          triggerServerSync();
        }, 0);
      }
      // Fallback timeout to ensure update if worker lags
      setTimeout(() => {
        if (syncPendingRef.current) triggerServerSync();
      }, 500);
    }
  }, [userId, onDurationUpdate]);

  const triggerServerSync = useCallback(() => {
    if (syncPendingRef.current || (Date.now() - lastSyncTimeRef.current < 1000)) return; // Debounce 1s
    syncPendingRef.current = true;
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "syncRequest", userId });
    } else {
      setTimeout(() => {
        instance.get(`/users/sleep/state/${userId}`).then(response => {
          if (response.data.success) {
            syncCoinsFromServer(response.data.coins, new Date(response.data.serverTime).getTime());
            remainingSecondsRef.current = response.data.remainingSeconds;
            onDurationUpdate(response.data.remainingSeconds);
            lastSyncTimeRef.current = Date.now();
            if (response.data.remainingSeconds <= 0) onComplete();
          }
        }).catch(err => console.error("Fallback sync failed:", err))
          .finally(() => { syncPendingRef.current = false; });
      }, 0);
    }
  }, [userId, onComplete, onDurationUpdate, syncCoinsFromServer]);

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

    const update = (currentTime) => {
      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = currentTime;
      accumulatedTimeRef.current += deltaTime;

      const elapsedSinceLastUpdate = currentTime - lastTimerUpdateRef.current;
      if (elapsedSinceLastUpdate >= 1000) {
        const secondsToDecrement = Math.floor(elapsedSinceLastUpdate / 1000);
        remainingSecondsRef.current = Math.max(0, remainingSecondsRef.current - secondsToDecrement);
        onDurationUpdate(remainingSecondsRef.current);
        if (remainingSecondsRef.current <= 0) onComplete();
        lastTimerUpdateRef.current += secondsToDecrement * 1000;
      }

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
            coin.localX = (coin.x ?? 374) + COIN_SPEED * Math.max(0, coinAge);
          }
        });

        accumulatedTimeRef.current -= FIXED_TIME_STEP;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#333";
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

      ctx.fillStyle = playerImgRef.current?.complete ? null : "blue";
      playerImgRef.current?.complete
        ? ctx.drawImage(playerImgRef.current, player.x, player.y, 40, 40)
        : ctx.fillRect(player.x, player.y, 40, 40);

      coinsRef.current.forEach((coin) => {
        if (!coin.collected && coin.localX >= -20 && coin.localX <= canvas.width) {
          coinImgRef.current?.complete
            ? ctx.drawImage(coinImgRef.current, coin.localX, coin.y, 20, 20)
            : (ctx.fillStyle = "yellow", ctx.fillRect(coin.localX, coin.y, 20, 20));

          const xOverlap = player.x + 40 > coin.localX && player.x < coin.localX + 20;
          const yOverlap = player.y + 40 > coin.y && player.y < coin.y + 20;

          if (xOverlap && yOverlap) {
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
            queueCollection(collection);
          }
        }
      });

      processPendingCollections();

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
  }, [handleJump, collectCoinLocally, queueCollection, processPendingCollections, triggerServerSync]);

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