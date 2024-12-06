import { instance } from "../instance"

export const getBoosts = async () => {
  try {
    const response = await instance.get(`/boost/getAll`)
    console.log(response)
    return response.data.boosts
  } catch (e) {
    console.log("Error while fetch boosts ", e)
  }
}

export const getUserBoosts = async (userId) => {
  try {
    const response = await instance.get(`/boost/user/${userId}`)

    return response.data.userBoosts
  } catch (e) {
    console.log("Error while fetch boosts ", e)
  }
}

export const buyBoost = async (userId, boostId) => {
  try {
    const response = await instance.post(`/boost/buy`, null, {
      params: { userId: userId, boostId: boostId },
    })
    return response.status
  } catch (e) {
    console.log("Error while fetch boosts ", e)
  }
}

export const useBoost = async (userId, boostId) => {
  try {
    const response = await instance.post(`/boost/use`, null, {
      params: { userId: userId, boostId: boostId },
    })
    return response.status
  } catch (e) {
    console.log("Error while fetch boosts ", e)
  }
}
