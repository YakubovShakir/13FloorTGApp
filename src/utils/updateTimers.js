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
    
    if (updatedProcess.seconds > 0) {
      updatedProcess.seconds--;
    } else if (updatedProcess.duration > 0) {
      updatedProcess.duration--;
      updatedProcess.seconds = 59;
    }
    
    // Add formatted time string
    updatedProcess.formattedTime = `${String(updatedProcess.duration).padStart(2, '0')}:${String(updatedProcess.seconds).padStart(2, '0')}`;
    
    onUpdate(updatedProcess);
    
    if (isWorkProcess && updateParametersFunction) {
      updateParametersFunction();
    }
  }, 1200);
};