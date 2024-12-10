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
  const [isPressed, setIsPressed] = useState(false);
  const shadowColorValue = active ? shadowColor || "#0E3228" : "#453D3F";

  return (
    <button
      onClick={() => {
        if (onClick) onClick();
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className="Button"
      style={{
        width: width,
        
        background: active
          ? ownColor
            ? bgColor
            : "linear-gradient(180deg, rgba(46,199,115,1) 0%, rgba(9,98,78,1) 100%)"
          : "linear-gradient(180deg, rgba(79,71,74,1) 5%, rgba(89,82,84,1) 65%)",
        boxShadow: `0px ${isPressed ? 3 : 5}px 0px ${shadowColorValue}`, // Смещение тени вниз
        transform: isPressed ? "translateY(2px)" : "translateY(0px)", // Смещение кнопки
        transition: "box-shadow 0.1s ease, transform 0.1s ease",
      }}
    >
      {icon && <img src={icon} alt="Button" />}
      <span style={{ fontSize, paddingTop, fontFamily, fontWeight }}>
        {text}
      </span>
    </button>
  );
};

export default Button;
