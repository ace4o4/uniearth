from typing import List, Dict, Any
# Lazy imports to avoid circular dependencies or startup costs
# In a real agent framework (LangChain/LlamaIndex), these would be Tool objects.

async def tool_search_isro(bbox: List[float], start_date: str, end_date: str) -> Dict[str, Any]:
    """Searches ISRO Bhuvan for data."""
    from connectors.bhoonidhi import ISROConnector
    from datetime import datetime
    
    c = ISROConnector()
    # Mocking date parsing for the tool wrapper
    start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    results = await c.search(bbox, start, end)
    return {"status": "found", "count": len(results), "data": results}

async def tool_search_global(source: str, bbox: List[float], start_date: str, end_date: str) -> Dict[str, Any]:
    """Searches Global sources (Sentinel/Landsat)."""
    from connectors.sentinel import SentinelConnector
    from connectors.nasa import LandsatConnector
    from datetime import datetime
    
    if source == "sentinel-2":
        c = SentinelConnector()
    elif source == "landsat-8":
        c = LandsatConnector()
    else:
        return {"error": "Unknown global source"}

    start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    results = await c.search(bbox, start, end)
    return {"status": "found", "count": len(results), "data": results}

async def tool_fuse_optical(optical_id: str, pan_id: str) -> Dict[str, Any]:
    """Simulates Optical Fusion (Pan-Sharpening)."""
    # In a real scenario, this would trigger the heavy compute job
    return {
        "status": "success", 
        "method": "Brovey Transform", 
        "message": f"Fused {pan_id} (High-Res) with {optical_id} (Color)."
    }

async def tool_fuse_sar(optical_id: str, sar_id: str) -> Dict[str, Any]:
    """Simulates SAR-Optical Fusion."""
    return {
        "status": "success", 
        "method": "HSV Fusion", 
        "message": f"Fused {sar_id} (Structure) with {optical_id} (Color). Cloud penetration active."
    }

TOOLS = {
    "search_isro": tool_search_isro,
    "search_global": tool_search_global,
    "fuse_optical": tool_fuse_optical,
    "fuse_sar": tool_fuse_sar
}
