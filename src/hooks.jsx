import { createContext, useContext, useState, useEffect, useRef } from 'react';
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  // Use refs for audio objects to persist across renders
  const backgroundMusicRef = useRef(new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Music.mp3"));
  const clickSoundPoolRef = useRef(
    Array(5).fill(null).map(() => new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/click.mp3"))
  );

  const currentSoundIndexRef = useRef(0);

  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('soundEnabled');
    return stored ? 'true' : 'false';
  });

  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    const stored = localStorage.getItem('musicEnabled');
    return stored ? 'true' : 'false';
  });

  // Set initial volume
  useEffect(() => {
    backgroundMusicRef.current.volume = 0.65;
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
      localStorage.setItem('soundEnabled', String(newIsSoundEnabled));
      return newIsSoundEnabled;
    });
  };

  const toggleMusic = () => {
    setIsMusicEnabled(prevIsMusicEnabled => {
      const newIsMusicEnabled = !prevIsMusicEnabled;
      localStorage.setItem('musicEnabled', String(newIsMusicEnabled));
      return newIsMusicEnabled;
    });
  };

  useEffect(() => {
    const backgroundMusic = backgroundMusicRef.current;
    
    const handleGlobalClick = (e) => {
      if (e.target.dataset.soundToggle) return;
      playClickSound();
    };

    const handleMusicCanPlayThrough = () => {
      if (isMusicEnabled) {
        backgroundMusic.play().catch(error => {
          console.log('Playback failed:', error);
          // Attempt to play on next user interaction
          const playOnInteraction = () => {
            backgroundMusic.play().catch(console.error);
            document.removeEventListener('click', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
        });
      } else {
        backgroundMusic.pause();
      }
    };

    if (isMusicEnabled) {
      backgroundMusic.addEventListener('canplaythrough', handleMusicCanPlayThrough);
      // Try to play immediately
      handleMusicCanPlayThrough();
    } else {
      backgroundMusic.pause();
    }

    if (isSoundEnabled) {
      document.addEventListener('click', handleGlobalClick);
    } else {
      document.removeEventListener('click', handleGlobalClick);
      clickSoundPoolRef.current.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    }

    return () => {
      backgroundMusic.removeEventListener('canplaythrough', handleMusicCanPlayThrough);
      document.removeEventListener('click', handleGlobalClick);
      clickSoundPoolRef.current.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    };
  }, [isSoundEnabled, isMusicEnabled]);

  // Cleanup effect
  useEffect(() => {
    return () => backgroundMusicRef.current.pause();
  }, []);

  return (
    <SettingsContext.Provider value={{ isSoundEnabled, toggleSound, toggleMusic, isMusicEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsProvider() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSoundManager must be used within a SoundProvider');
  }
  return context;
}