import React, { useContext, useState } from "react"
import "./PersonageCreation.css"
import Assets from "../../assets"
import Player from "../../components/complex/Player/Player"
import Button from "../../components/simple/Button/Button"
import { personageCreate } from "../../services/user/user"
import UserContext from "../../UserContext"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const STEPS = {
  Gender: "gender",
  Race: "race",
  Name: "name",
}

const SquareButton = ({
  handlePress,
  assignedValue,
  selectedValue,
  imageSrc,
  size = 60,
  imageSize = 40,
  paddingTop,
}) => {
  const isSelected =
    assignedValue && selectedValue && assignedValue === selectedValue

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      style={{
        backgroundColor: isSelected ? "#E94E1B" : "#453D3F",
        height: size + 5,
        width: size,
        borderRadius: 8,
        position: "relative",
      }}
      onClick={handlePress}
    >
      {/* Persistent Shadow */}
      {isSelected && (
        <motion.div
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          <img
            src={Assets.Layers.squareButtonShadow}
            width={42}
            height={42}
            style={{
              position: "absolute",
              bottom: 0,
              left: -1,
              zIndex: 5,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          backgroundColor: "#595254",
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        style={{
          height: size + 2,
          width: size + 2,
          marginLeft: -2,
          marginTop: -2,
          borderRadius: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <motion.img
          src={imageSrc}
          width={imageSize}
          height={imageSize}
          animate={{
            opacity: 1,
            rotate: 0,
            scale: isSelected ? 0.9 : 1,
            filter: isSelected ? "brightness(0.8)" : "brightness(1)",
          }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          style={{
            position: "relative",
            zIndex: 3,
            paddingTop,
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export const RACES = {
  WHITE: "white",
  BLACK: "black",
  ASIAN: "asian",
}

const femaleRaceToIconMap = {
  [RACES.WHITE]: Assets.Icons.femaleWhiteIcon,
  [RACES.BLACK]: Assets.Icons.femaleBlackIcon,
  [RACES.ASIAN]: Assets.Icons.femaleAsianIcon,
}

const maleRaceToIconMap = {
  [RACES.WHITE]: Assets.Icons.femaleWhiteIcon,
  [RACES.BLACK]: Assets.Icons.femaleBlackIcon,
  [RACES.ASIAN]: Assets.Icons.femaleAsianIcon,
}

const getGenderIcon = (gender, race) => {
  if (gender === GENDERS.FEMALE) {
    return femaleRaceToIconMap[race]
  }

  return maleRaceToIconMap[race]
}

export const GENDERS = {
  MALE: "male",
  FEMALE: "female",
}

const PersonageCreationScreen = () => {
  const [gender, setGender] = useState(GENDERS.FEMALE)
  const [race, setRace] = useState(RACES.WHITE)
  const [personageName, setPersonageName] = useState(null)
  const [currentStep, setCurrentStep] = useState(STEPS.Gender)
  const { userId, setUserPersonage } = useContext(UserContext)
  const navigate = useNavigate()

  const handlePersonageCreation = async () => {
    try {
      if(personageName && personageName.length > 5) {
        await setUserPersonage({ race, name: personageName, gender })
        await personageCreate(userId, race, gender, personageName)

        navigate("/#")
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (currentStep === STEPS.Gender) {
    return (
      <div
        style={{
          background: `url(${Assets.BG.personageCreationBg})`,
          backgroundSize: "cover",
          height: "100vh",
          width: "100vw",
        }}
      >
        <Player
          personage={{ gender, race }}
          gender={gender}
          race={RACES.WHITE}
          width={"40vw"}
          left={"30vw"}
          top={"30vh"}
        />
        <div
          style={{
            position: "absolute",
            display: "flex", // Parent container uses flexbox
            width: "100%",
            alignItems: "center", // Center vertically (optional)
            bottom: "5%",
          }}
        >
          <div
            style={{
              width: "30%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {/* <Button fontSize={14} paddingTop={2} text={'Далее'} width={95} height={43} shadowColor={"#AF370F"} active={true} ownColor={'linear-gradient(to right, #E94E1B, #F37500)'} bgColor={'linear-gradient(to right, #E94E1B, #F37500)'}/> */}
          </div>
          <div
            style={{
              width: "40%",
              display: "flex",
              justifyContent: "center",
              zIndex: 5,
            }}
          >
            <div style={{ marginRight: "8px" }}>
              <SquareButton
                assignedValue={GENDERS.FEMALE}
                selectedValue={gender}
                handlePress={() => {
                  console.log("gender", gender)
                  setGender(GENDERS.FEMALE)
                }}
                imageSrc={Assets.Icons.female}
                size={40}
                paddingTop={5}
              />
            </div>
            <div>
              <SquareButton
                assignedValue={GENDERS.MALE}
                selectedValue={gender}
                handlePress={() => {
                  console.log("gender", gender)
                  setGender(GENDERS.MALE)
                }}
                imageSrc={Assets.Icons.male}
                size={40}
                paddingTop={5}
              />
            </div>
          </div>
          <div
            style={{
              width: "30%",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            {gender && (
              <Button
                fontSize={14}
                paddingTop={2}
                text={"Далее"}
                width={95}
                height={43}
                shadowColor={"#AF370F"}
                active={true}
                ownColor={"linear-gradient(to right, #E94E1B, #F37500)"}
                bgColor={"linear-gradient(to right, #E94E1B, #F37500)"}
                onClick={() => {
                  if (gender) {
                    setCurrentStep(STEPS.Race)
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === STEPS.Race) {
    return (
      <div
        style={{
          background: `url(${Assets.BG.personageCreationBg})`,
          backgroundSize: "cover",
          height: "100vh",
          width: "100vw",
        }}
      >
        <Player
          personage={{ gender, race }}
          width={"90vw"}
          left={"5vw"}
          top={"23vh"}
        />
        <div
          style={{
            position: "absolute",
            display: "flex", // Parent container uses flexbox
            width: "100%",
            alignItems: "center", // Center vertically (optional)
            bottom: "5%",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "30%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              fontSize={14}
              paddingTop={2}
              text={"Назад"}
              width={95}
              height={43}
              shadowColor={"#AF370F"}
              active={true}
              ownColor={"linear-gradient(to right, #E94E1B, #F37500)"}
              bgColor={"linear-gradient(to right, #E94E1B, #F37500)"}
              onClick={() => {
                setCurrentStep(STEPS.Gender)
              }}
            />
          </div>
          <div
            style={{ width: "40%", display: "flex", justifyContent: "center" }}
          >
            <div style={{ marginRight: "8px" }}>
              <SquareButton
                assignedValue={RACES.WHITE}
                selectedValue={race}
                handlePress={() => setRace(RACES.WHITE)}
                imageSrc={getGenderIcon(gender, RACES.WHITE)}
                size={40}
              />
            </div>
            <div style={{ marginRight: "8px" }}>
              <SquareButton
                assignedValue={RACES.BLACK}
                selectedValue={race}
                handlePress={() => setRace(RACES.BLACK)}
                imageSrc={getGenderIcon(gender, RACES.BLACK)}
                size={40}
              />
            </div>
            <div>
              <SquareButton
                assignedValue={RACES.ASIAN}
                selectedValue={race}
                handlePress={() => setRace(RACES.ASIAN)}
                imageSrc={getGenderIcon(gender, RACES.ASIAN)}
                size={40}
              />
            </div>
          </div>
          <div
            style={{
              width: "30%",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <Button
              fontSize={14}
              paddingTop={2}
              text={"Далее"}
              width={95}
              height={43}
              shadowColor={"#AF370F"}
              active={true}
              ownColor={"linear-gradient(to right, #E94E1B, #F37500)"}
              bgColor={"linear-gradient(to right, #E94E1B, #F37500)"}
              onClick={() => {
                if (race && gender) {
                  setCurrentStep(STEPS.Name)
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === STEPS.Name) {
    return (
      <div
        style={{
          background: `url(${Assets.BG.personageCreationBg})`,
          backgroundSize: "cover",
          height: "100vh",
          width: "100vw",
        }}
      >
        <Player
          personage={{ gender, race }}
          width={"45vw"}
          left={"27vw"}
          top={"20vh"}
        />
        <div
          style={{
            position: "absolute",
            display: "flex", // Parent container uses flexbox
            width: "100%",
            alignItems: "center", // Center vertically (optional)
            bottom: "5%",
          }}
        >
          <div
            style={{
              width: "30%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          ></div>
          <div
            style={{ width: "40%", display: "flex", justifyContent: "center" }}
          >
            <div style={{ marginRight: "8px" }}></div>
            <div style={{ marginRight: "8px", zIndex: 3 }}>
              <Button
                fontSize={14}
                paddingTop={2}
                text={"Начать"}
                width={95}
                height={43}
                shadowColor={"#AF370F"}
                ownColor={"linear-gradient(to right, #E94E1B, #F37500)"}
                bgColor={"linear-gradient(to right, #E94E1B, #F37500)"}
                active={(personageName && personageName.length > 5) ? true : false}
                onClick={() => handlePersonageCreation()}
              />
            </div>
            <div></div>
          </div>
          <div
            style={{
              width: "100vw",
              height: "100vh",
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bottom: "8%",
              }}
            >
              <input
                placeholder="***"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  textAlign: "center",
                  width: "100%",
                  color: "white",
                  zIndex: 10,
                  position: "relative",
                }}
                onChange={(e) => setPersonageName(e.target.value)}
              />
              <img
                src={Assets.nameUnderline}
                style={{
                  position: "absolute",
                  bottom: "-10px",
                  width: "100%",
                  zIndex: 5,
                }}
              />
            </div>
          </div>
          <div
            style={{
              width: "30%",
              display: "flex",
              justifyContent: "flex-start",
            }}
          ></div>
        </div>
      </div>
    )
  }
}

export default PersonageCreationScreen
