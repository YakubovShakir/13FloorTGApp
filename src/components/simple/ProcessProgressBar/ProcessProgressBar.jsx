import React, { useRef, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./ProcessProgressBar.css"
import Assets from "../../../assets"
import { getWorks } from "../../../services/work/work"
import { checkCanStop, stopProcess } from "../../../services/process/process"
import UserContext, { useUser } from "../../../UserContext"
import { motion, AnimatePresence } from "framer-motion"
import FullScreenSpinner from "../../../screens/Home/FullScreenSpinner"
import { useSettingsProvider } from "../../../hooks"

// Pre-load audio files
const COIN_SOUND = new Audio(
    "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/coin.mp3"
)
const ALARM_SOUND = new Audio(
    "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/alarm.mp3"
)

// Ensure audio files are loaded
COIN_SOUND.load()
ALARM_SOUND.load()

const ProcessProgressBar = ({
    activeProcess,
    inputPercentage = null,
    reverse = false,
    rate,
    hasIconAnimated,
    setHasIconAnimated,
    unmountSelf,
}) => {
    const navigate = useNavigate()
    const [percentage, setPercentage] = useState(() => {
        if (!activeProcess || typeof activeProcess.totalSecondsRemaining !== 'number' || typeof activeProcess.totalSeconds !== 'number') {
            return NaN; // or 0, depending on desired default
        }
        return (activeProcess.totalSecondsRemaining / activeProcess.totalSeconds) * 100;
    });
    const [labels, setLabels] = useState({ left: "", right: "" })
    const [icons, setIcons] = useState({ left: null, right: null })
    const [showModal, setShowModal] = useState(false)
    const [works, setWorks] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const { userId } = useContext(UserContext)
    const { lang, isSoundEnabled } = useSettingsProvider()
    const { userParameters } = useContext(UserContext)
    const animationComplete = useRef(false)

    console.log("ProcessProgressBar Render - hasIconAnimated:", hasIconAnimated,
        "activeProcess:", activeProcess,
        "totalSecondsRemaining:", activeProcess?.totalSecondsRemaining,
        "totalSeconds:", activeProcess?.totalSeconds,
        "percentage:", percentage,
        "animationComplete:", animationComplete.current);


    const translations = {
        confirm: {
            ru: "Вы действительно хотите завершить процесс?",
            en: "Are you sure you want to stop the process?",
        },
        yes: {
            ru: "Да",
            en: "Yes",
        },
        no: {
            ru: "Нет",
            en: "No",
        },
        training: {
            ru: "Тренировка",
            en: "Training",
        },
        longSleep: {
            ru: "Продолжительный сон",
            en: "Long Sleep",
        },
    }

    const WorkIcon = ({ onAnimationComplete }) => {
        console.log("WorkIcon Render - shouldAnimate:", hasIconAnimated);
        if (hasIconAnimated) {
            return <img height={20} width={20} src={Assets.Icons.balance} alt="Balance Icon" />;
        }

        return (
            <AnimatePresence>
                <motion.img
                    height={20}
                    width={20}
                    src={Assets.Icons.balance}
                    key="animated-balance"
                    style={{ position: "absolute", top: 0, left: -16 }}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    onAnimationComplete={() => {
                      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
                      onAnimationComplete()
                    }}
                    onEnded={() => console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')}
                />
            </AnimatePresence>
        );
    }

    const ClockIcon = ({ shouldAnimate, onAnimationComplete }) => {
        console.log("ClockIcon Render - shouldAnimate:", shouldAnimate);
        if (hasIconAnimated) {
            return <img height={20} width={20} src={Assets.Icons.clock} alt="Clock Icon" />;
        }

        return (
            <AnimatePresence>
                <motion.div
                    style={{ position: "absolute", top: 0, left: -16 }}
                    animate={{
                        x: [0, 2, 0, 3, 0],
                        y: [-2, 2, -1, 1, 0],
                        rotate: [-3, 3, -2, 2, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                        repeat: 1,
                    }}
                    onAnimationComplete={() => {
                        console.log("ClockIcon - onAnimationComplete callback");
                        onAnimationComplete();
                    }}
                >
                    <img height={20} width={20} src={Assets.Icons.clock} alt="Clock Icon" />
                </motion.div>
            </AnimatePresence>
        );
    }

    const playSound = async (type) => {
        if (!isSoundEnabled) return

        const sound = type === "work" ? COIN_SOUND : ALARM_SOUND
        try {
            await sound.play()
        } catch (error) {
            console.error("Error playing sound:", error)
        }
    }

    const { refreshData } = useUser()

    const handleProcessCompletion = async () => {
        console.log("handleProcessCompletion - entry, animationComplete:", animationComplete.current, "hasIconAnimated:", hasIconAnimated);
        if (animationComplete.current) {
            console.log("handleProcessCompletion - early return due to animationComplete.current");
            return;
        }
        setHasIconAnimated(false);
        console.log('handleProcessCompletion - setHasIconAnimated(false)');
        setPercentage(0);
        await playSound(activeProcess.type)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setHasIconAnimated(true)
        console.log('handleProcessCompletion - setHasIconAnimated(true)');
        // setHasAnimated(false); // Remove

        setIsLoading(true)
  
        while (true) {
            try {
                await new Promise(resolve => setTimeout(resolve, 500))
                await checkCanStop(userId)
                break
            } catch (err) {
                await new Promise(resolve =>
                    setTimeout(resolve, err.response?.data?.seconds_left * 1000 || 1000)
                )
            }
        }

        setTimeout(() => {
          
          refreshData().finally(() => {
            setIsLoading(false)
            unmountSelf()
          })
            // window.location.href = window.location.origin
        }, 750)
    }

    // Load initial data
    useEffect(() => {
        const loadProgressBarData = async () => {
            try {
                if (works.length === 0) {
                    const worksData = await getWorks()
                    setWorks(worksData)
                }

                const work = works.find((w) => w?.work_id === activeProcess?.type_id)

                const labelMap = {
                    work: [
                        work?.name[lang] || "",
                        `${rate} +${activeProcess?.reward_at_the_end || ""}`,
                    ],
                    training: [translations.training[lang], rate],
                    sleep: [translations.longSleep[lang], rate],
                }

                const [leftLabel, rightLabel] = labelMap[activeProcess.type] || ["", ""]
                setLabels({ left: leftLabel, right: rightLabel })

                const iconMap = {
                    work: [null, Assets.Icons.balance],
                    training: [null, Assets.Icons.clock],
                    sleep: [null, Assets.Icons.clock],
                }

                const [leftIcon, rightIcon] = iconMap[activeProcess.type] || [null, null]
                setIcons({ left: leftIcon, right: rightIcon })
            } catch (error) {
                console.error("Error loading progress bar data:", error)
            }
        }

        loadProgressBarData()
        console.log("useEffect [activeProcess, rate, works.length, lang] - loadProgressBarData triggered");
    }, [activeProcess, rate, works.length, lang])

    // Handle progress updates
    useEffect(() => {
        if (!activeProcess || !activeProcess.totalSeconds || !activeProcess.totalSecondsRemaining) {
            console.log("useEffect [activeProcess] - early return - activeProcess, totalSeconds or totalSecondsRemaining invalid:", activeProcess);
            return
        }

        if (typeof activeProcess.totalSecondsRemaining !== 'number' || typeof activeProcess.totalSeconds !== 'number') {
            console.error("useEffect [activeProcess] - totalSecondsRemaining or totalSeconds is not a number:", activeProcess);
            return; // Prevent further execution if these are not numbers
        }


        const newPercentage = (activeProcess.totalSecondsRemaining / activeProcess.totalSeconds) * 100
        setPercentage(newPercentage)
        console.log("useEffect [activeProcess] - percentage updated to:", newPercentage,
            "totalSecondsRemaining:", activeProcess.totalSecondsRemaining,
            "totalSeconds:", activeProcess.totalSeconds);


        if (activeProcess.totalSecondsRemaining <= 1) {
            console.log("useEffect [activeProcess] - handleProcessCompletion triggered, animationComplete:", animationComplete.current);
            handleProcessCompletion()
        }

        // Check for process completion based on energy
        const checkProcessCompletionByEnergy = async () => {
            const isSleepFullyCharged =
                activeProcess.type === "sleep" &&
                userParameters?.energy === userParameters?.energy_capacity

            const isWorkOrTrainingExhausted =
                (activeProcess.type === "work" || activeProcess.type === 'training') &&
                (userParameters?.energy === 0 || userParameters?.hungry === 0)

            if ((isSleepFullyCharged || isWorkOrTrainingExhausted) && !animationComplete.current) {
                handleProcessCompletion()
            }
        }

        checkProcessCompletionByEnergy()
    }, [activeProcess, userParameters, userId])

    const handleCloseModal = () => setShowModal(false)

    const handleConfirmClose = async () => {
        try {
            await stopProcess(userId)
        } catch (error) {
            console.error("Error stopping process:", error)
        } finally {
            setShowModal(false)
            unmountSelf()
        }
    }

    if (isLoading) {
        return (
            <div
                style={{
                    position: "fixed",
                    left: 0,
                    bottom: 0,
                    height: "100vh",
                    width: "100vw",
                    zIndex: 300000,
                }}
            >
                <FullScreenSpinner />
            </div>
        )
    }

    const displayPercentage = reverse ? 100 - percentage : percentage

    if (!activeProcess || !rate) {
        return null
    }

    return (
        <div className="progress-bar-container-fixed-top">
            <div className="progress-bar-container">
                <div className="progress-bar-wrapper" style={{ width: "90%", float: "left" }}>
                    <div className="progress-bar-header">
                        <div className="progress-bar-icon-left">{icons.left}</div>
                        <div className="progress-bar-label-left">{labels.left}</div>
                        <div className="progress-bar-label-right">{labels.right}</div>
                        <div className="progress-bar-icon-right" style={{ right: "3%" }}>
                            {activeProcess?.type === "work" && (
                                <WorkIcon
                                    shouldAnimate={!hasIconAnimated}
                                    key="work"
                                    onAnimationComplete={() => {
                                        animationComplete.current = true
                                        setHasIconAnimated(true)
                                        console.log("WorkIcon - onAnimationComplete - setHasIconAnimated(true) called");
                                    }}
                                />
                            )}
                            {(activeProcess?.type === "training" || activeProcess?.type === "sleep") && (
                                <ClockIcon
                                    shouldAnimate={!hasIconAnimated}
                                    key="clock"
                                    onAnimationComplete={() => {
                                        animationComplete.current = true
                                        setHasIconAnimated(true)
                                        console.log("ClockIcon - onAnimationComplete - setHasIconAnimated(true) called");
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${displayPercentage}%`,
                                transition: "width 0.3s ease-in-out",
                            }}
                        />
                    </div>
                </div>

                <div style={{ width: "10%", float: "left", position: "relative" }}>
                    <button
                        className="process-action-button"
                        onClick={() => setShowModal(true)}
                        style={{
                            width: "32px",
                            backgroundColor: "rgb(0 0 0 / 52%)",
                            backdropFilter: "blur(5px)",
                            color: "rgb(255, 0, 0)",
                            border: "2px solid rgb(255, 0, 0)",
                            borderRadius: "5px",
                            fontSize: "20px",
                            cursor: "pointer",
                            height: "32px",
                            position: "absolute",
                            bottom: "0",
                        }}
                    >
                        X
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>{translations.confirm[lang]}</p>
                        <div className="modal-buttons">
                            <button
                                onClick={handleConfirmClose}
                                style={{
                                    border: "2px solid rgb(0, 255, 115)",
                                    color: "rgb(0, 255, 115)",
                                }}
                            >
                                {translations.yes[lang]}
                            </button>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    color: "rgb(255, 0, 0)",
                                    border: "2px solid rgb(255, 0, 0)",
                                }}
                            >
                                {translations.no[lang]}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProcessProgressBar