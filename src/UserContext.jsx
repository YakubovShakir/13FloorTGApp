import useTelegram from "./hooks/useTelegram"
import React, { createContext, useState, useEffect } from "react"
import { getParameters } from "./services/user/user"
// создаем контекст
const UserContext = createContext()

// создаем провайдер контекста
export const UserProvider = ({ children }) => {
  //states
  const [userParameters, setUserParameters] = useState(null)
  const [userId, setUserId] = useState(null)
  const [appReady, setAppReady] = useState(null)
  useEffect(() => {
    setUserId(790629329)
    getParameters(790629329).then((parameters) => setUserParameters(parameters))
    setAppReady(true)
    updateInformation()
  }, [])

  const updateInformation = () => {
    try {
      setInterval(() => {
        getParameters(790629329).then((parameters) =>
          setUserParameters(parameters)
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
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
