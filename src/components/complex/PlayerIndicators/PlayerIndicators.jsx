import React from "react"
import FillBar from "../../simple/FillBar/FillBar"

import "./PlayerIndicators.css"


const PlayerIndicators = ({ indicators }) => {
  return (
    <div className="PlayerIndicators">
      {indicators.map((indicator, index) => (
        <FillBar
          key={index}
          icon={indicator.icon}
          width={indicator.width}
          percentFill={indicator.percentFill}
        />
      ))}
    </div>
  )
}

export default PlayerIndicators
