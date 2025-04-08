import { useRef, useEffect, useCallback, useState, memo } from "react";
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
  const playerRef = useRef({ x: 50, y: 120, velocityY: 0, jumping: false, frame: 0, frameTime: 0 });
  const cloudsRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const accumulatedTimeRef = useRef(0);
  const remainingSecondsRef = useRef(initialSleepDuration);
  const lastReportedSecondsRef = useRef(initialSleepDuration);
  const playerJumpsRef = useRef([]);
  const assetsRef = useRef({});
  const syncIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const FIXED_TIME_STEP = 1 / 60;
  const COIN_SPEED = -50;
  const CLOUD_SPEED = -20;
  const FRAME_DURATION = 0.2;
  const CLOUD_SPACING = 100;
  const CLOUD_COUNT = 10;

  const preloadAssets = useCallback(async () => {
    const assetPromises = [
      ["coin", Assets.Icons.clock],
      ["ground", Assets.Images.sleepSheepGroundGif],
      ["cloud", Assets.Images.sleepSheepCloud],
      ["player1", Assets.Images.sleepSheep1],
      ["player2", Assets.Images.sleepSheep2],
      ["playerJump", Assets.Images.sleepSheepJump],
    ].map(([key, src]) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          assetsRef.current[key] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load asset ${key}: ${src}`);
          assetsRef.current[key] = null; // Set to null but still resolve
          resolve();
        };
      })
    );
  
    await Promise.all(assetPromises);
    setIsLoaded(true);
  }, []);
  // Initialize clouds
  const initializeClouds = useCallback(() => {
    const canvasWidth = 374;
    cloudsRef.current = Array.from({ length: CLOUD_COUNT }, (_, i) => ({
      x: i * CLOUD_SPACING,
      y: Math.random() * 80,
      width: 80,
      height: 80,
    }));
    while (cloudsRef.current[cloudsRef.current.length - 1].x < canvasWidth + CLOUD_SPACING * 2) {
      cloudsRef.current.push({
        x: cloudsRef.current[cloudsRef.current.length - 1].x + CLOUD_SPACING,
        y: Math.random() * 80,
        width: 80,
        height: 80,
      });
    }
  }, []);

  const syncCoinsFromServer = useCallback(async () => {
    try {
      const response = await instance.get(`/users/sleep/state/${userId}`);
      if (!response.data.success) {
        console.warn("Failed to sync coins from server:", response.data);
        return;
      }
  
      const now = Date.now();
      const serverCoins = response.data.coins || [];
      coinsRef.current = serverCoins
        .filter((coin) => !collectedCoinsRef.current.has(coin.id) && !coin.collected)
        .map((coin) => ({
          ...coin,
          localX: coin.x + COIN_SPEED * ((now - new Date(coin.spawnTime).getTime()) / 1000),
        }));
  
      const newRemainingSeconds = response.data.remainingSeconds;
      remainingSecondsRef.current = newRemainingSeconds;
      if (Math.abs(newRemainingSeconds - lastReportedSecondsRef.current) >= 1) {
        onDurationUpdate(newRemainingSeconds);
        lastReportedSecondsRef.current = newRemainingSeconds;
      }
      if (newRemainingSeconds <= 0) onComplete();
    } catch (err) {
      console.error("Error syncing coins:", err);
    }
  }, [userId, onDurationUpdate, onComplete]);

  // Handle jump
  const handleJump = useCallback(async () => {
    const player = playerRef.current;
    if (!player.jumping) {
      player.velocityY = -11;
      player.jumping = true;
      const jumpTime = new Date().toISOString();
      playerJumpsRef.current.push({ time: jumpTime, y: player.y });
      try {
        await instance.post(`/users/sleep/jump/${userId}`, { y: player.y, time: jumpTime });
      } catch (err) {
        // Silent fail
      }
    }
  }, [userId]);

  // Collect coin and update duration locally
  const collectCoinLocally = useCallback(
    (coinId) => {
      collectedCoinsRef.current.add(coinId);
      coinsRef.current = coinsRef.current.filter((coin) => coin.id !== coinId);
      const newRemainingSeconds = Math.max(remainingSecondsRef.current - 10, 0); // Reduce by 10s, min 0
      remainingSecondsRef.current = newRemainingSeconds;
      onDurationUpdate(newRemainingSeconds);
      lastReportedSecondsRef.current = newRemainingSeconds;
      if (newRemainingSeconds <= 0) onComplete();
    },
    [onDurationUpdate, onComplete]
  );

  const { refreshData } = useUser()

  const queueCollection = useCallback(
    async (collection) => {
      try {
        await Promise.all(
          [
            instance.post(`/users/sleep/collect-coin/${userId}`, collection),
            refreshData()
          ]
        )
      } catch (_) {}
    },
    [userId]
  );

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const player = playerRef.current;
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.1);
    lastFrameTimeRef.current = currentTime;
    accumulatedTimeRef.current += deltaTime;

    while (accumulatedTimeRef.current >= FIXED_TIME_STEP) {
      player.velocityY += 0.5 * FIXED_TIME_STEP * 60;
      player.y += player.velocityY * FIXED_TIME_STEP * 60;
      if (player.y > canvas.height - 80) {
        player.y = canvas.height - 80;
        player.velocityY = 0;
        player.jumping = false;
      }

      coinsRef.current.forEach((coin) => {
        if (!collectedCoinsRef.current.has(coin.id)) {
          coin.localX += COIN_SPEED * FIXED_TIME_STEP;
        }
      });

      const maxX = canvas.width + CLOUD_SPACING * 2;
      cloudsRef.current.forEach((cloud) => {
        cloud.x += CLOUD_SPEED * FIXED_TIME_STEP;
        if (cloud.x < -cloud.width) {
          cloud.x = maxX;
          cloud.y = Math.random() * 120;
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

    cloudsRef.current.forEach((cloud) => {
      if (assetsRef.current.cloud) {
        ctx.drawImage(assetsRef.current.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
      }
    });

    const currentFrame = player.jumping ? "playerJump" : `player${player.frame + 1}`;
    if (assetsRef.current[currentFrame]) {
      ctx.drawImage(assetsRef.current[currentFrame], player.x, player.y, 70, 70);
    }

    coinsRef.current.forEach((coin) => {
      if (!collectedCoinsRef.current.has(coin.id) && coin.localX >= -20 && coin.localX <= canvas.width) {
        if (assetsRef.current.coin) {
          ctx.drawImage(assetsRef.current.coin, coin.localX, coin.y, 25, 25);
        }

        const playerRect = { left: player.x, right: player.x + 40, top: player.y, bottom: player.y + 40 };
        const coinRect = { left: coin.localX - 20, right: coin.localX + 20, top: coin.y - 20, bottom: coin.y + 20 };
        const collided =
          playerRect.right > coinRect.left &&
          playerRect.left < coinRect.right &&
          playerRect.bottom > coinRect.top &&
          playerRect.top < coinRect.bottom;

        if (collided) {
          collectCoinLocally(coin.id);
          const lastJumpTime = playerJumpsRef.current[playerJumpsRef.current.length - 1]?.time || null;
          const now = Date.now();
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

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isLoaded, collectCoinLocally, queueCollection]);

  // Mount effects
  useEffect(() => {
    preloadAssets();
    initializeClouds();
  }, [preloadAssets, initializeClouds]);

  useEffect(() => {
    syncCoinsFromServer();
    syncIntervalRef.current = setInterval(syncCoinsFromServer, 2000);
    return () => clearInterval(syncIntervalRef.current);
  }, [syncCoinsFromServer]);

  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 374;
    canvas.height = 200;

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    // canvas.addEventListener("click", handleJump);
    window.addEventListener("keydown", (e) => e.code === "Space" && handleJump());

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      canvas.removeEventListener("click", handleJump);
      window.removeEventListener("keydown", handleJump);
    };
  }, [isLoaded, gameLoop, handleJump]);

  return (
    <>
    <div
      style={{
        background: "linear-gradient(0deg, rgb(27 37 61) 64%, rgba(255, 255, 255, 0) 100%)",
        borderBottom: "3px solid rgb(32 20 30)",
        borderRadius: "8px",
        position: "absolute",
        top:(window.Telegram?.WebApp.safeAreaInset?.top || 0) + 155.5,
        left: "0%",
        width: "100%",
        height: "200px",
        zIndex: 999999,
        overflow: "hidden",
        animation: isLoaded ? "fadeIn 0.5s ease-in" : "none",
        opacity: isLoaded ? 1 : 0,
      }}
    >
      {isLoaded ? (
        <>
          {assetsRef.current.ground && (
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
          )}
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
        </>
      ) : (
        <div style={{ width: "100%", height: "100%", background: "black" }} />
      )}
    </div>
    <div style={{ height: '60vh', width: '70vw', zIndex: 99999, top: '25vh', bottom: '5vh', left: '8vh', position: 'absolute' }} onClick={handleJump}/>
    </>
  );
};

// CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`, styleSheet.cssRules.length);

export default memo(SleepGame, (prevProps, nextProps) =>
  prevProps.sleepDuration === nextProps.sleepDuration &&
  prevProps.onDurationUpdate === nextProps.onDurationUpdate &&
  prevProps.onComplete === nextProps.onComplete
);