import React, { createContext, useState, useEffect, useRef, useCallback } from "react"
import { getParameters } from "./services/user/user"
import useTelegram from "./hooks/useTelegram"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [userParameters, setUserParameters] = useState(null)
  const [userPersonage, setUserPersonage] = useState(null)
  const [userClothing, setUserClothing] = useState(null)
  const [userShelf, setUserShelf] = useState(null)
  const [userId, setUserId] = useState(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 790629329)
  const [appReady, setAppReady] = useState(false)
  
  const isFetchingRef = useRef(false)
  const latestDataRef = useRef(null)

  const fetchParams = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return
    
    isFetchingRef.current = true
    if (isInitial) setAppReady(false)
    
    try {
      const parameters = await getParameters(userId)
      
      if (JSON.stringify(parameters) !== JSON.stringify(latestDataRef.current)) {
        setUserParameters(parameters.parameters)
        setUserPersonage(parameters.personage)
        setUserClothing(parameters.clothing)
        setUserShelf(parameters.shelf)
        latestDataRef.current = parameters
      }
      
      if (isInitial) setAppReady(true)
      useTelegram.setReady()
    } catch(err) {
      
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchParams(true)
    
    // Set up polling
    const intervalId = setInterval(() => {
      fetchParams(false)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [fetchParams])

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
        fetchParams: () => fetchParams(true),
        userShelf
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserContext