import React from "react"
import ProgressBar from "../../simple/ProgressBar/ProgressBar"
import Assets from "../../../assets"
import FillBar from "../../simple/FillBar/FillBar"

import "./PlayerIndicators.css"
const PlayerIndicators = () => {
  const { Images, Icons } = Assets
  const bars = [
    {
      icon: Icons.energy,
      percentFill: 55,
      width: "30%",
    },
    {
      icon: Icons.hungry,
      percentFill: 45,
      width: "30%",
    },
    {
      icon: Icons.happiness,
      percentFill: 90,
      width: "30%",
    },
  ]
  return (
    <div className="PlayerIndicators">
      {bars.map((bar, index) => (
        <FillBar
          key={index}
          icon={bar.icon}
          width={bar.width}
          percentFill={bar.percentFill}
        />
      ))}

      {/* 
            <>
            <SourceBar/>  Balance
            <SourceBar/> Food
            <SourceBar/> Energy
            <SourceBar/> Mood

        */}
    </div>
  )
}

export default PlayerIndicators
