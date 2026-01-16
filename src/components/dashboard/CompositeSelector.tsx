import { motion } from "framer-motion";
import { Palette, Eye, Leaf, Building2, Droplets, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BandComposite {
  id: string;
  name: string;
  description: string;
  bands: { red: string; green: string; blue: string };
  icon: React.ReactNode;
  color: string;
}

const composites: BandComposite[] = [
  {
    id: 'true-color',
    name: 'True Color',
    description: 'Natural RGB view',
    bands: { red: 'B04', green: 'B03', blue: 'B02' },
    icon: <Eye className="w-4 h-4" />,
    color: 'hsl(var(--primary))',
  },
  {
    id: 'false-color-nir',
    name: 'False Color (NIR)',
    description: 'Vegetation emphasis',
    bands: { red: 'B08', green: 'B04', blue: 'B03' },
    icon: <Palette className="w-4 h-4" />,
    color: 'hsl(var(--success))',
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'NIR-Red-Green composite',
    bands: { red: 'B08', green: 'B04', blue: 'B03' },
    icon: <Leaf className="w-4 h-4" />,
    color: '#22c55e',
  },
  {
    id: 'urban',
    name: 'Urban',
    description: 'SWIR-NIR-Red composite',
    bands: { red: 'B12', green: 'B08', blue: 'B04' },
    icon: <Building2 className="w-4 h-4" />,
    color: '#8b5cf6',
  },
  {
    id: 'moisture',
    name: 'Moisture Index',
    description: 'Water content analysis',
    bands: { red: 'B8A', green: 'B11', blue: 'B04' },
    icon: <Droplets className="w-4 h-4" />,
    color: '#3b82f6',
  },
  {
    id: 'geology',
    name: 'Geology',
    description: 'SWIR bands for minerals',
    bands: { red: 'B12', green: 'B11', blue: 'B02' },
    icon: <Flame className="w-4 h-4" />,
    color: '#f97316',
  },
];

interface CompositeSelectorProps {
  selectedComposite: string;
  onSelect: (composite: BandComposite) => void;
  className?: string;
}

export function CompositeSelector({ 
  selectedComposite, 
  onSelect, 
  className 
}: CompositeSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Band Composites
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {composites.map((composite, index) => (
          <motion.button
            key={composite.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(composite)}
            className={cn(
              "p-3 rounded-lg border text-left transition-all group",
              selectedComposite === composite.id
                ? "bg-primary/10 border-primary"
                : "bg-muted/30 border-border hover:border-primary/30 hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <div 
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  selectedComposite === composite.id
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground group-hover:text-primary"
                )}
                style={{ 
                  backgroundColor: selectedComposite === composite.id 
                    ? `${composite.color}20` 
                    : undefined,
                  color: selectedComposite === composite.id 
                    ? composite.color 
                    : undefined
                }}
              >
                {composite.icon}
              </div>
              <span className={cn(
                "text-sm font-medium transition-colors",
                selectedComposite === composite.id
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {composite.name}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {composite.description}
            </div>
            <div className="mt-2 flex gap-1">
              {['R', 'G', 'B'].map((channel, i) => (
                <span 
                  key={channel}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted/50"
                >
                  {channel}:{Object.values(composite.bands)[i]}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export { composites };
