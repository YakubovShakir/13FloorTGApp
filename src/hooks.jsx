import { createContext, useContext, useState, useEffect, useRef } from 'react';
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const backgroundMusicRef = useRef(new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Music.mp3"));
  const clickSoundPoolRef = useRef(new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/click.mp3"));

  const currentSoundIndexRef = useRef(0);
  const hasInteractedRef = useRef(false);

  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('soundEnabled')
    if(!stored) {
      localStorage.setItem('soundEnabled', 'true');
      return true
    } else if (stored === 'true') {
      return true
    } else {
      return false
    }
  });

  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    const stored = localStorage.getItem('musicEnabled')
    if(!stored) {
      localStorage.setItem('musicEnabled', 'true');
      return true
    } else if (stored === 'true') {
      return true
    } else {
      return false
    }
  });

  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('langc');
    console.log('@', stored)
    if (!stored) {
      // Get Telegram user's language code
      const userLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code === 'ru' ? 'ru' : 'en';
      // Store it in localStorage
      localStorage.setItem('langc', userLang);
      return userLang;
    }
    return stored;
  })

  useEffect(() => localStorage.setItem('langc', lang), [lang])

  // Set initial volume
  useEffect(() => {
    backgroundMusicRef.current.volume = 0.25;
    // Preload audio
    backgroundMusicRef.current.load();
    clickSoundPoolRef.current.load();
  }, []);

  const playClickSound = () => {
    if (!isSoundEnabled) return;
    clickSoundPoolRef.current.play().catch(console.error);
  };

  const toggleSound = () => {
    setIsSoundEnabled(prevIsSoundEnabled => {
      const newIsSoundEnabled = !prevIsSoundEnabled;
      localStorage.setItem('soundEnabled', JSON.stringify(newIsSoundEnabled));
      return newIsSoundEnabled;
    });
  };

  const toggleMusic = () => {
    hasInteractedRef.current = true;
    setIsMusicEnabled(prevIsMusicEnabled => {
      const newIsMusicEnabled = !prevIsMusicEnabled;
      localStorage.setItem('musicEnabled', JSON.stringify(newIsMusicEnabled));
      
      // Immediately handle music playback
      if (newIsMusicEnabled) {
        backgroundMusicRef.current.play().catch(console.error);
      } else {
        backgroundMusicRef.current.pause();
      }
      
      return newIsMusicEnabled;
    });
  };

  // Handle initial music autoplay and Telegram WebApp detection
  useEffect(() => {
    const backgroundMusic = backgroundMusicRef.current;
    
    // Check if running in Telegram WebApp
    const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;
    
    if (isTelegramWebApp) {
      // For Telegram WebApp, we need to wait for user interaction
      const handleFirstInteraction = () => {
        if (isMusicEnabled && !hasInteractedRef.current) {
          backgroundMusic.play().catch(console.error);
          hasInteractedRef.current = true;
        }
      };

      window.addEventListener('click', handleFirstInteraction, { once: true });
      
      return () => {
        window.removeEventListener('click', handleFirstInteraction);
      };
    } else {
      // Regular browser behavior
      if (isMusicEnabled) {
        backgroundMusic.play().catch(_ => {
          const playOnInteraction = () => {
            backgroundMusic.play().catch(console.error);
            document.removeEventListener('click', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
        });
      }
    }

    return () => {
      backgroundMusic.pause();
    };
  }, [isMusicEnabled]);

  // Handle click sounds
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.dataset.soundToggle) return;
      playClickSound();
    };

    return () => {
      clickSoundPoolRef.current.pause();
    };
  }, [isSoundEnabled]);

  return (
    <SettingsContext.Provider value={{ isSoundEnabled, toggleSound, toggleMusic, isMusicEnabled, lang, setLang, playClickSound }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsProvider() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsProvider must be used within a SettingsProvider');
  }
  return context;
}