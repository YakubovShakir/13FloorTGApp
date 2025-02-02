import moment from "moment-timezone"

export const updateProcessesTimers = (stateOfProcess, setState, end) => {
  if (!stateOfProcess || !stateOfProcess.length) return

  const intervalId = setInterval(() => {
    const updatedProcesses = stateOfProcess.map(process => {
      // Get total duration in seconds
      const totalDuration = process.target_duration_in_seconds || process.base_duration_in_seconds
      if (!totalDuration || !process.createdAt) return process

      // Calculate remaining time
      const elapsedSeconds = moment().diff(moment(process.createdAt), 'seconds')
      const remainingSeconds = Math.max(0, totalDuration - elapsedSeconds)

      // Convert to minutes and seconds
      const duration = Math.floor(remainingSeconds / 60)
      const seconds = remainingSeconds % 60

      // Check if process is complete
      if (duration === 0 && seconds === 0) {
        if (end) end().then(() => console.log('ran end cycle'))
      }

      return {
        ...process,
        duration,
        seconds
      }
    }).filter(Boolean)

    setState(updatedProcesses)
  }, 1000)

  return intervalId
}

// Helper function to get minutes and seconds for a specific process
export const getProcessRemainingTime = (process) => {
  if (!process?.createdAt) return { duration: 0, seconds: 0 }

  const totalDuration = process.target_duration_in_seconds || process.base_duration_in_seconds
  const elapsedSeconds = moment().diff(moment(process.createdAt), 'seconds')
  const remainingSeconds = Math.max(0, totalDuration - elapsedSeconds)

  return {
    duration: Math.floor(remainingSeconds / 60),
    seconds: remainingSeconds % 60
  }
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