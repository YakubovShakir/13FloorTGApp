import useTelegram from "./hooks/useTelegram"
import React, { createContext, useState, useEffect } from "react"
import { getParameters } from "./services/user/user"
// создаем контекст
const UserContext = createContext()

// создаем провайдер контекста
export const UserProvider = ({ children }) => {
  //states
  const [userParameters, setUserParameters] = useState(null)
  const [userPersonage, setUserPersonage] = useState(null)
  const [userClothing, setUserClothing] = useState(null)
  const [userShelf, setUserShelf] = useState(null)

  const [userId, setUserId] = useState(null)
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    setUserId(790629329)

    getParameters(790629329)
      .then((parameters) => {
        console.log('@@@', parameters)
        setUserParameters(parameters.parameters)
        setUserPersonage(parameters.personage)
        setUserClothing(parameters.clothing)
        setAppReady(true)
      }).catch(err => console.log('@', err))
    updateInformation()
  }, [])

  const fetchParams = async () => {
    setAppReady(false)
    console.log('FETCHING PARAMS')
    getParameters(790629329)
      .then((parameters) => {
        console.log('@@@', parameters)
        setUserParameters(parameters.parameters)
        setUserPersonage(parameters.personage)
        setUserClothing(parameters.clothing)
        setAppReady(true)
      }).catch(err => console.log('@', err))
  }

  const updateInformation = () => {
    try {
      setInterval(() => {
        getParameters(790629329).then((parameters) =>
          setUserParameters(parameters.parameters)
        )
      }, 30000)
    } catch (e) {
      console.log("Error when updateInfromation", e)
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
