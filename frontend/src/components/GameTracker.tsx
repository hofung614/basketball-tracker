import React, { useState, useEffect } from 'react';
import './GameTracker.css';
import PlayerActions from './PlayerActions';
import GameTimer from './GameTimer';
import EventLog from './EventLog';

interface Player {
  id: string;
  name: string;
  team: string;
}

interface Game {
  id: string;
  team1_name: string;
  team2_name: string;
  players: Player[];
  status: string;
}

interface Event {
  id: string;
  game_id: string;
  player_id: string;
  event_type: string;
  sub_type?: string;
  result?: string;
  game_time: number;
  timestamp: string;
  player_name: string;
  player_team: string;
}

interface GameTrackerProps {
  game: Game;
}

const GameTracker: React.FC<GameTrackerProps> = ({ game }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [gameTime, setGameTime] = useState(0);

  const team1Players = game.players.filter(p => p.team === game.team1_name);
  const team2Players = game.players.filter(p => p.team === game.team2_name);

  useEffect(() => {
    // Load existing events when component mounts
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/games/${game.id}/events`);
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleEventLog = async (eventType: string, subType?: string, result?: string) => {
    if (!selectedPlayer) return;

    const eventData = {
      game_id: game.id,
      player_id: selectedPlayer.id,
      event_type: eventType,
      sub_type: subType,
      result: result,
      game_time: gameTime
    };

    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        // Refresh events list
        fetchEvents();
        setSelectedPlayer(null);
      }
    } catch (error) {
      console.error('Error logging event:', error);
    }
  };

  const handleCloseActions = () => {
    setSelectedPlayer(null);
  };

  return (
    <div className="game-tracker">
      <div className="game-header">
        <h2>{game.team1_name} vs {game.team2_name}</h2>
        <GameTimer gameTime={gameTime} setGameTime={setGameTime} />
      </div>

      <div className="game-content">
        <div className="teams-container">
          <div className="team-section">
            <h3>{game.team1_name}</h3>
            <div className="players-grid">
              {team1Players.map(player => (
                <button
                  key={player.id}
                  className={`player-btn ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
                  onClick={() => handlePlayerSelect(player)}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>

          <div className="team-section">
            <h3>{game.team2_name}</h3>
            <div className="players-grid">
              {team2Players.map(player => (
                <button
                  key={player.id}
                  className={`player-btn ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
                  onClick={() => handlePlayerSelect(player)}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="events-section">
          <EventLog events={events} />
        </div>
      </div>

      {selectedPlayer && (
        <PlayerActions
          player={selectedPlayer}
          onEventLog={handleEventLog}
          onClose={handleCloseActions}
        />
      )}
    </div>
  );
};

export default GameTracker;
