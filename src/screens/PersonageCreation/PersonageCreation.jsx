import React, { useContext, useEffect, useState } from "react"
import "./PersonageCreation.css"
import Assets from "../../assets"
import Player from "../../components/complex/Player/Player"
import Button from "../../components/simple/Button/Button"
import { personageCreate } from "../../services/user/user"
import UserContext from "../../UserContext"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import FullScreenSpinner from "../Home/FullScreenSpinner"
import clothingSnapshot from "./clothingSnapshot"
import { SquareButton } from "../../components/simple/SquareButton/SquareButton"
import { useSettingsProvider } from "../../hooks"

const STEPS = {
  Gender: "gender",
  Race: "race",
  Name: "name",
}

const getInitialClothing = (gender, race) => {
  const raceToHatMap = {
    [RACES.ASIAN]: clothingSnapshot.find(item => item.clothing_id === 8),
    [RACES.BLACK]: clothingSnapshot.find(item => item.clothing_id === 12),
    [RACES.WHITE]: clothingSnapshot.find(item => item.clothing_id === 10),
  }

  const defaultClothes = {
    hat: null,
    top: clothingSnapshot.find(item => item.clothing_id === 15),
    pants: clothingSnapshot.find(item => item.clothing_id === 44),
    shoes: clothingSnapshot.find(item => item.clothing_id === 85),
  }

  defaultClothes.hat = raceToHatMap[race]

  return defaultClothes
}

export const RACES = {
  WHITE: "white",
  BLACK: "black",
  ASIAN: "asian",
}

const femaleRaceToIconMap = {
  [RACES.WHITE]: Assets.Icons.femaleAsianIcon,
  [RACES.BLACK]: Assets.Icons.femaleBlackIcon,
  [RACES.ASIAN]: Assets.Icons.femaleWhiteIcon,
}

