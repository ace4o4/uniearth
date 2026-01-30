import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Sun, Droplets, Wind, Thermometer, Clock, Ruler, Loader2, X, Minus, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationInfoProps {
  name: string;
  lat: number;
  lon: number;
  bbox?: number[]; // [minLon, minLat, maxLon, maxLat]
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

export function LocationInfoCard({ name, lat, lon, bbox, onClose, containerRef }: LocationInfoProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  // Calculate approx area if bbox is available
  const calculateArea = () => {
    if (!bbox) return "N/A";
    // Rough estimation
    const R = 6371; // km
    // Nominatim: [minLat, maxLat, minLon, maxLon]
    // Indices:   0       1       2       3
    const dLat = (bbox[1] - bbox[0]) * Math.PI / 180;
    const dLon = (bbox[3] - bbox[2]) * Math.PI / 180;
    // Approximating as rectangle
    const latDist = dLat * R;
    const lonDist = dLon * R * Math.cos((bbox[0] + bbox[1])/2 * Math.PI / 180);
    const area = Math.abs(latDist * lonDist);
    return area < 1 ? "< 1 km²" : `${area.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km²`;
  };

  useEffect(() => {
    let mounted = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        const data = await res.json();
        if (mounted && data.current) {
          setWeather(data.current);
          
          // Use timezone from API to show local time
          if (data.timezone) {
            const time = new Date().toLocaleTimeString('en-US', { 
                timeZone: data.timezone,
                hour: '2-digit', 
                minute: '2-digit'
            });
            setCurrentTime(time);
          }
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchWeather();
    return () => { mounted = false; };
  }, [lat, lon]);

  // Weather Code Map (Simplified)
  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="w-5 h-5 text-yellow-400" />;
    if (code <= 48) return <Cloud className="w-5 h-5 text-gray-400" />;
    if (code <= 82) return <Droplets className="w-5 h-5 text-blue-400" />;
    return <Wind className="w-5 h-5 text-cyan-400" />;
  };

  const [isMinimized, setIsMinimized] = useState(false);

  // ... (keep calculateArea, useEffect, getWeatherIcon)

  return (
    <motion.div
      drag
      dragMomentum={true} // "Smooth physics"
      dragElastic={0.05}   // Slight rubber banding but solid feel
      dragConstraints={containerRef} // Constrain to parent bounds
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          width: isMinimized ? 300 : 384, // w-96 is 384px. Shrink slightly on minimize.
          height: "auto"
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
      className="absolute bottom-8 right-8 z-[100] bg-card/95 backdrop-blur-xl border-2 border-primary/50 rounded-xl overflow-hidden shadow-2xl ring-4 ring-primary/10"
      style={{ boxShadow: "0 0 50px -10px rgba(var(--primary), 0.3)" }}
    >
        {/* Animated Glow Border Effect */}
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 opacity-50 pointer-events-none" />
        
        {/* Header - High Contrast & Draggable Handle */}
        <div className="relative z-10 bg-primary/10 p-4 flex items-start justify-between border-b border-primary/20 cursor-grab active:cursor-grabbing">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Live Intelligence</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground leading-none tracking-tight">{name}</h3>
                {!isMinimized && (
                    <div className="flex items-center gap-2 mt-1.5 opacity-80">
                        <span className="text-xs font-mono text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded border border-border">LAT: {lat.toFixed(4)}</span>
                        <span className="text-xs font-mono text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded border border-border">LON: {lon.toFixed(4)}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-1.5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all"
                >
                    {isMinimized ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <Minus className="w-5 h-5 text-muted-foreground" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onClose(); }} 
                  className="p-1.5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all"
                >
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>
        </div>

        {/* Content Grid - Collapsible */}
        <AnimatePresence>
            {!isMinimized && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative z-10 p-5 grid grid-cols-2 gap-4">
                        
                        {/* Time Card */}
                        <div className="bg-muted/40 rounded-lg p-3 flex flex-col items-center justify-center border border-border group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                                <Clock className="w-3.5 h-3.5 group-hover:text-primary transition-colors" /> Local Time
                            </div>
                            <div className="text-xl font-mono font-bold text-foreground">
                                {loading ? <div className="h-7 w-20 bg-muted animate-pulse rounded" /> : currentTime}
                            </div>
                        </div>

                        {/* Area Card */}
                        <div className="bg-muted/40 rounded-lg p-3 flex flex-col items-center justify-center border border-border group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                                <Ruler className="w-3.5 h-3.5 group-hover:text-primary transition-colors" /> Approx Area
                            </div>
                            <div className="text-xl font-mono font-bold text-foreground">
                                {bbox ? calculateArea() : "Unknown"}
                            </div>
                        </div>

                        {/* Weather Metrics */}
                        <div className="col-span-2 bg-muted/40 rounded-lg p-4 border border-border relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Thermometer className="w-16 h-16" />
                            </div>
                            
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 font-semibold">
                                    <Thermometer className="w-3.5 h-3.5" /> Live Conditions
                                </span>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : null}
                            </div>
                            
                            {loading ? (
                                <div className="space-y-3">
                                    <div className="h-8 w-full bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-background rounded-full border border-border shadow-sm">
                                            {getWeatherIcon(weather?.weather_code || 0)}
                                        </div>
                                        <div>
                                            <span className="text-3xl font-bold text-foreground block leading-none">{weather?.temperature_2m}°</span>
                                            <span className="text-xs text-muted-foreground">Celsius</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-xs font-mono text-muted-foreground text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="opacity-70">HUMIDITY</span>
                                            <span className="text-foreground font-bold">{weather?.relative_humidity_2m}%</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="opacity-70">WIND</span>
                                            <span className="text-foreground font-bold">{weather?.wind_speed_10m} km/h</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Graph (Decorative) */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
}
