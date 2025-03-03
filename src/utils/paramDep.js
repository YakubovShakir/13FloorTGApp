export const isFullMood = (mood) => mood === 100;
export const isHighMood = (mood) => mood < 100 && mood > 59;
export const isMediumMood = (mood) => mood <= 59 && mood > 19;
export const isLowMood = (mood) => mood <= 19 && mood >= 1;
export const isCriticallyMood = (mood) => mood < 1;

export const isFullEnergy = (energy, energy_capacity) => energy / energy_capacity * 100 === 100;
export const isHighEnergy = (energy, energy_capacity) => {
    const percentOutOfCapacity = energy / energy_capacity * 100
    
    return percentOutOfCapacity < 100 && percentOutOfCapacity >= 59;
}
export const isMediumEnergy = (energy, energy_capacity) => {
    const percentOutOfCapacity = energy / energy_capacity * 100

    return percentOutOfCapacity <= 59 && percentOutOfCapacity > 19;
}
export const isLowEnergy = (energy, energy_capacity) => {
    const percentOutOfCapacity = energy / energy_capacity * 100

    return percentOutOfCapacity <= 19 && percentOutOfCapacity >= 1;
}

export const isCriticallyEnergy = (energy, energy_capacity) => {
    const percentOutOfCapacity = energy / energy_capacity * 100

    return percentOutOfCapacity < 1;
}

export const isFullHungry = (hungry) => hungry === 100;
export const isHighHungry = (hungry) => hungry < 100 && hungry > 59;
export const isMeiumHungry = (hungry) => hungry <= 59 && hungry > 19;
export const isLowHungry = (hungry) => hungry <= 19 && hungry >= 1;
export const isCriticallyHungry = (hungry) => hungry < 1;
export function canEarnOrClaim (userParameters) {
    const { hungry, mood, energy, energy_capacity } = userParameters
    
    return !isCriticallyHungry(hungry) && !isCriticallyMood(mood) && !isCriticallyEnergy(energy, energy_capacity)
}

export function canStartTraining(userParameters) {
    const { hungry, energy, mood } = userParameters
    
    return !isCriticallyHungry(hungry) && !isCriticallyEnergy(energy) && !isFullMood(mood)
}

export function canStartSleeping(userParameters) {
    const { energy, energy_capacity } = userParameters

    return !isFullEnergy(energy, energy_capacity)
}

export function canStartWorking(userParameters) {
    const { energy, energy_capacity, mood, hungry } = userParameters

    return !isCriticallyEnergy(energy, energy_capacity) && !isCriticallyHungry(hungry) && !isCriticallyMood(mood)
}