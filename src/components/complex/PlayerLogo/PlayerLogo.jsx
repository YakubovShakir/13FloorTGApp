import { useState } from "react"
import CircularProgress from "@mui/joy/CircularProgress"
import Assets from "../../../assets"
import "./PlayerLogo.css"

const PlayerLogo = ({ progress, onClick }) => {
  const { Images } = Assets
  return (
    <div
      className="PlayerLogo"
      onClick={() => {
        onClick()
      }}
    >
      <CircularProgress
        className="CircularProgress"
        variant="solid"
        size="lg"
        determinate
        value={progress}
      >
        <img src={Images.avatar} />
      </CircularProgress>
      <span className="PlayerLogoLevel">{progress}</span>
    </div>
  )
}

export default PlayerLogo
