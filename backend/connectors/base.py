from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

class DataConnector(ABC):
    """
    Abstract Base Class for Sovereign-Global Data Connectors.
    Enforces a standardized interface for fetching metadata and tile URLs.
    """

    @property
    @abstractmethod
    def source_id(self) -> str:
        """Unique identifier (e.g., 'sentinel-2', 'liss-4')."""
        pass

    @abstractmethod
    async def search(self, bbox: List[float], start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """
        Search for available data in the BBox and Time Range.
        Returns a list of standardized metadata objects.
        """
        pass

    @abstractmethod
    async def get_tile_url(self, item_id: str, bands: List[str]) -> str:
        """
        Returns a URL (XYZ, WMS, or Blob SAS) to render the data.
        """
        pass
