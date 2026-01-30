import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Info, AlertTriangle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Satellite Overhead',
    message: 'Sentinel-2 pass expected in 15 mins.',
    type: 'info',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    title: 'Analysis Complete',
    message: 'Vegetation Health Index (NDVI) computed.',
    type: 'success',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    title: 'Cloud Cover Alert',
    message: 'High cloud density detected in Region A.',
    type: 'warning',
    time: '3h ago',
    read: true,
  }
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-card border border-border" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
             <button 
               onClick={markAllRead}
               className="text-[10px] text-primary hover:underline cursor-pointer"
             >
               Mark all read
             </button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
           {notifications.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground text-xs">
                   No recent alerts.
               </div>
           ) : (
               notifications.map((n) => (
                   <motion.div 
                     key={n.id}
                     whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                     className={cn(
                         "p-4 border-b border-border/50 last:border-0 cursor-pointer transition-colors relative",
                         !n.read && "bg-primary/5"
                     )}
                     onClick={() => markAsRead(n.id)}
                   >
                       {!n.read && (
                           <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary rounded-full" />
                       )}
                       <div className="flex gap-3">
                           <div className={cn(
                               "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                               n.type === 'info' && "bg-blue-500/10 text-blue-500",
                               n.type === 'success' && "bg-green-500/10 text-green-500",
                               n.type === 'warning' && "bg-orange-500/10 text-orange-500",
                           )}>
                               {n.type === 'info' && <Info className="w-4 h-4" />}
                               {n.type === 'success' && <Check className="w-4 h-4" />}
                               {n.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                           </div>
                           <div className="flex-1">
                               <div className="flex justify-between items-start mb-1">
                                   <p className={cn("text-xs font-medium", !n.read && "text-foreground")}>
                                       {n.title}
                                   </p>
                                   <span className="text-[10px] text-muted-foreground">{n.time}</span>
                               </div>
                               <p className="text-xs text-muted-foreground leading-relaxed">
                                   {n.message}
                               </p>
                           </div>
                       </div>
                   </motion.div>
               ))
           )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
