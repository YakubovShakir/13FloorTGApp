import { instance } from "../instance"

// Начать процесс
export const startProcess = async (type, userId, typeId = false) => {
  try {
    const response = await instance.post(`/process/start`, null, {
      params: { id: userId, type: type, typeId: typeId },
    })
    return response.data.status
  } catch (e) {
    console.log("Error in startProcess ", e)
  }
}

// Остановить активный процесс
export const stopProcess = async (userId) => {
  try {
    const response = await instance.post(`/process/stop`, null, {
      params: { id: userId },
    })
    return response.data.status
  } catch (e) {
    console.log("Error in startProcess ", e)
  }
}

// Получить процессы определенного типа 
export const getProcesses = async (type, userId) => {
  try {
    const response = await instance.get(`/process/get`, {
      params: { id: userId, type: type},
    })
    return response.data.processes
  } catch (e) {
    console.log("Error in startProcess ", e)
  }
}

// Получить активный процесс
export const getActiveProcess = async (userId) => {
    try {
      const response = await instance.get(`/process/getActive`, {
        params: { id: userId},
      })
      return response.data.process
    } catch (e) {
      console.log("Error in startProcess ", e)
    }
  }
  
  export const checkCanStop = async (userId) => {
    try {
      const response = await instance.get(`/process/check-can-stop/${userId}/`)
      return response.data
    } catch (e) {
      console.log("Error in startProcess ", e)
    }
  }