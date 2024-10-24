import "./WorkModal.css"
import Assets from "../../../../assets"
const WorkModal = ({ work }) => {
  const { BG, Icons } = Assets
  return (
    <div className="WorkModal">
      <div
        className="WorkModalLogo"
        // style={{ backgroundImage: `url(${BG.workCardBG})` }}
      >
        <img src={work.icon} alt="workIcon" />
      </div>
      <div className="WorkModalParams">
        <div className="WorkModalParam">
          <div>
            <img src={Icons.happiness} alt="iconSource" />
            <span>Настроение</span>
          </div>
          <span> +5/ч</span>
        </div>
        <div className="WorkModalParam">
          <div>
            <img src={Icons.hungry} alt="iconSource" />
            <span>Еда</span>
          </div>
          <span> +5/ч</span>
        </div>
        <div className="WorkModalParam">
          <div>
            <img src={Icons.respect} alt="iconSource" />
            <span>Респект</span>
          </div>
          <span> 200</span>
        </div>
        <div className="WorkModalParam">
          <div>
            <img src={Icons.book} alt="iconSource" />
            <span>Перк</span>
          </div>
          <span> 400</span>
        </div>
      </div>

      <div className="WorkModalCost">
        <img src={Icons.balance} alt="coinIcon" />
        <span>{work.cost} / час</span>
        <button
          style={{
            backgroundColor: `${work.type === "unavailable" && "#D9D3C4"}`,
            boxShadow: `0px 9px 4px -5px rgb(49 87 49)`,
          }}
          className={
            work.type === "available"
              ? "WorkModalCostButton"
              : "WorkModalCostButton WorkModalCostButtonDisable"
          }
        >
          <img src={Icons.play} alt="play" />
          Начать
        </button>
      </div>
    </div>
  )
}

export default WorkModal
