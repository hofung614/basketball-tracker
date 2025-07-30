import React, { useState, useEffect, useRef } from 'react';
import './GameTimer.css';

interface GameTimerProps {
  gameTime: number;
  setGameTime: (time: number) => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ gameTime, setGameTime }) => {
  const [isRunning, setIsRunning] = useState(true); // Auto-start the timer
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setGameTime(gameTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, gameTime, setGameTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setGameTime(0);
  };

  return (
    <div className="game-timer">
      <div className="timer-display">
        {formatTime(gameTime)}
      </div>
      <div className="timer-controls">
        {!isRunning ? (
          <button className="start-btn" onClick={handleStart}>
            ▶️ Start
          </button>
        ) : (
          <button className="stop-btn" onClick={handleStop}>
            ⏸️ Stop
          </button>
        )}
        <button className="reset-btn" onClick={handleReset}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default GameTimer;
