import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: 'online' | 'syncing' | 'offline' | 'processing';
  label: string;
  className?: string;
}

const statusConfig = {
  online: { color: 'bg-success', pulse: false, text: 'ONLINE' },
  syncing: { color: 'bg-primary', pulse: true, text: 'SYNCING' },
  offline: { color: 'bg-destructive', pulse: false, text: 'OFFLINE' },
  processing: { color: 'bg-warning', pulse: true, text: 'PROCESSING' },
};

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const config = statusConfig[status];
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className={cn(
          "w-2 h-2 rounded-full",
          config.color,
          config.pulse && "animate-pulse"
        )} />
        {config.pulse && (
          <div className={cn(
            "absolute inset-0 w-2 h-2 rounded-full opacity-50",
            config.color,
            "animate-ping"
          )} />
        )}
      </div>
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs font-mono text-primary uppercase">
        {config.text}
      </span>
    </div>
  );
}
