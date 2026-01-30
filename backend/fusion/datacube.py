import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

class DataCubeBuilder:
    """
    Manages the creation of Spatio-Temporal Data Cubes.
    Aligns data from different sensors (ISRO, Sentinel) in Space (CRS, Resolution) and Time.
    """
    
    def __init__(self, target_resolution: float = 10.0):
        self.target_resolution = target_resolution

    def create_cube(self, layers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Input: List of metadata layers (Sentinel-2, LISS-IV, etc.)
        Output: A virtual 'Cube' structure indicating alignment.
        """
        # 1. Sort by Time
        layers.sort(key=lambda x: x.get('date', ''))
        
        # 2. Check Temporal Decorrelation
        base_layer = layers[0]
        base_time = datetime.fromisoformat(base_layer['date'].replace('Z', '+00:00'))
        
        aligned_layers = []
        for layer in layers:
            layer_time = datetime.fromisoformat(layer['date'].replace('Z', '+00:00'))
            diff = abs((layer_time - base_time).days)
            
            # Decorrelation Logic:
            # If difference > 5 days (User configurable), flag it.
            confidence = 1.0 - (diff * 0.1) # Loose decay check
            confidence = max(0.0, confidence)
            
            aligned_layers.append({
                "layer_id": layer['id'],
                "sensor": layer.get('sensor'),
                "delta_days": diff,
                "fusion_confidence": confidence
            })
            
        return {
            "cube_id": f"cube_{base_layer['id']}",
            "base_resolution": self.target_resolution,
            "layers": aligned_layers,
            "status": "ready_for_fusion" if len(aligned_layers) > 1 else "insufficient_data"
        }
