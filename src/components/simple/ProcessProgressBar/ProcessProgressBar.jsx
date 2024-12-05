import React, { useEffect, useState } from "react"
import "./ProcessProgressBar.css"
import Assets from "../../../assets"
import { getActiveProcess } from "../../../services/process/process"

const getIcons = (processType) => {
  const typeToIconsMap = {
    work: [
      <img height={45} width={45} src={Assets.Icons.boss} />,
      <img height={35} width={35} src={Assets.Icons.balance} />,
    ],
    training: [
      <img
        height={40}
        width={40}
        src={Assets.Icons.training}
        style={{ marginTop: "5px", marginLeft: "10px" }}
      />,
      <img height={40} width={40} src={Assets.Icons.clock} />,
    ],
    sleep: [
      <img
        height={55}
        width={55}
        src={Assets.Icons.sleep}
        style={{ top: "-2.7%" }}
      />,
      <img height={40} width={40} src={Assets.Icons.clock} />,
    ],
  }

  return typeToIconsMap[processType]
}

const getLabels = (processType, rate) => {
  const typeToLabel = {
    work: ["Boss"],
    training: ["Training", rate],
    sleep: ["Long Sleep", rate],
  }

  return typeToLabel[processType]
}

const ProcessProgressBar = ({
  activeProcess = "working",
  inputPercentage = null,
  reverse = false,
  rate,
}) => {
  const [iconLeft, iconRight] = getIcons(activeProcess)
  const [labelLeft, labelRight] = getLabels(activeProcess, rate)
  const [percentage, setPercentage] = useState(100)

  const updatePercentage = () => {
    if (percentage === 0) setPercentage(100)
    else {
      setPercentage((prevPercentage) => prevPercentage - 2)
    }
  }
  useEffect(() => {
    if (!inputPercentage) {
      updatePercentage()
    }
  }, [])

  useEffect(() => {
    if (!inputPercentage) setTimeout(() => updatePercentage(), 1000)
      console.log(percentage, "get perc")
  }, [percentage])

  useEffect(() => console.log(percentage), [percentage])
  return (
    <div className="progress-bar-container-fixed-top">
      <div className="progress-bar-container">
        <div className="progress-bar-wrapper">
          <div className="progress-bar-header">
            <div className="progress-bar-icon-left">{iconLeft}</div>
            <div className="progress-bar-label-left">{labelLeft}</div>
            <div className="progress-bar-label-right">{labelRight}</div>
            <div
              className="progress-bar-icon-right"
              style={{ top: "-5px", right: "-4%" }}
            >
              {iconRight}
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${inputPercentage || percentage}%`,
                marginLeft: reverse ? `${100 - percentage}%` : "0",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessProgressBar
