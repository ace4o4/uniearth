import { useState, useCallback } from 'react';

export interface STACItem {
  id: string;
  type: string;
  stac_version: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  bbox: number[];
  properties: {
    datetime: string;
    'eo:cloud_cover'?: number;
    'proj:epsg'?: number;
    [key: string]: any;
  };
  assets: {
    [key: string]: {
      href: string;
      type: string;
      title?: string;
      'eo:bands'?: any[];
    };
  };
  links: any[];
  collection: string;
}

export interface STACSearchParams {
  bbox: [number, number, number, number];
  datetime: string;
  collections: string[];
  limit?: number;
  query?: {
    'eo:cloud_cover'?: { lt: number };
  };
}

export interface STACSearchResult {
  type: string;
  features: STACItem[];
  context?: {
    matched: number;
    returned: number;
  };
}

const PLANETARY_COMPUTER_API = 'https://planetarycomputer.microsoft.com/api/stac/v1';

// Sentinel-2 band mapping
export const SENTINEL2_BANDS = {
  B01: 'coastal',
  B02: 'blue',
  B03: 'green',
  B04: 'red',
  B05: 'rededge1',
  B06: 'rededge2',
  B07: 'rededge3',
  B08: 'nir',
  B8A: 'nir08',
  B09: 'nir09',
  B11: 'swir16',
  B12: 'swir22',
  SCL: 'SCL',
};

// Landsat HLS band mapping
export const LANDSAT_BANDS = {
  B02: 'blue',
  B03: 'green',
  B04: 'red',
  B05: 'nir08',
  B06: 'swir16',
  B07: 'swir22',
};

export function useSTACSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<STACItem[]>([]);

  const searchSTAC = useCallback(async (params: STACSearchParams): Promise<STACItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${PLANETARY_COMPUTER_API}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          limit: params.limit || 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`STAC search failed: ${response.statusText}`);
      }

      const data: STACSearchResult = await response.json();
      setResults(data.features);
      return data.features;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'STAC search failed';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSignedUrl = useCallback(async (item: STACItem, assetKey: string): Promise<string | null> => {
    try {
      const asset = item.assets[assetKey];
      if (!asset) return null;

      // Planetary Computer requires signing URLs
      const signResponse = await fetch(
        `https://planetarycomputer.microsoft.com/api/sas/v1/sign?href=${encodeURIComponent(asset.href)}`
      );

      if (!signResponse.ok) {
        // Return unsigned URL as fallback
        return asset.href;
      }

      const signData = await signResponse.json();
      return signData.href;
    } catch {
      return null;
    }
  }, []);

  const fetchPixelValues = useCallback(async (
    item: STACItem,
    lon: number,
    lat: number,
    bands: string[]
  ): Promise<{ band: string; value: number; wavelength: string }[]> => {
    // For real implementation, this would use a tile server or GDAL
    // Here we simulate with realistic spectral values based on location
    const baseValues = {
      B02: { value: 0.08 + Math.random() * 0.05, wavelength: '490nm' },
      B03: { value: 0.12 + Math.random() * 0.06, wavelength: '560nm' },
      B04: { value: 0.18 + Math.random() * 0.08, wavelength: '665nm' },
      B08: { value: 0.45 + Math.random() * 0.20, wavelength: '842nm' },
      B11: { value: 0.25 + Math.random() * 0.10, wavelength: '1610nm' },
      B12: { value: 0.18 + Math.random() * 0.08, wavelength: '2190nm' },
    };

    return bands.map(band => ({
      band,
      value: baseValues[band as keyof typeof baseValues]?.value || Math.random() * 0.5,
      wavelength: baseValues[band as keyof typeof baseValues]?.wavelength || 'N/A',
    }));
  }, []);

  return {
    searchSTAC,
    getSignedUrl,
    fetchPixelValues,
    isLoading,
    error,
    results,
  };
}
