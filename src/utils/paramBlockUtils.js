import formatTime from "./formatTime"
import { recalcValuesByParameters } from "./paramDep"

// Effects applied to expected rewards and durations in actions
export const COLORS = {
  RED: "red",
  GREEN: "#22c7a3",
  WHITE: "white",
}

export const getDurationAndColor = (
  process_type,
  durationInSeconds,
  parameters
) => {
  console.log("@", parameters)
  let targetDuration = durationInSeconds
  let color = COLORS.WHITE

  if (process_type === "work") {
    const workDurationDecrease = parameters?.work_duration_decrease || 0
    targetDuration = durationInSeconds * (1 - workDurationDecrease / 100)
  }

  if (process_type === "training") {
    const trainingDurationDecrease = parameters?.training_duration_decrease || 0
    targetDuration = durationInSeconds * (1 - trainingDurationDecrease / 100)
  }

  if (process_type === "sleep") {
    const sleepingDurationDecrease = parameters?.sleeping_duration_decrease || 0
    targetDuration = durationInSeconds * (1 - sleepingDurationDecrease / 100)
  }

  if (targetDuration === durationInSeconds) color = COLORS.WHITE
  if (targetDuration < durationInSeconds) color = COLORS.GREEN
  if (targetDuration > durationInSeconds) color = COLORS.RED

  const minutes = Math.floor(targetDuration / 60)
  const seconds = Math.ceil(targetDuration % 60)

  console.log(targetDuration, durationInSeconds)
  return {
    value: formatTime(minutes, seconds),
    color,
  }
}

export const getCoinRewardAndColor = (
  workDuration,
  workRewardHourly,
  parameters
) => {
  let color = COLORS.RED

  // Base hourly rate plus any increase
  const baseHourlyRate =
    workRewardHourly + (parameters.work_hourly_income_increase || 0)

  // Neko boost multiplier (converting percentage to multiplier)
  const nekoBoostMultiplier = parameters.neko_boost_percentage

  // Calculate final reward:
  // (hourly rate * boost) / 3600 * duration, rounded to 2 decimal places
  const targetReward =
    Math.round(
      ((baseHourlyRate * nekoBoostMultiplier) / 3600) * workDuration * 100
    ) / 100

  const endValue = recalcValuesByParameters(parameters, {
    coinsReward: targetReward,
  }).coins

  // Set color based on whether there's any increase or boost
  if (endValue < (baseHourlyRate / 3600 * workDuration)) {
    color = COLORS.RED
  } else if (endValue > targetReward){
    color = COLORS.GREEN
  } else {
    color = COLORS.WHITE
  }

  return {
    value: endValue,
    color,
  }
}
