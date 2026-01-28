from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from typing import List
from world_generator import WorldGenerator
from game_state import game_state, GameState

# Create FastAPI app
app = FastAPI(title="Space Mining Strategy API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create world generator
world_gen = WorldGenerator(seed=12345)

# Active WebSocket connections
active_connections: List[WebSocket] = []


async def broadcast_update(message: dict):
    """Send update to all connected clients"""
    for connection in active_connections:
        try:
            await connection.send_json(message)
        except:
            pass


async def game_loop():
    """Main game loop - runs every second"""
    while True:
        await asyncio.sleep(1.0)
        game_state.tick()
        await broadcast_update({
            "type": "tick",
            "data": game_state.get_state_snapshot()
        })


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(game_loop())


@app.get("/")
async def root():
    return {"message": "Space Mining Strategy API", "status": "online"}


@app.get("/api/chunk/{chunk_x}/{chunk_y}")
async def get_chunk(chunk_x: int, chunk_y: int):
    """Generate and return a chunk of terrain"""
    return world_gen.generate_chunk(chunk_x, chunk_y)


@app.post("/api/player/join")
async def join_game(username: str, player_id: str):
    """Add a player to the game"""
    player = game_state.add_player(player_id, username)
    from dataclasses import asdict
    return {"success": True, "player": asdict(player)}


@app.post("/api/building/place")
async def place_building(player_id: str, x: int, y: int, building_type: str):
    """Place a building on the map"""
    # For miners, determine output resource from tile
    tile_resource = None
    if building_type == "miner":
        chunk_x = x // 32
        chunk_y = y // 32
        chunk = world_gen.generate_chunk(chunk_x, chunk_y)
        for tile in chunk["tiles"]:
            if tile["x"] == x and tile["y"] == y:
                tile_resource = tile["resource"]
                break
    
    result = game_state.place_building(player_id, x, y, building_type, tile_resource)
    
    if result["success"]:
        # Broadcast building placement to all clients
        await broadcast_update({
            "type": "building_placed",
            "data": result["building"]
        })
    
    return result


@app.get("/api/state")
async def get_state():
    """Get current game state"""
    return game_state.get_state_snapshot()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    # Send initial state
    await websocket.send_json({
        "type": "initial_state",
        "data": game_state.get_state_snapshot()
    })
    
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle ping/pong
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        active_connections.remove(websocket)
    except Exception as e:
        if websocket in active_connections:
            active_connections.remove(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
