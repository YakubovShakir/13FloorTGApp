import React from "react"
import "./ProgressBar.css"
import Assets from "../../../assets"

const ProgressBar = ({
  value = undefined,
  percentFill = undefined,
  icon = undefined,
  restore = false,
  width = 100,
  height = 100,
  colorFill,
  isSource
}) => {
  const { Icons } = Assets
  colorFill =  isSource ? (percentFill > 50 ? "#38BF97" : "#DB162F") : colorFill
  return (
    <div
      className="ProgressBar"
      style={{ width: `${width}%`, height: `${height}%` }}
    >
      {icon && <img src={icon} className="ProgressBarIcon" />}
      <div
        className="ProgressBarFill"
        style={{ backgroundColor: `${colorFill}`, width: `${percentFill}%` }}
      ></div>
      <span>{value && value}</span>
      {restore && <img src={Icons.plus} className="ProgressBarRestoreIcon" />}
    </div>
  )
}

export default ProgressBar
