import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import "./Home.css";
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader";
import Player from "../../components/complex/Player/Player";
import Menu from "../../components/complex/Menu/Menu";
import Window from "../../components/complex/Windows/Window/Window";
import Assets from "../../assets/index";
import ProcessProgressBar from "../../components/simple/ProcessProgressBar/ProcessProgressBar";
import {
  getOwnNekoState,
  getTrainingParameters,
  getUserActiveProcess,
} from "../../services/user/user";
import UserContext, { useUser } from "../../UserContext";
import countPercentage from "../../utils/countPercentage";
import { getLevels } from "../../services/levels/levels";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FullScreenSpinner from "./FullScreenSpinner";
import getBgByCurrentProcess from "./getBgByCurrentProcess";
import moment from "moment-timezone";
import { useVisibilityChange, useWindowFocus } from "../../hooks/userActivities";
import formatTime from "../../utils/formatTime";
import { checkCanStop, stopProcess } from "../../services/process/process";
import {
  canStartSleeping,
  canStartTraining,
  canStartWorking,
} from "../../utils/paramDep";
import SleepGame from "./SleepGame";
import globalTranslations from "../../globalTranslations";
import { useSettingsProvider } from "../../hooks";
import WorkGame from "./WorkGame";

const COIN_SOUND = new Audio(
  "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/coin.mp3"
);
const ALARM_SOUND = new Audio(
  "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/alarm.mp3"
);

COIN_SOUND.load();
ALARM_SOUND.load();

