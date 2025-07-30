const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize the database
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    team TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE events (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(player_id) REFERENCES players(id)
  )`);
});

// Set up routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Basketball Tracker API!' });
});

// Server listening
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
