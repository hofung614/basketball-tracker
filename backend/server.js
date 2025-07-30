const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize the database
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE games (
    id TEXT PRIMARY KEY,
    team1_name TEXT NOT NULL,
    team2_name TEXT NOT NULL,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    status TEXT DEFAULT 'active'
  )`);

  db.run(`CREATE TABLE players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    game_id TEXT NOT NULL,
    FOREIGN KEY(game_id) REFERENCES games(id)
  )`);

  db.run(`CREATE TABLE events (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    sub_type TEXT,
    result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    game_time INTEGER,
    FOREIGN KEY(game_id) REFERENCES games(id),
    FOREIGN KEY(player_id) REFERENCES players(id)
  )`);
});

// Set up routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Basketball Tracker API!' });
});

// Game endpoints
app.post('/api/games', (req, res) => {
  const { team1_name, team2_name, players } = req.body;
  const gameId = uuidv4();
  
  db.run(
    'INSERT INTO games (id, team1_name, team2_name) VALUES (?, ?, ?)',
    [gameId, team1_name, team2_name],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Insert players
      const playerPromises = players.map(player => {
        return new Promise((resolve, reject) => {
          const playerId = uuidv4();
          db.run(
            'INSERT INTO players (id, name, team, game_id) VALUES (?, ?, ?, ?)',
            [playerId, player.name, player.team, gameId],
            (err) => {
              if (err) reject(err);
              else resolve({ id: playerId, ...player });
            }
          );
        });
      });
      
      Promise.all(playerPromises)
        .then(insertedPlayers => {
          res.json({ 
            id: gameId, 
            team1_name, 
            team2_name, 
            players: insertedPlayers,
            status: 'active'
          });
        })
        .catch(err => {
          res.status(500).json({ error: err.message });
        });
    }
  );
});

app.get('/api/games/:id', (req, res) => {
  const gameId = req.params.id;
  
  db.get(
    'SELECT * FROM games WHERE id = ?',
    [gameId],
    (err, game) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      // Get players for this game
      db.all(
        'SELECT * FROM players WHERE game_id = ?',
        [gameId],
        (err, players) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json({ ...game, players });
        }
      );
    }
  );
});

// Event endpoints
app.post('/api/events', (req, res) => {
  const { game_id, player_id, event_type, sub_type, result, game_time } = req.body;
  const eventId = uuidv4();
  
  db.run(
    'INSERT INTO events (id, game_id, player_id, event_type, sub_type, result, game_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [eventId, game_id, player_id, event_type, sub_type, result, game_time],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        id: eventId, 
        game_id, 
        player_id, 
        event_type, 
        sub_type, 
        result, 
        game_time 
      });
    }
  );
});

app.get('/api/games/:id/events', (req, res) => {
  const gameId = req.params.id;
  
  db.all(
    `SELECT e.*, p.name as player_name, p.team as player_team 
     FROM events e 
     JOIN players p ON e.player_id = p.id 
     WHERE e.game_id = ? 
     ORDER BY e.timestamp ASC`,
    [gameId],
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(events);
    }
  );
});

// Player endpoints
app.get('/api/games/:id/players', (req, res) => {
  const gameId = req.params.id;
  
  db.all(
    'SELECT * FROM players WHERE game_id = ?',
    [gameId],
    (err, players) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(players);
    }
  );
});

// Game stats endpoint
app.get('/api/games/:id/stats', (req, res) => {
  const gameId = req.params.id;
  
  const query = `
    SELECT 
      p.id,
      p.name,
      p.team,
      COUNT(CASE WHEN e.event_type = 'shot' AND e.sub_type = '2pt' AND e.result = 'make' THEN 1 END) as two_pt_made,
      COUNT(CASE WHEN e.event_type = 'shot' AND e.sub_type = '2pt' AND e.result = 'miss' THEN 1 END) as two_pt_missed,
      COUNT(CASE WHEN e.event_type = 'shot' AND e.sub_type = '3pt' AND e.result = 'make' THEN 1 END) as three_pt_made,
      COUNT(CASE WHEN e.event_type = 'shot' AND e.sub_type = '3pt' AND e.result = 'miss' THEN 1 END) as three_pt_missed,
      COUNT(CASE WHEN e.event_type = 'rebound' THEN 1 END) as rebounds,
      COUNT(CASE WHEN e.event_type = 'turnover' THEN 1 END) as turnovers,
      COUNT(CASE WHEN e.event_type = 'steal' THEN 1 END) as steals
    FROM players p
    LEFT JOIN events e ON p.id = e.player_id
    WHERE p.game_id = ?
    GROUP BY p.id, p.name, p.team
    ORDER BY p.team, p.name
  `;
  
  db.all(query, [gameId], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(stats);
  });
});

// Server listening
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
