export const isFullMood = (mood) => mood === 100;
export const isHighMood = (mood) => mood < 100 && mood > 49;
export const isMediumMood = (mood) => mood <= 49 && mood > 9;
export const isLowMood = (mood) => mood <= 9 && mood >= 1;
export const isCriticallyMood = (mood) => mood < 1;

export const isFullEnergy = (energy, energy_capacity) => energy / energy_capacity * 100 === 100;
export const isHighEnergy = (energy, energy_capacity) => {
    const percentOutOfCapacity = energy / energy_capacity * 100
    
    return percentOutOfCapacity < 100 && percentOutOfCapacity >= 49;
}
export const isMediumEnergy = (energy, energy_capacity) => {
    const percentOutOfCapacity = energy / energy_capacity * 100

    return percentOutOfCapacity <= 49 && percentOutOfCapacity > 9;
}
export const isLowEnergy = (energy, energy_capacity) => {
    const percentOutOfCapacity = energy / energy_capacity * 100

    return percentOutOfCapacity <= 9 && percentOutOfCapacity >= 1;
}

export const isCriticallyEnergy = (energy, energy_capacity) => {
    const percentOutOfCapacity = energy / energy_capacity * 100

    return percentOutOfCapacity < 1;
}

export const isFullHungry = (hungry) => hungry === 100;
export const isHighHungry = (hungry) => hungry < 100 && hungry > 49;
export const isMeiumHungry = (hungry) => hungry <= 49 && hungry > 9;
export const isLowHungry = (hungry) => hungry <= 9 && hungry >= 1;
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