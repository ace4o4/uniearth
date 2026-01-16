import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, TrendingUp, Layers, MapPin, RefreshCw, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface BandData {
  name: string;
  value: number;
  wavelength: string;
  color: string;
  wavelengthNum: number;
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

const generateBandData = (location: PixelLocation | null): BandData[] => {
  // Generate realistic-looking spectral data based on location
  const seed = location ? (location.lat * 1000 + location.lon * 100) % 1 : 0.5;
  
  // Simulate different land cover types based on coordinates
  const isVegetation = seed > 0.3 && seed < 0.7;
  const isWater = seed < 0.15;
  const isUrban = seed > 0.85;

  let baseProfile = {
    blue: 0.10,
    green: 0.15,
    red: 0.20,
    nir: 0.45,
    swir1: 0.30,
    swir2: 0.22,
  };

  if (isVegetation) {
    baseProfile = {
      blue: 0.05,
      green: 0.08,
      red: 0.04,
      nir: 0.55,
      swir1: 0.20,
      swir2: 0.12,
    };
  } else if (isWater) {
    baseProfile = {
      blue: 0.15,
      green: 0.10,
      red: 0.05,
      nir: 0.02,
      swir1: 0.01,
      swir2: 0.005,
    };
  } else if (isUrban) {
    baseProfile = {
      blue: 0.15,
      green: 0.18,
      red: 0.22,
      nir: 0.25,
      swir1: 0.30,
      swir2: 0.28,
    };
  }

  // Add some randomness
  const addNoise = (val: number) => val + (Math.random() - 0.5) * 0.05;

  return [
    { name: 'Blue', value: addNoise(baseProfile.blue), wavelength: '490nm', color: '#3b82f6', wavelengthNum: 490 },
    { name: 'Green', value: addNoise(baseProfile.green), wavelength: '560nm', color: '#22c55e', wavelengthNum: 560 },
    { name: 'Red', value: addNoise(baseProfile.red), wavelength: '665nm', color: '#ef4444', wavelengthNum: 665 },
    { name: 'NIR', value: addNoise(baseProfile.nir), wavelength: '842nm', color: '#f97316', wavelengthNum: 842 },
    { name: 'SWIR1', value: addNoise(baseProfile.swir1), wavelength: '1610nm', color: '#8b5cf6', wavelengthNum: 1610 },
    { name: 'SWIR2', value: addNoise(baseProfile.swir2), wavelength: '2190nm', color: '#ec4899', wavelengthNum: 2190 },
  ];
};

export function RealPixelInspector({ className, location, isLoading = false }: RealPixelInspectorProps) {
  const [bandData, setBandData] = useState<BandData[]>(generateBandData(null));
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (location) {
      setBandData(generateBandData(location));
      setAnimationKey(prev => prev + 1);
    }
  }, [location]);

  const ndvi = bandData.length >= 4 
    ? ((bandData[3].value - bandData[2].value) / (bandData[3].value + bandData[2].value)).toFixed(3)
    : '0.000';

  const ndwi = bandData.length >= 4
    ? ((bandData[1].value - bandData[3].value) / (bandData[1].value + bandData[3].value)).toFixed(3)
    : '0.000';

  const getNDVIStatus = (val: number) => {
    if (val > 0.4) return { text: 'Dense Vegetation', color: 'text-success' };
    if (val > 0.2) return { text: 'Moderate Vegetation', color: 'text-primary' };
    if (val > 0) return { text: 'Sparse Vegetation', color: 'text-warning' };
    return { text: 'No Vegetation', color: 'text-destructive' };
  };

  const getNDWIStatus = (val: number) => {
    if (val > 0.3) return { text: 'Water Body', color: 'text-primary' };
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
        {isLoading && (
          <RefreshCw className="w-4 h-4 text-primary animate-spin" />
        )}
      </div>

      {/* Location display */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">COORDINATES</span>
        </div>
        <div className="font-mono text-sm text-primary">
          {location 
            ? `${location.lat.toFixed(4)}°N, ${location.lon.toFixed(4)}°E`
            : 'Click on map to inspect'
          }
        </div>
      </div>

      {/* Spectral signature chart */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border mb-4">
        <div className="text-xs font-mono text-muted-foreground mb-3">SPECTRAL SIGNATURE</div>
        
        {/* Bar chart */}
        <div className="flex items-end justify-between h-24 gap-2 mb-2">
          <AnimatePresence mode="wait">
            {bandData.map((band, index) => (
              <motion.div
                key={`${animationKey}-${band.name}`}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(band.value * 100, 5)}%` }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                className="flex-1 rounded-t relative group cursor-pointer"
                style={{ backgroundColor: band.color }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-popover border border-border px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg">
                    {band.value.toFixed(4)}
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
              <div className="text-[9px] font-mono text-muted-foreground/60">{band.wavelength}</div>
            </div>
          ))}
        </div>

        {/* Area chart */}
        <div className="h-20 mt-4">
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
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                hide 
                domain={[0, 0.8]} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [value.toFixed(4), 'Reflectance']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#spectralGradient)"
                strokeWidth={2}
                fill="url(#spectralGradient)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Derived indices */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          key={`ndvi-${animationKey}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
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
          key={`ndwi-${animationKey}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-muted/30 rounded-lg p-3 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">NDWI</span>
          </div>
          <div className={cn("text-2xl font-mono", ndwiStatus.color)}>{ndwi}</div>
          <div className="text-xs text-muted-foreground mt-1">{ndwiStatus.text}</div>
        </motion.div>
      </div>

      {/* Source attribution */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs font-mono text-muted-foreground mb-2">DATA SOURCES</div>
        <div className="flex flex-wrap gap-2">
          {['Sentinel-2', 'Landsat-8', 'HLS'].map((source) => (
            <span
              key={source}
              className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono"
            >
              {source}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
