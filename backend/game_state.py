from typing import Dict, List, Optional
from dataclasses import dataclass, asdict, field
from datetime import datetime


@dataclass
class Building:
    id: str
    x: int
    y: int
    type: str
    owner: str
    health: int
    production_rate: float
    input_resource: Optional[str]
    output_resource: Optional[str]
    storage: Dict[str, float]
    created_at: float


@dataclass
class Player:
    id: str
    username: str
    resources: Dict[str, float]
    buildings_count: int
    production_per_minute: Dict[str, float]


class GameState:
    def __init__(self):
        self.buildings: Dict[str, Building] = {}
        self.players: Dict[str, Player] = {}
        self.tick_count: int = 0
        self.connections: List = []
    
    def add_player(self, player_id: str, username: str):
        """Initialize new player with starting resources"""
        if player_id not in self.players:
            self.players[player_id] = Player(
                id=player_id,
                username=username,
                resources={"iron": 100, "copper": 50, "coal": 30},
                buildings_count=0,
                production_per_minute={}
            )
        return self.players[player_id]
    
    def place_building(self, player_id: str, x: int, y: int, building_type: str) -> Dict:
        """Place a building at the specified coordinates"""
        # Check if player exists
        if player_id not in self.players:
            return {"success": False, "error": "Player not found"}
        
        player = self.players[player_id]
        
        # Check tile occupancy
        for building in self.buildings.values():
            if building.x == x and building.y == y:
                return {"success": False, "error": "Tile already occupied"}
        
        # Define building costs and configurations
        building_configs = {
            "miner": {
                "cost": {"iron": 10, "copper": 5},
                "input_resource": None,
                "output_resource": None,  # Will be determined by tile
                "production_rate": 1.0,
                "health": 100
            },
            "smelter": {
                "cost": {"iron": 20, "copper": 10},
                "input_resource": "iron",
                "output_resource": "steel",
                "production_rate": 0.5,
                "health": 100
            },
            "storage": {
                "cost": {"iron": 15, "copper": 5},
                "input_resource": None,
                "output_resource": None,
                "production_rate": 0,
                "health": 100
            }
        }
        
        if building_type not in building_configs:
            return {"success": False, "error": "Invalid building type"}
        
        config = building_configs[building_type]
        
        # Verify resource costs
        for resource, cost in config["cost"].items():
            if player.resources.get(resource, 0) < cost:
                return {"success": False, "error": f"Not enough {resource}"}
        
        # Deduct resources
        for resource, cost in config["cost"].items():
            player.resources[resource] -= cost
        
        # Create building with unique ID
        building_id = f"{player_id}_{x}_{y}_{self.tick_count}"
        building = Building(
            id=building_id,
            x=x,
            y=y,
            type=building_type,
            owner=player_id,
            health=config["health"],
            production_rate=config["production_rate"],
            input_resource=config["input_resource"],
            output_resource=config["output_resource"],
            storage={},
            created_at=datetime.now().timestamp()
        )
        
        self.buildings[building_id] = building
        player.buildings_count += 1
        
        return {
            "success": True,
            "building": asdict(building)
        }
    
    def tick(self):
        """Process game simulation tick"""
        self.tick_count += 1
        
        # Reset production tracking
        for player in self.players.values():
            player.production_per_minute = {}
        
        # Process each building
        for building in self.buildings.values():
            player = self.players[building.owner]
            
            if building.type == "miner":
                # Miners produce resources based on tile
                if building.output_resource:
                    # Add to building storage
                    if building.output_resource not in building.storage:
                        building.storage[building.output_resource] = 0
                    building.storage[building.output_resource] += building.production_rate
                    
                    # Track production per minute
                    if building.output_resource not in player.production_per_minute:
                        player.production_per_minute[building.output_resource] = 0
                    player.production_per_minute[building.output_resource] += building.production_rate * 60
            
            elif building.type == "smelter":
                # Smelters consume input and produce output
                if building.input_resource and building.output_resource:
                    input_amount = building.storage.get(building.input_resource, 0)
                    if input_amount >= 1:
                        # Consume input
                        building.storage[building.input_resource] -= 1
                        
                        # Produce output
                        if building.output_resource not in building.storage:
                            building.storage[building.output_resource] = 0
                        building.storage[building.output_resource] += building.production_rate
                        
                        # Track production
                        if building.output_resource not in player.production_per_minute:
                            player.production_per_minute[building.output_resource] = 0
                        player.production_per_minute[building.output_resource] += building.production_rate * 60
    
    def get_state_snapshot(self) -> Dict:
        """Return current game state as a dictionary"""
        return {
            "tick": self.tick_count,
            "buildings": [asdict(b) for b in self.buildings.values()],
            "players": {pid: asdict(p) for pid, p in self.players.items()}
        }


# Global game state instance
game_state = GameState()
