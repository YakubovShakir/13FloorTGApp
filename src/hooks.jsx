import { createContext, useContext, useState, useEffect, useRef } from 'react';
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const backgroundMusicRef = useRef(new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Music.mp3"));
  const clickSoundPoolRef = useRef(
    Array(5).fill(null).map(() => new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/click.mp3"))
  );

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

  // Set initial volume
  useEffect(() => {
    backgroundMusicRef.current.volume = 0.25;
    // Preload audio
    backgroundMusicRef.current.load();
    clickSoundPoolRef.current.forEach(sound => sound.load());
  }, []);

  const playClickSound = () => {
    if (!isSoundEnabled) return;
    const sounds = clickSoundPoolRef.current;
    sounds[currentSoundIndexRef.current].currentTime = 0;
    sounds[currentSoundIndexRef.current].play().catch(console.error);
    currentSoundIndexRef.current = (currentSoundIndexRef.current + 1) % sounds.length;
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

      window.Telegram.WebApp.ready();
      window.addEventListener('click', handleFirstInteraction, { once: true });
      
      return () => {
        window.removeEventListener('click', handleFirstInteraction);
      };
    } else {
      // Regular browser behavior
      if (isMusicEnabled) {
        backgroundMusic.play().catch(error => {
          console.log('Playback failed:', error);
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

    if (isSoundEnabled) {
      document.addEventListener('click', handleGlobalClick);
    }

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      clickSoundPoolRef.current.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    };
  }, [isSoundEnabled]);

  return (
    <SettingsContext.Provider value={{ isSoundEnabled, toggleSound, toggleMusic, isMusicEnabled }}>
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