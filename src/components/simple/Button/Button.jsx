import { boxClasses } from "@mui/joy"
import "./Button.css"
import { useState } from "react"
const Button = ({
  width,
  height,
  text,
  icon,
  onClick,
  bgColor,
  ownColor = false,
  active = true,
  shadowColor,
}) => {
  const [boxShadow, setBoxShadow] = useState({
    color: active ? shadowColor || "rgba(9,98,78,1)" : "#453D3F",
    x: 0,
    y: 9,
    blur: 0,
    scale: -3,
  })
  return (
    <button
      onClick={() => {
        onClick && onClick()
      }}
      onMouseDown={() => {
        setBoxShadow({ ...boxShadow, y: boxShadow.y - 5 })
      }}
      onMouseUp={() => {
        setBoxShadow({ ...boxShadow, y: boxShadow.y + 5 })
      }}
      onTouchStart={() => {
        setBoxShadow({ ...boxShadow, y: boxShadow.y - 5 })
      }}
      onTouchEnd={() => {
        setBoxShadow({ ...boxShadow, y: boxShadow.y + 5 })
      }}
      className="Button"
      style={{
        width: width,
        minHeight: height,
        height: height,
        background: active
          ? ownColor
            ? bgColor
            : "linear-gradient(180deg, rgba(46,199,115,1) 0%, rgba(9,98,78,1) 100%)"
          : "#453D3F",
        boxShadow: `${boxShadow.x}px ${boxShadow.y}px ${boxShadow.blur}px ${boxShadow.scale}px ${boxShadow.color}`,
      }}
    >
      {icon && <img src={icon} alt="Button" />}
      <span>{text}</span>
    </button>
  )
}

export default Button
