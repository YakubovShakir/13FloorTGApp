import React, { useContext, useEffect, useState, useMemo } from "react"
import "./PersonageCreation.css"
import Assets from "../../assets"
import Player from "../../components/complex/Player/Player"
import Button from "../../components/simple/Button/Button"
import { personageCreate } from "../../services/user/user"
import UserContext, { useUser } from "../../UserContext"
import { useNavigate } from "react-router-dom"
import FullScreenSpinner from "../Home/FullScreenSpinner"
import clothingSnapshot from "./clothingSnapshot"
import { SquareButton } from "../../components/simple/SquareButton/SquareButton"
import { useSettingsProvider } from "../../hooks"

const STEPS = {
  Gender: "gender",
  Race: "race",
  Name: "name",
}

export const RACES = {
  WHITE: "white",
  BLACK: "black",
  ASIAN: "asian",
}

export const GENDERS = {
  MALE: "male",
  FEMALE: "female",
}

// Memoized maps to prevent recreating objects on each render
const RACE_TO_HAT_MAP = {
  [RACES.ASIAN]: clothingSnapshot.find((item) => item.clothing_id === 8),
  [RACES.BLACK]: clothingSnapshot.find((item) => item.clothing_id === 12),
  [RACES.WHITE]: clothingSnapshot.find((item) => item.clothing_id === 10),
}

const DEFAULT_CLOTHES = {
  top: clothingSnapshot.find((item) => item.clothing_id === 15),
  pants: clothingSnapshot.find((item) => item.clothing_id === 44),
  shoes: clothingSnapshot.find((item) => item.clothing_id === 85),
}

const GENDER_RACE_ICONS = {
  [GENDERS.FEMALE]: {
    [RACES.WHITE]: Assets.Icons.femaleAsianIcon,
    [RACES.BLACK]: Assets.Icons.femaleBlackIcon,
    [RACES.ASIAN]: Assets.Icons.femaleWhiteIcon,
  },
  [GENDERS.MALE]: {
    [RACES.WHITE]: Assets.Icons.maleWhiteIcon,
    [RACES.BLACK]: Assets.Icons.maleWAfroIcon,
    [RACES.ASIAN]: Assets.Icons.maleWAsianIcon,
  },
}

const translations = {
  next: { ru: "Далее", en: "Next" },
  back: { ru: "Назад", en: "Back" },
  enterName: { ru: "Имя персонажа", en: "Personage's name" },
  start: { ru: "Начать", en: "Start" },
}

// Memoized helper functions
const getInitialClothing = (gender, race) => ({
  ...DEFAULT_CLOTHES,
  hat: RACE_TO_HAT_MAP[race],
})

const getGenderIcon = (gender, race) => GENDER_RACE_ICONS[gender]?.[race]

