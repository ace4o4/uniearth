import pystac_client
import planetary_computer
from datetime import datetime
from typing import List, Dict, Any
from .base import DataConnector

class LandsatConnector(DataConnector):
    """
    Connects to Landsat Collection 2 Level-2 data via Microsoft Planetary Computer.
    """
    
    STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
    COLLECTION = "landsat-c2-l2"

    def __init__(self):
        self.catalog = pystac_client.Client.open(self.STAC_URL, modifier=planetary_computer.sign_inplace)

    @property
    def source_id(self) -> str:
        return "landsat-8"

    async def search(self, bbox: List[float], start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        date_range = f"{start_date.isoformat()}/{end_date.isoformat()}"
        
        search = self.catalog.search(
            collections=[self.COLLECTION],
            bbox=bbox,
            datetime=date_range,
            query={"eo:cloud_cover": {"lt": 25}, "platform": {"in": ["landsat-8", "landsat-9"]}},
            max_items=10
        )
        
        items = search.item_collection()
        results = []
        for item in items:
            thumb = item.assets.get("rendered_preview", {}).get("href")
            if not thumb and "visual" in item.assets:
                thumb = item.assets["visual"].href
                
            results.append({
                "id": item.id,
                "source": "NASA",
                "sensor": "Landsat-8/9",
                "date": item.datetime.isoformat(),
                "cloud_cover": item.properties.get("eo:cloud_cover"),
                "bbox": item.bbox,
                "thumbnail": thumb
            })
        return results

    async def get_tile_url(self, item_id: str, bands: List[str]) -> str:
        search = self.catalog.search(ids=[item_id], collections=[self.COLLECTION])
        items = list(search.items())
        if not items:
            raise ValueError("Scene not found")
        item = items[0]
        
        if "rendered_preview" in item.assets:
            return item.assets["rendered_preview"].href
        elif "visual" in item.assets:
            return item.assets["visual"].href
        
        raise ValueError("No visual asset found")
