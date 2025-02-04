import React, { useRef, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProcessProgressBar.css";
import Assets from "../../../assets";
import { getWorks } from "../../../services/work/work";
import Button from "../../simple/Button/Button"
import { useSettingsProvider } from "../../../hooks";
import { checkCanStop, stopProcess } from "../../../services/process/process";
import UserContext, { UserProvider } from "../../../UserContext";
import { motion } from 'framer-motion'
import { getTrainingParameters } from "../../../services/user/user";

const COIN_SOUND = new Audio('https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/coin.mp3')
const ALARM_SOUND = new Audio('https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/alarm.mp3')

const ProcessProgressBar = ({
  activeProcess = null,
  inputPercentage = null,
  reverse = false,
  rate,
  setIsLoading
}) => {
  const navigate = useNavigate();
  const [percentage, setPercentage] = useState(100);
  const [labelLeft, setLabelLeft] = useState(null);
  const [labelRight, setLabelRight] = useState(null);
  const [iconLeft, setIconLeft] = useState(null);
  const [iconRight, setIconRight] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(true)
  const [works, setWorks] = useState(null)

  const { userId } = useContext(UserContext);
  const { lang } = useSettingsProvider();

  const translations = {
    confirm: {
      ru: 'Вы действительно хотите завершить процесс?',
      en: 'Are you sure you want to stop the process?'
    },
    yes: {
      ru: 'Да',
      en: 'Yes'
    },
    no: {
      ru: 'Нет',
      en: 'No'
    },
    training: {
      ru: 'Тренировка',
      en: 'Training'
    },
    longSleep: {
      ru: 'Продолжительный сон',
      en: 'Long Sleep'
    }
  };

  // Also modify the getLabels function to directly use the rate prop
  const getLabels = async (processType) => {
    const work = works?.find((work) => work?.work_id === activeProcess?.type_id);

    const typeToLabel = {
      work: [work?.name[lang], rate + ` +${activeProcess?.reward_at_the_end || ''}`],
      training: [translations.training[lang], rate],
      sleep: [translations.longSleep[lang], rate]
    };

    return typeToLabel[processType];
  };
  
  useEffect(() => {
    if(works === null) {
      getWorks().then(works => setWorks(works));
    }
    if (activeProcess && rate) {
      const loadData = async () => {
        try {
          const [icons, labels] = await Promise.all([
            getIcons(activeProcess.type),
            getLabels(activeProcess.type)
          ]);

          setIconLeft(icons[0]);
          setIconRight(icons[1]);
          setLabelLeft(labels[0]);
          setLabelRight(labels[1]);
        } catch (error) {
          console.error('Error loading progress bar data:', error);
        }
      };

      loadData();
    }

    // if(activeProcess === null && rate === '00:00') {
    //   window.location.href = window.location.origin
    // }
  }, [rate]); // Add rate to dependencies


  const { isSoundEnabled } = useSettingsProvider()

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
          ): <img 
          height={20} 
          width={20} 
          src={Assets.Icons.balance}
        />}
      </>
    );
  }
  
  const ClockIcon = ({ percentage, hasAnimated }) => {
    const containerVariants = {
      animate: {
        x: [0, 2, 0, 3, 0], // Subtle horizontal movement
        y: [-2, 2, -1, 1, 0], // Subtle vertical movement
        rotate: [-3, 3, -2, 2, 0], // Subtle rotation
        transition: {
          duration: 0.5, // Shorter duration for a snappier shake
          ease: "easeInOut", // More natural easing
          repeat: 1,       // Shake once
        },
      },
    };
  
    return (
      <>
        {!hasAnimated ? (
          <motion.div
            style={{ position: "absolute", top: 0, left: -16 }} // Keep positioning
            variants={containerVariants}
            animate="animate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img height={20} width={20} src={Assets.Icons.clock} alt="Clock Icon" /> {/* Add alt text */}
          </motion.div>
        ) : (
          <img height={20} width={20} src={Assets.Icons.clock} alt="Clock Icon" />
        )}
      </>
    );
  };

  const getIcons = async (processType) => {
    const typeToIconsMap = {
      work: [
        null
      ],
      training: [
        null
      ],
      sleep: [
        null
      ],
    };
    return typeToIconsMap[processType];
  };

  // Single responsibility for progress updates
  useEffect(() => {
    const newPercentage = activeProcess.totalSecondsRemaining / activeProcess.totalSeconds * 100
    setPercentage(newPercentage);
    if(activeProcess.totalSecondsRemaining <= 1) {
      setHasAnimated(false)
  
      let soundToPlay
        if(activeProcess.type === 'work') {
          soundToPlay = COIN_SOUND
        }

        if(activeProcess.type === 'sleep') {
          soundToPlay = ALARM_SOUND
        }

        if(activeProcess.type === 'training') {
          soundToPlay = ALARM_SOUND
        }
        
      
      setPercentage(0)
      if(isSoundEnabled) {
        soundToPlay.play()
      }

      const id = setTimeout(async () => {
        setIsLoading(true)
        setHasAnimated(true)
        
          while(true) {
            try {
              await checkCanStop(userId)
              break
            } catch(err) {
              await new Promise((resolve) => setTimeout(resolve, err * 1000))
            }
          }

          setTimeout(() => {window.location.href = window.location.origin}, 1500)
      },2000)

      return () => clearTimeout(id)
    }
  }, [activeProcess]);

  const displayPercentage = reverse ? 100 - percentage : percentage;

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmClose = async () => {
    try {
      await stopProcess(userId);
      window.location.href = window.location.origin;
    } catch (error) {
      console.error('Error stopping process:', error);
      navigate('/');
    } finally {
      setShowModal(false);
    }
  };

  if(activeProcess) {
    return (
      <div className="progress-bar-container-fixed-top">
        <div className="progress-bar-container" style={{}}>
          <div className="progress-bar-wrapper" style={{ width: "90%", float: "left" }}>
            <div className="progress-bar-header">
              <div className="progress-bar-icon-left">{iconLeft && iconLeft}</div>
              <div className="progress-bar-label-left">{labelLeft}</div>
              <div className="progress-bar-label-right">{labelRight}</div>
              <div
                className="progress-bar-icon-right"
                style={{ right: '3%' }}
              >
                {/* {iconRight && iconRight} */}
                { activeProcess?.type === 'work' && <WorkIcon percentage={percentage} hasAnimated={hasAnimated} key={'work'}/>}
                { activeProcess?.type === 'training' && <ClockIcon percentage={percentage} hasAnimated={hasAnimated} key={'work'}/>}
                { activeProcess?.type === 'sleep' && <ClockIcon percentage={percentage} hasAnimated={hasAnimated} key={'work'}/>}
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
  
          {/* Кнопка, которая не является частью прогресс бара */}
          <div style={{ width: "10%", float: "left", position: "relative" }}>
            <button
              className="process-action-button"
              onClick={() => setShowModal(true)} // Показываем модальное окно при нажатии
              style={{
  
  
                width: "32px", // Кнопка занимает всю оставшуюся ширину
                backgroundColor: "rgb(0 0 0 / 52%)",
                backdropFilter: " blur(5px)",
                color: "rgb(255, 0, 0)",
                border: "2px solid rgb(255, 0, 0)",
  
                borderRadius: "5px",
                fontSize: "20px",
                cursor: "pointer",
                height: "32px", // Задаем фиксированную высоту кнопки
                position: "absolute", // Абсолютное позиционирование кнопки
                bottom: "0", // Кнопка располагается внизу
              }}
            >
              X
            </button>
          </div>
        </div>
  
        {/* Всплывающее окно */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <p>{translations.confirm[lang]}</p>
              <div className="modal-buttons">
                <button onClick={() => handleConfirmClose()}
                  style={{
                    border: "2px solid rgb(0, 255, 115)",
                    color: "rgb(0, 255, 115)",
                  }}
                >{translations.yes[lang]}</button>
                <button onClick={() => handleCloseModal()}
  
                  style={{
                    color: "rgb(255, 0, 0)",
                    border: "2px solid rgb(255, 0, 0)",
  
                  }}
                >{translations.no[lang]}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default ProcessProgressBar;
