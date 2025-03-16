import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import "./Home.css";
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader";
import Player from "../../components/complex/Player/Player";
import Menu from "../../components/complex/Menu/Menu";
import Window from "../../components/complex/Windows/Window/Window";
import Assets from "../../assets/index";
import ProcessProgressBar from "../../components/simple/ProcessProgressBar/ProcessProgressBar";
import { getOwnNekoState, getTrainingParameters, getUserActiveProcess } from "../../services/user/user";
import { UserContext, useUser } from "../../UserContext";
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
import { canStartSleeping, canStartTraining, canStartWorking } from "../../utils/paramDep";
import GachaOverlay from "./Gacha";
import DailyCheckInOverlay from "./DailyCheckInOverlay";
import SleepGame from "./SleepGame";

const COIN_SOUND = new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/coin.mp3");
const ALARM_SOUND = new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/alarm.mp3");

COIN_SOUND.load();
ALARM_SOUND.load();

const Home = () => {
  console.log("Home Component Rendered");

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

  const { userId, userParameters, isInitialized, userPersonage, userClothing, userShelf } = useContext(UserContext);

  const getUserSleepDuration = useCallback(() => {
    return state.levels?.find((level) => level?.level === userParameters?.level)?.sleep_duration;
  }, [state.levels, userParameters?.level]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
    const imagePromises = imageUrls.map((url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          setLoadingProgress((prev) => prev + 100 / imageUrls.length);
          resolve();
        };
        img.onerror = () => {
          setLoadingProgress((prev) => prev + 100 / imageUrls.length);
          resolve();
        };
        img.src = url;
      })
    );
    await Promise.all(imagePromises);
  }, []);

  const calculateInitialRemaining = useCallback((process) => {
    if (!process?.createdAt) return null;
    const moscowNow = moment().tz("Europe/Moscow");
    const processStart = moment(process.createdAt).tz("Europe/Moscow");
    const elapsedSeconds = moscowNow.diff(processStart, "seconds");
    const totalSeconds = process.target_duration_in_seconds || process.base_duration_in_seconds;
    return Math.max(0, totalSeconds - elapsedSeconds);
  }, []);

  const initializeProcess = useCallback(async () => {
    try {
      const process = await getUserActiveProcess(userId);
      if (!process) {
        setState((prev) => ({ ...prev, currentProcess: null }));
        setRemainingSeconds(null);
        return;
      }
      const [trainingParams, levelsData] = await Promise.all([getTrainingParameters(userId), getLevels()]);
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
        setState((prev) => ({ ...prev, nekoState: { ...prev.nekoState, canClick: true, cooldownUntil: null } }));
        setTimer(null);
        return;
      }
      const duration = moment.duration(diff);
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      setTimer(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
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
      setLoadingProgress(0);
      try {
        await Promise.all([preloadImages(), fetchNekoState(), initializeProcess()]);
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, imagesLoaded: true }));
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initialize();
  }, [isInitialized, navigate, userPersonage, preloadImages, fetchNekoState, initializeProcess]);

  const canContinue = useCallback(
    (processType) => {
      if (processType === "training") return canStartTraining(userParameters) && userParameters?.mood < 100;
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
      await checkCanStop(userId);
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, currentProcess: null }));
        setRemainingSeconds(null);
        refreshData();
      }
    } catch (err) {
      console.error("Error in handleProcessCompletion:", err);
      if (err.status !== 404) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await checkCanStop(userId);
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, currentProcess: null }));
          setRemainingSeconds(null);
          refreshData();
        }
      }
    } finally {
      setIsLoading(false);
      hasCompletedRef.current = false;
    }
  }, [userId, refreshData]);

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
        checkCanStop(userId).finally(() => {
          if (mountedRef.current) {
            setState((prev) => ({ ...prev, currentProcess: null }));
            setRemainingSeconds(null);
            refreshData();
            setIsLoading(false);
          }
        });
        return;
      }

      const now = moment().tz("Europe/Moscow");
      const start = moment(state.currentProcess.createdAt).tz("Europe/Moscow");
      const elapsedSeconds = now.diff(start, "seconds");
      const totalSeconds = state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds;
      const newRemaining = Math.max(0, totalSeconds - elapsedSeconds);

      setRemainingSeconds(newRemaining);
      setState((prev) => ({
        ...prev,
        currentProcess: {
          ...prev.currentProcess,
          remainingSeconds: newRemaining,
          formattedTime: formatTime(Math.floor(newRemaining / 60), newRemaining % 60),
        },
      }));

      if (newRemaining <= 0 && !hasCompletedRef.current) {
        handleProcessCompletion();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.currentProcess, remainingSeconds, canContinue, handleProcessCompletion, userId, refreshData]);

  const onDurationUpdate = useCallback((newRemaining) => {
    setRemainingSeconds(newRemaining);
    setState((prev) =>
      prev.currentProcess
        ? {
            ...prev,
            currentProcess: {
              ...prev.currentProcess,
              target_duration_in_seconds: newRemaining,
              remainingSeconds: newRemaining,
              formattedTime: formatTime(Math.floor(newRemaining / 60), newRemaining % 60),
            },
          }
        : prev
    );
  }, []);

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

  const renderScene = useCallback(
    (content) => (
      <AnimatePresence mode="wait">
        <motion.div
          className="Home"
          key={state.currentProcess?.type || "default"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            backgroundColor: isLoading ? "#f0f0f0" : "transparent",
          }}
        >
          <GachaOverlay userId={userId} />
          <DailyCheckInOverlay />
          {state.imagesLoaded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                  filter: "blur(1px)",
                  position: "absolute",
                  height: "53%",
                  width: "53%",
                  backgroundImage: `url(${Assets.BG.winter})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center right",
                  zIndex: 0,
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  backgroundImage:
                    state.currentProcess?.type && state.currentProcess?.type !== "default" && state.currentProcess?.active
                      ? getBgByCurrentProcess(state.currentProcess.type, state.currentProcess?.type_id)
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
    [state.currentProcess?.type, state.currentProcess?.active, state.currentProcess?.type_id, state.imagesLoaded, userId]
  );

  if (isLoading || !isInitialized || (state.currentProcess && remainingSeconds === null)) {
    return <FullScreenSpinner progress={loadingProgress} />;
  }

  const homeContent = (
    <>
      <HomeHeader onClick={() => setState((prev) => ({ ...prev, visibleSettingsModal: !prev.visibleSettingsModal }))} />
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        className="HomeInventory"
      >
        {userShelf && (
          <>
            <div className="shelf-container1">
              {userShelf.flower?.shelf_link && (
                <motion.img
                  layout
                  className="shelf-flower"
                  src={userShelf.flower.shelf_link}
                  alt="flower"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
              {userShelf.award?.shelf_link && (
                <motion.img
                  layout
                  className="shelf-award"
                  src={userShelf.award.shelf_link}
                  alt="award"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
              {userShelf.event?.shelf_link && (
                <motion.img
                  layout
                  className="shelf-event"
                  src={userShelf.event.shelf_link}
                  alt="event"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
            </div>
            <div className="shelf-container2">
              {userShelf.neko?.shelf_link && (
                <motion.div className="shelf-neko-container" style={{ position: "relative" }}>
                  <motion.img
                    layout
                    className="shelf-neko"
                    src={userShelf.neko.shelf_link}
                    alt="neko"
                    style={{
                      filter: state.nekoState.canClick ? "none" : "grayscale(100%)",
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  {state.nekoState.canClick && (
                    <motion.div
                      className="pulse-effect"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
                    <motion.div
                      className="timer-overlay"
                      style={{
                        position: "absolute",
                        top: "75%",
                        left: "23%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        background: "rgba(0,0,0,0.7)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        pointerEvents: "none",
                        zIndex: 999999,
                      }}
                    >
                      {timer}
                    </motion.div>
                  )}
                </motion.div>
              )}
              {userShelf.flag?.shelf_link && (
                <motion.img
                  layout
                  className="shelf-flag"
                  src={userShelf.flag.shelf_link}
                  alt="flag"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
            </div>
          </>
        )}
      </motion.div>
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentWindow.data}
          tabs={state.currentWindow.tabs}
          onClose={() => setState((prev) => ({ ...prev, visibleWindow: false }))}
        />
      )}
    </>
  );

  const workContent = (
    <>
      <HomeHeader onClick={() => setState((prev) => ({ ...prev, visibleSettingsModal: !prev.visibleSettingsModal }))} />
      <Player
        bottom="calc(-1vh + 141px)"
        width="39vw"
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
            moment().tz("Europe/Moscow").diff(moment(state.currentProcess.createdAt).tz("Europe/Moscow"), "seconds"),
            state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds
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
          onClose={() => setState((prev) => ({ ...prev, visibleWindow: false }))}
        />
      )}
    </>
  );

  const trainingContent = (
    <>
      <HomeHeader onClick={() => setState((prev) => ({ ...prev, visibleSettingsModal: !prev.visibleSettingsModal }))} />
      <Player
        bottom="calc(-1vh + 141px)"
        width="39vw"
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
            moment().tz("Europe/Moscow").diff(moment(state.currentProcess.createdAt).tz("Europe/Moscow"), "seconds"),
            state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds
          ),
          state.currentProcess.formattedTime
        )}
      <Menu noButton />
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentProcess.data}
          tabs={state.currentWindow.tabs}
          onClose={() => setState((prev) => ({ ...prev, visibleWindow: false }))}
        />
      )}
    </>
  );

  const sleepContent = (
    <>
      <HomeHeader onClick={() => setState((prev) => ({ ...prev, visibleSettingsModal: !prev.visibleSettingsModal }))} />
      <SleepGame sleepDuration={remainingSeconds} onComplete={handleProcessCompletion} onDurationUpdate={onDurationUpdate} />
      <Player
        bottom={"calc(-468px)"}
        width="81vw"
        left={"5vw"}
        top={"55vmax"}
        personage={userPersonage}
        clothing={userClothing}
        sleep
      />
      <motion.img
        src={Assets.Layers.cover}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ position: "absolute", width: "100%", height: "100%", bottom: 0, zIndex: 0 }}
        alt="cover"
      />
      {state.currentProcess &&
        renderProcessProgressBar(
          state.currentProcess,
          100 -
            countPercentage(
              remainingSeconds,
              state.currentProcess.target_duration_in_seconds || getUserSleepDuration() * 60
            ),
          state.currentProcess.formattedTime
        )}
      <Menu noButton />
      {state.visibleWindow && (
        <Window
          title={state.currentWindow.title}
          data={state.currentProcess.data}
          tabs={state.currentWindow.tabs}
          onClose={() => setState((prev) => ({ ...prev, visibleWindow: false }))}
        />
      )}
    </>
  );

  if (state?.currentProcess === null || state.currentProcess.type === "skill" || state.currentProcess.type === "food") {
    return renderScene(homeContent);
  }
  if (state.currentProcess?.type === "work") return renderScene(workContent);
  if (state.currentProcess?.type === "training") return renderScene(trainingContent);
  if (state.currentProcess?.type === "sleep") return renderScene(sleepContent);

  return renderScene(homeContent); // Fallback to homeContent if no process matches
};

export default Home;