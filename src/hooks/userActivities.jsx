import { useEffect } from "react"

export const useVisibilityChange = (callback) => {
    useEffect(() => {
      const handleVisibilityChange = () => {
        console.log('change', Date.now())
        if (document.visibilityState === 'visible') {
          callback()
        }
      }
  
      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [callback])
  }
  
  export const useWindowFocus = (callback) => {
    useEffect(() => {
      window.addEventListener('focus', callback)
      return () => window.removeEventListener('focus', callback)
    }, [callback])
  }