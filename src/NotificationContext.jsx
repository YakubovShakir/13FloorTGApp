import React, { useState, createContext, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContext = createContext(null);

const notificationStyles = {
  container: {
    position: 'fixed',
    bottom: 25,
    width: '100%',
    transform: 'translateX(-50%)',
    zIndex: 50,
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
  const [notification, setNotification] = useState({
    message: '',
    icon: null,
    isVisible: false
  });

  const showNotification = useCallback((message, icon = null) => {
    setNotification({ message, icon, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <AnimatePresence>
        {notification.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -200 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={notificationStyles.container}
          >
           <div style={notificationStyles.innerContainer}>
           <div style={notificationStyles.notification}>
              {notification.icon && (
                <img 
                  src={notification.icon} 
                  alt="notification icon" 
                  style={notificationStyles.icon}
                />
              )}
              <p style={notificationStyles.text}>{notification.message}</p>
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