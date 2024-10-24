import React, { useState } from "react"
import Assets from "../../assets"
import { Navigate, useNavigate } from "react-router-dom"
import Player from "../../components/complex/Player/Player"
import "./StartCustomize.css"
import Button from "../../components/simple/Button/Button"
import Title from "../../components/simple/Title/Title"
const StartCustomize = () => {
  const [currentSex, setCurrentSex] = useState(null)
  const [currentAvatarType, setCurrentAvatarType] = useState(null)
  const navigate = useNavigate()

  const { BG, Icons } = Assets

  const sx = [
    {
      icon: Icons.male,
    },
    {
      icon: Icons.female,
    },
  ]
  const femaleAvatars = [
    {
      icon: Icons.femaleAzia,
    },
    {
      icon: Icons.femaleBlack,
    },
    {
      icon: Icons.femaleEurope,
    },
  ]

  return (
    <div
      className="StartCustomize"
      style={{ backgroundImage: `url(${BG.StartCustomizeBG})` }}
    >
      <Player width={"70%"} left={"18%"} top={"24%"} />
      <div className="StartCustomizeModal">
        <Title height={"25%"}>Выберите аватар</Title>
        <div className="StartCustomizeModalData">
          <div
            className="StartCustomizeModalDataType"
            style={{ height: "50%" }}
          >
            <div
              style={{
                display: "flex",
                width: "40%",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              {sx.map((sex, index) => (
                <div style={{ width: "40%", display: "flex" }}>
                  <img
                    key={index}
                    src={sex.icon}
                    alt="SexType"
                    onClick={() => {
                      setCurrentSex(index)
                    }}
                    style={{
                      width: "100%",
                      backgroundColor: currentSex === index && "#FCBA04",
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                width: "55%",
                alignItems: "center",
                justifyContent: "space-evenly"
              }}
            >
              {femaleAvatars.map((avatar, index) => (
                <div style={{ width: "30%", display: "flex" }}>
                  <img
                    key={index}
                    src={avatar.icon}
                    alt="avatarType"
                    onClick={() => {
                      setCurrentAvatarType(index)
                    }}
                    style={{
                      backgroundColor: currentAvatarType === index && "#FCBA04",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            active={currentAvatarType != null && currentSex != null}
            width={"40%"}
            text={"Далее"}
            height={"25%"}
            onClick={() => {
              currentAvatarType != null &&
                currentSex != null &&
                navigate("/home")
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default StartCustomize
