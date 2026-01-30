import numpy as np

class SarOpticalFusion:
    """
    Handles SAR-Optical Fusion.
    Primary Use Case: Flood Mapping (SAR for Water, Optical for Context) or Crop Monitoring.
    """

    @staticmethod
    def hsv_fusion(optical_rgb: np.ndarray, sar_intensity: np.ndarray) -> np.ndarray:
        """
        Performs HSV-based Fusion.
        1. Convert Optical RGB to HSV.
        2. Replace 'Value' (Intensity) with SAR Backscatter Intensity.
        3. Convert back to RGB.
        
        This highlights structural features (from SAR) while keeping spectral color (from Optical).
        """
        # Note: In a real implementation we'd use cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
        # For pure numpy implementation verification:
        
        # 1. Normalize inputs to 0-1 range
        opt_norm = optical_rgb.astype(float) / 255.0 if optical_rgb.max() > 1 else optical_rgb
        sar_norm = sar_intensity.astype(float) / 255.0 if sar_intensity.max() > 1 else sar_intensity
        
        # 2. Simple substitution (Conceptual HSV Fusion)
        # Instead of full RGB->HSV conversion, we can do a weighted blend for 'Value'
        # New_V = (Alpha * Old_V) + (Beta * SAR_V)
        
        # Simplified "Intensity Replacement" Fusion:
        # R_new = R * (SAR / I)
        # G_new = G * (SAR / I)
        # B_new = B * (SAR / I)
        # This is similar to Brovey but using SAR as the 'Pan' channel.
        
        red = opt_norm[0]
        green = opt_norm[1]
        blue = opt_norm[2]
        
        intensity = (red + green + blue) / 3.0
        intensity[intensity == 0] = 1e-6
        
        ratio = sar_norm / intensity
        
        new_red = np.clip(red * ratio, 0, 1)
        new_green = np.clip(green * ratio, 0, 1)
        new_blue = np.clip(blue * ratio, 0, 1)
        
        return np.stack([new_red, new_green, new_blue])
