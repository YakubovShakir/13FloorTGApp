import React, { useRef, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProcessProgressBar.css";
import Assets from "../../../assets";
import { getWorks } from "../../../services/work/work";
import Button from "../../simple/Button/Button"
import { useSettingsProvider } from "../../../hooks";
import { stopProcess } from "../../../services/process/process";
import UserContext, { UserProvider } from "../../../UserContext";
import { motion } from 'framer-motion'
import { getTrainingParameters } from "../../../services/user/user";

const useWorks = () => {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    const fetchWorks = async () => {
      const fetchedWorks = await getWorks();
      setWorks(fetchedWorks);
    };
    fetchWorks();
  }, []);

  const getLabels = (processType, activeProcess, lang, rate, translations) => {
    const work = works?.find((work) => work?.work_id === activeProcess?.type_id);

    const typeToLabel = {
      work: [work?.name[lang], `+${work?.coins_in_hour}/${lang === 'en' ? 'HOUR' : 'ЧАС'}`],
      training: [translations.training[lang], rate],
      sleep: [translations.longSleep[lang], rate]
    };

    return typeToLabel[processType];
  };

  return { works, getLabels };
};


const ProcessProgressBar = ({
  activeProcess = null,
  inputPercentage = null,
  reverse = false,
  rate,
}) => {
  const navigate = useNavigate();
  const [percentage, setPercentage] = useState(inputPercentage || 100);
  const [labelLeft, setLabelLeft] = useState(null);
  const [labelRight, setLabelRight] = useState(null);
  const [iconLeft, setIconLeft] = useState(null);
  const [iconRight, setIconRight] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false)
  const timerRef = useRef(null);

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
    const works = await getWorks();
    const work = works?.find((work) => work?.work_id === activeProcess?.type_id);

    const typeToLabel = {
      work: [work?.name[lang], `+${work?.coins_in_hour}/${lang === 'en' ? 'HOUR' : 'ЧАС'}`],
      training: [translations.training[lang], rate],
      sleep: [translations.longSleep[lang], rate]
    };

    return typeToLabel[processType];
  };
  
  useEffect(() => {
    if (activeProcess) {
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
  }, [activeProcess, rate]); // Add rate to dependencies


  const { isSoundEnabled } = useSettingsProvider()

  const WorkIcon = ({ percentage, hasAnimated }) => {  
    return (
      <>
        <img 
          height={20} 
          width={20} 
          src={Assets.Icons.balance} 
          style={{ position: "absolute", top: 0, left: -16 }} 
        />
        {percentage < 1 && !hasAnimated && (
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
          )}
      </>
    );
  }

  const getIcons = async (processType) => {
    const typeToIconsMap = {
      work: [

        <WorkIcon percentage={percentage} hasAnimated={hasAnimated} key={'work'}/>
        // /> : <img height={20} width={20} src={Assets.Icons.balance} key="balance" />,
      ],
      training: [
        <img height={20} width={20} src={Assets.Icons.clock} key="clock-training" />,
      ],
      sleep: [
        <img height={20} width={20} src={Assets.Icons.clock} key="clock-sleep" />,
      ],
    };
    return typeToIconsMap[processType];
  };

  useEffect(() => {
    if(percentage < 1) {
      if(isSoundEnabled) {
        new Audio('https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/coin.mp3').play()
      }
      const id = setTimeout(() => {
        setHasAnimated(true)
      },1000)

      return () => clearTimeout(id)
    }

    if(percentage > 1) {
      setHasAnimated(false)
    } 
  }, [percentage])

  // Single responsibility for progress updates
  useEffect(() => {
    if (inputPercentage !== null) {
      setPercentage(inputPercentage);
      return; // Don't start the timer if we have an input percentage
    }

    const updateProgress = () => {
      setPercentage(prev => {
        if (prev <= 0) return 100;
        return prev - 1;
      });
    };

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start new timer
    timerRef.current = setInterval(updateProgress, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [inputPercentage]);

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

  if (!activeProcess) {
    return null;
  }

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
              style={{ top: "-5px", right: "-4%" }}
            >
              {iconRight && iconRight}
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
};

export default ProcessProgressBar;
