import React, { useState, createContext, useCallback, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContext = createContext(null);

const notificationStyles = {
  container: {
    position: 'fixed',
    bottom: 25,
    width: '100%',
    transform: 'translateX(-50%)',
    zIndex: 9999999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  innerContainer: {
    width: '80%',
  },
  notification: {
    backgroundColor: 'rgba(22, 21, 21, 0.9)',
    color: 'white',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 8,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 200,
    backdropFilter: 'blur(10px)',
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    fontSize: 14,
    margin: 0,
  }
};

const NotificationProvider = ({ children }) => {
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const timeoutRef = useRef(null);

  const showNotification = useCallback((message, icon = null) => {
    setNotificationQueue(prevQueue => [...prevQueue, { message, icon }]);
  }, []);

  React.useEffect(() => {
    if (notificationQueue.length > 0 && !currentNotification) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);

      // CRITICAL CHANGE: Update the queue *BEFORE* setting the timeout
      setNotificationQueue(prevQueue => prevQueue.slice(1));

      timeoutRef.current = setTimeout(() => {
        setCurrentNotification(null); // Clear notification
      }, 5000); // 5-second delay
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notificationQueue, currentNotification]); // Dependency array remains [notificationQueue]


  const handleDismiss = () => {
    setCurrentNotification(null);
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <AnimatePresence>
        {currentNotification && (
          <motion.div
            initial={{ opacity: 0, y: -200 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={notificationStyles.container}
          >
            <div style={notificationStyles.innerContainer}>
              <div style={notificationStyles.notification}>
                {currentNotification.icon && (
                  <img
                    src={currentNotification.icon}
                    alt="notification icon"
                    style={notificationStyles.icon}
                  />
                )}
                <p style={notificationStyles.text}>{currentNotification.message}</p>
                 <button onClick={handleDismiss} style={{marginLeft: 'auto'}}>X</button> {/* Dismiss button */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export { NotificationProvider, useNotification };