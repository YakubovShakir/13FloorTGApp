import "./WelcomeModal.css"
import Modal from "../Modal/Modal"
import Button from "../../../simple/Button/Button"
import Assets from "../../../../assets"
const WelcomeModal = ({ onClose }) => {
  const { Icons, BG } = Assets

  const data = () => (
    <div className="WelcomeModalData">
      <div className="WelcomeModalLeftTime">
        <span>Пока вас не было</span>
        <span>
          <img src={Icons.clock} alt="iconClock" />
          1ч 29м 59с
        </span>
      </div>
      <div className="WelcomeModalSource">
        <div>
          <span>
            <img src={Icons.happiness} alt="happiness" />
            <span>Настроение</span>
          </span>
          <span style={{ textAlign: "right" }}>
            <img src={Icons.happinessDown} alt="happiness" />
            <span style={{ height: "100%" }}>50%</span>
          </span>
        </div>{" "}
        <div>
          <span>
            <img src={Icons.energy} alt="happiness" />
            <span>Настроение</span>
          </span>
          <span style={{ textAlign: "right" }}>
            <img src={Icons.energy} alt="happiness" />
            <span style={{ height: "100%" }}>50%</span>
          </span>
        </div>{" "}
        <div>
          <span>
            <img src={Icons.hungry} alt="happiness" />
            <span>Настроение</span>
          </span>
          <span style={{ textAlign: "right" }}>
            <img src={Icons.hungry} alt="happiness" />
            <span style={{ height: "100%" }}>50%</span>
          </span>
        </div>
      </div>
      <div 
        style={{
          backgroundImage: `url(${BG.backgroundSun})`,
          backgroundPositionX: "-41vw",
          backgroundPositionY: "-4vh",
        }}
        className="WelcomeModalEarned"
      >
        <img className="WelcomeModalEarnedIMG" src={Icons.balance} alt="coin" />
        <div> 
          <span>Вы заработали</span>
          <span>
            <img src={Icons.balance} alt="COIN" />
            1400
          </span>
        </div>
      </div>
      <div className="WelcomeModalMissedIncome">
        Если бы вы ваше настроение было 100% все это время, вы бы получили 2400{" "}
      </div>
      <Button
        text={"Принять"}
        bgColor={"#00C200"}
        width={"35%"}
        height={"10%"}
      />
    </div>
  )
  return (
    <Modal
      width={"90%"}
      height={"60%"}
      left="5%"
      top="20%"
      title={"Снова здравствуйте"}
      data={data}
      onClose={onClose}
    />
  )
}

export default WelcomeModal
