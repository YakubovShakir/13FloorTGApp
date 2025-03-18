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
  const cloudsRef = useRef([]); // Initialize here
  const lastFrameTimeRef = useRef(performance.now());
  const accumulatedTimeRef = useRef(0);
  const remainingSecondsRef = useRef(initialSleepDuration);
  const lastReportedSecondsRef = useRef(initialSleepDuration);
  const playerJumpsRef = useRef([]);
  const coinImgRef = useRef(null);
  const playerFramesRef = useRef([]);
  const groundImgRef = useRef(null);
  const cloudImgRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const serverTimeOffsetRef = useRef(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const FIXED_TIME_STEP = 1 / 60;
  const COIN_SPEED = -50;
  const CLOUD_SPEED = -20;
  const FRAME_DURATION = 0.2;
  const CLOUD_SPACING = 120;

  // Initialize clouds once on mount
  useEffect(() => {
    const generateCloud = (startX) => ({
      x: startX,
      y: Math.random() * (canvasRef.current?.width ? canvasRef.current.height - 80 : 120),
      width: 80,
      height: 80,
    });

    cloudsRef.current = Array.from({ length: 6 }, (_, i) =>
      generateCloud(i * CLOUD_SPACING)
    ); // [0, 120, 240, 360, 480, 600]
    // console.log("Clouds initialized:", cloudsRef.current.map(c => `x=${c.x}`));
  }, []); // Empty deps = run once on mount

  const syncCoinsFromServer = useCallback(async (isInitial = false) => {
    try {
      const response = await instance.get(`/users/sleep/state/${userId}`);
      if (response.data.success) {
        const serverTime = new Date(response.data.serverTime).getTime();
        if (isInitial && serverTimeOffsetRef.current === null) {
          serverTimeOffsetRef.current = serverTime - Date.now();
        }

        const now = Date.now() + (serverTimeOffsetRef.current || 0);
        const serverCoins = response.data.coins || [];
        coinsRef.current = serverCoins
          .filter(coin => !collectedCoinsRef.current.has(coin.id) && !coin.collected)
          .map(coin => {
            const spawnTime = new Date(coin.spawnTime).getTime();
            const coinAge = (now - spawnTime) / 1000;
            return { ...coin, localX: coin.x + COIN_SPEED * coinAge };
          });

        const newRemainingSeconds = response.data.remainingSeconds;
        remainingSecondsRef.current = newRemainingSeconds;
        if (Math.abs(newRemainingSeconds - lastReportedSecondsRef.current) >= 1) {
          onDurationUpdate(newRemainingSeconds);
          lastReportedSecondsRef.current = newRemainingSeconds;
        }
        if (newRemainingSeconds <= 0) onComplete();
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
    syncCoinsFromServer(true);
    syncIntervalRef.current = setInterval(() => syncCoinsFromServer(false), 2000);
    return () => clearInterval(syncIntervalRef.current);
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
  }, []);

  const queueCollection = useCallback(async (collection) => {
    try {
      const response = await instance.post(`/users/sleep/collect-coin/${userId}`, collection);
      if (response.data.success) {
        remainingSecondsRef.current = response.data.remainingSeconds;
        if (Math.abs(response.data.remainingSeconds - lastReportedSecondsRef.current) >= 1) {
          onDurationUpdate(response.data.remainingSeconds);
          lastReportedSecondsRef.current = response.data.remainingSeconds;
        }
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

    // console.log("Game loop started");

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

        let resetDone = false;
        cloudsRef.current.forEach(cloud => {
          cloud.x += CLOUD_SPEED * FIXED_TIME_STEP;
          if (cloud.x < -cloud.width && !resetDone) {
            cloud.x = canvas.width + cloud.width; // 454
            // console.log(`Reset cloud: x=${cloud.x}, y=${cloud.y}`);
            resetDone = true;
          }
        });

        // console.log("Clouds:", cloudsRef.current.map(c => `x=${c.x.toFixed(1)}`));

        player.frameTime += FIXED_TIME_STEP;
        if (player.frameTime >= FRAME_DURATION) {
          player.frameTime = 0;
          if (!player.jumping) player.frame = (player.frame + 1) % 2;
        }

        accumulatedTimeRef.current -= FIXED_TIME_STEP;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      cloudsRef.current.forEach(cloud => {
        ctx.drawImage(cloudImgRef.current, cloud.x, cloud.y, cloud.width, cloud.height);
      });

      const currentFrame = player.jumping ? 2 : player.frame;
      ctx.drawImage(playerFramesRef.current[currentFrame], player.x, player.y, 70, 70);

      coinsRef.current.forEach(coin => {
        if (!collectedCoinsRef.current.has(coin.id) && coin.localX >= -20 && coin.localX <= canvas.width) {
          ctx.drawImage(coinImgRef.current, coin.localX, coin.y, 20, 20);

          const playerLeft = player.x;
          const playerRight = player.x + 40;
          const playerTop = player.y;
          const playerBottom = player.y + 40;
          const coinLeft = coin.localX - 20;
          const coinRight = coin.localX + 20;
          const coinTop = coin.y - 20;
          const coinBottom = coin.y + 20;

          const xOverlap = playerRight > coinLeft && playerLeft < coinRight;
          const yOverlap = playerBottom > coinTop && playerTop < coinBottom;

          if (xOverlap && yOverlap) {
            collectCoinLocally(coin.id);
            const lastJumpTime = playerJumpsRef.current[playerJumpsRef.current.length - 1]?.time || null;
            const now = Date.now() + (serverTimeOffsetRef.current || 0);
            const collection = {
              coinId: coin.id,
              collectionToken: coin.collectionToken || null,
              playerX: player.x,
              playerY: player.y,
              jumpTime: lastJumpTime,
              x: coin.x,
              spawnTime: coin.spawnTime,
              clientCoinX: coin.localX,
              collectionTime: new Date(now).toISOString(),
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

export default memo(SleepGame, (prevProps, nextProps) =>
  prevProps.sleepDuration === nextProps.sleepDuration &&
  prevProps.onDurationUpdate === nextProps.onDurationUpdate &&
  prevProps.onComplete === nextProps.onComplete
);