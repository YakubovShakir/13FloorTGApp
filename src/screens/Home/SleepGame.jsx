import React, { useRef, useEffect, useCallback, useState, memo } from "react";
import Assets from "../../assets/index";
import { instance } from "../../services/instance";
import { useUser } from "../../UserContext";

const SleepGame = ({
  sleepDuration: initialSleepDuration,
  onDurationUpdate,
  onComplete,
}) => {
  const canvasRef = useRef(null);
  const { userId } = useUser();
  const coinsRef = useRef([]);
  const collectedCoinsRef = useRef(new Set());
  const playerRef = useRef({
    x: 50,
    y: 120, // Start on top of the ground (200 - 80)
    velocityY: 0,
    jumping: false,
    frame: 0,
    frameTime: 0,
  });
  const cloudsRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const accumulatedTimeRef = useRef(0);
  const remainingSecondsRef = useRef(initialSleepDuration);
  const playerJumpsRef = useRef([]);
  const coinImgRef = useRef(null);
  const playerFramesRef = useRef([]); // Array for 3 frames (2 running + 1 jump)
  const groundImgRef = useRef(null);
  const cloudImgRef = useRef(null);
  const serverTimeOffsetRef = useRef(0);
  const workerRef = useRef(null);
  const pendingCollectionsRef = useRef([]);
  const syncPendingRef = useRef(false);
  const lastSyncTimeRef = useRef(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false); // Track asset loading

  const FIXED_TIME_STEP = 1 / 60;
  const COIN_SPEED = -50;
  const FRAME_DURATION = 0.2; // Time per frame in seconds
  const CLOUD_SPEED = -20;

  const syncCoinsFromServer = useCallback((serverCoins, serverTime) => {
    console.log("Syncing coins from server:", serverCoins);
    if (!Array.isArray(serverCoins) || serverCoins.length === 0) {
      coinsRef.current = [
        {
          id: 1,
          x: 374,
          y: 100,
          spawnTime: new Date().toISOString(),
          collected: false,
          localX: 374,
        },
      ];
      console.log("No server coins, initialized default:", coinsRef.current);
    } else {
      const syncedTime = serverTime;
      coinsRef.current = serverCoins
        .filter((serverCoin) => !collectedCoinsRef.current.has(serverCoin.id))
        .map((serverCoin) => {
          const spawnTime = new Date(serverCoin.spawnTime).getTime();
          const coinAge = (syncedTime - spawnTime) / 1000;
          const localX = (serverCoin.x ?? 374) + COIN_SPEED * Math.max(0, coinAge);
          return { ...serverCoin, localX: isNaN(localX) ? serverCoin.x : localX };
        });
      console.log("Synced coins:", coinsRef.current);
    }
  }, []);

  // Preload assets and update loading state
  useEffect(() => {
    coinImgRef.current = new Image();
    coinImgRef.current.src = Assets.Icons.energyUp;

    groundImgRef.current = new Image();
    groundImgRef.current.src = Assets.Images.sleepSheepGroundGif;

    cloudImgRef.current = new Image();
    cloudImgRef.current.src = Assets.Images.sleepSheepCloud;

    // Load 2 running frames and 1 jump frame
    playerFramesRef.current = [new Image(), new Image(), new Image()];
    playerFramesRef.current[0].src = Assets.Images.sleepSheep1;
    playerFramesRef.current[1].src = Assets.Images.sleepSheep2;
    playerFramesRef.current[2].src = Assets.Images.sleepSheepJump;

    const checkImages = () => {
      const allLoaded =
        coinImgRef.current.complete &&
        groundImgRef.current.complete &&
        cloudImgRef.current.complete &&
        playerFramesRef.current.every((img) => img.complete);
      if (allLoaded) {
        console.log("All images preloaded");
        setAssetsLoaded(true); // Set loaded state to true
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
            remainingSecondsRef.current = data.remainingSeconds;
            onDurationUpdate(data.remainingSeconds);
            lastSyncTimeRef.current = Date.now();
            if (data.remainingSeconds <= 0) onComplete();
            syncPendingRef.current = false;
          } else if (type === "collection") {
            if (data.success) {
              remainingSecondsRef.current = data.remainingSeconds;
              onDurationUpdate(data.remainingSeconds);
            }
            syncPendingRef.current = false;
          }
        };
        worker.onerror = (error) => {
          console.error("Worker error:", error.message);
          setupFallback();
        };
        worker.postMessage({ type: "init", userId });
        worker.postMessage({ type: "syncRequest", userId });
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
            console.log("Fallback sync response:", response.data);
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
      fetchSync();
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
    collectedCoinsRef.current.add(coinId);
    coinsRef.current = coinsRef.current.filter((coin) => coin.id !== coinId);
    console.log("Collected coin:", coinId, "Remaining coins:", coinsRef.current);
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
            instance
              .post(`/users/sleep/collect-coin/${userId}`, collection)
              .then((response) => {
                if (response.data.success) {
                  remainingSecondsRef.current = response.data.remainingSeconds;
                  onDurationUpdate(response.data.remainingSeconds);
                }
              })
              .catch((err) => console.error("Collection failed:", err));
          });
          triggerServerSync();
        }, 0);
      }
      setTimeout(() => {
        if (syncPendingRef.current) triggerServerSync();
      }, 500);
    }
  }, [userId, onDurationUpdate]);

  const triggerServerSync = useCallback(() => {
    if (syncPendingRef.current || Date.now() - lastSyncTimeRef.current < 1000) return;
    syncPendingRef.current = true;
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "syncRequest", userId });
    } else {
      setTimeout(() => {
        instance
          .get(`/users/sleep/state/${userId}`)
          .then((response) => {
            if (response.data.success) {
              syncCoinsFromServer(response.data.coins, new Date(response.data.serverTime).getTime());
              remainingSecondsRef.current = response.data.remainingSeconds;
              onDurationUpdate(response.data.remainingSeconds);
              lastSyncTimeRef.current = Date.now();
              if (response.data.remainingSeconds <= 0) onComplete();
            }
          })
          .catch((err) => console.error("Fallback sync failed:", err))
          .finally(() => {
            syncPendingRef.current = false;
          });
      }, 0);
    }
  }, [userId, onComplete, onDurationUpdate, syncCoinsFromServer]);

  // Main game loop and rendering
  useEffect(() => {
    if (!assetsLoaded) return; // Don't start until assets are loaded

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const player = playerRef.current;
    const gravity = 0.5;
    let animationFrameId;

   
    canvas.width = 374;
    canvas.height = 200;

    // Initialize clouds with more spread
    const generateCloud = () => ({
      x: Math.random() * (canvas.width + 200),
      y: Math.random() * (canvas.height - 80),
      width: 80,
      height: 80,
    });
    cloudsRef.current = [generateCloud(), generateCloud(), generateCloud()];

    const update = (currentTime) => {
      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = currentTime;
      accumulatedTimeRef.current += deltaTime;

      while (accumulatedTimeRef.current >= FIXED_TIME_STEP) {
        // Physics update
        player.velocityY += gravity * FIXED_TIME_STEP * 60;
        player.y += player.velocityY * FIXED_TIME_STEP * 60;
        if (player.y > canvas.height - 80) {
          player.y = canvas.height - 80;
          player.velocityY = 0;
          player.jumping = false;
        }

        // Update coin positions
        const syncedTime = Date.now() + serverTimeOffsetRef.current;
        coinsRef.current.forEach((coin) => {
          if (!coin.collected && !collectedCoinsRef.current.has(coin.id)) {
            const spawnTime = new Date(coin.spawnTime).getTime();
            const coinAge = (syncedTime - spawnTime) / 1000;
            coin.localX = (coin.x ?? 374) + COIN_SPEED * Math.max(0, coinAge);
          }
        });

        // Update clouds
        cloudsRef.current.forEach((cloud) => {
          cloud.x += CLOUD_SPEED * FIXED_TIME_STEP;
          if (cloud.x < -cloud.width) {
            cloud.x = canvas.width + Math.random() * 200;
            cloud.y = Math.random() * (canvas.height - 80);
          }
        });

        // Animation frame update
        player.frameTime += FIXED_TIME_STEP;
        if (player.frameTime >= FRAME_DURATION) {
          player.frameTime = 0;
          if (!player.jumping) {
            player.frame = (player.frame + 1) % 2; // Loop through 2 running frames (0-1)
          }
        }

        accumulatedTimeRef.current -= FIXED_TIME_STEP;
      }

      // Rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00000000"; // Sky blue background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds
      cloudsRef.current.forEach((cloud) => {
        ctx.drawImage(cloudImgRef.current, cloud.x, cloud.y, cloud.width, cloud.height);
      });

      // Draw ground as a single full-width image
      ctx.drawImage(groundImgRef.current, 0, canvas.height - 0, canvas.width, 45);

      // Draw player
      const currentFrame = player.jumping ? 2 : player.frame; // 2 is jump frame
      ctx.drawImage(playerFramesRef.current[currentFrame], player.x, player.y, 70, 70);

      // Draw coins
      coinsRef.current.forEach((coin) => {
        if (!collectedCoinsRef.current.has(coin.id) && coin.localX >= -20 && coin.localX <= canvas.width) {
          ctx.drawImage(coinImgRef.current, coin.localX, coin.y, 20, 20);

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
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") handleJump();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("click", handleJump);
      window.removeEventListener("keydown", handleJump);
    };
  }, [
    assetsLoaded,
    handleJump,
    collectCoinLocally,
    queueCollection,
    processPendingCollections,
    triggerServerSync,
  ]);

  // Only render canvas when assets are loaded, with fade-in effect
  return assetsLoaded ? (
    <div
    style={{
      background: "linear-gradient(0deg, rgba(231, 231, 231, 1) 44%, rgba(208, 208, 208, 0) 100%)",
      backgroundColor: "black",
      borderBottom: "3px solid rgb(32 20 30)",
      borderRadius: "8px",
      position: "absolute",
      top: "26.5%",
      left: "0%",
      width: "100%",
      height: "200px",
      zIndex: 999999,
      opacity: 0,
      animation: "fadeIn 0.5s ease-in forwards",
      overflow: "hidden", // Чтобы содержимое не выходило за границы
    }}
  >
    {/* Анимированная гифка земли */}
    <img
      src={groundImgRef.current.src} // Путь к вашей гифке
      alt="Animated Ground"
      style={{
        position: "absolute",
        bottom: 0, // Привязываем к нижней части контейнера
        left: 0,
        width: "100%", // Растягиваем на всю ширину контейнера
        height: "45px", // Высота земли (как в ctx.drawImage)
        zIndex: 1, // Под канвасом
      }}
    />
    <canvas
      ref={canvasRef}
      style={{
        
        borderRadius: "8px",
        position: "fixed",
        top: "26.5%",
        left: "0%",
        width: "100%",
        height: "auto",
        zIndex: 999999,
        opacity: 0, // Start invisible
        animation: "fadeIn 0.5s ease-in forwards", // Fade in over 0.5s
      }}
    />
    </div>
  ) : null;
};

// Define the fade-in animation with keyframes
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Inject the keyframes into the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default memo(SleepGame);