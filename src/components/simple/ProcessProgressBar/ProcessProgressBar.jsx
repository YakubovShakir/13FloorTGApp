import React, { useEffect, useState, useContext} from "react"
import "./ProcessProgressBar.css"
import Assets from "../../../assets"
import { getWorks } from "../../../services/work/work"
import UserContext from "../../../UserContext"


const ProcessProgressBar = ({
  activeProcess = null,
  inputPercentage = null,
  reverse = false,
  rate,
}) => {
  const [percentage, setPercentage] = useState(100);
  const [labelLeft, setLabelLeft] = useState(null);
  const [labelRight, setLabelRight] = useState(null);
  const [iconLeft, setIconLeft] = useState(null);
  const [iconRight, setIconRight] = useState(null);

  const getLabels = async (processType, rate) => {
    const works = await getWorks();
    const work = works?.find((work) => work?.work_id === activeProcess?.type_id);
    const typeToLabel = {
      work: [work?.name, `${"+" +work?.coins_in_hour}/Час`],
      training: ["Training", rate],
      sleep: ["Long Sleep", rate],
    };
  
    return typeToLabel[processType];
  };

  const getIcons = async (processType) => {
    const works = await getWorks();
    const typeToIconsMap = {
      work: [
        <img height={55} width={55} src={works?.find((work) => work?.work_id === activeProcess?.type_id)?.link} />,
        <img height={45} width={45} src={Assets.Icons.balance} />,
      ],
      training: [
        <img
          height={50}
          width={50}
          src={Assets.Icons.training}
          style={{ marginTop: "1px", marginLeft: "7px" }}
        />,
        <img height={40} width={40} src={Assets.Icons.clock} />,
      ],
      sleep: [
        <img
          height={60}
          width={60}
          src={Assets.Icons.sleep}
          style={{ marginTop: "-1px", marginLeft: "0px" }}
        />,
        <img height={40} width={40} src={Assets.Icons.clock} />,
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
    getIcons(activeProcess?.type).then(([left, right]) => {
      setIconLeft(left);
      setIconRight(right);
    });
    getLabels(activeProcess?.type, rate).then(([left, right]) => {
      setLabelLeft(left);
      setLabelRight(right);
    });
  }, [activeProcess, rate]);

  useEffect(() => {
    if (!inputPercentage) setTimeout(() => updatePercentage(), 1000);
  }, [percentage]);

  const currentPercentage = inputPercentage || percentage;
  const displayPercentage = reverse ? 100 - currentPercentage : currentPercentage;
  
  return (
    <div className="progress-bar-container-fixed-top">
      <div className="progress-bar-container">
        <div className="progress-bar-wrapper">
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
                transition: "width 0.3s ease-in-out"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessProgressBar
