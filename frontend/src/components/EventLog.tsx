import React from 'react';
import './EventLog.css';

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

interface EventLogProps {
  events: Event[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatEventDescription = (event: Event) => {
    const { event_type, sub_type, result, player_name } = event;
    
    switch (event_type) {
      case 'shot':
        const shotType = sub_type === '2pt' ? '2-point' : '3-point';
        const shotResult = result === 'make' ? 'made' : 'missed';
        return `${player_name} ${shotResult} a ${shotType} shot`;
      
      case 'rebound':
        return `${player_name} got a rebound`;
      
      case 'steal':
        return `${player_name} made a steal`;
      
      case 'turnover':
        return `${player_name} committed a turnover`;
      
      default:
        return `${player_name} - ${event_type}`;
    }
  };

  const getEventIcon = (event: Event) => {
    const { event_type, result } = event;
    
    switch (event_type) {
      case 'shot':
        return result === 'make' ? '🎯' : '❌';
      case 'rebound':
        return '🏀';
      case 'steal':
        return '🏃';
      case 'turnover':
        return '⚠️';
      default:
        return '📝';
    }
  };

  return (
    <div className="event-log">
      <h3>Game Events</h3>
      <div className="events-list">
        {events.length === 0 ? (
          <div className="no-events">No events recorded yet</div>
        ) : (
          events.slice().reverse().map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-time">
                {formatTime(event.game_time)}
              </div>
              <div className="event-icon">
                {getEventIcon(event)}
              </div>
              <div className="event-details">
                <div className="event-description">
                  {formatEventDescription(event)}
                </div>
                <div className="event-team">
                  {event.player_team}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLog;
