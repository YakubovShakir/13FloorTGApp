import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from "react";
import { debounce } from 'lodash';
import { getParameters } from "./services/user/user";
import useTelegram from "./hooks/useTelegram";
import FullScreenSpinner from "./screens/Home/FullScreenSpinner";
import { useNotification } from "./NotificationContext";
import { useSettingsProvider } from "./hooks";

const UserContext = createContext();

const hasParametersChanged = (oldData, newData) => {
  if (!oldData || !newData) return true;
  return JSON.stringify(oldData.parameters) !== JSON.stringify(newData.parameters);
};

const hasPersonageChanged = (oldData, newData) => {
  if (!oldData || !newData) return true;
  return ['personage', 'clothing', 'shelf'].some(
    key => JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
  );
};

export const UserProvider = ({ children }) => {
  const [state, setState] = useState({
    parameters: {
      userParameters: null,
      isParametersLoading: true,
      parametersError: null
    },
    personage: {
      userPersonage: {},
      userClothing: null,
      userShelf: null,
      isPersonageLoading: true,
      personageError: null
    },
    isInitialized: false
  });

  const userId = useMemo(() =>
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 790629329,
    []
  );

  const isFetchingRef = useRef(false);
  const latestDataRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateParametersState = useCallback((updates) => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          ...updates
        }
      }));
    }
  }, []);

  const updatePersonageState = useCallback((updates) => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        personage: {
          ...prev.personage,
          ...updates
        }
      }));
    }
  }, []);

  const handleParametersError = useCallback((error) => {
    console.error('UserContext Parameters Error:', error);
    updateParametersState({
      parametersError: error.message,
      isParametersLoading: false
    });
    setState(prev => ({ ...prev, isInitialized: false }));
  }, [updateParametersState]);

  const handlePersonageError = useCallback((error) => {
    console.error('UserContext Personage Error:', error);
    updatePersonageState({
      personageError: error.message,
      isPersonageLoading: false
    });
    setState(prev => ({ ...prev, isInitialized: false }));
  }, [updatePersonageState]);

  const fetchData = useCallback(async (isInitial = false, signal) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const data = await getParameters(userId, { signal });
      if (!mountedRef.current) return;

      if (hasParametersChanged(latestDataRef.current, data)) {
        updateParametersState({
          userParameters: { ...data?.parameters, work_hourly_income_increase: data.work_hourly_income_increase, work_duration_decrease: data.work_duration_decrease },
          isParametersLoading: false,
          parametersError: null
        });
      }

      if (hasPersonageChanged(latestDataRef.current, data)) {
        updatePersonageState({
          userPersonage: data.personage || {},
          userClothing: data.clothing,
          userShelf: data.shelf,
          isPersonageLoading: false,
          personageError: null
        });
      }

      if (isInitial) {
        useTelegram.setReady();
        setState(prev => ({ ...prev, isInitialized: true }));
      }

      latestDataRef.current = data; // Moved this line
    } catch (error) {
      if (error.name === 'AbortError') return;

      if (error.message.includes('parameters')) {
        handleParametersError(error);
      } else if (error.message.includes('personage')) {
        handlePersonageError(error);
      } else {
        handleParametersError(error);
        handlePersonageError(error);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [userId, updateParametersState, updatePersonageState, handleParametersError, handlePersonageError]);

  const debouncedFetchData = useMemo(
    () => debounce(
      (isInitial, signal) => fetchData(isInitial, signal),
      100,
      { leading: true, trailing: false }
    ),
    [fetchData]
  );

  useEffect(() => {
    const controller = new AbortController();

    debouncedFetchData(true, controller.signal);

    const intervalId = setInterval(() => {
      debouncedFetchData(false, controller.signal);
    }, 0);

    return () => {
      controller.abort();
      clearInterval(intervalId);
      debouncedFetchData.cancel();
    };
  }, [debouncedFetchData]);

  const contextValue = useMemo(() => ({
    // Parameters related values
    userParameters: state.parameters.userParameters,
    isParametersLoading: state.parameters.isParametersLoading,
    parametersError: state.parameters.parametersError,
    setUserParameters: (newParams) => 
      updateParametersState({ userParameters: newParams }),

    // Personage related values
    userPersonage: state.personage.userPersonage,
    userClothing: state.personage.userClothing,
    userShelf: state.personage.userShelf,
    isPersonageLoading: state.personage.isPersonageLoading,
    personageError: state.personage.personageError,
    setUserPersonage: (newPersonage) => 
      updatePersonageState({ userPersonage: newPersonage }),

    // Common values
    userId,
    isInitialized: state.isInitialized,
    refreshData: async () => {
      const controller = new AbortController()
      await fetchData(false, controller.signal)
      checkAndSendNotifications();
      return () => controller.abort()
    }
  }), [state, userId, updateParametersState, updatePersonageState, fetchData])

  if (state.parameters.parametersError && state.personage.personageError) {
    return (
      <div className="error-container">
        <h2>Error loading user data</h2>
        <p>Parameters Error: {state.parameters.parametersError}</p>
        <p>Personage Error: {state.personage.personageError}</p>
        <button onClick={() => debouncedFetchData(true)}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <UserContext.Provider value={contextValue}>
      {(state.parameters.isParametersLoading || state.personage.isPersonageLoading) 
        ? <FullScreenSpinner /> 
        : children}
    </UserContext.Provider>
  )
}

export const useForeignUser = (userId) => {
  const [state, setState] = useState({
    parameters: {
      userParameters: null,
      isParametersLoading: false,
      parametersError: null
    },
    personage: {
      userPersonage: {},
      userClothing: null,
      userShelf: null,
      isPersonageLoading: false,
      personageError: null
    },
    isInitialized: false
  })

  const isFetchingRef = useRef(false)
  const latestDataRef = useRef(null)
  const mountedRef = useRef(true)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const updateParametersState = useCallback((updates) => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          ...updates
        }
      }))
    }
  }, [])

  const updatePersonageState = useCallback((updates) => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        personage: {
          ...prev.personage,
          ...updates
        }
      }))
    }
  }, [])

  const handleParametersError = useCallback((error) => {
    console.error('useUser Parameters Error:', error)
    updateParametersState({
      parametersError: error.message,
      isParametersLoading: false
    })
    setState(prev => ({ ...prev, isInitialized: false }))
  }, [updateParametersState])

  const handlePersonageError = useCallback((error) => {
    console.error('useUser Personage Error:', error)
    updatePersonageState({
      personageError: error.message,
      isPersonageLoading: false
    })
    setState(prev => ({ ...prev, isInitialized: false }))
  }, [updatePersonageState])

  const fetchData = useCallback(async (signal) => {
    if (!userId || isFetchingRef.current) return
    isFetchingRef.current = true

    // Set loading states
    updateParametersState({ isParametersLoading: true })
    updatePersonageState({ isPersonageLoading: true })

    try {
      const data = await getParameters(userId, { signal })
      if (!mountedRef.current) return

      // Handle parameters update
      if (hasParametersChanged(latestDataRef.current, data)) {
        updateParametersState({
          userParameters: { 
            ...data.parameters, 
            work_hourly_income_increase: data.work_hourly_income_increase, 
            work_duration_decrease: data.work_duration_decrease 
          },
          isParametersLoading: false,
          parametersError: null
        })
      }

      // Handle personage update
      if (hasPersonageChanged(latestDataRef.current, data)) {
        updatePersonageState({
          userPersonage: data.personage || {},
          userClothing: data.clothing,
          userShelf: data.shelf,
          isPersonageLoading: false,
          personageError: null
        })
      }

      setState(prev => ({ ...prev, isInitialized: true }))
      latestDataRef.current = data
    } catch (error) {
      if (error.name === 'AbortError') return
      
      if (error.message.includes('parameters')) {
        handleParametersError(error)
      } else if (error.message.includes('personage')) {
        handlePersonageError(error)
      } else {
        handleParametersError(error)
        handlePersonageError(error)
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [userId, updateParametersState, updatePersonageState, handleParametersError, handlePersonageError])

  const debouncedFetchData = useMemo(
    () => debounce(
      (signal) => fetchData(signal),
      100,
      { leading: true, trailing: false }
    ),
    [fetchData]
  )

  // Clear debounce on unmount
  React.useEffect(() => {
    return () => {
      debouncedFetchData.cancel()
    }
  }, [debouncedFetchData])

  return {
    // Parameters related values
    userParameters: state.parameters.userParameters,
    isParametersLoading: state.parameters.isParametersLoading,
    parametersError: state.parameters.parametersError,
    setUserParameters: (newParams) => 
      updateParametersState({ userParameters: newParams }),

    // Personage related values
    userPersonage: state.personage.userPersonage,
    userClothing: state.personage.userClothing,
    userShelf: state.personage.userShelf,
    isPersonageLoading: state.personage.isPersonageLoading,
    personageError: state.personage.personageError,
    setUserPersonage: (newPersonage) => 
      updatePersonageState({ userPersonage: newPersonage }),

    // Common values
    userId,
    isInitialized: state.isInitialized,
    refreshData: async () => {
      const controller = new AbortController()
      await fetchData(controller.signal)
      return () => controller.abort()
    }
  }
}

export const useUser = () => {
  const context = React.useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserContext