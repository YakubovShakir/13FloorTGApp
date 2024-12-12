import "./FillBar.css";

const FillBar = ({ icon, width, percentFill }) => {
  const roundedPercent = Math.round(percentFill);

  const color =
    roundedPercent > 50
      ? "linear-gradient(180deg, rgba(46,199,115,1) 0%, rgba(9,98,78,1) 100%)"
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
