import "./SettingsModal.css"
import Title from "../../../simple/Title/Title"
import Assets from "../../../../assets"
import IconButton from "../../../simple/IconButton/IconButton"

const SettingsModal = ({
  playerName,
  totalIncome,
  respect,
  status,
  onClose,
}) => {
  const { Icons } = Assets
  const collection = [
    {
      icon: Icons.head,
    },
    {
      icon: Icons.body,
    },
    {
      icon: Icons.legs,
    },
    {
      icon: Icons.typeShoes,
    },
    {
      icon: Icons.accessory,
    },
    {
      icon: Icons.accessory,
    },
  ]
  return (
    <div className="SettingsModal">
      <div
        style={{ position: "absolute", right: "2%", top: "3%", width: "22%" }}
      >
        <IconButton
          onClick={() => {
            onClose(false)
          }}
          icon={Icons.cancel}
          width="100%"
        />
      </div>

      <Title>{playerName}</Title>
      <div className="SettingsModalInfo">
        <div
          style={{
            height: "20%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <div className="SettingsModalInfoTitle">
            <img src={Icons.balance} alt="balanceIcon" />
            <div>За карьеру</div>
            <div>{totalIncome}</div>
          </div>
          <div className="SettingsModalInfoTitle">
            <img src={Icons.respect} alt="balanceIcon" />
            <div>Респект</div>

            <div>{respect}</div>
          </div>
        </div>
        <div className="SettingsModalInventory">
          {collection.map((item, index) => (
            <span key={index}>
              <img src={item.icon} alt="icon" />
            </span>
          ))}
        </div>
        <div>{respect}</div>
      </div>
    </div>
  )
}

export default SettingsModal
