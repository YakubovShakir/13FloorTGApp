import React, { useState, useEffect, useRef, useCallback } from 'react';

// Placeholder SVG assets (you'd replace these with actual sprite sheets)
const SPRITES = {
  background: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 400"><rect width="100%" height="100%" fill="#87CEEB"/><rect x="0" y="350" width="100%" height="50" fill="#7CFC00"/></svg>',
  sheep: [
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="white"/><circle cx="30" cy="35" r="10" fill="black"/><circle cx="70" cy="35" r="10" fill="black"/></svg>',
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="white"/><ellipse cx="30" cy="35" rx="10" ry="15" fill="black"/><ellipse cx="70" cy="35" rx="10" ry="15" fill="black"/></svg>',
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="white"/><circle cx="30" cy="40" r="10" fill="black"/><circle cx="70" cy="40" r="10" fill="black"/></svg>'
  ],
  collectible: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="gold"/></svg>'
};

const SheepJumpGame = () => {
  const [sheepPosition, setSheepPosition] = useState(50);
  const [isJumping, setIsJumping] = useState(false);
  const [spriteFrame, setSpriteFrame] = useState(0);
  const [collectibles, setCollectibles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameAreaRef = useRef(null);

  // Sprite animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setSpriteFrame(prev => (prev + 1) % 3);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Collectible generation and movement
  useEffect(() => {
    if (gameOver) return;

    const generateCollectible = () => {
      const newCollectible = {
        id: Date.now(),
        x: window.innerWidth, // Start from the right side of the screen
        y: Math.random() * 180
      };
      setCollectibles(prev => [...prev, newCollectible]);
    };

    const moveCollectibles = () => {
      setCollectibles(prev => 
        prev.map(c => ({ ...c, x: c.x - 5 })) // Increased movement speed
          .filter(c => c.x > -50)
      );
    };

    // Spawn collectibles more frequently
    const collectibleInterval = setInterval(generateCollectible, 1000);
    const moveInterval = setInterval(moveCollectibles, 10);

    return () => {
      clearInterval(collectibleInterval);
      clearInterval(moveInterval);
    };
  }, [gameOver]);

  // Jump logic
  const handleJump = useCallback(() => {
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }
  }, [isJumping, gameOver]);

  // Keyboard support for jumping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  // Collision detection
  useEffect(() => {
    const checkCollisions = () => {
      const newCollectibles = collectibles.filter(c => {
        const collected = 
          c.x > 50 && c.x < 100 && 
          Math.abs(c.y - (isJumping ? 150 : 50)) < 50;
        
        if (collected) {
          setScore(prev => prev + 1);
        }
        
        // Game over if collectible passes without collecting
        if (c.x < 50 && !collected) {
          setGameOver(true);
        }
        
        return !collected;
      });

      setCollectibles(newCollectibles);
    };

    if (!gameOver) {
      checkCollisions();
    }
  }, [collectibles, isJumping, gameOver]);

  // Restart game
  const restartGame = () => {
    setScore(0);
    setCollectibles([]);
    setGameOver(false);
  };

  return (
    <div 
      ref={gameAreaRef}
      style={{
        width: '100%',
        height: '400px',
        position: 'relative',
        overflow: 'hidden',
        background: `url(${SPRITES.background})`,
        backgroundSize: 'cover',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
      onClick={!gameOver ? handleJump : restartGame}
    >
      {/* Score Display */}
      <div style={{
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        fontSize: '24px', 
        color: 'white'
      }}>
        Score: {score}
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          fontSize: '36px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '20px',
          borderRadius: '10px'
        }}>
          Game Over!
          <div style={{
            fontSize: '20px',
            marginTop: '10px'
          }}>
            Click to Restart
          </div>
        </div>
      )}

      {/* Sheep Sprite */}
      <img 
        src={SPRITES.sheep[spriteFrame]} 
        alt="Sheep" 
        style={{
          position: 'absolute',
          bottom: isJumping ? '150px' : '50px',
          left: '50px',
          width: '100px',
          height: '100px',
          transition: 'bottom 0.5s ease-out'
        }}
      />

      {/* Collectibles */}
      {!gameOver && collectibles.map((c) => (
        <img 
          key={c.id}
          src={SPRITES.collectible} 
          alt="Collectible" 
          style={{
            position: 'absolute',
            bottom: `${c.y}px`,
            left: `${c.x}px`,
            width: '50px',
            height: '50px'
          }}
        />
      ))}
    </div>
  );
};

export default SheepJumpGame;