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
import { getCoinRewardAndColor } from "../../../utils/paramBlockUtils"


const WorkIcon = ({ hasIconAnimated = true, onAnimationComplete }) => {
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
                  onAnimationComplete()
                }}
                onEnded={() => onAnimationComplete()}
            />
        </AnimatePresence>
    );
}

const ClockIcon = ({ hasIconAnimated = true, onAnimationComplete }) => {
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
                    onAnimationComplete()
                  }}
                onEnded={() => onAnimationComplete()}
            >
                <img height={20} width={20} src={Assets.Icons.clock} alt="Clock Icon" />
            </motion.div>
        </AnimatePresence>
    );
}

const ProcessProgressBar = ({
    activeProcess,
    reverse = false,
    rate,
    percentage,
    hasIconAnimated,
    setHasIconAnimated,
    handleConfirmClose
}) => {
    const navigate = useNavigate()
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

    const handleCloseModal = () => setShowModal(false)

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
        <div className="progress-bar-container-fixed-top" style={{ 
            paddingTop: (window.Telegram?.WebApp.safeAreaInset?.top || 0) + 120.5,
            zIndex: 9999999
         }}>
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
                                    fontFamily: "Oswald",
                                    textTransform: "uppercase"
                                }}
                            >
                                {translations.yes[lang]}
                            </button>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    color: "rgb(255, 0, 0)",
                                    border: "2px solid rgb(255, 0, 0)",
                                    fontFamily: "Oswald",
                                     textTransform: "uppercase"
                                    
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