const PersonageCreationScreen = () => {
  const [gender, setGender] = useState(GENDERS.FEMALE)
  const [race, setRace] = useState(RACES.WHITE)
  const [personageName, setPersonageName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(STEPS.Gender)
  const { userId, setUserPersonage } = useContext(UserContext)
  const { lang } = useSettingsProvider()
  const navigate = useNavigate()

  // Memoize clothing to prevent unnecessary recalculations
  const clothing = useMemo(
    () => getInitialClothing(gender, race),
    [gender, race]
  )

  // Memoize essential assets that need to be preloaded
  const essentialAssets = useMemo(
    () => [
      Assets.BG.personageCreationBg,
      Assets.Icons.female,
      Assets.Icons.male,
      Assets.Icons.femaleWhiteIcon,
      Assets.Icons.femaleBlackIcon,
      Assets.Icons.femaleAsianIcon,
      Assets.Icons.maleWhiteIcon,
      Assets.Icons.maleWAfroIcon,
      Assets.Icons.maleWAsianIcon,
      Assets.Images.asianGirl,
      Assets.Images.asianMan,
      Assets.Images.euGirl,
      Assets.Images.euMan,
      Assets.Images.blackGirl,
      Assets.Images.blackMan,
      Assets.Layers.squareButtonShadow,
      Assets.nameUnderline,
    ],
    []
  )

  // Optimize asset preloading
  useEffect(() => {
    let mounted = true
    const preloadController = new AbortController()

    const preloadAssets = async () => {
      try {
        await Promise.all(
          essentialAssets.map((src) => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = () => resolve(src)
              img.onerror = () => reject(src)
              img.src = src
            })
          })
        )

        if (mounted) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Asset loading error:", error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    preloadAssets()

    return () => {
      mounted = false
      preloadController.abort()
    }
  }, [essentialAssets])

  const { refreshData } = useUser()

  const handlePersonageCreation = async () => {
    try {
      await setUserPersonage({ race, gender })
      await personageCreate(userId, race, gender)
      await refreshData()
    } catch (err) {
      console.error(err)
    } finally {
      navigate("/learning/1")
    }
  }

  // Common styles memoization
  const commonStyles = useMemo(
    () => ({
      container: {
        background: `url(${Assets.BG.personageCreationBg})`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100vw",
      },
      buttonContainer: {
        position: "absolute",
        display: "flex",
        width: "100%",
        alignItems: "center",
        bottom: "5%",
      },
    }),
    []
  )

  if (isLoading) return <FullScreenSpinner />

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.Gender:
        return (
          <div style={commonStyles.container}>
            <Player
              bottom={"calc(1vh + 120px)"}
              width={"46vw"}
              left={"26vw"}
              personage={{ race, gender }}
              clothing={clothing}
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
                  position: "absolute",
                  right: 0,
                  zIndex: 1000,
                }}
              >
                <Button
                  className="clothing-item-equip-button"
                  shadowColor={"rgb(199, 80, 21)"}
                  width={"25vw"}
                  height={44}
                  active={true}
                  fontFamily={"Oswald"}
                  fontWeight={"300"}
                  text={translations.next[lang]}
                  fontSize={14}
                  color={"rgb(255, 255, 255)"}
                  ownColor={"rgb(255, 118, 0)"}
                  bgColor={"rgb(255, 118, 0)"}
                  onClick={() => setCurrentStep(STEPS.Race)}
                />
              </div>
            </div>

          
          </div>
        )
      case STEPS.Race:
        return (
          <div style={commonStyles.container}>
            <Player
              bottom={"calc(1vh + 120px)"}
              width={"46vw"}
              left={"26vw"}
              personage={{ race, gender }}
              clothing={getInitialClothing(gender, race)}
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
                  className="clothing-item-equip-button"
                  shadowColor={"rgb(199, 80, 21)"}
                  width={"25vw"}
                  height={44}
                  active={true}
                  fontFamily={"Oswald"}
                  color={"rgb(255, 255, 255)"}
                  fontWeight={"300"}
                  text={translations.back[lang]}
                  fontSize={14}
                  ownColor={"rgb(255, 118, 0)"}
                  bgColor={"rgb(255, 118, 0)"}
                  onClick={() => {
                    setCurrentStep(STEPS.Gender)
                  }}
                />
              </div>
              <div
                style={{
                  width: "40%",
                  display: "flex",
                  justifyContent: "center",
                }}
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
                  className="clothing-item-equip-button"
                  shadowColor={"rgb(199, 80, 21)"}
                  width={"25vw"}
                  height={44}
                  active={true}
                  fontFamily={"Oswald"}
                  color={"rgb(255, 255, 255)"}
                  fontWeight={"300"}
                  text={translations.next[lang]}
                  fontSize={14}
                  ownColor={"rgb(255, 118, 0)"}
                  bgColor={"rgb(255, 118, 0)"}
                  onClick={() => {
                    if (race && gender) {
                      handlePersonageCreation()
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return renderStepContent()
}

export default PersonageCreationScreen
