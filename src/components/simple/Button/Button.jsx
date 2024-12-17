import "./Button.css";
import { useEffect, useState } from "react";

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
  borderColor, // Новый параметр для обводки
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const shadowColorValue = active ? shadowColor || "rgb(57, 57, 57)" : "rgb(57, 57, 57)";
  const borderColorValue = active ? borderColor || "rgb(243, 117, 0)" : "rgb(57, 57, 57)"; // Цвет обводки зависит от активности
  
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
        height: height,
        background: active
          ? ownColor
            ? bgColor
            : "linear-gradient(180deg, rgba(46,199,115,1) 0%, rgba(9,98,78,1) 100%)"
          : "linear-gradient(rgb(18 18 18) 5%, rgb(18 18 18) 95%)",
        boxShadow: `0px ${isPressed ? 3 : 5}px 0px ${shadowColorValue}`, // Смещение тени вниз
        transform: isPressed ? "translateY(2px)" : "translateY(0px)", // Смещение кнопки
        transition: "box-shadow 0.1s ease, transform 0.1s ease",
        border: `1px solid ${borderColorValue}`, // Обводка, цвет зависит от состояния кнопки
        borderRadius: "5px", // Скругление углов, можно изменить по необходимости
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
