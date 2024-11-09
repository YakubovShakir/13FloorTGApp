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
    color: active ? shadowColor || "#0E3228" : "#453D3F",
    x: 0,
    y: 5,
    blur: 0,
    scale: 0,
  })
  return (
    <button
      onClick={() => {
        onClick && onClick()
      }}
      onMouseDown={() => {
        setBoxShadow({ ...boxShadow, y: boxShadow.y - 2 })
      }}
      onMouseUp={() => {
        setBoxShadow({ ...boxShadow, y: boxShadow.y + 2 })
      }}
      onTouchStart={() => {
        setBoxShadow({ ...boxShadow, y: boxShadow.y - 2 })
      }}
      onTouchEnd={() => {
        setBoxShadow({ ...boxShadow, y: boxShadow.y + 2 })
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
          : "linear-gradient(180deg, rgba(79,71,74,1) 5%, rgba(89,82,84,1) 65%)",
        boxShadow: `${boxShadow.x}px ${boxShadow.y}px ${boxShadow.blur}px ${boxShadow.scale}px ${boxShadow.color}`,
      }}
    >
      {icon && <img src={icon} alt="Button" />}
      <span>{text}</span>
    </button>
  )
}

export default Button
