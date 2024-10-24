import "./ActionCard.css"
import Assets from "../../../assets"
import Button from "../../simple/Button/Button"
const ActionCard = ({
  cardWidth = undefined,
  cardHeight = undefined,
  backgroundImage = undefined,
  title,
  icon,
  sourceParams = undefined,
  duration,
  cost,
  buttons,
  type = undefined,
}) => {
  const { Icons } = Assets
  return (
    <div
      style={{
        maxHeight: `${cardHeight}`,
        width: `${cardWidth}`,
        backgroundImage: `url(${backgroundImage})`,
      }}
      className={
        "ActionCard" + (backgroundImage != undefined ? " ActionCardBG" : "")
      }
    >
      <div className="ActionCardLogo">
        <img src={icon} alt="cardIcon" />
      </div>
      <div className="ActionCardData">
        <div className="ActionCardDataTitle">{title}</div>
        <div className="ActionCardDataSource">
          {sourceParams &&
            Object.keys(sourceParams).map((key, index) => (
              <div key={index} style={{ color: `${sourceParams[key]?.color}` }}>
                <img src={sourceParams[key].icon} alt="sourceIcon" />
                <span>{sourceParams[key].value}</span>
              </div>
            ))}
        </div>
        {cost && (
          <div className="ActionCardDataCost">
            <img src={Icons.balance} alt="coinIcon" />
            <span>{cost}</span>
          </div>
        )}
        {duration && (
          <div className="ActionCardDataDuration">
            <img src={Icons.clock} alt="clockIcon" />
            <span>{duration}</span>
          </div>
        )}
      </div>
      <div className="ActionCardButtons">
        {buttons &&
          type != "unavailable" &&
          buttons.map((button, index) => (
            <Button
              key={index}
              width={"40%"}
              active={button.active}
              text={button.text}
              icon={button.icon}
            />
            // <button
            //   key={index}
            //   style={{
            //     width: "40%",
            //     backgroundColor: `${
            //       type === "completed" ? "#D9D3C4" : buttons[key].color
            //     }`,
            //     boxShadow: `0px 9px 4px -5px rgb(49 87 49)`,
            //   }}
            // >
            //   {buttons[key].icon && <img src={buttons[key].icon} />}
            //   <span> {buttons[key].text}</span>
            // </button>
          ))}
      </div>
    </div>
  )
}

export default ActionCard
