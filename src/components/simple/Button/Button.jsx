import "./Button.css";
import { useState } from "react";

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
  fontSize,
  paddingTop
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const boxShadow = {
    color: active ? shadowColor || "#0E3228" : "#453D3F",
    y: isPressed ? 2 : 4, // Тень уменьшается при нажатии
    blur: 0,
  };

  return (
    <button
      onClick={() => {
        onClick && onClick();
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)} // Возврат в исходное состояние
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
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
        boxShadow: `0px ${boxShadow.y}px ${boxShadow.blur}px ${boxShadow.color}`,
        transform: isPressed ? "translateY(2px)" : "translateY(0px)", // Одноразовое смещение
        transition: "box-shadow 0.1s ease, transform 0.1s ease", // Плавный переход,
      }}
    >
      {icon && <img src={icon} alt="Button" />}
      <span style={{ fontSize, paddingTop }}>{text}</span>
    </button>
  );
};

export default Button;
