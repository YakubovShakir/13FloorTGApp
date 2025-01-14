import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProcessProgressBar.css";
import Assets from "../../../assets";
import { getWorks } from "../../../services/work/work";
import Button from "../../simple/Button/Button"
import { useSettingsProvider } from "../../../hooks";
import { stopProcess } from "../../../services/process/process";
import UserContext, { UserProvider } from "../../../UserContext";

const ProcessProgressBar = ({
  activeProcess = null,
  inputPercentage = null,
  reverse = false,
  rate,
}) => {
  const navigate = useNavigate();
  const [percentage, setPercentage] = useState(100);
  const [labelLeft, setLabelLeft] = useState(null);
  const [labelRight, setLabelRight] = useState(null);
  const [iconLeft, setIconLeft] = useState(null);
  const [iconRight, setIconRight] = useState(null);
  const [showModal, setShowModal] = useState(false); // Состояние для отображения модального окна

  const { userId, fetchParams } = useContext(UserContext)
  const { lang } = useSettingsProvider()

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
    }
  }

  const getLabels = async (processType, rate) => {
    const works = await getWorks();
    const work = works?.find((work) => work?.work_id === activeProcess?.type_id);
    const typeToLabel = {
      work: [work?.name[lang], `${"+" + work?.coins_in_hour}/` + (lang === 'en' ? 'Hour' : 'Час')],
      training: ["Training", rate],
      sleep: ["Long Sleep", rate],
    };

    return typeToLabel[processType];
  };

  const getIcons = async (processType) => {
    const works = await getWorks();
    const typeToIconsMap = {
      work: [
        // <img height={45} width={45} src={works?.find((work) => work?.work_id === activeProcess?.type_id)?.link} />,
        <img height={20} width={20} src={Assets.Icons.balance} />,
      ],
      training: [
        // <img
        //   height={50}
        //   width={50}
        //   src={Assets.Icons.training}
        //   style={{ marginTop: "1px", marginLeft: "7px" }}
        // />,
        <img height={20} width={20} src={Assets.Icons.clock} />,
      ],
      sleep: [
        // <img
        //   height={60}
        //   width={60}
        //   src={Assets.Icons.sleep}
        //   style={{ marginTop: "-1px", marginLeft: "0px" }}
        // />,
        <img height={20} width={20} src={Assets.Icons.clock} />,
      ],
    };
    return typeToIconsMap[processType];
  };

  const updatePercentage = () => {
    if (percentage === 0) setPercentage(100);
    else {
      setPercentage((prevPercentage) => prevPercentage - 2);
    }
  };

  useEffect(() => {
    if (!inputPercentage) {
      updatePercentage();
    }
  }, []);

  useEffect(() => {
    if (activeProcess) {
      getIcons(activeProcess?.type).then(([left, right]) => {
        setIconLeft(left);
        setIconRight(right);
      });
      getLabels(activeProcess?.type, rate).then(([left, right]) => {
        setLabelLeft(left);
        setLabelRight(right);
      });
    }
  }, [activeProcess, rate]);

  useEffect(() => {
    if (!inputPercentage) setTimeout(() => updatePercentage(), 1000);
  }, [percentage]);

  const currentPercentage = inputPercentage || percentage;
  const displayPercentage = reverse ? 100 - currentPercentage : currentPercentage;

  const handleCloseModal = () => {
    navigate('/#');
    setShowModal(false);
  };

  const handleConfirmClose = async () => {
    await stopProcess(userId)
    await fetchParams()
    setShowModal(false);
    navigate('/');
  };

  if (!activeProcess) {
    return null;
  }

  return (
    <div className="progress-bar-container-fixed-top">
      <div className="progress-bar-container" style={{ }}>
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
              backdropFilter:" blur(5px)",
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
              <button onClick={handleCloseModal}
              
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
