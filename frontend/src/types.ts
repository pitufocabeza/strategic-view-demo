export interface Tile {
  x: number;
  y: number;
  type: 'water' | 'sand' | 'grass' | 'rock';
  resource: 'iron' | 'copper' | 'coal' | null;
  resource_amount: number;
}

export interface Chunk {
  chunk_x: number;
  chunk_y: number;
  tiles: Tile[];
}

export interface Building {
  id: string;
  x: number;
  y: number;
  type: 'miner' | 'smelter' | 'storage';
  owner: string;
  health: number;
  production_rate: number;
  input_resource: string | null;
  output_resource: string | null;
  storage: Record<string, number>;
  created_at: number;
}

export interface Player {
  id: string;
  username: string;
  resources: Record<string, number>;
  buildings_count: number;
  production_per_minute: Record<string, number>;
}

export interface GameState {
  tick: number;
  buildings: Building[];
  players: Record<string, Player>;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}
