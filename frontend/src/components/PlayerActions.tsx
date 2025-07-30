import React, { useState } from 'react';
import './PlayerActions.css';

interface Player {
  id: string;
  name: string;
  team: string;
}

interface PlayerActionsProps {
  player: Player;
  allPlayers: Player[];
  onEventLog: (eventType: string, subType?: string, result?: string, playerId?: string) => void;
  onClose: () => void;
}

interface NextAction {
  type: 'attempt' | 'miss' | 'turnover';
  shotType?: '2pt' | '3pt';
}

const PlayerActions: React.FC<PlayerActionsProps> = ({ player, allPlayers, onEventLog, onClose }) => {
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  
  // Get opponents (other team players)
  const opponents = allPlayers.filter(p => p.team !== player.team);

  const handleShotType = (shotType: '2pt' | '3pt') => {
    setNextAction({ type: 'attempt', shotType });
  };

  const handleShotResult = (shotType: '2pt' | '3pt', result: 'make' | 'miss', rebounderId?: string) => {
    console.log(`${new Date().toISOString()}: ${player.name} ${shotType} shot ${result}${rebounderId ? `, rebound by ${rebounderId}` : ''}`);
    
    if (result === 'make') {
      onEventLog('shot', shotType, result);
    } else {
      // Log the missed shot
      onEventLog('shot', shotType, result);
      // Log the rebound if specified
      if (rebounderId && rebounderId !== 'out-of-bounds') {
        const rebounder = allPlayers.find(p => p.id === rebounderId);
        console.log(`${new Date().toISOString()}: Rebound by ${rebounder?.name}`);
        onEventLog('rebound', undefined, undefined, rebounderId);
      } else if (rebounderId === 'out-of-bounds') {
        console.log(`${new Date().toISOString()}: Ball out of bounds`);
        onEventLog('out-of-bounds');
      }
    }
    onClose();
  };

  const handleTurnoverType = () => {
    setNextAction({ type: 'turnover' });
  };

  const handleTurnoverResult = (stealerId?: string) => {
    if (stealerId) {
      const stealer = allPlayers.find(p => p.id === stealerId);
      console.log(`${new Date().toISOString()}: ${player.name} turnover, steal by ${stealer?.name}`);
      onEventLog('steal', undefined, undefined, stealerId);
    } else {
      console.log(`${new Date().toISOString()}: ${player.name} normal turnover`);
      onEventLog('turnover');
    }
    onClose();
  };

  return (
    <div className="player-actions-overlay" onClick={onClose}>
      <div className="player-actions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{player.name}</h3>
          <span className="team-badge">{player.team}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="actions-grid">
          {nextAction ? (
            nextAction.type === 'attempt' ? (
              <div className="action-section">
                <h4>{nextAction.shotType} Shot Result</h4>
                <div className="shot-result-buttons">
                  <button 
                    className="make-btn"
                    onClick={() => handleShotResult(nextAction.shotType!, 'make')}
                  >
                    Made ✓
                  </button>
                  <button 
                    className="miss-btn"
                    onClick={() => setNextAction({ type: 'miss', shotType: nextAction.shotType })}
                  >
                    Missed ✗
                  </button>
                </div>
              </div>
            ) : nextAction.type === 'miss' ? (
              <div className="action-section">
                <h4>Who got the rebound?</h4>
                <div className="rebound-options">
                  {allPlayers.map(p => (
                    <button
                      key={p.id}
                      className="player-option-btn"
                      onClick={() => handleShotResult(nextAction.shotType!, 'miss', p.id)}
                    >
                      {p.name}
                    </button>
                  ))}
                  <button
                    className="player-option-btn out-of-bounds-btn"
                    onClick={() => handleShotResult(nextAction.shotType!, 'miss', 'out-of-bounds')}
                  >
                    Out of Bounds
                  </button>
                </div>
              </div>
            ) : (
              <div className="action-section">
                <h4>Who stole the ball?</h4>
                <div className="turnover-options">
                  {opponents.map(opponent => (
                    <button
                      key={opponent.id}
                      className="player-option-btn"
                      onClick={() => handleTurnoverResult(opponent.id)}
                    >
                      {opponent.name}
                    </button>
                  ))}
                  <button
                    className="player-option-btn normal-turnover-btn"
                    onClick={() => handleTurnoverResult()}
                  >
                    Normal Turnover
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="initial-actions">
              <button className="action-btn shot-btn" onClick={() => handleShotType('2pt')}>
                2pt Shot
              </button>
              <button className="action-btn shot-btn" onClick={() => handleShotType('3pt')}>
                3pt Shot
              </button>
              <button className="action-btn turnover-btn" onClick={handleTurnoverType}>
                Turnover
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerActions;
