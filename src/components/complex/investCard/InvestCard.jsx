import "./InvestCard.css"
import ProgressBar from "../../simple/ProgressBar/ProgressBar"
import Assets from "../../../assets"
import Button from "../../simple/Button/Button"
import Modal from "../Modals/Modal/Modal"
import { useState } from "react"
const InvestCard = ({
  icon,
  name,                
  level,
  autoClaim = false,
  claimStatus = false,
  upgradeStatus = false,
  progress,
  capacity,
  width = undefined,
  height = undefined,
  dataIcon,
}) => {
  const [visibleDataModal, setVisibleDataModal] = useState(false)
  const [visibleUpgradeModal, setVisibleUpgradeModal] = useState(false)
  const { Icons } = Assets
  const managerModal = (
    <Modal
      title={"Менеджер"}
      width={"80%"}
      left={"10%"}
      onClose={() => setVisibleDataModal(false)}
      top={"20%"}
      height={"60%"}
      data={() => (
        <div className="InvestCardDataModal">
          <img
            className="InvestCardDataModalIcon"
            src={Icons.manager}
            alt="dataIcon"
          />
          <span>Менеджер будет сам собирать доход</span>
          <Button
            ownColor={true}
            bgColor={"#0088CC"}
            width={"50%"}
            height={"12%"}
            text={3}
            icon={Icons.ton}
          />
        </div>
      )}
    />
  )
  const upgradeModal = (
    <Modal
      title={"Уровень 2"}
      left={"10%"}
      top={"20%"}
      width={"80%"}
      height={"40%"}
      onClose={() => setVisibleUpgradeModal(false)}
      data={() => (
        <div className="InvestCardUpgradeModal">
          <div className="InvestCardUpgradeLevel">
            <div>
              <img src={Icons.balance} alt="coin" /> <span>130 / час</span>
            </div>
            <img style={{width: "16%"}}src={Icons.arrowRight} alt="arrowRight" />
            <div style={{color: "#FCBA04", fontWeight: "bold"}}>
              <img src={Icons.balance} alt="coin" /> <span>130 / час</span>
            </div>
          </div>
          <div className="InvestCardUpgradeDescr">Улучши бизнес, чтобы получать больше дохода</div>
          <Button
            text={"440"}
            height={"20%"}
            width={"50%"}
            icon={Icons.balance}
            bgColor={"#00C200"}
          />
        </div>
      )}
    />
  )

  return (
    <div className="InvestCard" style={{ width: width, height: height }}>
      {visibleUpgradeModal && upgradeModal}
      {visibleDataModal && managerModal}
      <div className="InvestCardLogo">
        <span>ур.{level}</span>
        <img src={icon} alt="investIcon" />
        <Button
          height={"25%"}
          width={"80%"}
          active={upgradeStatus}
          text={"Улучшить"}
          onClick={() => setVisibleUpgradeModal(true)}
        />
      </div>
      <div className="InvestCardData">
        {dataIcon ? (
          <img src={dataIcon} alt="dataIcon" />
        ) : (
          <img
            style={{ width: "30%" }}
            onClick={() => setVisibleDataModal(true)}
            src={Icons.brownPlus}
            alt="plus"
          />
        )}
      </div>
      <div className="InvestCardInfo">
        <span>{name}</span>
        <ProgressBar
          icon={Icons.balance}
          width={85}
          height={25}
          percentFill={51}
          colorFill={"#FCBA04"}
          value={`${progress} / ${capacity}`}
        />
        <Button
          height={"25%"}
          width={"80%"}
          active={claimStatus}
          bgColor={"linear-gradient(180deg, rgba(233,78,27,1) 5%, rgba(243,117,0,1) 65%)"}
          ownColor = {autoClaim ? true : false}
          text={autoClaim ? "Автосбор" : "Собрать"}
        />
        {/* <button>{autoClaim ? "Автосбор" : "Собрать"}</button> */}
      </div>
    </div>
  )
}

export default InvestCard
