import "./ProcessBar.css"
import Assets from "../../../assets"

const ProcessBar = ({
  icon,
  title,
  timeLeft,
  lineColor,
  barWidth,
  progressWidth = "100%",
  left,
  top
}) => {
  const { Icons } = Assets

  return (
    <div className="ProcessBar" style={{ width: barWidth, left: left, top: top}} >
      <div className="ProcessBarTitle">
        <img src={icon} alt="ProcIcon" className="ProcessBarIcon" />

        <span>{title}</span>
        <span>{timeLeft} </span>
        <img src={Icons.clock} alt="ClockIcon" className="ProcessBarClock" />
      </div>
      <div
        className="ProcessBarLine"
        style={{ backgroundColor: `${lineColor}`, width: progressWidth }}
      ></div>
    </div>
  )
}

export default ProcessBar
