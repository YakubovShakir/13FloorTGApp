import { React, useState } from "react"
import PlayerLogo from "../PlayerLogo/PlayerLogo"
import PlayerIndicators from "../PlayerIndicators/PlayerIndicators"
import IconButton from "../../simple/IconButton/IconButton"
import Assets from "../../../assets"
import "./HomeHeader.css"
const HomeHeader = ({ onClick }) => {
  const [progress, setProgress] = useState(60)
  const { Icons } = Assets
  return (
    <div className="HomeHeader">
      <PlayerIndicators />
      <div className="HomeHeaderIncome">
        <div>
          <img src={Icons.balance} alt="Coin" />
        </div>
        <div>
          <span>100000</span>
          <span>+ 0/Ч</span>
        </div>
      </div>

      <div className="HomeHeaderLevel">
        <span>1</span>
        <span>Уровень</span>
      </div>
    </div>
  )
}

export default HomeHeader
