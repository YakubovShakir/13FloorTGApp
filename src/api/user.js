import { instance } from "./instance"

export const getParameters = async (id) => {
  try {
    let parameters
    await instance
      .get(`/users/parameters/${id}`)
      .then((response) => (parameters = response.data.parameters))
      .catch((error) => {
        console.log("Some error on /parameters/id", error)
      })

    return parameters
  } catch (e) {
    console.log("Error while fetch parameters ", e)
  }
}

export const getCurrentProcess = async (id) => {
  try {
    let curentProcess

    curentProcess = await instance
      .get(`/users/process/${id}`)
      .then((response) => (parameters = response.data.parameters))
      .catch((error) => {
        console.log("Some error on /parameters/id", error)
      }) 

    return curentProcess
  } catch(e) {
    console.log("Error while fetch parameters ", e)
  }
}

export const getTrainingParameters = async (id) => {
  try {
    let parameters
    await instance
      .get(`/users/training-parameters/${id}`)
      .then((response) => {
        parameters = response.data.training_parameters
      })
      .catch((error) => {
        console.log("Some error on getTrainingParameters", error)
      })

    return parameters
  } catch (e) {
    console.log("Error while fetch getTrainingParameters ", e)
  }
}

export const getUserProcesses = async (userId, procType) => {
  try {
    let processes
    await instance
      .get(`/users/user/${userId}/processes/${procType}`)
      .then((response) => (processes = response.data.processes))
      .catch((error) => {
        processes = null
        console.log("Some error on getUserProcesses:", error)
      })
    return processes
  } catch (error) {
    console.log("getUserProcesses catch error - ", e)
  }
}

export const startTraining = async (id) => {
  try {
    let status
    await instance
      .post(`/users/user/${id}/startTraining`)
      .then((response) => {
        status = response.data.status
      })
      .catch((error) => {
        console.log("Some error on getTrainingParameters", error)
      })

    return status
  } catch (e) {
    console.log("Error while fetch getTrainingParameters ", e)
  }
}
