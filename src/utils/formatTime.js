const formatTime = (timeInMinute) => {
    const d = Math.floor(timeInMinute / 60 / 24)
    const h = d >= 1 ? Math.floor(timeInMinute / 60 - d * 24) : Math.floor(timeInMinute / 60)
    const m = Math.floor(timeInMinute % 60) 

    let days = d ?  d + "d " : ""
    let hours = h ? h + "h " : ""
    let minuts = m ? m + "m " : ""
    return days + hours + minuts 
}
export default formatTime