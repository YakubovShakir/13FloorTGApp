import "./FillBar.css"

const FillBar = ({ icon, width, percentFill }) => {
  const color =
    percentFill > 50
      ? "linear-gradient(180deg, rgba(46,199,115,1) 0%, rgba(9,98,78,1) 100%)"
      : "#E94E1B"

  return (
    <div
      className="FillBar"
      style={{ backgroundColor: "#3B3537", width: width }}
    >
      <img src={icon} alt="icon" />
      <div
        style={{
          background: color,
          width: `${percentFill}%`, // Управляем шириной
          height: "100%", // Полная высота
        }}
      ></div>
    </div>
  )
}

export default FillBar
