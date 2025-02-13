import React, { useEffect, useState, useContext, useRef } from "react"
import "./Home.css"
import HomeHeader from "../../components/complex/HomeHeader/HomeHeader"
import Player from "../../components/complex/Player/Player"
import Menu from "../../components/complex/Menu/Menu"
import Window from "../../components/complex/Windows/Window/Window"
import Assets from "../../assets/index"
import ProcessProgressBar from "../../components/simple/ProcessProgressBar/ProcessProgressBar"
import {
    getParameters,
    getTrainingParameters,
    getUserActiveProcess,
} from "../../services/user/user"
import { stopProcess } from "../../services/process/process"
import UserContext, { useUser } from "../../UserContext"
import countPercentage from "../../utils/countPercentage"
import { updateProcessTimers } from "../../utils/updateTimers"
import { getLevels } from "../../services/levels/levels"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import FullScreenSpinner from "./FullScreenSpinner"
import getBgByCurrentProcess from "./getBgByCurrentProcess"
import moment from "moment-timezone"
import { useVisibilityChange, useWindowFocus } from "../../hooks/userActivities"
import formatTime from "../../utils/formatTime"


const Home = () => {
    console.log("Home Component Rendered"); // LOG - Component Render Start

    const navigate = useNavigate()
    const mountedRef = useRef(false)

    const [state, setState] = useState({
        currentWindow: null,
        currentProcess: null,
        visibleWindow: false,
        visibleSettingsModal: false,
        trainingParameters: null,
        levels: null,
        isStoppingProcess: false,
        imagesLoaded: false,
        hasIconAnimated: true
    })

    const [isLoading, setIsLoading] = useState(true)

    const {
        userId,
        userParameters,
        isInitialized,
        userPersonage,
        userClothing,
        userShelf,
    } = useContext(UserContext)

    const getUserSleepDuration = () => {
        const duration = state.levels?.find(
            (level) => level?.level === userParameters?.level
        )?.sleep_duration
        return duration
    }

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    const [progressRate, setProgressRate] = useState(null)

    const preloadImages = async () => {
        const imageUrls = [
            Assets.Layers.cover,
            Assets.BG.workScreenBG,
            Assets.BG.sleepScreenBG,
            Assets.BG.trainScreenBG,
            Assets.BG.homeBackground,
            Assets.HOME.shelf,
            Assets.HOME.couch,
            Assets.BG.backgroundSun,
            Assets.BG.winter
        ]

        return Promise.all(
            imageUrls.map((url) => {
                return new Promise((resolve) => {
                    const img = new Image()
                    img.onload = resolve
                    img.onerror = resolve // Continue even if image fails to load
                    img.src = url
                })
            })
        )
    }

    const initializeProcess = async () => {
        console.log("initializeProcess - Start"); // LOG - initializeProcess start
        try {
            if (!mountedRef.current) return

            const process = await getUserActiveProcess(userId);
            console.log("initializeProcess - getUserActiveProcess result:", process); // LOG - process from API

            // Important: Set current process to null first - NO, keep existing process during fetch to avoid UI flicker if process is unchanged
            // setState(prev => ({ ...prev, currentProcess: null })); // DO NOT SET TO NULL HERE ANYMORE
            // console.log("initializeProcess - setState to null currentProcess"); // LOG - set null

            // Wait a frame - not needed if we don't set to null immediately.
            // await new Promise(resolve => requestAnimationFrame(resolve));

            if (!mountedRef.current) return;

            if (!process) {
                console.log("initializeProcess - No active process found, exiting"); // LOG - no process
                // If no process, still update state to reflect no process and reset animation
                setState(prev => ({
                    ...prev,
                    currentProcess: null,
                }));
                return;
            }

            const [trainingParams, levelsData] = await Promise.all([
                getTrainingParameters(userId),
                getLevels()
            ]);
            console.log("initializeProcess - getTrainingParameters & getLevels results:", trainingParams, levelsData); // LOG - training and levels

            if (!mountedRef.current) return

            setState(prev => ({
                ...prev,
                currentProcess: process,
                trainingParameters: trainingParams,
                levels: levelsData,
            }));
            console.log("initializeProcess - setState with new process, hasIconAnimated: false", process); // LOG - set new process
        } catch (error) {
            console.error("Error initializing process:", error);
            if (mountedRef.current) {
                setState(prev => ({ ...prev, currentProcess: null }));
                console.log("initializeProcess - Error, setState to null currentProcess due to error"); // LOG - set null on error
            }
        }
        console.log("initializeProcess - End"); // LOG - initializeProcess end
    }

    const [processStartTime, setProcessStartTime] = useState(null); // Store the start time

    useEffect(() => {
      console.log('ICON ANIMATED', state.hasIconAnimated)
    }, [state.hasIconAnimated])

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;  // Pad minutes
        const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds; // Pad seconds

        return `${formattedMinutes}:${formattedSeconds}`;
    }

    useEffect(() => {
        let timerInterval;
        const isActive = state.currentProcess?.active; // Get active status here for dependency
        const currentProcessCreatedAt = state.currentProcess?.createdAt; // Get createdAt for dependency

        console.log("Timer useEffect - Start - isActive:", isActive, "createdAt:", currentProcessCreatedAt); // LOG - Timer useEffect start

        if (isActive && mountedRef.current && currentProcessCreatedAt) { // Ensure createdAt is also valid
            timerInterval = setInterval(() => {
                if (!mountedRef.current) {
                    clearInterval(timerInterval);
                    return; // Exit if component unmounted
                }

                const now = moment();
                const elapsedSeconds = now.diff(moment(currentProcessCreatedAt), 'seconds'); // Use createdAt from state
                const totalSeconds = state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds;
                const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
                const formattedTime = formatTime(remainingSeconds); // Format time here

                // Create a *new* object with ONLY the updated timer values
                const timerUpdates = {
                    totalSecondsRemaining: remainingSeconds,
                    formattedTime: formattedTime,
                    totalSeconds
                };

                setProgressRate(formattedTime);

                if (remainingSeconds <= 0) {
                    clearInterval(timerInterval);
                    console.log("Timer useEffect - clearInterval - remainingSeconds <= 0"); // LOG - timer clear - finished
                    // Process completion logic will handle re-initialization if needed
                } else {
                    // Update ONLY the timer related values in currentProcess state - use functional update for safety
                    setState(prev => {
                        // Safely update only if currentProcess is still the same (referential equality check - VERY IMPORTANT for performance)
                        if (prev.currentProcess && prev.currentProcess.id === state.currentProcess.id) { // Check if process ID is the same before updating - CRITICAL for preventing re-renders if process didn't change
                            const updatedProcess = { ...prev.currentProcess, ...timerUpdates }; // Create updated process object
                            const updatedState = { ...prev, currentProcess: updatedProcess }; // Create updated state
                            console.log("Timer useEffect - setState - updatedState.currentProcess.formattedTime:", updatedState.currentProcess?.formattedTime, "remainingSeconds:", remainingSeconds, "processId:", updatedState.currentProcess.id); // LOG - timer setState
                            return updatedState;
                        } else {
                            console.log("Timer useEffect - setState - process ID changed or no currentProcess, skipping update"); // Log when skipping update due to process change
                            return prev; // Return previous state if process ID changed, avoid update if process changed in between timer ticks
                        }
                    });
                }
            }, 1000);
            console.log("Timer useEffect - setInterval started"); // LOG - timer started
        } else {
            clearInterval(timerInterval);
            setProcessStartTime(null);
            setProgressRate(null); // Reset progress when inactive
            console.log("Timer useEffect - clearInterval - process not active or component unmounted or no createdAt"); // LOG - timer cleared - not active or no createdAt
        }

        return () => {
            clearInterval(timerInterval);
            console.log("Timer useEffect - Cleanup - clearInterval"); // LOG - timer cleanup
        };
    }, [state.currentProcess?.active, state.currentProcess?.createdAt, state.currentProcess?.id]); // ADDED createdAt and id to dependency array - CRITICAL: More specific dependency


    // Add a background transition effect
    const renderScene = (content) => (
        <AnimatePresence mode="wait">
            <motion.div
                className="Home"
                key={state.currentProcess?.type || "default"}
                style={{
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    overflow: "hidden",
                }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
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
                    transition={{ duration: 0.3 }}
                    style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        backgroundImage: state.currentProcess?.type
                            ? getBgByCurrentProcess(state.currentProcess.type, state.currentProcess?.type_id)
                            : `url(${Assets.BG.homeBackground})`,
                        backgroundSize: "cover",
                        backgroundPosition: "bottom right",
                        zIndex: 0,
                    }}
                />
                {content}
            </motion.div>
        </AnimatePresence>
    )

    useEffect(() => {
        if (!isInitialized) return

        const initialize = async () => {
            setIsLoading(true)
            console.log("Home Initialize useEffect - Start - isInitialized:", isInitialized); // LOG - Home initialize useEffect start

            if (JSON.stringify(userPersonage) === "{}") {
                navigate("/learning")
                return
            }

            try {
                // Run all initialization tasks in parallel
                await Promise.all([
                    initializeProcess(),
                    preloadImages()
                ]);
                console.log("Home Initialize useEffect - Promise.all completed"); // LOG - promise all

                setState(prev => ({ ...prev, imagesLoaded: true }));
                console.log("Home Initialize useEffect - setState imagesLoaded: true"); // LOG - set imagesLoaded
            } catch (err) {
                console.error('Initialization error:', err);
            } finally {
                setIsLoading(false);
                console.log("Home Initialize useEffect - setIsLoading(false)"); // LOG - set isLoading false
            }
            console.log("Home Initialize useEffect - End"); // LOG - Home initialize useEffect end
        }

        initialize()
    }, [isInitialized])

    const { refreshData } = useUser()

    useVisibilityChange(() => {
        console.log("Visibility Change Hook - visibilityState:", document.visibilityState); // LOG - visibility hook
        if (mountedRef.current && document.visibilityState === 'visible') {
            console.log("Visibility Change Hook - document visible - calling initializeProcess"); // LOG - visibility hook - visible, call init
            refreshData();
            initializeProcess();
        } else {
            console.log("Visibility Change Hook - document not visible, or component unmounted - NOT calling initializeProcess"); // LOG - visibility hook - not visible, skip init
        }
    })

    useWindowFocus(() => {
        console.log("Window Focus Hook - window focused"); // LOG - focus hook
        if (mountedRef.current) {
            console.log("Window Focus Hook - window focused - calling initializeProcess"); // LOG - focus hook - focused, call init
            refreshData();
            initializeProcess();
        } else {
            console.log("Window Focus Hook - window not focused or component unmounted - NOT calling initializeProcess"); // LOG - focus hook - not focused, skip init
        }
    })


    const renderProcessProgressBar = (
        process,
        percentage,
        rate,
        reverse = false
    ) => {
        // Check if process is valid before rendering ProcessProgressBar - to prevent NaN percentage
        if (!process) {
            console.log("renderProcessProgressBar - process INVALID - NOT rendering ProcessProgressBar", process); // LOG - invalid process
            return null; // Do not render if process data is invalid
        }

        console.log("renderProcessProgressBar - process:", process, "percentage:", percentage, "rate:", rate, "hasIconAnimated:", state.hasIconAnimated); // LOG - renderProcessProgressBar
        return (
            <ProcessProgressBar
                activeProcess={process}
                inputPercentage={percentage}
                rate={rate}
                reverse={reverse}
                setIsLoading={setIsLoading}
                hasIconAnimated={state.hasIconAnimated}
                setHasIconAnimated={(newState) => {
                    console.log("Home - setHasIconAnimated called, newState:", newState);
                    setState(prev => ({ ...prev, hasIconAnimated: newState }))
                }}
                unmountSelf={() => setState(prev => ({ ...prev, currentProcess: null }))}
            />
        )
    }


    useEffect(() => {
        if (!isInitialized) return

        const initialize = async () => {
            if (JSON.stringify(userPersonage) === "{}") {
                navigate("/learning")
                return
            }

            try {
                await Promise.all([
                    initializeProcess(),
                    preloadImages()
                ])

                if (mountedRef.current) {
                    setState(prev => ({ ...prev, imagesLoaded: true }))
                    setIsLoading(false)
                }
            } catch (err) {
                console.error('Initialization error:', err)
                if (mountedRef.current) {
                    setIsLoading(false)
                }
            }
        }

        initialize()
    }, [])


    if (isLoading) {
        return <FullScreenSpinner />
    }

    if (!isInitialized) {
        return <FullScreenSpinner />
    } else {
        if (state?.currentProcess === null || state.currentProcess.type === 'skill' || state.currentProcess.type === 'food') {
            return renderScene(
                <>
                    <HomeHeader
                        onClick={() => setState(prev => ({
                            ...prev,
                            visibleSettingsModal: !prev.visibleSettingsModal
                        }))}
                    />
                    <img className="shelf1" src={Assets.HOME.shelf} alt="shelf1" />
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
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="HomeInventory"
                    >
                        {userShelf && (
                            <>
                                <div className="shelf-container1">
                                    {userShelf.flower?.shelf_link && (
                                        <img
                                            className="shelf-flower"
                                            src={userShelf.flower.shelf_link}
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
                                        <img
                                            className="shelf-neko"
                                            src={userShelf.neko.shelf_link}
                                            alt="neko"
                                        />
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
                    </motion.div>
                    {state.visibleWindow && (
                        <Window
                            title={state.currentWindow.title}
                            data={state.currentWindow.data}
                            tabs={state.currentWindow.tabs}
                            onClose={() => setState(prev => ({ ...prev, visibleWindow: false }))}
                        />
                    )}
                </>
            )
        }

        if (state.currentProcess?.type === "work") {
            return renderScene(
                <>
                    <HomeHeader
                        onClick={() => setState(prev => ({
                            ...prev,
                            visibleSettingsModal: !prev.visibleSettingsModal
                        }))}
                    />
                    <Player
                        bottom="calc(-1vh + 141px)"
                        width="39vw"
                        left={"9vw"}
                        top={"35vh"}
                        personage={userPersonage}
                        clothing={userClothing}
                        work
                    />
                    {renderProcessProgressBar(
                        state.currentProcess,
                        countPercentage(moment().diff(moment(state.currentProcess.createdAt), 'second'), state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds),
                        progressRate,
                        true
                    )}
                    <Menu noButton />
                    {state.visibleWindow && (
                        <Window
                            title={state.currentWindow.title}
                            data={state.currentWindow.data}
                            tabs={state.currentWindow.tabs}
                            onClose={() => setState(prev => ({ ...prev, visibleWindow: false }))}
                        />
                    )}
                </>
            )
        }

        if (state.currentProcess?.type === "training") {
            return renderScene(
                <>
                    <HomeHeader
                        onClick={() => setState(prev => ({
                            ...prev,
                            visibleSettingsModal: !prev.visibleSettingsModal
                        }))}
                    />
                    <Player
                        bottom="calc(-1vh + 141px)"
                        width="39vw"
                        left={"9vw"}
                        top={"35vh"}
                        personage={userPersonage}
                        clothing={userClothing}
                        training
                    />
                    {renderProcessProgressBar(
                        state.currentProcess,
                        countPercentage(
                            countPercentage(moment().diff(moment(state.currentProcess.createdAt), 'second'), state.currentProcess.target_duration_in_seconds || state.currentProcess.base_duration_in_seconds),
                        ),
                        progressRate
                    )}
                    <Menu noButton />
                    {state.visibleWindow && (
                        <Window
                            title={state.currentWindow.title}
                            data={state.currentWindow.data}
                            tabs={state.currentWindow.tabs}
                            onClose={() => setState(prev => ({ ...prev, visibleWindow: false }))}
                        />
                    )}
                </>
            )
        }

        if (state.currentProcess?.type === "sleep") {
            return renderScene(
                <>
                    <HomeHeader
                        onClick={() => setState(prev => ({
                            ...prev,
                            visibleSettingsModal: !prev.visibleSettingsModal
                        }))}
                    />
                    <Player
                        bottom={"calc(-468px )"}
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
                        transition={{ duration: 0.3 }}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            bottom: 0,
                            zIndex: 0,
                        }}
                        alt="cover"
                    />
                    {renderProcessProgressBar(
                        state.currentProcess,
                        countPercentage(
                            state.currentProcess?.duration * 60 + state.currentProcess?.seconds,
                            getUserSleepDuration() * 60
                        ),
                        progressRate
                    )}
                    <Menu noButton />
                    {state.visibleWindow && (
                        <Window
                            title={state.currentWindow.title}
                            data={state.currentWindow.data}
                            tabs={state.currentWindow.tabs}
                            onClose={() => setState(prev => ({ ...prev, visibleWindow: false }))}
                        />
                    )}
                </>
            )
        }
    }
}

export default Home