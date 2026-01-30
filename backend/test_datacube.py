from fusion.datacube import DataCubeBuilder

def test_datacube():
    print("Testing Data Cube Logic...")
    
    # Simulate Layers (Sentinel-2 and LISS-IV)
    # One is today, one is 2 days ago
    layers = [
        {"id": "s2_scene_1", "sensor": "Sentinel-2", "date": "2024-01-05T10:00:00Z"},
        {"id": "liss4_scene_1", "sensor": "LISS-IV", "date": "2024-01-03T10:00:00Z"}
    ]
    
    builder = DataCubeBuilder(target_resolution=10.0)
    cube = builder.create_cube(layers)
    
    print(f"Cube Status: {cube['status']}")
    for layer in cube['layers']:
        print(f" - Layer: {layer['sensor']}, Delta Days: {layer['delta_days']}, Confidence: {layer['fusion_confidence']}")
        
    # Check logic
    # Base is 2024-01-03 (Sorted) or 2024-01-05? Sort key is date.
    # 2024-01-03 comes before 2024-01-05. So base is LISS-IV.
    # Diff is 2 days. 
    # Confidence = 1.0 - (2 * 0.1) = 0.8
    
    assert cube['status'] == "ready_for_fusion"
    assert cube['layers'][1]['fusion_confidence'] == 0.8
    print("✅ Data Cube Logic Verified")

if __name__ == "__main__":
    test_datacube()
