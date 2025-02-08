import React, { useRef, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./ProcessProgressBar.css"
import Assets from "../../../assets"
import { getWorks } from "../../../services/work/work"
import { checkCanStop, stopProcess } from "../../../services/process/process"
import UserContext from "../../../UserContext"
import { motion } from "framer-motion"
import FullScreenSpinner from "../../../screens/Home/FullScreenSpinner"
import { useSettingsProvider } from "../../../hooks"

const COIN_SOUND = new Audio(
  "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/coin.mp3"
)
const ALARM_SOUND = new Audio(
  "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/alarm.mp3"
)

const ProcessProgressBar = ({
  activeProcess,
  inputPercentage = null,
  reverse = false,
  rate,
}) => {
  // Early return if required props are missing
  if (!activeProcess || !rate) {
    return null
  }

  const navigate = useNavigate()
  const [percentage, setPercentage] = useState(() => {
    if (activeProcess?.totalSeconds && activeProcess?.totalSecondsRemaining) {
      return (activeProcess.totalSecondsRemaining / activeProcess.totalSeconds) * 100
    }
    return 100
  })
  
  const [labels, setLabels] = useState({
    left: "",
    right: "",
  })
  const [icons, setIcons] = useState({
    left: null,
    right: null,
  })
  const [showModal, setShowModal] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(true)
  const [works, setWorks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { userId } = useContext(UserContext)
  const { lang, isSoundEnabled } = useSettingsProvider()
  const { userParameters } = useContext(UserContext)

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

  const WorkIcon = ({ percentage, hasAnimated }) => {
    return (
      <>
        {!hasAnimated ? (
          <motion.img
            height={20}
            width={20}
            src={Assets.Icons.balance}
            key="animated-balance"
            style={{ position: "absolute", top: 0, left: -16 }}
            initial={{
              y: -50,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
          />
        ) : (
          <img height={20} width={20} src={Assets.Icons.balance} />
        )}
      </>
    )
  }

  const ClockIcon = ({ percentage, hasAnimated }) => {
    const containerVariants = {
      animate: {
        x: [0, 2, 0, 3, 0],
        y: [-2, 2, -1, 1, 0],
        rotate: [-3, 3, -2, 2, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut",
          repeat: 1,
        },
      },
    }

    return (
      <>
        {!hasAnimated ? (
          <motion.div
            style={{ position: "absolute", top: 0, left: -16 }}
            variants={containerVariants}
            animate="animate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img
              height={20}
              width={20}
              src={Assets.Icons.clock}
              alt="Clock Icon"
            />
          </motion.div>
        ) : (
          <img
            height={20}
            width={20}
            src={Assets.Icons.clock}
            alt="Clock Icon"
          />
        )}
      </>
    )
  }

  // Consolidated data loading function
  const loadProgressBarData = async () => {
    try {
      // Load works if not already loaded
      if (works.length === 0) {
        const worksData = await getWorks()
        setWorks(worksData)
      }

      // Find relevant work
      const work = works.find((w) => w?.work_id === activeProcess?.type_id)

      // Set labels based on process type
      const labelMap = {
        work: [
          work?.name[lang] || "",
          `${rate} +${activeProcess?.reward_at_the_end || ""}`,
        ],
        training: [translations.training[lang], rate],
        sleep: [translations.longSleep[lang], rate],
      }

      const [leftLabel, rightLabel] = labelMap[activeProcess.type] || ["", ""]
      
      setLabels({
        left: leftLabel,
        right: rightLabel,
      })

      // Set icons based on process type
      const iconMap = {
        work: [null, Assets.Icons.balance],
        training: [null, Assets.Icons.clock],
        sleep: [null, Assets.Icons.clock],
      }

      const [leftIcon, rightIcon] = iconMap[activeProcess.type] || [null, null]
      
      setIcons({
        left: leftIcon,
        right: rightIcon,
      })
    } catch (error) {
      console.error("Error loading progress bar data:", error)
    }
  }

  // Load initial data
  useEffect(() => {
    loadProgressBarData()
  }, [activeProcess, rate, lang, works.length])

  // Handle progress updates
  useEffect(() => {
    if (!activeProcess?.totalSeconds || !activeProcess?.totalSecondsRemaining) {
      return
    }

    const newPercentage = (activeProcess.totalSecondsRemaining / activeProcess.totalSeconds) * 100
    setPercentage(newPercentage)

    const handleProcessCompletion = async () => {
      setHasAnimated(false)
      setPercentage(0)

      const soundToPlay = activeProcess.type === "work" ? COIN_SOUND : ALARM_SOUND
      if (isSoundEnabled) {
        soundToPlay.play()
      }

      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsLoading(true)
      setHasAnimated(true)

      while (true) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          await checkCanStop(userId)
          break
        } catch (err) {
          if (err.response?.status === 404) break
          await new Promise(resolve => 
            setTimeout(resolve, err.response?.data?.seconds_left * 1000 || 1000)
          )
        }
      }

      setTimeout(() => {
        window.location.href = window.location.origin
      }, 750)
    }

    if (activeProcess.totalSecondsRemaining <= 1) {
      handleProcessCompletion()
    }

    // Check for process completion based on energy
    const checkProcessCompletionByEnergy = async () => {
      const isSleepFullyCharged = 
        activeProcess.type === "sleep" && 
        userParameters?.energy === userParameters?.energy_capacity

      const isWorkOrTrainingExhausted = 
        (activeProcess.type === "work" || activeProcess.type === 'training') && 
        userParameters?.energy === 0

      if (isSleepFullyCharged || isWorkOrTrainingExhausted) {
        setHasAnimated(false)
        const soundToPlay = activeProcess.type === "work" ? COIN_SOUND : ALARM_SOUND
        
        if (isSoundEnabled) {
          soundToPlay.play()
        }

        setTimeout(async () => {
          setIsLoading(true)
          setHasAnimated(true)
          
          while (true) {
            try {
              await new Promise(resolve => setTimeout(resolve, 500))
              await checkCanStop(userId)
              break
            } catch (err) {
              if (err.response?.status === 404) break
              await new Promise(resolve => 
                setTimeout(resolve, err.response?.data?.seconds_left * 1000 || 1000)
              )
            }
          }

          setTimeout(() => {
            window.location.href = window.location.origin
          }, 0)
        }, 1500)
      }
    }

    checkProcessCompletionByEnergy()
  }, [activeProcess, userParameters, isSoundEnabled, userId])

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleConfirmClose = async () => {
    try {
      await stopProcess(userId)
      window.location.href = window.location.origin
    } catch (error) {
      console.error("Error stopping process:", error)
      navigate("/")
    } finally {
      setShowModal(false)
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

  return (
    <div className="progress-bar-container-fixed-top">
      <div className="progress-bar-container">
        <div
          className="progress-bar-wrapper"
          style={{ width: "90%", float: "left" }}
        >
          <div className="progress-bar-header">
            <div className="progress-bar-icon-left">
              {icons.left}
            </div>
            <div className="progress-bar-label-left">{labels.left}</div>
            <div className="progress-bar-label-right">{labels.right}</div>
            <div className="progress-bar-icon-right" style={{ right: "3%" }}>
              {activeProcess?.type === "work" && (
                <WorkIcon
                  percentage={percentage}
                  hasAnimated={hasAnimated}
                  key={"work"}
                />
              )}
              {(activeProcess?.type === "training" || activeProcess?.type === "sleep") && (
                <ClockIcon
                  percentage={percentage}
                  hasAnimated={hasAnimated}
                  key={"clock"}
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
                onClick={() => handleConfirmClose()}
                style={{
                  border: "2px solid rgb(0, 255, 115)",
                  color: "rgb(0, 255, 115)",
                }}
              >
                {translations.yes[lang]}
              </button>
              <button
                onClick={() => handleCloseModal()}
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