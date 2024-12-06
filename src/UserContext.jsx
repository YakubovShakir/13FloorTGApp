import React, { createContext, useState, useEffect } from "react"
import { getParameters } from "./services/user/user"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  //states
  const [userParameters, setUserParameters] = useState(null)
  const [userPersonage, setUserPersonage] = useState(null)
  const [userClothing, setUserClothing] = useState(null)

  const [userId, setUserId] = useState(null)
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    // Check if running in Telegram WebApp
    const tg = window.Telegram?.WebApp
    const actualUserId = tg?.initDataUnsafe?.user?.id || 790629329

    setUserId(actualUserId)

    getParameters(actualUserId)
      .then((parameters) => {
        console.log('@@@', parameters)
        setUserParameters(parameters.parameters)
        setUserPersonage(parameters.personage)
        setUserClothing(parameters.clothing)
        setAppReady(true)
      }).catch(err => console.log('@', err))
    updateInformation(actualUserId)
  }, [])

  const fetchParams = async () => {
    const tg = window.Telegram?.WebApp
    const actualUserId = tg?.initDataUnsafe?.user?.id || 790629329

    setAppReady(false)
    console.log('FETCHING PARAMS')
    getParameters(actualUserId)
      .then((parameters) => {
        console.log('@@@', parameters)
        setUserParameters(parameters.parameters)
        setUserPersonage(parameters.personage)
        setUserClothing(parameters.clothing)
        setAppReady(true)
      }).catch(err => console.log('@', err))
  }

  const updateInformation = (userId) => {
    try {
      setInterval(() => {
        getParameters(userId).then((parameters) =>
          setUserParameters(parameters.parameters)
        )
      }, 30000)
    } catch (e) {
      console.log("Error when updateInformation", e)
    }
  }

  return (
    <UserContext.Provider
      value={{
        appReady,
        userId,
        userParameters,
        setUserParameters,
        userPersonage,
        setUserPersonage,
        userClothing,
        fetchParams
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContext