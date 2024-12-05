import React, { useContext, useState } from "react"
import "./PersonageCreation.css"
import Assets from "../../assets"
import Player from "../../components/complex/Player/Player"
import Button from "../../components/simple/Button/Button"
import { personageCreate } from "../../services/user/user"
import UserContext from "../../UserContext"
import { useNavigate } from "react-router-dom"

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
}) => {
    const isSelected =
        assignedValue && selectedValue && assignedValue === selectedValue

    return (
        <div
            style={{
                backgroundColor: isSelected ? "#E94E1B" : "#453D3F",
                height: 48,
                width: 43,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
            }}
            onClick={handlePress}
        >
            <div
                style={{
                    backgroundColor: "#595254",
                    height: 43,
                    width: 43,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    borderTopLeftRadius: 7,
                    borderTopRightRadius: 7,
                }}
            >
                <img src={imageSrc} width={43} height={43} style={{ paddingTop: 6 }} />
            </div>
            {/* {isSelected && (
               
            )} */}
            {isSelected === true && (
                <img
                    src={Assets.Layers.squareButtonShadow}
                    style={{
                        position: "absolute",
                        zIndex: 5,
                        bottom: "5%",
                    }}
                    width={43}
                    height={43}
                />
            )}
        </div>
    )
}

const RACES = {
    WHITE: 'white',
    BLACK: 'black',
    ASIAN: 'asian'
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

const GENDERS = {
    MALE: "male",
    FEMALE: "female",
}

const PersonageCreationScreen = () => {
    const [gender, setGender] = useState(null)
    const [race, setRace] = useState(null)
    const [personageName, setPersonageName] = useState(null)
    const [currentStep, setCurrentStep] = useState(STEPS.Gender)
    const { userId } = useContext(UserContext)
    const navigate = useNavigate()

    const handlePersonageCreation = async () => {
        try {
            await personageCreate(userId, race, gender, personageName)
            navigate('/#')
        } catch(err) {
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
                {/* <Player width={'45%'} left={'29%'} top={'23%'} /> */}
                {gender === GENDERS.MALE && (
                    <Player width={"45%"} left={"29%"} top={"23%"} />
                )}
                {gender === GENDERS.FEMALE && (
                    <Player width={"45%"} left={"29%"} top={"23%"} />
                )}
                {gender === null && (
                    <Player type={null} width={"57%"} left={"26%"} top={"23%"} />
                )}
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
                        style={{ width: "40%", display: "flex", justifyContent: "center" }}
                    >
                        <div style={{ marginRight: "8px" }}>
                            <SquareButton
                                assignedValue={GENDERS.FEMALE}
                                selectedValue={gender}
                                handlePress={() =>
                                    setGender(gender === GENDERS.FEMALE ? null : GENDERS.FEMALE)
                                }
                                imageSrc={Assets.Icons.female}
                            />
                        </div>
                        <div>
                            <SquareButton
                                assignedValue={GENDERS.MALE}
                                selectedValue={gender}
                                handlePress={() =>
                                    setGender(gender === GENDERS.MALE ? null : GENDERS.MALE)
                                }
                                imageSrc={Assets.Icons.male}
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
                <Player width={"80%"} left={"13%"} top={"23%"} />
                <div
                    style={{
                        position: "absolute",
                        display: "flex", // Parent container uses flexbox
                        width: "100%",
                        alignItems: "center", // Center vertically (optional)
                        bottom: "5%",
                        zIndex: 10
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
                                setRace(null)
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
                                handlePress={() =>
                                    setRace(race === RACES.WHITE ? null : RACES.WHITE)
                                }
                                imageSrc={getGenderIcon(gender, RACES.WHITE)}
                            />
                        </div>
                        <div style={{ marginRight: "8px" }}>
                            <SquareButton
                                assignedValue={RACES.BLACK}
                                selectedValue={race}
                                handlePress={() =>
                                    setRace(race === RACES.BLACK ? null : RACES.BLACK)
                                }
                                imageSrc={getGenderIcon(gender, RACES.BLACK)}
                            />
                        </div>
                        <div>
                            <SquareButton
                                assignedValue={RACES.ASIAN}
                                selectedValue={race}
                                handlePress={() =>
                                    setRace(race === RACES.ASIAN ? null : RACES.ASIAN)
                                }
                                imageSrc={getGenderIcon(gender, RACES.ASIAN)}
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
                <Player width={"45%"} left={"29%"} top={"23%"} />
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
                    </div>
                    <div
                        style={{ width: "40%", display: "flex", justifyContent: "center" }}
                    >
                        <div style={{ marginRight: "8px" }}>

                        </div>
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
                                active={personageName ? true : false}
                                onClick={() => handlePersonageCreation()}
                            />
                        </div>
                        <div>

                        </div>
                    </div>
                    <div style={{
                        width: '100vw',
                        height: '100vh',
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '50%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            bottom: '8%'
                        }}>
                            <input
                                placeholder="***"
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    width: '100%',
                                    color: 'white',
                                    zIndex: 10,
                                    position: 'relative'
                                }}
                                onChange={(e) => setPersonageName(e.target.value)}
                            />
                            <img
                                src={Assets.nameUnderline}
                                style={{
                                    position: 'absolute',
                                    bottom: '-10px',
                                    width: '100%',
                                    zIndex: 5
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
                    >
                    </div>
                </div>
            </div>
        )
    }

}

export default PersonageCreationScreen
