import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, Layers, Crosshair, Maximize, Split, Eye, Loader2, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BandComposite } from "@/lib/constants";
import { api } from "@/lib/api";

interface PixelLocation {
  lat: number;
  lon: number;
}

interface MapCanvasProps {
  className?: string;
  selectedComposite?: BandComposite;
  onPixelClick?: (location: PixelLocation) => void;
  dataSources?: any[];
  flyToLocation?: { lat: number; lon: number; zoom?: number } | null;
  fusionOptions?: any[]; // Passed from Index
  searchResults?: any[]; // New: STAC items to visualize
}

export function MapCanvas({ className, selectedComposite, onPixelClick, dataSources, flyToLocation, fusionOptions, searchResults }: MapCanvasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: 20.5937, lon: 78.9629 });
  const [zoom, setZoom] = useState(4);
  const [pitch, setPitch] = useState(0);
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'terrain' | 'dark'>('satellite');
  const [splitView, setSplitView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<PixelLocation | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Backend Health Check
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.health();
        setBackendStatus(res.status === 'ok' ? 'connected' : 'disconnected');
      } catch (e) {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'google-satellite': {
            type: 'raster',
            tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
            tileSize: 256,
            attribution: '&copy; Google Maps'
          },
          'isro-vedas': {
            type: 'raster',
            tiles: [
                // Call local proxy, passing WMS params directly. MapLibre replaces {bbox-epsg-3857}
                'http://localhost:8000/proxy/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=cite:india_state&STYLES=&WIDTH=256&HEIGHT=256&SRS=EPSG:3857&BBOX={bbox-epsg-3857}'
            ],
            tileSize: 256,
            attribution: '&copy; VEDAS / SAC / ISRO'
          },
          'carto-labels': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png'],
            tileSize: 512,
            attribution: '&copy; CartoDB',
            maxzoom: 19
          },
          'terrain-source': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15
          },
          'stac-results': {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'google-satellite',
            paint: {
              'raster-fade-duration': 0
            }
          },
          {
            id: 'isro-layer',
            type: 'raster',
            source: 'isro-vedas',
            paint: {
              'raster-opacity': 0, // Hidden by default
              'raster-fade-duration': 300
            }
          },

          {
            id: 'labels-layer',
            type: 'raster',
            source: 'carto-labels',
            paint: {
              'raster-fade-duration': 0,
              'raster-contrast': 0.1 // Slight contrast boost for sharpness
            }
          },
          // STAC Footprints Fill
          {
            id: 'stac-fill',
            type: 'fill',
            source: 'stac-results',
            paint: {
              'fill-color': '#f97316', // Orange-500
              'fill-opacity': 0.1
            }
          },
          // STAC Footprints Outline
          {
            id: 'stac-line',
            type: 'line',
            source: 'stac-results',
            paint: {
              'line-color': '#f97316',
              'line-width': 2,
              'line-dasharray': [2, 1] // Dashed look
            }
          }
        ],
        terrain: {
          source: 'terrain-source',
          exaggeration: 1.5
        },
        sky: {
           'sky-color': '#87CEEB',
           'sky-horizon-blend': 0.5,
           'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 10, 1, 12, 0]
        }
      },
      center: [78.9629, 20.5937],
      zoom: 4,
      pitch: 0,
      maxZoom: 22,
    });

    map.current.on('load', () => {
        setIsLoading(false);
    });

    map.current.on('move', () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      setCoordinates({
        lat: parseFloat(center.lat.toFixed(4)),
        lon: parseFloat(center.lng.toFixed(4))
      });
      setZoom(Math.round(map.current.getZoom()));
      setPitch(Math.round(map.current.getPitch()));
    });

    map.current.on('click', (e) => {
       const { lng, lat } = e.lngLat;
       const location = { lat, lon: lng };
       setClickedLocation(location);
       setIsFetchingData(true);
       setTimeout(() => {
         setIsFetchingData(false);
         onPixelClick?.(location);
       }, 500);
    });

  }, []);

  // Update Data Source Visibility
  useEffect(() => {
      if (!map.current || !map.current.isStyleLoaded()) return;

      const isroEnabled = dataSources?.find(s => s.id === 'resourcesat-2')?.enabled;
      
      // Toggle ISRO Layer Visibility (Hard Switch)
      if (map.current.getLayer('isro-layer')) {
          const visibility = isroEnabled ? 'visible' : 'none';
          map.current.setLayoutProperty('isro-layer', 'visibility', visibility);
          
          if (isroEnabled) {
              // Reset opacity to ensure it's visible if it was faded
              map.current.setPaintProperty('isro-layer', 'raster-opacity', 1);
              map.current.triggerRepaint();
          }
      }

  }, [dataSources]);

  // Update Band Simulation & FUSION EFFECTS (Raster Paint Properties)
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const layerId = 'satellite-layer';
    const mode = selectedComposite?.name;
    
    // Base Values
    let saturation = 0;
    let contrast = 0; 
    let hueRotate = 0;
    
    // 1. Apply Band Composite Logic
    switch (mode) {
       case 'Urban':
         contrast = 0.6; // High contrast
         saturation = -0.8; // Desaturated (Grayscale-ish)
         hueRotate = 0;
         break;
       case 'Agriculture':
         saturation = 1.5; // Very vibrant
         contrast = 0.3;
         hueRotate = -45; // Shift to Yellow/Bright Green
         break;
       case 'False Color (NIR)':
         saturation = 1.2;
         contrast = 0.3;
         hueRotate = -130; // DRASITC SHIFT: Green (120) -> Red (approx -10)
         break;
       case 'Moisture Index':
         hueRotate = 160; // Inverted-ish to highlight water/cool tones
         saturation = 0.5;
         contrast = 0.2;
         break;
       case 'Geology':
         hueRotate = 30; // Shift to browns/purples
         saturation = -0.2; 
         contrast = 0.4;
         break;
       default:
         saturation = 0.1;
         contrast = 0.05;
         break;
    }

    // 2. Apply FUSION ENGINE Logic (Real-Time Simulation)
    if (fusionOptions) {
        const panSharpen = fusionOptions.find((o:any) => o.id === 'pan-sharpen')?.enabled;
        const cloudFill = fusionOptions.find((o:any) => o.id === 'cloud-filling')?.enabled;
        const spectral = fusionOptions.find((o:any) => o.id === 'spectral-harmony')?.enabled;

        // Pan-Sharpening: Boost Contrast & Saturation significanly (Sharper look)
        if (panSharpen) {
            contrast += 0.5; // Huge contrast boost for sharpness
            saturation += 0.3;
        }

        // Cloud Filling: Boost Brightness (Simulate Dehazing)
        // Note: MapLibre doesn't typically have raster-brightness, but we can simulate with contrast
        if (cloudFill) {
            contrast += 0.1;
            // brightness handled via color shift if possible, or just assume contrast cleans it up
        }

        // Spectral Harmony: Adjust Hue for Warmth/Balance
        if (spectral) {
            hueRotate += 5; // Slight warm shift
            saturation += 0.1;
        }
    }

    // Apply to Map
    map.current.setPaintProperty(layerId, 'raster-saturation', saturation);
    map.current.setPaintProperty(layerId, 'raster-contrast', contrast);
    map.current.setPaintProperty(layerId, 'raster-hue-rotate', hueRotate);

  }, [selectedComposite, fusionOptions]); // Re-run when Fusion Options change

  // Update STAC Search Results (Visual Footprints)
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !searchResults) return;

    if (map.current.getSource('stac-results')) {
        const source = map.current.getSource('stac-results') as maplibregl.GeoJSONSource;
        
        // Convert API results to Generic GeoJSON Features (Polygon from BBox)
        const features = searchResults.map(scene => ({
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [scene.bbox[0], scene.bbox[1]], // minLon, minLat
                    [scene.bbox[2], scene.bbox[1]], // maxLon, minLat
                    [scene.bbox[2], scene.bbox[3]], // maxLon, maxLat
                    [scene.bbox[0], scene.bbox[3]], // minLon, maxLat
                    [scene.bbox[0], scene.bbox[1]]  // Close Loop
                ]]
            },
            properties: {
                id: scene.id,
                date: scene.date,
                satellite: scene.satellite,
                cloud_cover: scene.cloud_cover
            }
        }));

        source.setData({
            type: 'FeatureCollection',
            features: features as any
        });
    }
  }, [searchResults]);


  // FlyTo Logic
  useEffect(() => {
    if (flyToLocation && map.current) {
        map.current.flyTo({
            center: [flyToLocation.lon, flyToLocation.lat],
            zoom: flyToLocation.zoom || 14,
            essential: true,
            pitch: 60, // Auto tilt for cinematic effect
            speed: 0.8,
            curve: 1.5
        });
    }
  }, [flyToLocation]);

  const handleZoom = (dir: 'in' | 'out') => {
      if(dir === 'in') map.current?.zoomIn();
      else map.current?.zoomOut();
  };

  const handlePitch = () => {
    if (!map.current) return;
    const current = map.current.getPitch();
    map.current.easeTo({ pitch: current > 30 ? 0 : 60 });
  };

  const handleCenter = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: [78.9629, 20.5937],
      zoom: 4,
      pitch: 0,
      essential: true,
      duration: 1500
    });
  };

  const handleFullscreen = () => {
      if (!document.fullscreenElement) {
          mapContainer.current?.requestFullscreen();
      } else {
          document.exitFullscreen();
      }
  };

  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-border", className)}>
      {/* Scanning Overlay */}
      <AnimatePresence>
        {isFetchingData && (
           <motion.div
             initial={{ top: "-10%" }}
             animate={{ top: "110%" }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             className="absolute left-0 right-0 h-2 bg-primary/50 blur-sm z-20 pointer-events-none"
             style={{ boxShadow: '0 0 20px 5px rgba(0, 212, 255, 0.4)' }}
           />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-card flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
              <div className="text-sm font-mono text-muted-foreground">INITIALIZING FUSION ENGINE 3D</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAP CONTAINER */}
      <div ref={mapContainer} className="w-full h-full min-h-[500px]" />

      {/* Info Panel */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
          <div className="flex items-center gap-4 font-mono text-xs">
            <div><span className="text-muted-foreground">LAT: </span><span className="text-primary">{coordinates.lat.toFixed(4)}°</span></div>
            <div><span className="text-muted-foreground">LON: </span><span className="text-primary">{coordinates.lon.toFixed(4)}°</span></div>
            <div><span className="text-muted-foreground">ZOOM: </span><span className="text-primary">{zoom}</span></div>
            <div><span className="text-muted-foreground">PITCH: </span><span className="text-primary">{pitch}°</span></div>
          </div>
        </div>
      </div>
      
      {/* Backend Status Indicator Overlay */}
      <div className="absolute bottom-4 left-4 z-10">
         <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1 border border-border flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${backendStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[10px] font-mono text-muted-foreground">
               FUSION LINK: <span className={backendStatus === 'connected' ? 'text-green-500' : 'text-red-500'}>{backendStatus.toUpperCase()}</span>
            </span>
         </div>
      </div>

       {/* Map controls */}
       <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleZoom('in')} className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><ZoomIn className="w-5 h-5" /></motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleZoom('out')} className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><ZoomOut className="w-5 h-5" /></motion.button>
        <div className="h-px bg-border my-1" />
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCenter} className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
            <Crosshair className="w-5 h-5" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleFullscreen} className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
            <Maximize className="w-5 h-5" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePitch} className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
            <Compass className={cn("w-5 h-5 transition-transform duration-500", pitch > 0 && "text-primary")} style={{ transform: `rotateX(${pitch}deg)` }} />
        </motion.button>
       </div>

    </div>
  );
}
