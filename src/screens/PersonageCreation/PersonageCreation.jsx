import React, { useState } from 'react'
import './PersonageCreation.css'
import Assets from '../../assets'
import Player from '../../components/complex/Player/Player'

const STEPS = {
    Gender: 'gender',
    Race: 'race',
    Name: 'name'
}

const GenderButton = ({ handlePress }) => {
    return (
        <div style={{ backgroundColor: '#591258', height: 48, width: 43, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
            <div style={{ backgroundColor: '#595254', height: 43, width: 43, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <img src={Assets.Icons.male} width={43} height={43} style={{ paddingTop: 6 }} />
            </div>
        </div>

    )
}

const PersonageCreationScreen = () => {
    const [gender, setGender] = useState(null)
    const [race, setRace] = useState(null)
    const [personageName, setPersonageName] = useState(null)
    const [currentStep, setCurrentStep] = useState(STEPS.Gender)
    const [pressedState, setPressedState] = useState(false);

    const handleButtonClick = () => {
        setPressedState(!pressedState);
    };

    const handleGenderChange = () => { }


    if (currentStep === STEPS.Gender) {
        return (
            <div style={{ background: `url(${Assets.BG.personageCreationBg})`, backgroundSize: 'cover', height: '100vh', width: '100vw' }}>
                <Player width={'45%'} left={'29%'} top={'25%'} />
                <div style={{ position: 'absolute', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', bottom: '5%' }}>
                    <div style={{ marginRight: '16px' }}>
                        <GenderButton />
                    </div>
                    <div>
                        <GenderButton />
                    </div>
                </div>
            </div>
        )
    }
}

export default PersonageCreationScreen