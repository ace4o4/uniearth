from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

app = FastAPI(title="Sat-Fusion-AI", version="1.0.0", description="Autonomous Geospatial Fusion Agent")

# Configure CORS
origins = [
    "http://localhost:8080",
    "http://localhost:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import Connectors
from connectors.sentinel import SentinelConnector
from connectors.nasa import LandsatConnector
from connectors.bhoonidhi import ISROConnector

# Initialize Connectors
connectors = {
    "sentinel-2": SentinelConnector(),
    "landsat-8": LandsatConnector(),
    "isro-bhuvan": ISROConnector()
}

class SearchRequest(BaseModel):
    source_id: str
    bbox: List[float] # [min_lon, min_lat, max_lon, max_lat]
    start_date: str # ISO format
    end_date: str # ISO format

@app.get("/")
async def root():
    return {"message": "Sat-Fusion-AI is Active", "timestamp": datetime.now()}

@app.get("/health")
async def health_check():
    """
    Health check endpoint probed by the frontend.
    """
    return {"status": "ok", "service": "fusion-agent", "timestamp": datetime.now()}

# Agent Integration
from agent.core import SatFusionAgent
agent = SatFusionAgent()

class AgentRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

@app.post("/agent/reason")
async def agent_reason(request: AgentRequest):
    """
    The Brain Interface.
    Frontend sends natural language (or structured intent), Agent replies with Reasoning + Actions.
    """
    response = await agent.reason_and_act(request.query, request.context)
    return response

class FusionRequest(BaseModel):
    method: str # "pan-sharpen", "sar-optical"
    optical_source_id: str
    secondary_source_id: str # Pan or SAR

@app.post("/fuse")
async def trigger_fusion(request: FusionRequest):
    """
    Triggers the Fusion Engine.
    In a real system, this would fetch the rasters (via Connectors) and run 
    OpticalFusion.brovey_transform() or SarOpticalFusion.hsv_fusion().
    
    For now, it acts as the 'Agentic Thought' confirming the validity of the operation.
    """
    if request.method == "pan-sharpen":
        return {
            "status": "success",
            "operation": "Brovey Transform",
            "message": "Fused LISS-IV (High-Res) with Sentinel-2 (Color).",
            "output_resolution": "5.8m",
            "virtual_constellation": True
        }
    elif request.method == "sar-optical":
        return {
            "status": "success",
            "operation": "HSV Fusion",
            "message": "Fused Sentinel-1 (Structure) with Sentinel-2 (Color). Cloud penetration active.",
            "mode": "All-Weather"
        }
    else:
        raise HTTPException(status_code=400, detail="Unknown fusion method")

class FusionActionRequest(BaseModel):
    action: str
    params: Optional[Dict[str, Any]] = None

@app.post("/fusion/process")
async def process_fusion(request: FusionActionRequest):
    """
    Simulates complex satellite processing tasks with realistic delays.
    """
    import asyncio
    
    # Simulate processing time based on complexity
    if request.action == "pan-sharpening":
        await asyncio.sleep(1.5) # 1.5s delay
        return {
            "status": "success", 
            "message": "Pan-Sharpening Complete. Spatial Resolution enhanced to 0.5m.",
            "metrics": {"sharpness": "+45%", "clarity": "High"}
        }
    elif request.action == "cloud-filling":
        await asyncio.sleep(2.0)
        return {
            "status": "success",
            "message": "Cloud artifacts removed using GAN reconstruction.",
            "metrics": {"cloud_cover": "0%", "confidence": "98%"}
        }
    elif request.action == "spectral-harmony":
        await asyncio.sleep(1.0)
        return {
            "status": "success",
            "message": "Band histograms equalized. Color balance restored.",
            "metrics": {"color_accuracy": "99.9%"}
        }
    elif request.action == "co-registration":
         await asyncio.sleep(1.2)
         return {
            "status": "success",
            "message": "Multi-temporal alignment complete. RMSE < 0.2 pixels.",
             "metrics": {"alignment": "Perfect"}
         }
    else:
        return {"status": "error", "message": "Unknown action"}

class SpectralRequest(BaseModel):
    lat: float
    lon: float

@app.post("/spectral/analyze")
async def analyze_spectral(request: SpectralRequest):
    """
    Simulates retrieving hyperspectral data for a specific pixel.
    In a real app, this would query a Cloud Optimized GeoTIFF (COG).
    """
    import random
    import math

    # Deterministic seed based on location (so the same pixel always gives the same 'reading')
    seed = (request.lat * 1000 + request.lon * 100) % 1
    
    # Classification Logic (Simulated Land Cover)
    is_vegetation = 0.3 < seed < 0.7
    is_water = seed < 0.15
    is_urban = seed > 0.85
    
    # Base Spectral Profiles (Reflectance 0.0 - 1.0)
    profile = {}
    
    if is_vegetation:
        profile = {
            "Blue": 0.05, "Green": 0.08, "Red": 0.04, "NIR": 0.55, "SWIR1": 0.20, "SWIR2": 0.12,
            "type": "Vegetation"
        }
    elif is_water:
        profile = {
            "Blue": 0.15, "Green": 0.10, "Red": 0.05, "NIR": 0.02, "SWIR1": 0.01, "SWIR2": 0.005,
             "type": "Water Body"
        }
    elif is_urban:
        profile = {
            "Blue": 0.15, "Green": 0.18, "Red": 0.22, "NIR": 0.25, "SWIR1": 0.30, "SWIR2": 0.28,
             "type": "Urban/Built-up"
        }
    else: # Barren / Soil
        profile = {
             "Blue": 0.10, "Green": 0.12, "Red": 0.15, "NIR": 0.20, "SWIR1": 0.25, "SWIR2": 0.30,
             "type": "Barren Land"
        }

    # Add Sensor Noise (Realistic variations)
    bands = []
    wavelengths = {"Blue": "490nm", "Green": "560nm", "Red": "665nm", "NIR": "842nm", "SWIR1": "1610nm", "SWIR2": "2190nm"}
    
    for band, val in profile.items():
        if band == "type": continue
        noise = (random.random() - 0.5) * 0.05
        value = max(0, min(1, val + noise)) # Clamp 0-1
        bands.append({
            "name": band,
            "value": value,
            "wavelength": wavelengths[band]
        })

    # Sort by wavelength for chart (approximation by name order isn't perfect, but fixed list is better)
    order = ["Blue", "Green", "Red", "NIR", "SWIR1", "SWIR2"]
    bands.sort(key=lambda x: order.index(x['name']))

    return {
        "status": "success",
        "location": {"lat": request.lat, "lon": request.lon},
        "classification": profile["type"],
        "bands": bands,
        "message": f"Spectral signature analyzed: {profile['type']} detected."
    }

@app.post("/search")
async def search_satellite_data(request: SearchRequest):
    """
    Agentic Search Endpoint.
    """
    if request.source_id not in connectors:
        # Agentic Fallback: If source not found, try to reason or default?
        # For now, strict error.
        raise HTTPException(status_code=400, detail=f"Source {request.source_id} not supported. Available: {list(connectors.keys())}")
        
    connector = connectors[request.source_id]
    
    try:
        # Parse dates (Timezone consideration: naïve vs aware)
        start = datetime.fromisoformat(request.start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(request.end_date.replace('Z', '+00:00'))
        
        results = await connector.search(request.bbox, start, end)
        return {"count": len(results), "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
