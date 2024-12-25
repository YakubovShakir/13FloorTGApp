import { createContext, useContext, useState, useEffect } from 'react';
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('soundEnabled');
    return stored === null ? true : stored === 'true';
  });

  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    const stored = localStorage.getItem('musicEnabled');
    return stored === null ? true : stored === 'true';
  });

  const backgroundMusic = new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/Music.mp3");
  backgroundMusic.volume = 0.65;

  const clickSoundPool = Array(5).fill(null).map(() => new Audio("https://d8bddedf-ac40-4488-8101-05035bb63d25.selstorage.ru/click.mp3"));
  let currentSoundIndex = 0;

  const playClickSound = () => {
    if (!isSoundEnabled) return;
    clickSoundPool[currentSoundIndex].currentTime = 0;
    clickSoundPool[currentSoundIndex].play().catch(console.error);
    currentSoundIndex = (currentSoundIndex + 1) % clickSoundPool.length;
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
    const handleGlobalClick = (e) => {
      if (e.target.dataset.soundToggle) return;
      playClickSound();
    };

    const handleMusicCanPlayThrough = () => {
      if (isMusicEnabled) {
        backgroundMusic.play();
      } else {
        backgroundMusic.pause();
      }
    };

    backgroundMusic.addEventListener('canplaythrough', handleMusicCanPlayThrough);

    if (isMusicEnabled) {
      backgroundMusic.play(); // Play music initially if enabled
    } else {
      backgroundMusic.pause();
    }

    if (isSoundEnabled) {
      document.addEventListener('click', handleGlobalClick);
    } else {
      document.removeEventListener('click', handleGlobalClick);
      clickSoundPool.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    }

    return () => {
      backgroundMusic.removeEventListener('canplaythrough', handleMusicCanPlayThrough);
      document.removeEventListener('click', handleGlobalClick);
      clickSoundPool.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    };
  }, [isSoundEnabled, backgroundMusic, clickSoundPool, isMusicEnabled]);

  useEffect(() => {
    return () => backgroundMusic.pause()
  }, [toggleMusic])

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