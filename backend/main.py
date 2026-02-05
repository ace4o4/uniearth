from fastapi import FastAPI, HTTPException, Request, Response
import httpx
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
    Real-Time STAC Search Endpoint.
    Queries Earth Search (AWS) for Sentinel-2 and Landsat data.
    """
    from pystac_client import Client
    
    STAC_API_URL = "https://earth-search.aws.element84.com/v1"
    
    print(f"Searching STAC: {request.bbox} | {request.start_date} to {request.end_date}")

    try:
        # Convert bbox dict/object to list [minx, miny, maxx, maxy] if not already
        # Assuming request.bbox is [min_lon, min_lat, max_lon, max_lat]
        bbox = request.bbox
        
        # Connect to STAC API
        client = Client.open(STAC_API_URL)
        
        # Determine collections based on source_id or search everything
        collections = []
        if "sentinel" in request.source_id.lower():
            collections.append("sentinel-2-l2a")
        elif "landsat" in request.source_id.lower():
            collections.append("landsat-c2-l2")
        else:
            collections = ["sentinel-2-l2a", "landsat-c2-l2"] # Default to both
            
        # Parse Dates
        # Pystac expects "start_iso/end_iso"
        # We need to ensure YYYY-MM-DD format mostly works or ISO string
        datetime_range = f"{request.start_date}/{request.end_date}".replace('Z', '')

        search = client.search(
            collections=collections,
            bbox=bbox,
            datetime=datetime_range,
            max_items=50,
            query={"eo:cloud_cover": {"lt": 50}} # Default < 50% cloud cover to find something
        )
        
        items = list(search.items())
        print(f"Docs Found: {len(items)}")
        
        results = []
        for item in items:
            props = item.properties
            
            # Extract Thumbnail (Visual Proof)
            thumbnail = ""
            if "thumbnail" in item.assets:
                thumbnail = item.assets["thumbnail"].href
            elif "visual" in item.assets: # Sentinel-2 often uses 'visual'
                thumbnail = item.assets["visual"].href
            
            # Construct Result
            scene = {
                "id": item.id,
                "date": item.datetime.strftime("%Y-%m-%d"),
                "time": item.datetime.strftime("%H:%M:%S"),
                "satellite": props.get("platform", "Satellite"),
                "cloud_cover": props.get("eo:cloud_cover", 0),
                "thumbnail": thumbnail,
                "bbox": item.bbox
            }
            results.append(scene)
            
        return {"count": len(results), "results": results}

    except Exception as e:
        print(f"STAC Error: {str(e)}")
        # Graceful Fallback
        return {"count": 0, "results": [], "error": str(e)}


@app.get("/proxy/wms")
async def proxy_wms(request: Request):
    """
    Transparent WMS Proxy.
    Catches all query parameters (SERVICE, REQUEST, LAYERS, BBOX, etc.) 
    and forwards them to the ISRO VEDAS server.
    """
    vedas_base = "https://vedas.sac.gov.in/drought_monitoring_wms/wms"
    
    # Extract all query params from the incoming request
    params = dict(request.query_params)
    
    try:
        async with httpx.AsyncClient(verify=False) as client: # verify=False for ISRO SSL quirks
            # Forward the request to VEDAS with the captured parameters
            resp = await client.get(vedas_base, params=params, timeout=15.0)
            
            # debug logging
            print(f"Proxying: {resp.url} -> Status: {resp.status_code}")
            
            if resp.status_code != 200:
                print(f"Error from VEDAS: {resp.text[:200]}")
                return Response(content=resp.content, status_code=resp.status_code)

            return Response(content=resp.content, media_type=resp.headers.get("content-type", "image/png"))
            
    except Exception as e:
        print(f"Proxy Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Proxy failed: {str(e)}")

@app.get("/notifications/live")
async def live_notifications():
    """
    Simulates a Real-Time 'RSS Feed' of satellite acquisitions.
    Frontend polls this to show 'Live' toasts.
    """
    import random
    
    # 30% chance to have a "new" acquisition in the last few seconds
    if random.random() > 0.7:
        cities = ["Mumbai", "Delhi", "Bangalore", "New York", "London", "Tokyo", "Paris", "Berlin", "Sydney", "Dubai"]
        sats = ["Sentinel-2A", "Sentinel-2B", "Landsat-8", "Landsat-9", "Cartosat-3", "Resourcesat-2"]
        
        city = random.choice(cities)
        sat = random.choice(sats)
        
        return {
            "has_new": True,
            "event": {
                "id": str(int(datetime.now().timestamp())),
                "message": f"{sat} just acquired new data over {city}.",
                "timestamp": datetime.now().isoformat(),
                "type": "acquisition"
            }
        }
    
    return {"has_new": False}

@app.post("/agent/reason")
async def agent_reason(payload: dict):
    """
    Autonomous Agent Brain.
    Parses natural language queries and returns:
    1. Answer (Spoken response)
    2. Thoughts (Step-by-step reasoning)
    3. Actions (JSON commands for Frontend to execute)
    """
    query = payload.get("query", "").lower()
    
    response = {
        "answer": "I'm not sure how to help with that yet.",
        "thoughts": ["Analyzing query...", "No matching intent found."],
        "actions": []
    }
    
    # INTENT 1: NAVIGATION (Fly to X)
    import re
    loc_match = re.search(r"(go to|fly to|show me|zoom to|find) (.+)", query)
    if loc_match:
        location = loc_match.group(2).strip()
        # Clean up common words
        for stop in ["in", "at", "the", "map", "location"]:
            location = location.replace(f" {stop} ", " ")
            
        response["thoughts"] = [
            f"User wants to navigate to '{location}'.",
            "Extracting location entity...",
            f"Generating flight command for '{location}'."
        ]
        response["answer"] = f"Understood. Initiating orbital transfer to {location}."
        response["actions"] = [{
            "type": "fly_to",
            "payload": {"name": location}
        }]
        return response

    # INTENT 2: LAYER SWITCHING (Sentinel, Landsat, ISRO)
    if "sentinel" in query:
        response["thoughts"] = ["Detected intent: Switch Data Source", "Target: Sentinel-2 (ESA/Copernicus)", "Generating layer switch command."]
        response["answer"] = "Switching main feed to Sentinel-2 MSI. Bringing up real-time HLS tiles."
        response["actions"] = [{"type": "set_datasource", "payload": {"id": "sentinel-2"}}]
        return response
    
    if "landsat" in query:
        response["thoughts"] = ["Detected intent: Switch Data Source", "Target: Landsat-8/9 (NASA/USGS)", "Generating layer switch command."]
        response["answer"] = "Activating Landsat-8 OLI feed. Thermal and optical bands syncing."
        response["actions"] = [{"type": "set_datasource", "payload": {"id": "landsat-8"}}]
        return response

    if "isro" in query or "resource" in query or "bhuvan" in query:
        response["thoughts"] = ["Detected intent: Switch Data Source", "Target: ISRO Resourcesat-2", "Generating layer switch command."]
        response["answer"] = "Connecting to ISRO VEDAS Node. Loading Resourcesat-2 LISS-III coverage."
        response["actions"] = [{"type": "set_datasource", "payload": {"id": "resourcesat-2"}}]
        return response

    # INTENT 3: ANALYSIS / COMPOSITES
    if "vegetation" in query or "crop" in query or "farming" in query or "agriculture" in query:
        response["thoughts"] = ["Detected intent: Spectral Analysis", "Topic: Vegetation/Agriculture", "Recommended Composite: NDVI / Agriculture (SWIR)", "Applying filter."]
        response["answer"] = "Analying vegetation health. Switching to Agriculture composite (SWIR-NIR-Blue) to highlight chlorophyll content."
        response["actions"] = [{"type": "set_composite", "payload": {"id": "agriculture"}}]
        return response
        
    if "water" in query or "flood" in query or "moisture" in query:
         response["thoughts"] = ["Detected intent: Spectral Analysis", "Topic: Water/Moisture", "Recommended Composite: NDWI / Moisture Index", "Applying filter."]
         response["answer"] = "Highlighting water bodies and moisture content. Applying Normalized Difference Water Index filter."
         response["actions"] = [{"type": "set_composite", "payload": {"id": "moisture"}}]
         return response

    if "urban" in query or "city" in query or "building" in query:
         response["thoughts"] = ["Detected intent: Spectral Analysis", "Topic: Urbanization", "Recommended Composite: Urban / False Color", "Applying filter."]
         response["answer"] = "Enhancing man-made structures. Switching to Urban composite."
         response["actions"] = [{"type": "set_composite", "payload": {"id": "urban"}}]
         return response

    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
