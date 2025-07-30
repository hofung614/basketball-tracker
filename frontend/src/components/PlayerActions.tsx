import React from 'react';
import './PlayerActions.css';

interface Player {
  id: string;
  name: string;
  team: string;
}

interface PlayerActionsProps {
  player: Player;
  onEventLog: (eventType: string, subType?: string, result?: string) => void;
  onClose: () => void;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({ player, onEventLog, onClose }) => {
  const handleShotAttempt = (shotType: '2pt' | '3pt', result: 'make' | 'miss') => {
    onEventLog('shot', shotType, result);
  };

  const handleRebound = () => {
    onEventLog('rebound');
  };

  const handleTurnover = (type: 'steal' | 'turnover') => {
    onEventLog(type);
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
          <div className="action-section">
            <h4>Shot Attempts</h4>
            <div className="shot-buttons">
              <div className="shot-type">
                <span>2-Point</span>
                <button 
                  className="make-btn"
                  onClick={() => handleShotAttempt('2pt', 'make')}
                >
                  Make ✓
                </button>
                <button 
                  className="miss-btn"
                  onClick={() => handleShotAttempt('2pt', 'miss')}
                >
                  Miss ✗
                </button>
              </div>
              <div className="shot-type">
                <span>3-Point</span>
                <button 
                  className="make-btn"
                  onClick={() => handleShotAttempt('3pt', 'make')}
                >
                  Make ✓
                </button>
                <button 
                  className="miss-btn"
                  onClick={() => handleShotAttempt('3pt', 'miss')}
                >
                  Miss ✗
                </button>
              </div>
            </div>
          </div>

          <div className="action-section">
            <h4>Other Actions</h4>
            <div className="other-actions">
              <button 
                className="rebound-btn"
                onClick={handleRebound}
              >
                🏀 Rebound
              </button>
              <button 
                className="steal-btn"
                onClick={() => handleTurnover('steal')}
              >
                🏃 Steal
              </button>
              <button 
                className="turnover-btn"
                onClick={() => handleTurnover('turnover')}
              >
                ❌ Turnover
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerActions;
