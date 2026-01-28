# Strategic View Demo - Space Mining Strategy Game

A full-stack web-based strategy game prototype featuring procedural world generation, building placement, and real-time resource production.

## Features

- **Procedural Terrain Generation**: Uses Perlin noise to create natural-looking terrain with water, sand, grass, and rock
- **Resource Deposits**: Procedurally placed iron, copper, and coal deposits across the map
- **Real-time Gameplay**: WebSocket-based real-time updates with 1-second game ticks
- **Building System**: Three building types (Miners, Smelters, Storage) with different functions
- **Resource Management**: Track and manage resources with production rates
- **Interactive Map**: Pan, zoom, and click to place buildings on a dynamic canvas

## Tech Stack

**Backend:**
- FastAPI - Modern Python web framework
- WebSockets - Real-time communication
- Perlin Noise - Procedural generation

**Frontend:**
- React + TypeScript - Modern UI framework
- Vite - Fast build tool
- HTML5 Canvas - Game rendering
- Web Audio API - Sound effects

## Project Structure

```
strategic-view-demo/
├── backend/
│   ├── main.py                 # FastAPI server with WebSocket
│   ├── world_generator.py      # Procedural terrain generation
│   ├── game_state.py          # Game logic and state management
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameCanvas.tsx      # Main game rendering
│   │   │   ├── BuildingMenu.tsx    # Building selector UI
│   │   │   └── ResourcePanel.tsx   # Resource display
│   │   ├── hooks/
│   │   │   ├── useGameState.ts     # WebSocket connection
│   │   │   └── useAudio.ts         # Sound effects
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── App.tsx                # Main application
│   │   ├── main.tsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## How to Play

1. **Start the Game**: Open your browser to `http://localhost:5173`
2. **View the Map**: The game will load with a procedurally generated terrain
3. **Select a Building**: Click on one of the building types in the right panel
   - **Miner** (Iron: 10, Copper: 5) - Extracts resources from tiles
   - **Smelter** (Iron: 20, Copper: 10) - Converts iron to steel
   - **Storage** (Iron: 15, Copper: 5) - Stores resources
4. **Place Buildings**: Click on the map to place your selected building
5. **Manage Resources**: Watch your resources grow as buildings produce
6. **Pan & Zoom**: 
   - Right-click and drag to pan the map
   - Use mouse wheel to zoom in/out

## Game Mechanics

### Buildings

**Miner:**
- Extracts resources from the tile it's placed on
- Production rate: 1.0 units/second
- Must be placed on a resource-bearing tile

**Smelter:**
- Converts iron into steel
- Production rate: 0.5 units/second
- Requires iron as input

**Storage:**
- Stores excess resources
- No production

### Resources

- **Iron**: Base material, extracted from iron deposits
- **Copper**: Base material, extracted from copper deposits
- **Coal**: Fuel resource, extracted from coal deposits
- **Steel**: Produced by smelters from iron

### Terrain Types

- **Water**: Blue tiles, no resources
- **Sand**: Beige tiles, no resources
- **Grass**: Green tiles, may contain resources
- **Rock**: Gray tiles, may contain resources

## Development

### Backend API Endpoints

- `GET /` - API status
- `GET /api/chunk/{chunk_x}/{chunk_y}` - Get terrain chunk
- `POST /api/player/join` - Join game
- `POST /api/building/place` - Place building
- `GET /api/state` - Get current game state
- `WebSocket /ws` - Real-time updates

### Frontend Components

- **GameCanvas**: Main rendering component using HTML5 Canvas
- **BuildingMenu**: UI for selecting building types
- **ResourcePanel**: Display current resources and production
- **useGameState**: Hook for WebSocket connection
- **useAudio**: Hook for sound effects

## Future Enhancements

- Multiplayer support
- Combat system
- Tech tree and upgrades
- Save/load game state
- More building types
- Unit production
- Fog of war

## License

MIT