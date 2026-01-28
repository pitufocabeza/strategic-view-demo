import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Building, Chunk, Camera } from '../types';
import { useAudio } from '../hooks/useAudio';

interface GameCanvasProps {
  buildings: Building[];
  onPlaceBuilding: (x: number, y: number, type: string) => Promise<{ success: boolean; error?: string }>;
  selectedBuildingType: string | null;
}

const TILE_SIZE = 32;
const API_URL = 'http://localhost:8000/api';

export const GameCanvas: React.FC<GameCanvasProps> = ({
  buildings,
  onPlaceBuilding,
  selectedBuildingType,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [chunks, setChunks] = useState<Map<string, Chunk>>(new Map());
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const { playBuildingPlaced, playError } = useAudio();

  // Load chunk from API
  const loadChunk = useCallback(async (chunkX: number, chunkY: number) => {
    const key = `${chunkX},${chunkY}`;
    if (chunks.has(key)) return;

    try {
      const response = await fetch(`${API_URL}/chunk/${chunkX}/${chunkY}`);
      const chunk: Chunk = await response.json();
      setChunks(prev => new Map(prev).set(key, chunk));
    } catch (error) {
      console.error('Error loading chunk:', error);
    }
  }, [chunks]);

  // Calculate visible chunks and load them
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const viewWidth = canvas.width / camera.zoom;
    const viewHeight = canvas.height / camera.zoom;

    const startChunkX = Math.floor(camera.x / (32 * TILE_SIZE));
    const startChunkY = Math.floor(camera.y / (32 * TILE_SIZE));
    const endChunkX = Math.ceil((camera.x + viewWidth) / (32 * TILE_SIZE));
    const endChunkY = Math.ceil((camera.y + viewHeight) / (32 * TILE_SIZE));

    for (let cx = startChunkX; cx <= endChunkX; cx++) {
      for (let cy = startChunkY; cy <= endChunkY; cy++) {
        loadChunk(cx, cy);
      }
    }
  }, [camera, loadChunk]);

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply camera transform
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // Draw tiles
    chunks.forEach(chunk => {
      chunk.tiles.forEach(tile => {
        const screenX = tile.x * TILE_SIZE;
        const screenY = tile.y * TILE_SIZE;

        // Terrain color
        let color = '#808080';
        if (tile.type === 'water') color = '#4499ff';
        else if (tile.type === 'sand') color = '#f4e4c1';
        else if (tile.type === 'grass') color = '#77cc77';
        else if (tile.type === 'rock') color = '#999999';

        ctx.fillStyle = color;
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

        // Resource indicator
        if (tile.resource) {
          let resourceColor = '#ffffff';
          if (tile.resource === 'iron') resourceColor = '#cc6633';
          else if (tile.resource === 'copper') resourceColor = '#ff9933';
          else if (tile.resource === 'coal') resourceColor = '#333333';

          ctx.fillStyle = resourceColor;
          ctx.fillRect(screenX + 4, screenY + 4, 8, 8);
        }

        // Grid lines
        ctx.strokeStyle = '#00000022';
        ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      });
    });

    // Draw buildings
    buildings.forEach(building => {
      const screenX = building.x * TILE_SIZE;
      const screenY = building.y * TILE_SIZE;

      // Building color based on type
      let buildingColor = '#666666';
      if (building.type === 'miner') buildingColor = '#ffaa00';
      else if (building.type === 'smelter') buildingColor = '#ff5555';
      else if (building.type === 'storage') buildingColor = '#5555ff';

      ctx.fillStyle = buildingColor;
      ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);

      // Building border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    });

    // Draw hovered tile highlight
    if (hoveredTile && selectedBuildingType) {
      const screenX = hoveredTile.x * TILE_SIZE;
      const screenY = hoveredTile.y * TILE_SIZE;

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    }

    ctx.restore();
  }, [camera, chunks, buildings, hoveredTile, selectedBuildingType]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / camera.zoom + camera.x;
    const mouseY = (e.clientY - rect.top) / camera.zoom + camera.y;

    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setCamera(prev => ({
        ...prev,
        x: prev.x - dx / camera.zoom,
        y: prev.y - dy / camera.zoom,
      }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (selectedBuildingType) {
      const tileX = Math.floor(mouseX / TILE_SIZE);
      const tileY = Math.floor(mouseY / TILE_SIZE);
      setHoveredTile({ x: tileX, y: tileY });
    }
  }, [camera, isDragging, lastMousePos, selectedBuildingType]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2 || (e.button === 0 && !selectedBuildingType)) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [selectedBuildingType]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click
  const handleClick = useCallback(async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedBuildingType || isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / camera.zoom + camera.x;
    const mouseY = (e.clientY - rect.top) / camera.zoom + camera.y;

    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    const result = await onPlaceBuilding(tileX, tileY, selectedBuildingType);
    
    if (result.success) {
      playBuildingPlaced();
    } else {
      playError();
      console.error('Failed to place building:', result.error);
    }
  }, [selectedBuildingType, isDragging, camera, onPlaceBuilding, playBuildingPlaced, playError]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.25, Math.min(2, prev.zoom * zoomFactor)),
    }));
  }, []);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={700}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      style={{
        border: '2px solid #333',
        cursor: isDragging ? 'grabbing' : selectedBuildingType ? 'crosshair' : 'grab',
        display: 'block',
      }}
    />
  );
};
