import moment from "moment-timezone"
import { instance } from "../instance"

export const getParameters = async (id) => {
  try {
    const parameters = await instance
      .get(`/users/parameters/${id}`)
      .then((response) => response.data)
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
  } catch (e) {
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

export const getUserActiveProcess = async (userId) => {
  try {
    const response = await instance.get(`process/getActive?id=${userId}`)
    return response.data.process
  } catch (e) {
    console.log("Some error on getUserActiveProcesses:", e)
    return null
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

export const personageCreate = async (id, race, gender) => {
  try {
    await instance.post(`/users/personage/create/${id}`, {
      race,
      gender,
    })
  } catch (e) {
    console.log("Error while fetch getTrainingParameters ", e)
  }
}

export const getShopItems = async (id) => {
  try {
    const { data } = await instance.get(`/users/${id}/shop/get-items`)
    console.log("Shop data", data)
    return data
  } catch (err) {
    console.log("Error while fetching shop items", err)
  }
}

export const getInventoryItems = async (id) => {
  try {
    const { data } = await instance.get(`/users/${id}/inventory/get-items`)
    console.log("Inventory", data)
    return data
  } catch (err) {
    console.log("Error while fetching shop items", err)
  }
}

export const handleClothesUnequip = async (
  id,
  clothing_id,
  type,
  productType
) => {
  await instance.post(`/users/${id}/inventory/c-unequip`, {
    clothing_id,
    type,
    productType,
  })
}

export const handleClothesEquip = async (
  id,
  clothing_id,
  type,
  productType
) => {
  await instance.post(`/users/${id}/inventory/c-equip`, {
    clothing_id,
    type,
    productType,
  })
}

export const buyItemsForCoins = async (userId, itemId, productType) => {
  await instance.post(`/users/${userId}/buy-items-for-coins`, {
    id: itemId,
    productType,
  })
}

export const getUserInvestments = async (userId) => {
  const { data } = await instance.get(`/users/${userId}/investments`)
  return data
}

export const buyInvestmentLevel = async (userId, investment_type) => {
  const { data } = await instance.post(
    `/users/${userId}/investments/buy-level`,
    {
      investment_type,
    }
  )
  return data
}

export const claimInvestment = async (userId, investment_type) => {
  const { data } = await instance.post(`/users/${userId}/investments/claim`, {
    investment_type,
  })
  return data
}

export const startInvestment = async (userId, investment_type) => {
  const { data } = await instance.post(`/users/${userId}/investments/start`, {
    investment_type,
  })
  return data
}

export const getTasks = async (userId) => {
  const { data } = await instance.get(`/users/${userId}/tasks`)
  return data
}

export const claimTask = async (userId, id) => {
  const { data } = await instance.post(`/users/${userId}/tasks/claim`, {
    id,
  })
  return data
}

export const WalletConnectionErrors = {
  BadRequest: "BAD_REQUEST",
  Forbidden: "FORBIDDEN",
  InternalServerError: "ISE",
}

export const saveUserWallet = async (userId, tonWalletAddress) => {
  try {
    await instance.post(`/users/${userId}/wallet/connect`, {
      tonWalletAddress,
    })
  } catch (error) {
    // Handle different error codes
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400: // Bad Request
          return WalletConnectionErrors.BadRequest
        case 403: // Forbidden
          return WalletConnectionErrors.Forbidden
        default:
          return WalletConnectionErrors.InternalServerError
      }
    } else {
      return WalletConnectionErrors.InternalServerError
    }
  }
}

export const disconnectUserWallet = async (userId) => {
  try {
    await instance.post(`/users/${userId}/wallet/disconnect`)
  } catch (error) {
    // Handle different error codes
    if (error.response) {
      const { status } = error.response

      switch (status) {
        case 400: // Bad Request
          return WalletConnectionErrors.BadRequest
        case 403: // Forbidden
          return WalletConnectionErrors.Forbidden
        default:
          return WalletConnectionErrors.InternalServerError
      }
    } else {
      return WalletConnectionErrors.InternalServerError
    }
  }
}

export const getLeaderboard = async () => {
  const { data } = await instance.get(`/users/leaderboard`)
  return data.leaderboard
}

export const getServerTime = async () => {
  const { data } = await instance.get(`/users/time`)

  return moment(data.server_time).tz("Europe/Moscow")
}

export const submitProfileData = async (userId, WebApp) => {
  // Parse the initData string
  const { initData, initDataUnsafe } = WebApp
  console.log("DECODED", initData, initDataUnsafe)
  const initDataObj = Object.fromEntries(new URLSearchParams(initData))
  const user = JSON.parse(initDataObj.user || "{}")

  // Create payload object with only provided fields
  const payload = {}

  if (user.photo_url) {
    payload.photo_url = user.photo_url
  }

  if (user.first_name) {
    payload.first_name = user.first_name
  }

  if (user.last_name) {
    payload.last_name = user.last_name
  }

  if (user.username) {
    payload.username = user.username
  }

  console.log("Updating profile data: ", payload, initDataObj)

  // Only send request if we have any data to send
  if (Object.keys(payload).length > 0) {
    await instance.post(`/users/${userId}/profile-data`, payload)
  } else {
    console.log("No user data available to submit")
  }
}

export const getOwnNekoState = async (userId) => {
  const response = await instance.get(`/users/neko/user-state/${userId}`)
  
  return response.data
}

export const getForeignNekoState = async (userId, targetUserId) => {
  const response = await instance.post(`/users/neko/interaction-state`, {
    userId,
    targetUserId    
  })

  return response.data
}
 
export const interactWithNeko = async (userId, targetUserId) => {
  const response = await instance.post(`/users/neko/interact`, {
    userId,
    targetUserId    
  })

  return response.data
}
