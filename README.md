# Basketball Game Tracker

A simple app to track events during basketball games with real-time event logging and analysis.

## Features

### Game Setup
- 2 teams with 5 players each (5v5)
- Pre-assigned players with unique names
- No substitutions during the game

### Gameplay Tracking
- Timer counts up during the game
- All events timestamped for analysis
- Real-time event logging

### Player Interaction
- 10 player buttons (5 per team)
- Player selection opens action menu:
  - **Shot Attempts**: 2-point or 3-point with make/miss tracking
  - **Rebounds**: Track which player gets the rebound or if ball goes out of bounds
  - **Turnovers**: Track steals vs normal turnovers

### Data Tracking
- Complete event log with timestamps
- Post-game analysis capabilities
- Export functionality for further analysis

## Project Structure

```
basketball-tracker/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd backend && npm install`

### Development

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend application: `cd frontend && npm start`

## Tech Stack

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express
- **Database**: SQLite (for simplicity)
- **State Management**: React hooks
