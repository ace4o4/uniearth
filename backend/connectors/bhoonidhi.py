from typing import List, Dict, Any
from datetime import datetime
from .base import DataConnector

class ISROConnector(DataConnector):
    """
    Connects to ISRO Bhuvan Services.
    Currently utilizes the Open Data WMS endpoints for visualization.
    Future upgrade: Integrate Bhoonidhi STAC API for raw transparency.
    """
    
    # Public WMS endpoints (LISS-III / LISS-IV composite layers often exposed via Bhuvan)
    WMS_URL = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"

    @property
    def source_id(self) -> str:
        return "isro-bhuvan"

    async def search(self, bbox: List[float], start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """
        Since Bhuvan WMS is a continuous service, we return a single 'Live Layer' object.
        """
        return [{
            "id": "bhuvan-lulc",
            "source": "ISRO",
            "sensor": "Resourcesat-2 (LISS-III/IV)",
            "date": datetime.now().isoformat(),
            "bbox": bbox,
            "thumbnail": "https://bhuvan.nrsc.gov.in/bhuvan_links/images/bhuvan_logo.png"
        }]

    async def get_tile_url(self, item_id: str, bands: List[str]) -> str:
        """
        Returns the WMS endpoint. The frontend OpenLayers client will append BBox params.
        """
        return self.WMS_URL
