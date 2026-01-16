import { motion } from "framer-motion";
import { Layers, Cloud, Maximize2, Grid3X3, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FusionOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface FusionControlsProps {
  options: FusionOption[];
  onToggle: (id: string) => void;
}

export function FusionControls({ options, onToggle }: FusionControlsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Fusion Engine
      </h3>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-3 rounded-lg border transition-all duration-300",
              option.enabled
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  option.enabled 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {option.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </div>
              <Switch
                checked={option.enabled}
                onCheckedChange={() => onToggle(option.id)}
              />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">FUSION MODE</span>
          <span className="text-xs font-mono text-primary">BROVEY TRANSFORM</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

export function getFusionOptions(): FusionOption[] {
  return [
    {
      id: 'cloud-filling',
      label: 'Cloud Filling',
      description: 'Fill gaps from cloudy pixels',
      icon: <Cloud className="w-4 h-4" />,
      enabled: true,
    },
    {
      id: 'pan-sharpening',
      label: 'Pan-Sharpening',
      description: 'Enhance spatial resolution',
      icon: <Maximize2 className="w-4 h-4" />,
      enabled: false,
    },
    {
      id: 'co-registration',
      label: 'Co-Registration',
      description: 'Align multi-source pixels',
      icon: <Grid3X3 className="w-4 h-4" />,
      enabled: true,
    },
    {
      id: 'spectral-harmony',
      label: 'Spectral Harmony',
      description: 'Normalize band responses',
      icon: <Layers className="w-4 h-4" />,
      enabled: false,
    },
  ];
}
