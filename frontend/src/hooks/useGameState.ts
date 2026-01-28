import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState } from '../types';

const WS_URL = 'ws://localhost:8000/ws';
const API_URL = 'http://localhost:8000/api';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'initial_state') {
        setGameState(message.data);
      } else if (message.type === 'tick') {
        setGameState(message.data);
      } else if (message.type === 'building_placed') {
        // Building placed event handled by tick updates
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  const placeBuilding = useCallback(async (
    playerId: string,
    x: number,
    y: number,
    buildingType: string
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/building/place?player_id=${playerId}&x=${x}&y=${y}&building_type=${buildingType}`,
        { method: 'POST' }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error placing building:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  return { gameState, connected, placeBuilding };
};
