import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2, X, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  addresstype?: string; // administrative, city, country, etc.
  geojson?: any; // Polygon or MultiPolygon
  boundingbox?: string[]; // [minLat, maxLat, minLon, maxLon]
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number, zoom?: number, startRect?: DOMRect, name?: string, geojson?: any, bbox?: string[]) => void;
  className?: string;
}

export function LocationSearch({ onLocationSelect, className }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Live Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2) {
        handleSearch();
      } else if (query.trim().length === 0) {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    // Check for coordinate format "lat, lon"
    const coordMatch = query.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
       // If it's a coordinate, handle explicitly
       if (e) { 
          const lat = parseFloat(coordMatch[1]);
          const lon = parseFloat(coordMatch[3]);
          const rect = inputRef.current?.getBoundingClientRect(); 
          onLocationSelect(lat, lon, 12, rect);
          setIsOpen(false);
       }
       return;
    }

    setIsLoading(true);
    setIsOpen(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&polygon_geojson=1`
      );
      const data = await response.json();
      setResults(data);

      // Auto-select on Enter key
      if (e && data.length > 0) {
        // FLIGHT FROM SEARCH BAR
        const rect = inputRef.current?.getBoundingClientRect();
        handleSelect(data[0], rect);
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSmartZoom = (feature: LocationResult): number => {
    const type = feature.addresstype?.toLowerCase();
    switch (type) {
        case 'country': return 5;
        case 'state': return 7;
        case 'region': return 8;
        case 'county': return 9;
        case 'city': return 11;
        case 'town': return 12;
        case 'village': return 13;
        case 'suburb': return 13;
        case 'neighbourhood': return 14;
        case 'residential': return 15;
        default: return 12;
    }
  };

  const handleSelect = (result: LocationResult, startRect?: DOMRect) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const targetZoom = getSmartZoom(result);
    
    // If startRect passed, use that. If not (Enter key), fallback to inputRef.
    const finalRect = startRect || inputRef.current?.getBoundingClientRect();

    onLocationSelect(lat, lon, targetZoom, finalRect, result.display_name.split(',')[0], result.geojson, result.boundingbox);
    
    setQuery(result.display_name.split(',')[0]); 
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-md", className)}>
      <form onSubmit={handleSearch} className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
         <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location or enter coordinates..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-muted/30 focus:bg-card focus:border-primary/50 outline-none transition-all text-sm font-medium"
         />
         {query && (
            <button 
              type="button"
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
               <X className="w-3 h-3" />
            </button>
         )}
      </form>

      {/* Results Dropdown */}
      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl overflow-hidden z-[100] max-h-[300px] overflow-y-auto ring-1 ring-black/5">
           {isLoading ? (
             <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...
             </div>
           ) : (
             results.length > 0 ? (
                <ul className="py-1">
                  {results.map((result) => (
                    <li key={result.place_id} className="relative group">
                      <div className="flex items-center w-full hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 pr-2">
                        <button
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              handleSelect(result, rect);
                            }}
                            className="flex-1 text-left px-4 py-3 flex items-start gap-3"
                        >
                            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                            <div className="text-sm font-medium text-foreground">
                                {result.display_name.split(',')[0]}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                                {result.display_name}
                            </div>
                            </div>
                        </button>
                        
                        {/* FLY ACTION BUTTON */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Don't trigger standard select
                                const rect = e.currentTarget.getBoundingClientRect();
                                handleSelect(result, rect);
                            }}
                            className="p-2 mr-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
                            title="Fly to Location"
                        >
                            <div className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Fly</div>
                            <Search className="w-4 h-4 rotate-90" /> {/* Using Search icon as 'Plane' proxy if Plane not imported, but let's import Plane */}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
             ) : (
               <div className="p-4 text-center text-muted-foreground text-sm">
                 No results found.
               </div>
             )
           )}
        </div>
      )}
    </div>
  );
}
