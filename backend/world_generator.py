import noise
from typing import Dict, List, Optional


class WorldGenerator:
    def __init__(self, seed: int = 12345):
        self.seed = seed
        self.chunk_size = 32
        
    def generate_chunk(self, chunk_x: int, chunk_y: int) -> Dict:
        """Generate a 32x32 chunk of terrain tiles"""
        tiles = []
        
        for local_y in range(self.chunk_size):
            for local_x in range(self.chunk_size):
                # Calculate world coordinates
                world_x = chunk_x * self.chunk_size + local_x
                world_y = chunk_y * self.chunk_size + local_y
                
                # Generate terrain using Perlin noise
                terrain_value = noise.pnoise2(
                    world_x / 50.0,
                    world_y / 50.0,
                    octaves=4,
                    persistence=0.5,
                    lacunarity=2.0,
                    base=self.seed
                )
                
                # Determine terrain type based on noise value
                if terrain_value < -0.2:
                    terrain_type = "water"
                elif terrain_value < 0.0:
                    terrain_type = "sand"
                elif terrain_value < 0.4:
                    terrain_type = "grass"
                else:
                    terrain_type = "rock"
                
                # Generate resource deposits using separate noise layers
                resource = None
                resource_amount = 0
                
                if terrain_type in ["grass", "rock"]:
                    # Iron resource layer
                    iron_value = noise.pnoise2(
                        world_x / 30.0,
                        world_y / 30.0,
                        octaves=4,
                        persistence=0.5,
                        lacunarity=2.0,
                        base=self.seed + 1000
                    )
                    
                    # Copper resource layer
                    copper_value = noise.pnoise2(
                        world_x / 25.0,
                        world_y / 25.0,
                        octaves=4,
                        persistence=0.5,
                        lacunarity=2.0,
                        base=self.seed + 2000
                    )
                    
                    # Coal resource layer
                    coal_value = noise.pnoise2(
                        world_x / 35.0,
                        world_y / 35.0,
                        octaves=4,
                        persistence=0.5,
                        lacunarity=2.0,
                        base=self.seed + 3000
                    )
                    
                    # Determine resource based on highest value above threshold
                    if coal_value > 0.65:
                        resource = "coal"
                        resource_amount = int((coal_value - 0.65) * 100) + 50
                    elif copper_value > 0.62:
                        resource = "copper"
                        resource_amount = int((copper_value - 0.62) * 100) + 50
                    elif iron_value > 0.6:
                        resource = "iron"
                        resource_amount = int((iron_value - 0.6) * 100) + 50
                
                tile = {
                    "x": world_x,
                    "y": world_y,
                    "type": terrain_type,
                    "resource": resource,
                    "resource_amount": resource_amount
                }
                tiles.append(tile)
        
        return {
            "chunk_x": chunk_x,
            "chunk_y": chunk_y,
            "tiles": tiles
        }
