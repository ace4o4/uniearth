import { motion } from "framer-motion";
import { Info, TrendingUp, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface BandData {
  name: string;
  value: number;
  wavelength: string;
  color: string;
}

interface PixelInspectorProps {
  className?: string;
}

const sampleBands: BandData[] = [
  { name: 'Blue', value: 0.12, wavelength: '490nm', color: '#3b82f6' },
  { name: 'Green', value: 0.18, wavelength: '560nm', color: '#22c55e' },
  { name: 'Red', value: 0.24, wavelength: '665nm', color: '#ef4444' },
  { name: 'NIR', value: 0.65, wavelength: '842nm', color: '#f97316' },
  { name: 'SWIR1', value: 0.31, wavelength: '1610nm', color: '#8b5cf6' },
  { name: 'SWIR2', value: 0.22, wavelength: '2190nm', color: '#ec4899' },
];

export function PixelInspector({ className }: PixelInspectorProps) {
  const ndvi = ((sampleBands[3].value - sampleBands[2].value) / (sampleBands[3].value + sampleBands[2].value)).toFixed(3);

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
          <Info className="w-4 h-4" />
          Pixel Inspector
        </h3>
        <div className="text-xs font-mono text-primary">
          20.5937°N, 78.9629°E
        </div>
      </div>

      {/* Spectral signature chart */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border mb-4">
        <div className="flex items-end justify-between h-32 gap-2">
          {sampleBands.map((band, index) => (
            <motion.div
              key={band.name}
              initial={{ height: 0 }}
              animate={{ height: `${band.value * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 rounded-t relative group"
              style={{ backgroundColor: band.color }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-popover px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
                  {band.value.toFixed(3)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {sampleBands.map((band) => (
            <div key={band.name} className="flex-1 text-center">
              <div className="text-[10px] font-mono text-muted-foreground">{band.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Derived indices */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs font-mono text-muted-foreground">NDVI</span>
          </div>
          <div className="text-2xl font-mono text-success">{ndvi}</div>
          <div className="text-xs text-muted-foreground mt-1">Healthy Vegetation</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">NDWI</span>
          </div>
          <div className="text-2xl font-mono text-primary">-0.234</div>
          <div className="text-xs text-muted-foreground mt-1">Low Water Content</div>
        </div>
      </div>

      {/* Source attribution */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs font-mono text-muted-foreground mb-2">DATA SOURCES</div>
        <div className="flex flex-wrap gap-2">
          {['Sentinel-2', 'Landsat-8'].map((source) => (
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
