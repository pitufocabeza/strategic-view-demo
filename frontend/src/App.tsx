import { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { BuildingMenu } from './components/BuildingMenu';
import { ResourcePanel } from './components/ResourcePanel';
import { useGameState } from './hooks/useGameState';
import './index.css';

const PLAYER_ID = 'player1';
const PLAYER_NAME = 'Player';
const API_URL = 'http://localhost:8000/api';

function App() {
  const { gameState, connected, placeBuilding } = useGameState();
  const [selectedBuildingType, setSelectedBuildingType] = useState<string | null>(null);
  const [playerJoined, setPlayerJoined] = useState(false);

  // Join game when connected
  useEffect(() => {
    if (connected && !playerJoined) {
      fetch(`${API_URL}/player/join?username=${PLAYER_NAME}&player_id=${PLAYER_ID}`, {
        method: 'POST',
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Player joined:', data.player);
            setPlayerJoined(true);
          }
        })
        .catch(error => console.error('Error joining game:', error));
    }
  }, [connected, playerJoined]);

  const handlePlaceBuilding = async (x: number, y: number, type: string) => {
    const result = await placeBuilding(PLAYER_ID, x, y, type);
    if (result.success) {
      setSelectedBuildingType(null);
    }
    return result;
  };

  const currentPlayer = gameState?.players?.[PLAYER_ID] || null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#1a1a1a',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
    }}>
      <header style={{
        background: '#2a2a2a',
        padding: '15px 20px',
        borderBottom: '2px solid #444',
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          Space Mining Strategy Game
        </h1>
        <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </header>

      <div style={{
        display: 'flex',
        flex: 1,
        padding: '20px',
        gap: '20px',
        overflow: 'hidden',
      }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {gameState ? (
            <GameCanvas
              buildings={gameState.buildings}
              onPlaceBuilding={handlePlaceBuilding}
              selectedBuildingType={selectedBuildingType}
            />
          ) : (
            <div style={{ fontSize: '20px', color: '#aaa' }}>
              Loading game...
            </div>
          )}
        </div>

        <div style={{
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          <ResourcePanel
            player={currentPlayer}
            tick={gameState?.tick || 0}
          />
          <BuildingMenu
            selectedType={selectedBuildingType}
            onSelectType={setSelectedBuildingType}
          />
        </div>
      </div>

      <footer style={{
        background: '#2a2a2a',
        padding: '10px 20px',
        borderTop: '2px solid #444',
        fontSize: '12px',
        color: '#aaa',
        textAlign: 'center',
      }}>
        Use mouse wheel to zoom • Right-click or drag to pan • Click to place buildings
      </footer>
    </div>
  );
}

export default App;
