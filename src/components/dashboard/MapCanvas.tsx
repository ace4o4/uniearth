import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Layers, Crosshair, Maximize, Split, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import type { MapBrowserEvent } from "ol";
import "ol/ol.css";
import { BandComposite } from "./CompositeSelector";

interface PixelLocation {
  lat: number;
  lon: number;
}

interface MapCanvasProps {
  className?: string;
  selectedComposite?: BandComposite;
  onPixelClick?: (location: PixelLocation) => void;
}

export function MapCanvas({ className, selectedComposite, onPixelClick }: MapCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: 20.5937, lon: 78.9629 });
  const [zoom, setZoom] = useState(5);
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'terrain' | 'dark'>('satellite');
  const [splitView, setSplitView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedLocation, setClickedLocation] = useState<PixelLocation | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/health');
        if (res.ok) setBackendStatus('connected');
        else setBackendStatus('disconnected');
      } catch (e) {
        setBackendStatus('disconnected');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
      }),
      className: 'satellite-layer',
    });

    const map = new Map({
      target: mapRef.current,
      layers: [satelliteLayer],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]),
        zoom: 5,
        maxZoom: 18,
        minZoom: 3,
      }),
      controls: [],
    });

    map.on('moveend', () => {
      const view = map.getView();
      const center = view.getCenter();
      if (center) {
        const lonLat = toLonLat(center);
        setCoordinates({
          lat: parseFloat(lonLat[1].toFixed(4)),
          lon: parseFloat(lonLat[0].toFixed(4))
        });
      }
      setZoom(Math.round(view.getZoom() || 5));
    });

    // Handle map clicks for pixel inspection
    map.on('click', (event) => {
      const lonLat = toLonLat(event.coordinate);
      const location = {
        lat: parseFloat(lonLat[1].toFixed(6)),
        lon: parseFloat(lonLat[0].toFixed(6)),
      };
      setClickedLocation(location);
      setIsFetchingData(true);

      // Simulate fetching pixel data
      setTimeout(() => {
        setIsFetchingData(false);
        onPixelClick?.(location);
      }, 500);
    });

    map.once('rendercomplete', () => {
      setIsLoading(false);
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
    };
  }, [onPixelClick]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!mapInstance.current) return;
    const view = mapInstance.current.getView();
    const currentZoom = view.getZoom() || 5;
    view.animate({
      zoom: direction === 'in' ? currentZoom + 1 : currentZoom - 1,
      duration: 250,
    });
  };

  const handleCenter = () => {
    if (!mapInstance.current) return;
    mapInstance.current.getView().animate({
      center: fromLonLat([78.9629, 20.5937]),
      zoom: 5,
      duration: 500,
    });
  };

  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-border", className)}>
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-card flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
              <div className="text-sm font-mono text-muted-foreground">INITIALIZING MAP ENGINE</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-full min-h-[500px] cursor-crosshair"
      />

      {/* Split view overlay */}
      {splitView && (
        <div className="absolute inset-y-0 left-1/2 w-1 bg-primary/50 z-20 cursor-ew-resize">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Split className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Clicked location marker overlay */}
      {clickedLocation && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary/20 animate-pulse" />
            <div className="absolute inset-0 w-6 h-6 rounded-full border border-primary/50 animate-ping" />
          </div>
        </motion.div>
      )}

      {/* Coordinates display */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
          <div className="flex items-center gap-4 font-mono text-xs">
            <div>
              <span className="text-muted-foreground">LAT: </span>
              <span className="text-primary">{coordinates.lat.toFixed(4)}°</span>
            </div>
            <div>
              <span className="text-muted-foreground">LON: </span>
              <span className="text-primary">{coordinates.lon.toFixed(4)}°</span>
            </div>
            <div>
              <span className="text-muted-foreground">ZOOM: </span>
              <span className="text-primary">{zoom}</span>
            </div>
            {selectedComposite && (
              <>
                <div className="w-px h-4 bg-border" />
                <div>
                  <span className="text-muted-foreground">MODE: </span>
                  <span className="text-primary">{selectedComposite.name}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleZoom('in')}
          className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleZoom('out')}
          className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <div className="h-px bg-border my-1" />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCenter}
          className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          <Crosshair className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSplitView(!splitView)}
          className={cn(
            "w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border flex items-center justify-center transition-colors",
            splitView
              ? "border-primary text-primary"
              : "border-border text-muted-foreground hover:text-primary hover:border-primary/50"
          )}
        >
          <Split className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          <Maximize className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Layer toggle */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-1 border border-border flex gap-1">
          {[
            { id: 'satellite', icon: <Layers className="w-4 h-4" />, label: 'SAT' },
            { id: 'terrain', icon: <Layers className="w-4 h-4" />, label: 'TER' },
            { id: 'dark', icon: <Eye className="w-4 h-4" />, label: 'DRK' },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={cn(
                "px-3 py-2 rounded-md text-xs font-mono transition-all flex items-center gap-2",
                activeLayer === layer.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {layer.icon}
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Processing indicator */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
          <div className="flex items-center gap-3">
            {isFetchingData ? (
              <>
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs font-mono text-muted-foreground">
                  FETCHING PIXEL DATA...
                </span>
              </>
            ) : (
              <>
                <div className={`w-2 h-2 rounded-full animate-pulse ${backendStatus === 'connected' ? 'bg-success' : 'bg-destructive'}`} />
                <span className="text-xs font-mono text-muted-foreground">
                  FUSION ENGINE: <span className={backendStatus === 'connected' ? 'text-success' : 'text-destructive'}>
                    {backendStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
