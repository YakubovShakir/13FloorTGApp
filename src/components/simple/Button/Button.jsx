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
  fontFamily,
  fontWeight,
  borderColor,
  border,
  backdropFilter, // Новый параметр
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const shadowColorValue = active ? shadowColor || "rgb(57, 57, 57)" : "rgb(57, 57, 57)";
  const borderColorValue = active ? borderColor || "rgb(243, 117, 0)" : "rgb(57, 57, 57)";

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
        width,
        height,
        background: active
          ? ownColor
            ? bgColor
            : "linear-gradient(180deg, rgba(46,199,115,1) 0%, rgba(9,98,78,1) 100%)"
          : "linear-gradient(rgb(18 18 18) 5%, rgb(18 18 18) 95%)",
        boxShadow: `0px ${isPressed ? 3 : 5}px 0px ${shadowColorValue}`,
        transform: isPressed ? "translateY(2px)" : "translateY(0px)",
        transition: "box-shadow 0.1s ease, transform 0.1s ease",
        border: `1px solid ${borderColorValue}`,
        borderRadius: "5px",
        backdropFilter, // Применяем backdropFilter из пропсов
        WebkitBackdropFilter: backdropFilter, // Для поддержки в Safari
      }}
    >
      {icon && <img src={icon} alt="Button" />}
      <span style={{ fontSize, paddingTop, fontFamily, fontWeight }}>{text}</span>
    </button>
  );
};

export default Button;