const { Icons } = Assets
const Home = () => {
  const { refreshData } = useUser();
  const navigate = useNavigate();
  const mountedRef = useRef(false);
  const [state, setState] = useState({
    currentWindow: null,
    currentProcess: null,
    visibleWindow: false,
    visibleSettingsModal: false,
    trainingParameters: null,
    levels: null,
    isStoppingProcess: false,
    imagesLoaded: false,
    hasIconAnimated: true,
    nekoState: { canClick: false, cooldownUntil: null },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [timer, setTimer] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const hasCompletedRef = useRef(false);
  const [isInitializedFully, setIsInitializedFully] = useState(false);

  const {
    userId,
    userParameters,
    isInitialized,
    userPersonage,
    userClothing,
    userShelf,
  } = useContext(UserContext);

  const getUserSleepDuration = useCallback(() => {
    return state.levels?.find((level) => level?.level === userParameters?.level)
      ?.sleep_duration;
  }, [state.levels, userParameters?.level]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Sequential image loading
  const preloadImages = useCallback(async () => {
    const imageUrls = [
      Assets.Layers.cover,
      Assets.BG.workScreenBG,
      Assets.BG.sleepScreenBG,
      Assets.BG.trainScreenBG,
      Assets.BG.homeBackground,
      Assets.HOME.shelf,
      Assets.HOME.couch,
      Assets.BG.backgroundSun,
      Assets.BG.winter,
    ];

    for (let i = 0; i < imageUrls.length; i++) {
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          setLoadingProgress(((i + 1) / imageUrls.length) * 100);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${imageUrls[i]}`);
          setLoadingProgress(((i + 1) / imageUrls.length) * 100);
          resolve();
        };
        img.src = imageUrls[i];
      });
    }
  }, []);

  const calculateInitialRemaining = useCallback((process) => {
    if (!process?.createdAt) return null;
    const moscowNow = moment().tz("Europe/Moscow");
    const processStart = moment(process.createdAt).tz("Europe/Moscow");
    const elapsedSeconds = moscowNow.diff(processStart, "seconds");
    const totalSeconds =
      process.target_duration_in_seconds || process.base_duration_in_seconds;
    return Math.max(0, totalSeconds - elapsedSeconds);
  }, []);
  const initializeProcess = useCallback(async () => {
    try {
      const process = await timeoutPromise(getUserActiveProcess(userId), 10000);
      if (!process) {
        setState((prev) => ({ ...prev, currentProcess: null }));
        setRemainingSeconds(null);
        return;
      }
      const [trainingParams, levelsData] = await Promise.all([
        timeoutPromise(getTrainingParameters(userId), 5000),
        timeoutPromise(getLevels(), 5000),
      ]);
      if (!mountedRef.current) return;
  
      const initialRemaining = calculateInitialRemaining(process);
      setState((prev) => ({
        ...prev,
        currentProcess: {
          ...process,
          remainingSeconds: initialRemaining,
          formattedTime: formatTime(Math.floor(initialRemaining / 60), initialRemaining % 60),
        },
        trainingParameters: trainingParams,
        levels: levelsData,
      }));
      setRemainingSeconds(initialRemaining);
    } catch (error) {
      console.error("Error initializing process:", error);
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, currentProcess: null }));
        setRemainingSeconds(null);
      }
    }
  }, [userId, calculateInitialRemaining]);
  
  // Add timeout utility
  const timeoutPromise = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
    ]);

  const fetchNekoState = useCallback(async () => {
    try {
      const nekoData = await getOwnNekoState(userId);
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, nekoState: nekoData }));
      }
    } catch (error) {
      console.error("Error fetching neko state:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (!state.nekoState.cooldownUntil || state.nekoState.canClick) return;

    const updateTimer = () => {
      if (!mountedRef.current) return;
      const now = moment().tz("Europe/Moscow");
      const end = moment(state.nekoState.cooldownUntil).tz("Europe/Moscow");
      const diff = end.diff(now);
      if (diff <= 0) {
        setState((prev) => ({
          ...prev,
          nekoState: { ...prev.nekoState, canClick: true, cooldownUntil: null },
        }));
        setTimer(null);
        return;
      }
      const duration = moment.duration(diff);
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      setTimer(
        `${minutes
          .toString()
          .padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state.nekoState]);

  useEffect(() => {
    if (!isInitialized) return;

    const initialize = async () => {
      if (!userPersonage?.gender) {
        navigate("/personage-create");
        return;
      }

      setIsLoading(true);
      try {
        await initializeProcess(); // Critical data first
        setIsInitializedFully(true);
        await preloadImages(); // Sequential image loading
        await fetchNekoState(); // Load neko state after images
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, imagesLoaded: true }));
        }
      } catch (err) {
        console.error("Initialization error:", err);
        if (mountedRef.current) setIsInitializedFully(true);
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    };

    initialize();
  }, [isInitialized, navigate, userPersonage, initializeProcess, preloadImages, fetchNekoState]);

  const canContinue = useCallback(
    (processType) => {
      if (processType === "training")
        return canStartTraining(userParameters) && userParameters?.mood < 100;
      if (processType === "work") return canStartWorking(userParameters);
      if (processType === "sleep") return canStartSleeping(userParameters);
      return false;
    },
    [userParameters]
  );

  const handleConfirmClose = useCallback(async () => {
    setIsLoading(true);
    try {
      await stopProcess(userId);
      setState((prev) => ({ ...prev, currentProcess: null }));
      setRemainingSeconds(null);
    } catch (error) {
      console.error("Error stopping process:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleProcessCompletion = useCallback(async () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await checkCanStop(userId, null, null, state.currentProcess.type);
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, currentProcess: null }));
        setRemainingSeconds(null);
        refreshData();
      }
    } catch (err) {
      console.error("Error in handleProcessCompletion:", err);
      if (err.status !== 404) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (state.currentProcess) {
          await checkCanStop(userId, null, null, state.currentProcess?.type);
        }
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, currentProcess: null }));
          setRemainingSeconds(null);
          refreshData();
        }
      }
    } finally {
      await initializeProcess();
      setIsLoading(false);
      hasCompletedRef.current = false;
    }
  }, [userId, refreshData, state.currentProcess]);

  useVisibilityChange(() => {
    if (mountedRef.current && document.visibilityState === "visible") {
      refreshData();
      initializeProcess();
      fetchNekoState();
    }
  });

  useWindowFocus(() => {
    if (mountedRef.current) {
      refreshData();
      initializeProcess();
      fetchNekoState();
    }
  });

  useEffect(() => {
    if (!state.currentProcess || remainingSeconds === null) return;

    const interval = setInterval(() => {
      if (!mountedRef.current || !state.currentProcess) {
        clearInterval(interval);
        return;
      }

      const processType = state.currentProcess.type;
      if (!canContinue(processType)) {
        setIsLoading(true);
        checkCanStop(userId, null, null, state.currentProcess.type).finally(
          () => {
            if (mountedRef.current) {
              setState((prev) => ({ ...prev, currentProcess: null }));
              setRemainingSeconds(null);
              refreshData();
              setIsLoading(false);
            }
          }
        );
        return;
      }

      const now = moment().tz("Europe/Moscow");
      const start = moment(state.currentProcess.createdAt).tz("Europe/Moscow");
      const elapsedSeconds = now.diff(start, "seconds");
      const totalSeconds =
        state.currentProcess.target_duration_in_seconds ||
        state.currentProcess.base_duration_in_seconds;
      const newRemaining = Math.max(0, totalSeconds - elapsedSeconds);

      setRemainingSeconds(newRemaining);
      setState((prev) => ({
        ...prev,
        currentProcess: {
          ...prev.currentProcess,
          remainingSeconds: newRemaining,
          formattedTime: formatTime(
            Math.floor(newRemaining / 60),
            newRemaining % 60
          ),
        },
      }));

      if (newRemaining <= 0 && !hasCompletedRef.current) {
        handleProcessCompletion();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    state.currentProcess,
    remainingSeconds,
    canContinue,
    handleProcessCompletion,
    userId,
    refreshData,
  ]);

  const onDurationUpdate = useCallback(
    (newRemaining) => {
      const current_elapsedSeconds = moment()
        .tz("Europe/Moscow")
        .diff(
          moment(state.currentProcess.createdAt).tz("Europe/Moscow"),
          "seconds"
        );
      const new_target_duration = newRemaining + current_elapsedSeconds;
      setRemainingSeconds(newRemaining);
      setState((prev) =>
        prev.currentProcess
          ? {
              ...prev,
              currentProcess: {
                ...prev.currentProcess,
                target_duration_in_seconds: new_target_duration,
                formattedTime: formatTime(
                  Math.floor(newRemaining / 60),
                  newRemaining % 60
                ),
              },
            }
          : prev
      );
    },
    [state.currentProcess]
  );

  const shineVariants = {
    shine: {
      filter: [
        "drop-shadow(0 0 12px rgba(0, 153, 255, 0.89))",
        "drop-shadow(0 0 18px rgba(0, 4, 255, 0.8))",
        "drop-shadow(0 0 12px rgb(0, 132, 255))",
      ],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const renderProcessProgressBar = useCallback(
    (process, percentage, rate, reverse = false) => (
      <ProcessProgressBar
        activeProcess={process}
        rate={rate}
        percentage={percentage}
        reverse={reverse}
        handleConfirmClose={handleConfirmClose}
        style={{ transition: "width 1s ease-in-out" }}
      />
    ),
    [handleConfirmClose]
  );

  const { lang } = useSettingsProvider();

  const renderScene = useCallback(
    (content) => (
      <AnimatePresence mode="wait">
        <motion.div
          className="Home"
          key={state.currentProcess?.type || "default"}
          // Removed initial/animate/exit opacity for no flash
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            backgroundColor: "transparent", // No gray flash
          }}
        >
          <div
            onClick={() => navigate("/gacha")}
            style={{
              cursor: "pointer",
              position: "fixed",
              bottom: "13vh",
              left: "3.5vw",
              color: "white",
              border: "none",
              zIndex: 99999,
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            <motion.img
              src={Assets.Icons.spin}
              width={50}
              alt="Wheel"
              variants={shineVariants}
              animate="shine"
            />
            <p
              style={{
                textShadow:
                  "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
                textTransform: "uppercase",
                fontStyle: "italic",
                fontFamily: "Oswald",
                fontWeight: "400",
              }}
            >
              {globalTranslations.gacha.wheel[lang]}
            </p>
          </div>
          <div
            onClick={() => navigate("/daily-rewards")}
            style={{
              cursor: "pointer",
              position: "fixed",
              bottom: "13vh",
              right: "3.5vw",
              color: "white",
              zIndex: 99999,
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            <img src={Assets.Icons.task} width={50} alt="Daily" />
            <p
              style={{
                textShadow:
                  "1px 1px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
                textTransform: "uppercase",
                fontStyle: "italic",
                fontFamily: "Oswald",
                fontWeight: "400",
              }}
            >
              {globalTranslations.daily.daily[lang]}
            </p>
          </div>
          {state.imagesLoaded && (
            <>
              <div
                style={{
                  filter: "blur(1.5px)",
                  position: "absolute",
                  height: "53%",
                  width: "53%",
                  backgroundImage: `url(${Assets.BG.winter})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center right",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  backgroundImage:
                    state.currentProcess?.type &&
                    state.currentProcess?.type !== "default" &&
                    state.currentProcess?.active
                      ? getBgByCurrentProcess(
                          state.currentProcess.type,
                          state.currentProcess?.type_id
                        )
                      : `url(${Assets.BG.homeBackground})`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom right",
                  zIndex: 0,
                }}
              />
            </>
          )}
          {content}
        </motion.div>
      </AnimatePresence>
    ),
    [state.currentProcess?.type, state.currentProcess?.active, state.currentProcess?.type_id, state.imagesLoaded, lang, navigate]
  );

  // Show spinner until everything (including images) is loaded
  if (!isInitializedFully || isLoading || !state.imagesLoaded) {
    return <FullScreenSpinner progress={loadingProgress} />;
  }

  const homeContent = (
    <>
      <HomeHeader
        onClick={() =>
          setState((prev) => ({
            ...prev,
            visibleSettingsModal: !prev.visibleSettingsModal,
          }))
        }
      />
      <img className="shelf1" src={Assets.HOME.shelf} alt="shelf1" />
      <img className="shelf2" src={Assets.HOME.shelf} alt="shelf2" />
      <img className="shelf2" src={Assets.HOME.shelf} alt="shelf2" />
      <img className="couch" src={Assets.HOME.couch} alt="couch" />
      <div style={{ position: "absolute", zIndex: 2 }}>
        <Player
          bottom={"calc(-85vh + 50px)"}
          width="39vw"
          left={"9vw"}
          top={"35vh"}
          personage={userPersonage}
          clothing={userClothing}
        />
      </div>
      <Menu hasBg={false} />
      <div className="HomeInventory">
        {userShelf && (
          <>
            <div className="shelf-container1">
              {userShelf.star?.shelf_link && (
                <img
                  className="shelf-flower"
                  src={userShelf.star.shelf_link}
                  alt="flower"
                />
              )}
              {userShelf.award?.shelf_link && (
                <img
                  className="shelf-award"
                  src={userShelf.award.shelf_link}
                  alt="award"
                />
              )}
              {userShelf.flower?.shelf_link && (
                <img
                  className="shelf-flower"
                  src={userShelf.flower.shelf_link}
                  alt="flower"
                />
              )}
              {userShelf.event?.shelf_link && (
                <img
                  className="shelf-event"
                  src={userShelf.event.shelf_link}
                  alt="event"
                />
              )}
            </div>
            <div className="shelf-container2">
              {userShelf.neko?.shelf_link && (
                <div className="shelf-neko-container" style={{ position: "relative" }}>
                  <img
                    className="shelf-neko"
                    src={userShelf.neko.shelf_link}
                    alt="neko"
                    style={{
                      filter: state.nekoState.canClick ? "none" : "none",
                    }}
                  />
                  {state.nekoState.canClick && (
                    <motion.div
                      className="pulse-effect"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "46%",
                        height: "100%",
                        overflow: "hidden",
                        pointerEvents: "none",
                        filter: "blur(10px)",
                        borderRadius: "50%",
                      }}
                    >
                      <div
                        style={{
                          width: "70%",
                          height: "100%",
                          background: "#00ffb7",
                          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
                          transform: "translateY(-50%)",
                          filter: "blur(30px)",
                        }}
                      />
                    </motion.div>
                  )}
                  {!state.nekoState.canClick && timer && (
                    <div
                      className="timer-overlay"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "absolute",
                        top: "100%",
                        left: "23%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        background: "rgba(0,0,0,0.7)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "16px",
                        pointerEvents: "none",
                        zIndex: 999999,
                      }}
                    >
                        <img
                  src={Icons.clock}
                  alt="Coin"
                  style={{ width: "20px", marginRight: "5px" }}
                />
                      {timer} <p style={{
                        paddingLeft: "2px",}}>M</p>
                    </div>
                  )}
                </div>
              )}
              {userShelf.flag?.shelf_link && (
                <img
                  className="shelf-flag"
                  src={userShelf.flag.shelf_link}
                  alt="flag"
                />
              )}
            </div>
          </>
        )}
      </div>
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentWindow.data}
          tabs={state.currentWindow.tabs}
          onClose={() =>
            setState((prev) => ({ ...prev, visibleWindow: false }))
          }
        />
      )}
    </>
  );

  const workContent = (
    <>
      <HomeHeader
        onClick={() =>
          setState((prev) => ({
            ...prev,
            visibleSettingsModal: !prev.visibleSettingsModal,
          }))
        }
      />
      <WorkGame
        workDuration={remainingSeconds}
        onComplete={handleProcessCompletion}
        onDurationUpdate={onDurationUpdate}
      />
      <Player
        bottom="calc(-1vh + 141px)"
        width="42vw"
        left={"9vw"}
        top={"35vh"}
        personage={userPersonage}
        clothing={userClothing}
        work
      />
      {state.currentProcess &&
        renderProcessProgressBar(
          state.currentProcess,
          countPercentage(
            moment()
              .tz("Europe/Moscow")
              .diff(
                moment(state.currentProcess.createdAt).tz("Europe/Moscow"),
                "seconds"
              ),
            state.currentProcess.target_duration_in_seconds ||
              state.currentProcess.base_duration_in_seconds
          ),
          state.currentProcess.formattedTime,
          true
        )}
      <Menu noButton />
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentWindow.data}
          tabs={state.currentWindow.tabs}
          onClose={() =>
            setState((prev) => ({ ...prev, visibleWindow: false }))
          }
        />
      )}
    </>
  );

  const trainingContent = (
    <>
      <HomeHeader
        onClick={() =>
          setState((prev) => ({
            ...prev,
            visibleSettingsModal: !prev.visibleSettingsModal,
          }))
        }
      />
      <Player
        bottom="calc(-1vh + 141px)"
        width="40vw"
        left={"9vw"}
        top={"35vh"}
        personage={userPersonage}
        clothing={userClothing}
        training
      />
      {state.currentProcess &&
        renderProcessProgressBar(
          state.currentProcess,
          countPercentage(
            moment()
              .tz("Europe/Moscow")
              .diff(
                moment(state.currentProcess.createdAt).tz("Europe/Moscow"),
                "seconds"
              ),
            state.currentProcess.target_duration_in_seconds ||
              state.currentProcess.base_duration_in_seconds
          ),
          state.currentProcess.formattedTime
        )}
      <Menu noButton />
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentProcess.data}
          tabs={state.currentWindow.tabs}
          onClose={() =>
            setState((prev) => ({ ...prev, visibleWindow: false }))
          }
        />
      )}
    </>
  );

  const sleepContent = (
    <>
      <HomeHeader
        onClick={() =>
          setState((prev) => ({
            ...prev,
            visibleSettingsModal: !prev.visibleSettingsModal,
          }))
        }
      />
      <SleepGame
        sleepDuration={remainingSeconds}
        onComplete={handleProcessCompletion}
        onDurationUpdate={onDurationUpdate}
      />
      <Player
        bottom={"calc(-468px)"}
        width="81vw"
        left={"5vw"}
        top={"55vmax"}
        personage={userPersonage}
        clothing={userClothing}
        sleep
      />
      <img
        src={Assets.Layers.cover}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          bottom: 0,
          zIndex: 0,
        }}
        alt="cover"
      />
      {state.currentProcess &&
        renderProcessProgressBar(
          state.currentProcess,
          100 -
            countPercentage(
              remainingSeconds,
              state.currentProcess.target_duration_in_seconds ||
                getUserSleepDuration() * 60
            ),
          state.currentProcess.formattedTime
        )}
      <Menu noButton />
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentProcess.data}
          tabs={state.currentWindow.tabs}
          onClose={() =>
            setState((prev) => ({ ...prev, visibleWindow: false }))
          }
        />
      )}
    </>
  );

  const currentProcessType = state.currentProcess?.type;
  if (
    !currentProcessType ||
    currentProcessType === "skill" ||
    currentProcessType === "food"
  ) {
    return renderScene(homeContent);
  }
  if (currentProcessType === "work") return renderScene(workContent);
  if (currentProcessType === "training") return renderScene(trainingContent);
  if (currentProcessType === "sleep") return renderScene(sleepContent);

  return renderScene(homeContent);
};

export default Home;