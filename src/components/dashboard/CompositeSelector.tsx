import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BandComposite, composites } from "@/lib/constants";

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
          <Tooltip key={composite.id}>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(composite)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all group w-full",
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
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px] text-xs">
              <p className="font-semibold mb-1">Why use this?</p>
              <p className="text-muted-foreground">
                {composite.id === 'true-color' && "Best for general orientation. Shows the earth as your eyes see it."}
                {composite.id === 'false-color-nir' && "Standard for vegetation analysis. Healthy plants reflect NIR light strongly, appearing bright red."}
                {composite.id === 'agriculture' && "Optimized for crop health. Uses Short-Wave Infrared to cut through haze and show plant moisture."}
                {composite.id === 'urban' && "Highlights man-made structures vs natural terrain. Useful for city planning."}
                {composite.id === 'moisture' && "Ideal for drought monitoring and flood mapping. Water appears blue/black."}
                {composite.id === 'geology' && "Differentiates rock types and soil mineral content."}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}


