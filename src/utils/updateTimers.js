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
  stateOfProcess,
  setState,
  infinity,
  endFunction
) => {
  const inervalId = setInterval(() => {
    const newState = { ...stateOfProcess }
    const minuts = newState?.duration
    const seconds = newState?.seconds

    if (!seconds && !minuts) {
      if (infinity) {
        newState.seconds = 59
      } else {
        setState(null)
        return inervalId
      }
      endFunction()
    }

    if (minuts) {
      if (seconds) {
        newState.seconds -= 1
      } else {
        newState.duration -= 1
        newState.seconds = 59
      }
    } else {
      newState.seconds -= 1
    }

    setState(newState)
  }, 1000)

  return inervalId
}
