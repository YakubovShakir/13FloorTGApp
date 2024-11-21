import useTelegram from "./hooks/useTelegram";
import React, { createContext, useState, useEffect } from "react";
import { getParameters } from "./api/user";
// создаем контекст
const UserContext = createContext();

// создаем провайдер контекста
export const UserProvider = ({ children }) => {
  //states
  const [userParameters, setUserParameters] = useState(null);
  const [userId, setUserId] = useState(null)

  useEffect(()=> {
    setUserId(useTelegram?.getUserId)
    getParameters(useTelegram?.getUserId).then((parameters) => setUserParameters(parameters))
    updateInformation()
  }, [])

  const updateInformation = () => {
    try {
        setInterval(()=> {
            console.log("Обновляю параметры пользователя")

            getParameters(useTelegram?.getUserId).then((parameters) => setUserParameters(parameters)) 
        }, 30000)
    }
    catch (e) {
        console.log("Error when updateInfromation", e)
    }
  }

  return (
    <UserContext.Provider
      value={{
        userId,
        userParameters, 
        setUserParameters
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;