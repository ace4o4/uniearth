import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Activity, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface SystemLogProps {
  logs: LogEntry[];
  className?: string;
  onPopOut?: () => void;
}

export function SystemLog({ logs, className, onPopOut }: SystemLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={cn("bg-card/90 backdrop-blur-sm border border-border rounded-xl flex flex-col overflow-hidden", className)}>
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20">
        <Terminal className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          System Logs
        </h3>
        <div className="ml-auto flex items-center gap-2">
           {onPopOut && (
             <button 
               onClick={onPopOut}
               className="p-1 hover:bg-primary/20 rounded-md text-muted-foreground hover:text-primary transition-colors"
               title="Pop Out Terminal"
             >
               <ExternalLink className="w-3 h-3" />
             </button>
           )}
           <Activity className="w-3 h-3 text-success animate-pulse" />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[10px]"
      >
        <AnimatePresence initial={false}>
          {logs.length === 0 && (
            <div className="text-muted-foreground/50 italic text-center py-4">
              System Ready. Waiting for input...
            </div>
          )}
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <span className="text-muted-foreground opacity-50 flex-shrink-0">
                [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]
              </span>
              <span className={cn(
                "break-all",
                log.type === 'info' && "text-foreground",
                log.type === 'success' && "text-success",
                log.type === 'warning' && "text-warning",
                log.type === 'error' && "text-destructive"
              )}>
                {log.type === 'success' && "✓ "}
                {log.type === 'error' && "✗ "}
                {log.type === 'warning' && "⚠ "}
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
