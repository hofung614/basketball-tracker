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
  currentPossession: string;
  onEventLog: (eventType: string, subType?: string, result?: string, playerId?: string, newPossession?: string) => void;
  onClose: () => void;
}

interface NextAction {
  type: 'attempt' | 'miss' | 'turnover';
  shotType?: '2pt' | '3pt';
}

const PlayerActions: React.FC<PlayerActionsProps> = ({ player, allPlayers, currentPossession, onEventLog, onClose }) => {
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  
  // Get opponents (other team players)
  const opponents = allPlayers.filter(p => p.team !== player.team);

  const handleShotType = (shotType: '2pt' | '3pt') => {
    setNextAction({ type: 'attempt', shotType });
  };

  const handleShotResult = (shotType: '2pt' | '3pt', result: 'make' | 'miss', rebounderId?: string) => {
    console.log(`${new Date().toISOString()}: ${player.name} ${shotType} shot ${result}${rebounderId ? `, rebound by ${rebounderId}` : ''}`);
    
    if (result === 'make') {
      // Made shot - possession changes to other team
      const otherTeam = player.team === currentPossession ? 
        allPlayers.find(p => p.team !== player.team)?.team || '' : player.team;
      onEventLog('shot', shotType, result, undefined, otherTeam);
    } else {
      // Log the missed shot
      onEventLog('shot', shotType, result);
      
      // Log the rebound if specified
      if (rebounderId && rebounderId !== 'out-of-bounds') {
        const rebounder = allPlayers.find(p => p.id === rebounderId);
        const reboundType = rebounder?.team === player.team ? 'offensive' : 'defensive';
        console.log(`${new Date().toISOString()}: ${reboundType} rebound by ${rebounder?.name}`);
        
        // Possession changes on defensive rebound
        const newPossession = reboundType === 'defensive' ? rebounder?.team : currentPossession;
        onEventLog('rebound', reboundType, undefined, rebounderId, newPossession);
      } else if (rebounderId === 'out-of-bounds') {
        console.log(`${new Date().toISOString()}: Ball out of bounds`);
        // For now, assume possession doesn't change on out of bounds
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
      // Log both turnover and steal, possession goes to stealer's team
      onEventLog('turnover', undefined, undefined, undefined, stealer?.team);
      onEventLog('steal', undefined, undefined, stealerId, stealer?.team);
    } else {
      console.log(`${new Date().toISOString()}: ${player.name} normal turnover`);
      // Normal turnover - possession goes to other team
      const otherTeam = allPlayers.find(p => p.team !== player.team)?.team || '';
      onEventLog('turnover', undefined, undefined, undefined, otherTeam);
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
