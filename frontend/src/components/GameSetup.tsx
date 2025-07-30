import React, { useState } from 'react';
import './GameSetup.css';

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

interface GameSetupProps {
  onGameStart: (game: Game) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onGameStart }) => {
  const [team1Name, setTeam1Name] = useState('Team A');
  const [team2Name, setTeam2Name] = useState('Team B');
  const [team1Players, setTeam1Players] = useState([
    'Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'
  ]);
  const [team2Players, setTeam2Players] = useState([
    'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'
  ]);
  const [initialPossession, setInitialPossession] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlayerNameChange = (team: number, index: number, name: string) => {
    if (team === 1) {
      const newPlayers = [...team1Players];
      newPlayers[index] = name;
      setTeam1Players(newPlayers);
    } else {
      const newPlayers = [...team2Players];
      newPlayers[index] = name;
      setTeam2Players(newPlayers);
    }
  };

  const handleStartGame = async () => {
    setLoading(true);
    
    const players = [
      ...team1Players.map(name => ({ name, team: team1Name })),
      ...team2Players.map(name => ({ name, team: team2Name }))
    ];

    const possessionTeam = initialPossession || team1Name;

    try {
      const response = await fetch('http://localhost:3001/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1_name: team1Name,
          team2_name: team2Name,
          players: players,
          initial_possession: possessionTeam
        }),
      });

      if (response.ok) {
        const game = await response.json();
        onGameStart(game);
      } else {
        console.error('Failed to create game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-setup">
      <h2>Set up your Basketball Game</h2>
      
      <div className="teams-setup">
        <div className="team-setup">
          <h3>Team 1</h3>
          <input
            type="text"
            value={team1Name}
            onChange={(e) => setTeam1Name(e.target.value)}
            className="team-name-input"
            placeholder="Team 1 Name"
          />
          <div className="players-setup">
            {team1Players.map((player, index) => (
              <input
                key={index}
                type="text"
                value={player}
                onChange={(e) => handlePlayerNameChange(1, index, e.target.value)}
                className="player-name-input"
                placeholder={`Player ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="vs-divider">VS</div>

        <div className="team-setup">
          <h3>Team 2</h3>
          <input
            type="text"
            value={team2Name}
            onChange={(e) => setTeam2Name(e.target.value)}
            className="team-name-input"
            placeholder="Team 2 Name"
          />
          <div className="players-setup">
            {team2Players.map((player, index) => (
              <input
                key={index}
                type="text"
                value={player}
                onChange={(e) => handlePlayerNameChange(2, index, e.target.value)}
                className="player-name-input"
                placeholder={`Player ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="possession-setup">
        <h3>Who starts with the ball?</h3>
        <div className="possession-options">
          <label className="possession-option">
            <input
              type="radio"
              name="initialPossession"
              value={team1Name}
              checked={initialPossession === team1Name}
              onChange={(e) => setInitialPossession(e.target.value)}
            />
            <span>{team1Name}</span>
          </label>
          <label className="possession-option">
            <input
              type="radio"
              name="initialPossession"
              value={team2Name}
              checked={initialPossession === team2Name}
              onChange={(e) => setInitialPossession(e.target.value)}
            />
            <span>{team2Name}</span>
          </label>
        </div>
      </div>

      <button 
        className="start-game-btn" 
        onClick={handleStartGame}
        disabled={loading}
      >
        {loading ? 'Starting Game...' : 'Start Game'}
      </button>
    </div>
  );
};

export default GameSetup;
