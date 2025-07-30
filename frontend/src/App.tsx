import React, { useState } from 'react';
import './App.css';
import GameSetup from './components/GameSetup';
import GameTracker from './components/GameTracker';

interface Player {
  id: string;
  name: string;
  team: string;
}

interface Game {
  id: string;
  team1_name: string;
  team2_name: string;
  possession: string;
  players: Player[];
  status: string;
}

function App() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleGameStart = (game: Game) => {
    setCurrentGame(game);
    setGameStarted(true);
  };

  const handleNewGame = () => {
    setCurrentGame(null);
    setGameStarted(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏀 Basketball Game Tracker</h1>
        {gameStarted && currentGame && (
          <button className="new-game-btn" onClick={handleNewGame}>
            New Game
          </button>
        )}
      </header>
      
      <main className="App-main">
        {!gameStarted ? (
          <GameSetup onGameStart={handleGameStart} />
        ) : (
          currentGame && <GameTracker game={currentGame} />
        )}
      </main>
    </div>
  );
}

export default App;
