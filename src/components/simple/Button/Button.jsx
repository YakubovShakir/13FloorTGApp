import { useSettingsProvider } from "../../../hooks";
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
  active,
  shadowColor,
  fontSize,
  paddingTop,
  paddingBottom = 0,
  fontFamily,
  fontWeight,
  borderColor,
  color, // Новый пропс для цвета текста
  border,
  backdropFilter, // Новый параметр
  iconStyles = {},
  animation,
  strokeText,
  paddingLeft
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const shadowColorValue = active ? (shadowColor || "rgb(199, 80, 21)") : "rgb(24 24 24)";
  const borderColorValue = active ? (borderColor || "rgb(255, 141, 0)") : "rgb(73 73 73)";
  const { playClickSound } = useSettingsProvider()

  return (
    <button
      onClick={() => {
        playClickSound()
        if (onClick) onClick();
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className="Button"
      style={{
        width,
        height,
        // marginTop:"-4px",
        background: active
          ? ownColor
            ? bgColor
            : "rgb(255, 118, 0)"
          : "rgb(65 64 64)",
        boxShadow: `0px ${isPressed ? 3 : 5}px 0px ${shadowColorValue}`,
        transform: isPressed ? "translateY(2px)" : "translateY(0px)",
        color: color || ownColor, // Используем цвет текста из пропсов или ownColor
        border: `1px solid ${borderColorValue}`,
        borderRadius: "5px",
        backdropFilter, // Применяем backdropFilter из пропсов
        WebkitBackdropFilter: backdropFilter, // Для поддержки в Safari,
        animation
      }}
    >
      {icon && <img src={icon} style={iconStyles} alt="Button" />}
      {strokeText && <span style={{ fontSize, paddingTop, fontFamily, fontWeight, paddingBottom, textDecoration: 'line-through', color: 'gray', marginLeft: paddingLeft }}>{strokeText}</span>}<span style={{ fontSize, paddingTop, fontFamily, fontWeight, paddingBottom, paddingLeft: strokeText ? 5 : 0 }}>{text}</span>
    </button>
  );
};

export default Button;
