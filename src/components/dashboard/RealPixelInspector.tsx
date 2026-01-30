import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, TrendingUp, Layers, MapPin, RefreshCw, Crosshair, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";

interface BandData {
  name: string;
  value: number;
  wavelength: string;
  color?: string;
  wavelengthNum?: number;
}

interface PixelLocation {
  lat: number;
  lon: number;
}

interface RealPixelInspectorProps {
  className?: string;
  location?: PixelLocation | null;
  isLoading?: boolean;
}

// Helper for chart colors
const getBandColor = (name: string) => {
    switch(name) {
        case 'Blue': return '#3b82f6';
        case 'Green': return '#22c55e';
        case 'Red': return '#ef4444';
        case 'NIR': return '#f97316';
        case 'SWIR1': return '#8b5cf6';
        case 'SWIR2': return '#ec4899';
        default: return '#888888';
    }
};

const getWavelengthNum = (str: string) => parseInt(str.replace('nm', '')) || 0;

export function RealPixelInspector({ className, location, isLoading: parentLoading = false }: RealPixelInspectorProps) {
  const [bandData, setBandData] = useState<BandData[]>([]);
  const [loading, setLoading] = useState(false);
  const [classification, setClassification] = useState<string>("");
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const fetchSpectralData = async () => {
        if (!location) return;
        
        setLoading(true);
        // Artificial delay for 'Analyzing' effect if backend is too fast
        const [res] = await Promise.all([
             api.analyzeSpectral(location.lat, location.lon),
             new Promise(resolve => setTimeout(resolve, 600)) 
        ]);

        if (res && res.bands) {
            const processed = res.bands.map((b: any) => ({
                ...b,
                color: getBandColor(b.name),
                wavelengthNum: getWavelengthNum(b.wavelength)
            }));
            setBandData(processed);
            setClassification(res.classification || "Unknown");
            setAnimationKey(prev => prev + 1);
        }
        setLoading(false);
    };

    fetchSpectralData();
  }, [location]);

  // Calculations
  const getBandValue = (name: string) => bandData.find(b => b.name === name)?.value || 0;
  
  const red = getBandValue('Red');
  const nir = getBandValue('NIR');
  const green = getBandValue('Green');

  const ndvi = (nir + red) !== 0 ? ((nir - red) / (nir + red)).toFixed(3) : '0.000';
  const ndwi = (green + nir) !== 0 ? ((green - nir) / (green + nir)).toFixed(3) : '0.000'; // McFeeters NDWI

  const getNDVIStatus = (val: number) => {
    if (val > 0.4) return { text: 'Dense Vegetation', color: 'text-success' };
    if (val > 0.2) return { text: 'Moderate Vegetation', color: 'text-primary' };
    if (val > 0) return { text: 'Sparse Vegetation', color: 'text-warning' };
    return { text: 'No Vegetation', color: 'text-destructive' };
  };

  const getNDWIStatus = (val: number) => {
    if (val > 0.2) return { text: 'Water Body', color: 'text-primary' };
    if (val > 0) return { text: 'High Moisture', color: 'text-success' };
    return { text: 'Low Moisture', color: 'text-muted-foreground' };
  };

  const ndviStatus = getNDVIStatus(parseFloat(ndvi));
  const ndwiStatus = getNDWIStatus(parseFloat(ndwi));

  const chartData = bandData.map(b => ({
    name: b.name,
    value: b.value,
    wavelength: b.wavelengthNum,
  }));

  const showLoading = loading || parentLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card border border-border rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Crosshair className="w-4 h-4" />
          Pixel Inspector
        </h3>
        {showLoading ? (
          <RefreshCw className="w-4 h-4 text-primary animate-spin" />
        ) : (
          <Activity className="w-4 h-4 text-emerald-500" />
        )}
      </div>

      {/* Location display */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border mb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">COORDINATES</span>
            </div>
            {classification && !showLoading && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase">
                    {classification}
                </span>
            )}
        </div>
        <div className="font-mono text-sm text-primary">
          {location 
            ? `${location.lat.toFixed(4)}°N, ${location.lon.toFixed(4)}°E`
            : 'Click on map to inspect'
          }
        </div>
      </div>

      {/* Spectral signature chart */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border mb-4 relative overflow-hidden">
        {showLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-xs font-mono text-muted-foreground animate-pulse">ANALYZING SPECTRUM...</div>
            </div>
        )}

        <div className="text-xs font-mono text-muted-foreground mb-3">SPECTRAL SIGNATURE</div>
        
        {/* Bar chart */}
        <div className="flex items-end justify-between h-24 gap-2 mb-2">
          <AnimatePresence>
            {bandData.map((band, index) => (
              <motion.div
                key={`${animationKey}-${band.name}`}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(band.value * 100, 5)}%` }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                className="flex-1 rounded-t relative group cursor-pointer hover:brightness-125 transition-all"
                style={{ backgroundColor: band.color }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div className="bg-popover border border-border px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg z-50">
                    {band.value.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex justify-between">
          {bandData.map((band) => (
            <div key={band.name} className="flex-1 text-center">
              <div className="text-[10px] font-mono text-muted-foreground">{band.name}</div>
            </div>
          ))}
        </div>

        {/* Area chart */}
        <div className="h-20 mt-4 opacity-50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="spectralGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="20%" stopColor="#22c55e" />
                  <stop offset="40%" stopColor="#ef4444" />
                  <stop offset="60%" stopColor="#f97316" />
                  <stop offset="80%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, 1]} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#spectralGradient)"
                strokeWidth={2}
                fill="url(#spectralGradient)"
                fillOpacity={0.2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Derived indices */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-muted/30 rounded-lg p-3 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs font-mono text-muted-foreground">NDVI</span>
          </div>
          <div className={cn("text-2xl font-mono", ndviStatus.color)}>{ndvi}</div>
          <div className="text-xs text-muted-foreground mt-1">{ndviStatus.text}</div>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-muted/30 rounded-lg p-3 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">NDWI</span>
          </div>
          <div className={cn("text-2xl font-mono", ndviStatus.color)}>{ndwi}</div>
          <div className="text-xs text-muted-foreground mt-1">{ndwiStatus.text}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
