import moment from "moment-timezone"

export const updateProcessesTimers = (stateOfProcess, setState) => {
  const inervalId = setInterval(() => {
    const arr = []

    for (let process of stateOfProcess) {
      const minuts = process?.duration
      const seconds = process?.seconds

      if (!(seconds - 1 > 0) && !minuts) continue

      if (minuts) {
        if (seconds) {
          process.seconds -= 1
        } else {
          process.duration -= 1
          process.seconds = 59
        }
      } else {
        process.seconds -= 1
      }
      arr.push(process)
    }
    setState(arr)
  }, 1000)

  return inervalId
}

export const updateProcessTimers = (
  process,
  onUpdate,
  isWorkProcess,
  updateParametersFunction
) => {
  return setInterval(() => {
    const updatedProcess = { ...process };
    
    const baseDuration = updatedProcess.target_duration_in_seconds || updatedProcess.base_duration_in_seconds
    const endTime = moment(updatedProcess.createdAt).add(baseDuration, 'seconds'); // Calculate the target end time
    const now = moment();

    const timeLeft = moment.duration(endTime.diff(now)); // Calculate the difference
    
    if(timeLeft > 0) {
      const minutes = timeLeft.minutes();
      const seconds = timeLeft.seconds();
    
      updatedProcess.duration = minutes; // Store the calculated minutes
      updatedProcess.seconds = seconds; // Store the calculated seconds
      updatedProcess.totalSecondsRemaining = timeLeft.asSeconds();
      updatedProcess.totalSeconds = baseDuration
      updatedProcess.formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
      
      onUpdate(updatedProcess);
      
      if(updateParametersFunction) {
        updateParametersFunction();
      }
    }
  }, 1000);
};