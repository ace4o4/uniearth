import { motion } from "framer-motion";
import { Check, Info, Server, Database, Satellite } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DataSource {
  id: string;
  name: string;
  operator: string;
  resolution: string;
  revisit: string;
  enabled: boolean;
  color: string;
  bestFor: string;
  description: string;
}

interface DataSourceSelectorProps {
  sources: DataSource[];
  onToggle: (id: string) => void;
}

export function DataSourceSelector({ sources, onToggle }: DataSourceSelectorProps) {
  /* 
     Real-time Availability Check
     In a full production app, this would query api.search() for each source 
     to see if data exists in the current view.
     For this MVP, we assume global sources are always 'Online' if backend is healthy.
  */
  const getStatusColor = (id: string) => {
      // Simple visual feedback for now
      return "text-success"; 
  };


  return (
    <div className="space-y-3">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Data Sources
      </h3>
      {sources.map((source, index) => (
        <motion.button
          key={source.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onToggle(source.id)}
          className={cn(
            "w-full p-3 rounded-lg border transition-all duration-300 text-left group",
            source.enabled
              ? "border-primary/50 bg-primary/10"
              : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                  source.enabled 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground group-hover:text-primary/70"
                )}
                style={{ 
                  boxShadow: source.enabled ? `0 0 20px ${source.color}40` : 'none' 
                }}
              >
                <Satellite className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">
                  {source.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {source.operator}
                </div>
              </div>
            </div>
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
              source.enabled 
                ? "border-primary bg-primary" 
                : "border-muted-foreground/30"
            )}>
              {source.enabled && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs font-mono items-center">
            <div>
              <span className="text-muted-foreground">RES: </span>
              <span className={source.enabled ? "text-primary" : "text-foreground"}>
                {source.resolution}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">REV: </span>
              <span className={source.enabled ? "text-primary" : "text-foreground"}>
                {source.revisit}
              </span>
            </div>
          </div>
          
          {/* Enhanced UX: Best For Badge */}
          <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2">
             <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Best For:</span>
             <span className={cn(
               "text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
               source.enabled 
                 ? "bg-primary/20 text-primary border-primary/30" 
                 : "bg-muted text-muted-foreground border-border"
             )}>
                {source.bestFor}
             </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
