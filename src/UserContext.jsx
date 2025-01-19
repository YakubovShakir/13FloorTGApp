import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react"
import { getParameters } from "./services/user/user"
import useTelegram from "./hooks/useTelegram"
import FullScreenSpinner from "./screens/Home/FullScreenSpinner"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [state, setState] = useState({
    userParameters: null,
    userPersonage: null,
    userClothing: null,
    userShelf: null,
    isInitialized: false // Replace appReady with isInitialized
  })
  
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 790629329
  const isFetchingRef = useRef(false)
  const latestDataRef = useRef(null)

  const fetchParams = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const parameters = await getParameters(userId)

      if (JSON.stringify(parameters) !== JSON.stringify(latestDataRef.current)) {
        setState(prev => ({
          ...prev,
          userParameters: {...parameters.parameters},
          userPersonage: parameters.personage,
          userClothing: parameters.clothing,
          userShelf: parameters.shelf,
          isInitialized: isInitial ? true : prev.isInitialized
        }))
        latestDataRef.current = parameters
      } else if (isInitial) {
        useTelegram.setReady()
        setState(prev => ({ ...prev, isInitialized: true }))
      }
    } catch (err) {
      console.error('Failed to fetch parameters:', err)
      if (isInitial) {
        setState(prev => ({ ...prev, isInitialized: false }))
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [userId])

  useEffect(() => {
    fetchParams(true)
    
    const intervalId = setInterval(() => {
      fetchParams(false)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [fetchParams])

  return (
    <UserContext.Provider
      value={{
        ...state,
        userId,
        fetchParams: () => fetchParams(false),
        setUserParameters: (newParams) => 
          setState(prev => ({ ...prev, userParameters: newParams })),
        setUserPersonage: (newParams) => 
          setState(prev => ({...prev, userPersonage: newParams}))
      }}
    >
      { state.isInitialized ? children : <FullScreenSpinner/> }
    </UserContext.Provider>
  )
}

export default UserContext