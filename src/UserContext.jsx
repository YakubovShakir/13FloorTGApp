import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from "react"
import { debounce } from 'lodash'
import { getParameters } from "./services/user/user"
import useTelegram from "./hooks/useTelegram"
import FullScreenSpinner from "./screens/Home/FullScreenSpinner"

const UserContext = createContext()

const hasDataChanged = (oldData, newData) => {
  if (!oldData || !newData) return true
  
  return ['parameters', 'personage', 'clothing', 'shelf'].some(
    key => JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
  )
}

export const UserProvider = ({ children }) => {
  const [state, setState] = useState({
    userParameters: null,
    userPersonage: {},
    userClothing: null,
    userShelf: null,
    isInitialized: false,
    error: null,
    isLoading: true
  })
  
  const userId = useMemo(() => 
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 790629329,
    []
  )
  
  const isFetchingRef = useRef(false)
  const latestDataRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const updateState = useCallback((updates) => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        ...updates
      }))
    }
  }, [])

  const handleError = useCallback((error) => {
    console.error('UserContext Error:', error)
    updateState({
      error: error.message,
      isLoading: false,
      isInitialized: false
    })
  }, [updateState])

  const fetchParams = useCallback(async (isInitial = false, signal) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const parameters = await getParameters(userId, { signal })

      if (!mountedRef.current) return

      if (hasDataChanged(latestDataRef.current, parameters)) {
        if (isInitial) {
          useTelegram.setReady()
        }

        updateState({
          userParameters: { ...parameters.parameters },
          userPersonage: parameters.personage || {},
          userClothing: parameters.clothing,
          userShelf: parameters.shelf,
          isInitialized: true,
          isLoading: false,
          error: null
        })

        latestDataRef.current = parameters
      } else if (isInitial) {
        updateState({
          isInitialized: true,
          isLoading: false
        })
      }
    } catch (error) {
      if (error.name === 'AbortError') return
      
      handleError(error)
    } finally {
      isFetchingRef.current = false
    }
  }, [userId, updateState, handleError])

  const debouncedFetchParams = useMemo(
    () => debounce(
      (isInitial, signal) => fetchParams(isInitial, signal),
      750,
      { leading: true, trailing: false }
    ),
    [fetchParams]
  )

  useEffect(() => {
    const controller = new AbortController()
    
    debouncedFetchParams(true, controller.signal)
    
    const intervalId = setInterval(() => {
      debouncedFetchParams(false, controller.signal)
    }, 1000) // Increased interval to reduce server load

    return () => {
      controller.abort()
      clearInterval(intervalId)
      debouncedFetchParams.cancel()
    }
  }, [debouncedFetchParams])

  const contextValue = useMemo(() => ({
    ...state,
    userId,
    fetchParams: (signal) => debouncedFetchParams(false, signal),
    setUserParameters: (newParams) => 
      updateState({ userParameters: newParams }),
    setUserPersonage: (newPersonage) => 
      updateState({ userPersonage: newPersonage }),
    refreshData: async () => {
      const controller = new AbortController()
      await fetchParams(false, controller.signal)
      return () => controller.abort()
    }
  }), [state, userId, debouncedFetchParams, updateState, fetchParams])

  //!!!TODO: ERROR SCREEN WITH RETRY
  if (state.error) {
    return (
      <div className="error-container">
        <h2>Error loading user data</h2>
        <p>{state.error}</p>
        <button onClick={() => debouncedFetchParams(true)}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <UserContext.Provider value={contextValue}>
      {state.isLoading ? <FullScreenSpinner /> : children}
    </UserContext.Provider>
  )
}

// Custom hook for consuming the context
export const useUser = () => {
  const context = React.useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserContext