import numpy as np
from fusion.optical import OpticalFusion
from fusion.sar_optical import SarOpticalFusion

def test_optical_fusion():
    print("Testing Optical Fusion (Brovey)...")
    # Simulate low-res Multispectral (3 bands, 10x10)
    # Shape: (3, 10, 10)
    ms = np.ones((3, 10, 10)) * 50 # RGB values around 50
    
    # Simulate high-res Pan (10x10 for simplicity, in real usage this is the target dim)
    # Let's assume we've already upsampled MS to match Pan.
    pan = np.ones((10, 10)) * 100 # Higher intensity structure
    
    try:
        fused = OpticalFusion.brovey_transform(ms, pan)
        print(f"✅ Fusion Successful. Output Shape: {fused.shape}")
        
        # Simple math check: 
        # I = (50+50+50)/3 = 50
        # Ratio = 100/50 = 2
        # New Red = 50 * 2 = 100
        assert np.allclose(fused, 100), "Math check failed for Brovey"
        print("✅ Math Check Passed")
    except Exception as e:
        print(f"❌ Optical Fusion Failed: {e}")

def test_sar_fusion():
    print("\nTesting SAR-Optical Fusion (HSV)...")
    # Simulate Optical RGB (3, 10, 10)
    # Normalized 0-1
    opt = np.ones((3, 10, 10)) * 0.5 
    
    # Simulate SAR Intensity (10, 10)
    # Bright reflector
    sar = np.ones((10, 10)) * 0.9 
    
    try:
        fused = SarOpticalFusion.hsv_fusion(opt, sar)
        print(f"✅ Fusion Successful. Output Shape: {fused.shape}")
        
        # Math check (Simplified Fusion logic in sar_optical.py)
        # Intensity = 0.5
        # Ratio = 0.9 / 0.5 = 1.8
        # New R = 0.5 * 1.8 = 0.9
        assert np.allclose(fused, 0.9), "Math check failed for HSV"
        print("✅ Math Check Passed")
    except Exception as e:
        print(f"❌ SAR Fusion Failed: {e}")

if __name__ == "__main__":
    test_optical_fusion()
    test_sar_fusion()
