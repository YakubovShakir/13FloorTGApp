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
    y: 120, // On ground (200 - 80)
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
  const playerFramesRef = useRef([]);
  const groundImgRef = useRef(null);
  const cloudImgRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const serverTimeOffsetRef = useRef(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const FIXED_TIME_STEP = 1 / 60;
  const COIN_SPEED = -50; // Coins approach player
  const CLOUD_SPEED = -20; // Clouds move slower for parallax
  const FRAME_DURATION = 0.2;

  const syncCoinsFromServer = useCallback(async (isInitial = false) => {
    try {
      const response = await instance.get(`/users/sleep/state/${userId}`);
      if (response.data.success) {
        const serverTime = new Date(response.data.serverTime).getTime();
        if (isInitial && serverTimeOffsetRef.current === null) {
          serverTimeOffsetRef.current = serverTime - Date.now(); // Calculate drift once
        }

        const serverCoins = response.data.coins || [];
        const updatedCoins = serverCoins
          .filter(coin => !collectedCoinsRef.current.has(coin.id) && !coin.collected)
          .map(coin => {
            const existingCoin = coinsRef.current.find(c => c.id === coin.id);
            return {
              ...coin,
              localX: existingCoin ? existingCoin.localX : coin.x,
            };
          });
        coinsRef.current = updatedCoins;
        remainingSecondsRef.current = response.data.remainingSeconds;
        onDurationUpdate(response.data.remainingSeconds);
        if (response.data.remainingSeconds <= 0) onComplete();
      }
    } catch (err) {
      console.error("Sync failed:", err);
    }
  }, [userId, onDurationUpdate, onComplete]);

  useEffect(() => {
    coinImgRef.current = new Image();
    coinImgRef.current.src = Assets.Icons.energyUp;
    groundImgRef.current = new Image();
    groundImgRef.current.src = Assets.Images.sleepSheepGroundGif;
    cloudImgRef.current = new Image();
    cloudImgRef.current.src = Assets.Images.sleepSheepCloud;
    playerFramesRef.current = [new Image(), new Image(), new Image()];
    playerFramesRef.current[0].src = Assets.Images.sleepSheep1;
    playerFramesRef.current[1].src = Assets.Images.sleepSheep2;
    playerFramesRef.current[2].src = Assets.Images.sleepSheepJump;

    const checkImages = () => {
      const allLoaded =
        coinImgRef.current.complete &&
        groundImgRef.current.complete &&
        cloudImgRef.current.complete &&
        playerFramesRef.current.every(img => img.complete);
      if (allLoaded) setAssetsLoaded(true);
      else setTimeout(checkImages, 100);
    };
    checkImages();
  }, []);

  useEffect(() => {
    syncCoinsFromServer(true); // Initial sync with drift
    syncIntervalRef.current = setInterval(() => syncCoinsFromServer(false), 2000);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [syncCoinsFromServer]);

  const handleJump = useCallback(async () => {
    const player = playerRef.current;
    if (!player.jumping) {
      player.velocityY = -12;
      player.jumping = true;
      const jumpTime = new Date(Date.now() + (serverTimeOffsetRef.current || 0)).toISOString();
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
    coinsRef.current = coinsRef.current.filter(coin => coin.id !== coinId);
    console.log("Coin collected locally:", coinId);
  }, []);

  const queueCollection = useCallback(async (collection) => {
    const now = Date.now() + (serverTimeOffsetRef.current || 0);
    const spawnTime = new Date(collection.spawnTime).getTime();
    const coinAge = (now - spawnTime) / 1000;
    const updatedCollection = {
      coinId: collection.coinId,
      collectionToken: collection.collectionToken || null,
      playerX: collection.playerX,
      playerY: collection.playerY,
      jumpTime: collection.jumpTime,
      x: collection.x,
      spawnTime: collection.spawnTime,
      clientCoinX: collection.x + COIN_SPEED * coinAge,
      collectionTime: new Date(now).toISOString(),
    };

    try {
      const response = await instance.post(`/users/sleep/collect-coin/${userId}`, updatedCollection);
      if (response.data.success) {
        remainingSecondsRef.current = response.data.remainingSeconds;
        onDurationUpdate(response.data.remainingSeconds);
        console.log("Backend confirmed collection:", collection.coinId);
      } else {
        console.error("Backend rejected collection:", response.data.message);
      }
    } catch (err) {
      console.error("Collection request failed:", err);
    }
  }, [userId, onDurationUpdate]);

  useEffect(() => {
    if (!assetsLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const player = playerRef.current;
    const gravity = 0.5;
    canvas.width = 374;
    canvas.height = 200;

    const generateCloud = () => ({
      x: canvas.width + Math.random() * 200, // Start off-screen right
      y: Math.random() * (canvas.height - 80),
      width: 80,
      height: 80,
    });
    cloudsRef.current = [generateCloud(), generateCloud(), generateCloud()];

    const update = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = currentTime;
      accumulatedTimeRef.current += deltaTime;

      while (accumulatedTimeRef.current >= FIXED_TIME_STEP) {
        player.velocityY += gravity * FIXED_TIME_STEP * 60;
        player.y += player.velocityY * FIXED_TIME_STEP * 60;
        if (player.y > canvas.height - 80) {
          player.y = canvas.height - 80;
          player.velocityY = 0;
          player.jumping = false;
        }

        coinsRef.current.forEach(coin => {
          if (!coin.collected && !collectedCoinsRef.current.has(coin.id)) {
            coin.localX += COIN_SPEED * FIXED_TIME_STEP;
          }
        });

        cloudsRef.current.forEach(cloud => {
          cloud.x += CLOUD_SPEED * FIXED_TIME_STEP; // Smooth movement
          if (cloud.x < -cloud.width) {
            cloud.x = canvas.width + cloud.width; // Reset to right edge
            cloud.y = Math.random() * (canvas.height - 80); // Random Y
          }
        });

        player.frameTime += FIXED_TIME_STEP;
        if (player.frameTime >= FRAME_DURATION) {
          player.frameTime = 0;
          if (!player.jumping) player.frame = (player.frame + 1) % 2;
        }

        accumulatedTimeRef.current -= FIXED_TIME_STEP;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00000000";

      cloudsRef.current.forEach(cloud => {
        ctx.drawImage(cloudImgRef.current, cloud.x, cloud.y, cloud.width, cloud.height);
      });

      const currentFrame = player.jumping ? 2 : player.frame;
      ctx.drawImage(playerFramesRef.current[currentFrame], player.x, player.y, 70, 70);

      coinsRef.current.forEach(coin => {
        if (!collectedCoinsRef.current.has(coin.id) && coin.localX >= -20 && coin.localX <= canvas.width) {
          ctx.drawImage(coinImgRef.current, coin.localX, coin.y, 20, 20);

          const playerLeft = player.x;
          const playerRight = player.x + 70;
          const playerTop = player.y;
          const playerBottom = player.y + 70;
          const coinLeft = coin.localX;
          const coinRight = coin.localX + 20;
          const coinTop = coin.y;
          const coinBottom = coin.y + 20;

          const xOverlap = playerRight > coinLeft && playerLeft < coinRight;
          const yOverlap = playerBottom > coinTop && playerTop < coinBottom;

          if (xOverlap && yOverlap) {
            collectCoinLocally(coin.id);
            const lastJumpTime = playerJumpsRef.current[playerJumpsRef.current.length - 1]?.time || null;
            const collection = {
              coinId: coin.id,
              collectionToken: coin.collectionToken || null,
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

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
    canvas.addEventListener("click", handleJump);
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") handleJump();
    });

    return () => {
      canvas.removeEventListener("click", handleJump);
      window.removeEventListener("keydown", handleJump);
    };
  }, [assetsLoaded, handleJump, collectCoinLocally, queueCollection]);

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
        overflow: "hidden",
      }}
    >
      <img
        src={Assets.Images.sleepSheepGroundGif}
        alt="Animated Ground"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "45px",
          zIndex: 1,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: "8px",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "200px",
          zIndex: 2,
        }}
      />
    </div>
  ) : null;
};

export default memo(SleepGame);