const formatTime = (timeInMinute, s) => {
  const d = Math.floor(timeInMinute / 60 / 24)
  const h =
    d >= 1
      ? Math.floor(timeInMinute / 60 - d * 24)
      : Math.floor(timeInMinute / 60)
  const m = Math.floor(timeInMinute % 60)

  let days = d ? d + "d " : ""
  let hours = h ? h + "h " : ""
  let minuts = m ? m + "m ": ""
  let seconds = s ? s + "s" : ""
  return days + hours + minuts + seconds
}

export const getMinutesAndSeconds = (totalSeconds) => {
    const duration = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return { duration, seconds }
}


export default formatTime