const maleRaceToIconMap = {
  [RACES.WHITE]: Assets.Icons.maleWhiteIcon,
  [RACES.BLACK]: Assets.Icons.maleWAfroIcon,
  [RACES.ASIAN]: Assets.Icons.maleWAsianIcon,
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

const translations = {
  next: {
    ru: 'Далее',
    en: 'Next'
  },
  back: {
    ru: 'Назад',
    en: 'Back'
  },
  enterName: {
    ru: 'Имя персонажа',
    en: "Personage's name"
  },
  start: {
    ru: 'Начать',
    en: 'Start'
  }
}

const PersonageCreationScreen = () => {
  const [gender, setGender] = useState(GENDERS.FEMALE)
  const [race, setRace] = useState(RACES.WHITE)
  const [personageName, setPersonageName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(STEPS.Gender)
  const { userId, setUserPersonage } = useContext(UserContext)
  const { lang } = useSettingsProvider()
  const navigate = useNavigate()

  const handlePersonageCreation = async () => {
    try {
      if (personageName && personageName?.length >= 2) {

        await setUserPersonage({ race, name: personageName, gender })

        await personageCreate(userId, race, gender, personageName)
        navigate("/learning/1")
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    let mounted = true
  
    const preloadAssets = async () => {
      const preloadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.src = src
          img.onload = () => resolve(src)
          img.onerror = () => reject(src)
        })
      }

      const assetsToPreload = [
        // Initial Clothes
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/1/Head/GlossyGlamDark-m.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/1/Head/GlossyGlamDark-f.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/1/Head/GlossyGlamBlonde-m.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/1/Head/GlossyGlamBlonde-f.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/1/Head/GlossyGlam  Brown-m.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/1/Head/GlossyGlamBrown-f.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/1/Body/WhiteTShirt-m.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/1/Body/WhiteTShirt-f.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/3/Shoes/Boots_m.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/3/Shoes/Boots-f.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/2/Legs/CamelPants-m.png",
        // "https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/clothes/2/Legs/CamelPants-f.png",
        // Backgrounds
        Assets.BG.personageCreationBg,

        // Icons and players
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
        // Layers
        Assets.Layers.squareButtonShadow,

        // Other assets
        Assets.nameUnderline
      ]

      try {
        const preloadPromises = assetsToPreload.map(src => preloadImage(src))
        const results = await Promise.allSettled(preloadPromises)
  
        // Check for any rejected promises
        const hasRejected = results.some(result => result.status === 'rejected')
        if (hasRejected) {
          console.error('Failed to load some assets:', results.filter(result => result.status === 'rejected'))
        }
  
        if (mounted) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to load some assets:', error)
        // Still set loading to false to allow user to proceed
        if (mounted) {
          setTimeout(() => setIsLoading(false), 3000)
        }
      }
    }
  
    preloadAssets()
  
    return () => {
      mounted = false
    }
  }, [])

  const [clothing, setClothing] = useState(null)

  useEffect(() => {
    setClothing(getInitialClothing(gender, race))
  }, [race, gender])

  if (isLoading) {
    return <FullScreenSpinner />
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
              position: 'absolute',
              right: 0,
              zIndex: 1000
            }}
          >
            <Button
              className="clothing-item-equip-button"
              shadowColor={"rgb(199, 80, 21)"}
              width={'25vw'}
              height={44}
              active={true}
              fontFamily={"Anonymous pro"}
              fontWeight={"300"}
              text={translations.next[lang]}
              fontSize={14}
              color={"rgb(255, 255, 255)"}
              ownColor={
                "rgb(255, 118, 0)"
              }
              bgColor={
                "rgb(255, 118, 0)"
              }
              onClick={() => setCurrentStep(STEPS.Race)} />
          </div>
        </div>

        <Player
          bottom={'calc(1vh + 120px)'}
          width={'37vw'}
          left={'30vw'}
          personage={{ race, gender }}
          clothing={getInitialClothing(gender, race)}
        />
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
          bottom={'calc(1vh + 120px)'}
          width={'37vw'}
          left={'30vw'}
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
              width={'25vw'}
              height={44}
              active={true}
              fontFamily={"Anonymous pro"}
              color={"rgb(255, 255, 255)"}
              fontWeight={"300"}
              text={translations.back[lang]}
              fontSize={14}
              ownColor={
                "rgb(255, 118, 0)"
              }
              bgColor={
                "rgb(255, 118, 0)"
              }
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
              className="clothing-item-equip-button"
              shadowColor={"rgb(199, 80, 21)"}
              width={'25vw'}
              height={44}
              active={true}
              fontFamily={"Anonymous pro"}
              color={"rgb(255, 255, 255)"}
              fontWeight={"300"}
              text={translations.next[lang]}
              fontSize={14}
              ownColor={
                "rgb(255, 118, 0)"
              }
              bgColor={
                "rgb(255, 118, 0)"}
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
        {/* <Player
            fixed={true}
            bottom={'calc(1vh + 50px)'}
            width={'37vw'}
            left={'30vw'}
            personage={{ race, gender }}
            clothing={getInitialClothing(gender, race)}
          /> */}
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
                className="clothing-item-equip-button"
                shadowColor={"rgb(199, 80, 21)"}
                width={'30vw'}
                marginBottom={"5"}
                color={"rgb(255, 255, 255)"}
                height={44}
                active={personageName.length >= 2}
                fontFamily={"Anonymous pro"}
                fontWeight={"300"}
                text={translations.start[lang]}
                fontSize={14}
                ownColor={
                  "rgb(255, 118, 0)"
                }
                bgColor={
                  "rgb(255, 118, 0)"
                }
                onClick={() => personageName.length >= 2 ? handlePersonageCreation() : null}
              />
            </div>
            <div></div>
          </div>
          <div
            style={{
              width: "100vw",
              height: "550vh",
              position: "fixed",
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
                placeholder={translations.enterName[lang]}
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