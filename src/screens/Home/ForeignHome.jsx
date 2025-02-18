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
import UserContext, { useForeignUser } from "../../UserContext"
import countPercentage from "../../utils/countPercentage"
import { updateProcessTimers } from "../../utils/updateTimers"
import { getLevels } from "../../services/levels/levels"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import FullScreenSpinner from "./FullScreenSpinner"
import getBgByCurrentProcess from "./getBgByCurrentProcess"
import moment from "moment-timezone"
import { useVisibilityChange, useWindowFocus } from "../../hooks/userActivities"
import { formatCoins } from "../../utils/formatCoins"
import { formUsername } from "../../utils/formUsername"
import { useSettingsProvider } from "../../hooks"


const ForeignHome = () => {
    const navigate = useNavigate()
    const mountedRef = useRef(false)
    const { userId = "0" } = useParams()
    const { lang } = useSettingsProvider()
    const [state, setState] = useState({
        currentWindow: null,
        currentProcess: null,
        visibleWindow: false,
        visibleSettingsModal: false,
        trainingParameters: null,
        levels: null,
        isStoppingProcess: false,
        imagesLoaded: false
    })

    const [isLoading, setIsLoading] = useState(true)

    const {
        userParameters,
        isInitialized,
        userPersonage,
        userClothing,
        userShelf,
        refreshData
    } = useForeignUser(userId)

    const getUserSleepDuration = () => {
        const duration = state.levels?.find(
            (level) => level?.level === userParameters?.level
        )?.sleep_duration
        return duration
    }

    useEffect(() => {
        mountedRef.current = true
        refreshData()
        return () => {
            mountedRef.current = false
        }
    }, [])

    const [progressRate, setProgressRate] = useState(null)


    const handleProcessStop = async () => {
        try {
            setState(prev => ({ ...prev, isStoppingProcess: true }))
            await stopProcess(userId)
            if (mountedRef.current) {
                setState(prev => ({
                    ...prev,
                    currentProcess: null,
                    isStoppingProcess: false
                }))
                navigate("/")
            }
        } catch (error) {
            console.error("Error stopping process:", error)
            if (mountedRef.current) {
                setState(prev => ({ ...prev, isStoppingProcess: false }))
            }
        }
    }

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
        try {
            console.warn(Date.now())
            const process = await getUserActiveProcess(userId)

            if (!process) {
                setState(prev => ({ ...prev, currentProcess: null }))
                return
            }

            const [trainingParams, levelsData] = await Promise.all([
                getTrainingParameters(userId),
                getLevels()
            ])

            setState(prev => ({
                ...prev,
                currentProcess: process,
                trainingParameters: trainingParams,
                levels: levelsData
            }))
        } catch (error) {
            console.error("Error initializing process:", error)
            setState(prev => ({ ...prev, currentProcess: null }))
        }
    }

    useEffect(() => {
        if (!isInitialized) return

        const initialize = async () => {
            setIsLoading(true)

            try {
                // Run all initialization tasks in parallel
                await Promise.all([
                    initializeProcess(),
                    preloadImages()
                ])

                setState(prev => ({ ...prev, imagesLoaded: true }))
            } catch (err) {
                console.error('Initialization error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        initialize()
    }, [isInitialized])

    useVisibilityChange(() => {
        console.log(document.visibilityState)
        if (mountedRef.current && document.visibilityState === 'visible') {
            initializeProcess()
            setProgressRate(null) // Force reset progress
        }
    })

    useWindowFocus(() => {
        if (mountedRef.current) {
            initializeProcess()
        }
    })

    if (isLoading) {
        return <FullScreenSpinner />
    }

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
                    style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        backgroundImage: `url(${Assets.BG.homeBackground})`,
                        backgroundSize: "cover",
                        backgroundPosition: "bottom right",
                        zIndex: 0,
                    }}
                />
                {content}
            </motion.div>
        </AnimatePresence>
    )


    if (!isInitialized) {
        return <FullScreenSpinner />
    } else {
        return renderScene(
            <>
                {/* <HomeHeader
                    isForeign={true}
                    onClick={() => setState(prev => ({
                        ...prev,
                        visibleSettingsModal: !prev.visibleSettingsModal
                    }))}
                    key={userId}
                /> */}
                <div style={{ position: 'fixed', textAlign: 'center', width: '100%', color: 'white', top: '15%'}} >
                    <h1>{formUsername(userParameters, lang)}</h1>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 12 }}>
                        <div style={{display: 'flex' }}>
                            <img src={Assets.Icons.balance} width={15}/>
                            <p style={{ paddingLeft: 8 }}>{formatCoins(Math.floor(userParameters.total_earned))}</p>
                        </div>
                        <div style={{display: 'flex' }}>
                            <img src={Assets.Icons.respect} width={15}/>
                            <p style={{ paddingLeft: 8 }}>{formatCoins(userParameters.respect)}</p>
                        </div>
                        <div style={{display: 'flex' }}>
                            <img src={Assets.Icons.levelIcon} width={15}/>
                            <p style={{ paddingLeft: 8 }}>{formatCoins(userParameters.level)}</p>
                        </div>
                    </div>
                </div>
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
                <Menu hasBg={false} isForeign={true}/>
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
            </>
        )
    }
}

export default ForeignHome
