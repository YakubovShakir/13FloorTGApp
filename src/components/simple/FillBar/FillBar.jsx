import "./FillBar.css";

const FillBar = ({ icon, width, percentFill }) => {
  const roundedPercent = Math.round(percentFill);

  const color =
    roundedPercent > 50
      ? ""
      : "#E94E1B";

  return (
    <div className="FillBar" style={{ width: width }}>
      <img src={icon} alt="icon" />
      <div className="FillBarProgress">
        <div
          style={{
            width: `${roundedPercent}%`,
            background: color,
          }}
        ></div>
        <div className="FillBarText">
          {roundedPercent}%
        </div>
      </div>
    </div>
  );
};

export default FillBar;
