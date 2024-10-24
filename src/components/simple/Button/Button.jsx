import "./Button.css"

const Button = ({
  width,
  height,
  text,
  icon,
  onClick,
  bgColor,
  ownColor = false,
  active = true,
}) => {
  return (
    <button
      onClick={() => {
        onClick && onClick()
      }}
      className="Button"
      style={{
        width: width,
        minHeight: height,
        height: height,
        backgroundColor: ownColor ? bgColor : active ? "#00C200" : "#D9D3C4",
        boxShadow: `0px 9px 4px -5px rgb(49 87 49)`,
      }}
    >
      {icon && <img src={icon} alt="Button" />}
      <span>{text}</span>
    </button>
  )
}

export default Button
