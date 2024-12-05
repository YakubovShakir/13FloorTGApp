import Assets from "../../../assets"

import "./IconButton.css"
const IconButton = ({
  icon,
  title = undefined,
  color = "#fff",
  notify = false,
  onClick,
  bgTextColor = "transparent",
  size,
}) => {
  const { Icons } = Assets
  return (
    <button
      onClick={() => onClick()}
      className="IconButton"
    >
      {notify && <img src={Icons.notify} className="IconButtonNotify" />}
      <img src={icon} style={{ backgroundColor: bgTextColor, height: size ? size : undefined, width:  size ? size : undefined }} className="IconButtonImg" />
      {title && <span style={{ backgroundColor: bgTextColor, color: `${color}` }}>{title}</span>}
    </button>
  )
}

export default IconButton
