import "./Player.css"
import Assets from "../../../assets"

const Player = ({ width, left, top, type = true }) => {
  const { Images } = Assets
  if(type === null) {
    return (
      <div
        className="Player"
        style={{ width: `${width}`, aspectRatio: "0.3", left: left, top: top }}
      >
        <img className="PlayerAvatar" src={Images.missingGirl} alt="avatar" />
    </div>
    )
  } else {
    return (
      <div
        className="Player"
        style={{ width: `${width}`, aspectRatio: "0.3", left: left, top: top }}
      >
        <img className="PlayerAvatar" src={Images.euGirl} alt="avatar" />
        <img
          className="PlayerHead"
          style={{ zIndex: "3" }}
          src={Images.afro}
          alt="Head"
        />
        <img className="PlayerTop" src={Images.blackSkin} alt="Top" />
        <img className="PlayerLegs" src={Images.miniSkirt} alt="Legs" />
        <img className="PlayerFeet" src={Images.hightHeels} alt="Feet" />
      </div>
    )
  }
}

export default Player
