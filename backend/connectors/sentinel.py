import pystac_client
import planetary_computer
from datetime import datetime
from typing import List, Dict, Any
from .base import DataConnector

class SentinelConnector(DataConnector):
    """
    Connects to Sentinel-2 Level-2A data via Microsoft Planetary Computer.
    """
    
    STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
    COLLECTION = "sentinel-2-l2a"

    def __init__(self):
        self.catalog = pystac_client.Client.open(self.STAC_URL, modifier=planetary_computer.sign_inplace)

    @property
    def source_id(self) -> str:
        return "sentinel-2"

    async def search(self, bbox: List[float], start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        date_range = f"{start_date.isoformat()}/{end_date.isoformat()}"
        
        search = self.catalog.search(
            collections=[self.COLLECTION],
            bbox=bbox,
            datetime=date_range,
            query={"eo:cloud_cover": {"lt": 25}},
            max_items=10
        )
        
        items = search.item_collection()
        results = []
        for item in items:
            results.append({
                "id": item.id,
                "source": "ESA",
                "sensor": "Sentinel-2",
                "date": item.datetime.isoformat(),
                "cloud_cover": item.properties.get("eo:cloud_cover"),
                "bbox": item.bbox,
                "thumbnail": item.assets["visual"].href if "visual" in item.assets else None
            })
        return results

    async def get_tile_url(self, item_id: str, bands: List[str]) -> str:
        # Re-fetch to get fresh signed URL
        search = self.catalog.search(ids=[item_id], collections=[self.COLLECTION])
        items = list(search.items())
        if not items:
            raise ValueError("Scene not found")
        item = items[0]
        return item.assets["visual"].href
