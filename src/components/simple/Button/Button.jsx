import "./Button.css"
import { useEffect, useState } from "react"
const Button = ({
  width,
  height,
  text,
  icon,
  onClick,
  bgColor,
  ownColor = false,
  active,
  shadowColor,
  fontSize,
  paddingTop,
  fontFamily,
  fontWeight,
}) => {
  const [boxShadow, setBoxShadow] = useState(null)
  useEffect(() => {
    setBoxShadow({
      color: active ? shadowColor || "#0E3228" : "#453D3F",
      x: 0,
      y: 5,
      blur: 0,
      scale: -3,
    })
  }, [active, shadowColor])
  const [isPressed, setIsPressed] = useState(false)
  return (
    <button
      onClick={() => {
        setIsPressed(true)
        if (onClick) {
          onClick()
        }
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
        boxShadow: `0px ${boxShadow?.y}px ${boxShadow?.blur}px ${boxShadow?.color}`,
        transform: isPressed ? "translateY(2px)" : "translateY(0px)", // Одноразовое смещение
        transition: "box-shadow 0.1s ease, transform 0.1s ease", // Плавный переход,
      }}
    >
      {icon && <img src={icon} alt="Button" />}
      <span style={{ fontSize, paddingTop, fontFamily, fontWeight }}>
        {text}
      </span>
    </button>
  )
}

export default Button
