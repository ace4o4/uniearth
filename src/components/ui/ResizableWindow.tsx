import { motion, useDragControls } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { X, Minus, Maximize2, ExternalLink, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResizableWindowProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  onClose?: () => void;
  onPopOut?: () => void;
  className?: string;
  defaultPosition?: { x: number; y: number };
}

export function ResizableWindow({
  children,
  title,
  icon,
  initialWidth = 600,
  initialHeight = 500,
  minWidth = 300,
  minHeight = 200,
  onClose,
  onPopOut,
  className,
  defaultPosition
}: ResizableWindowProps) {
  // Window State
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Refs
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Drag Controls
  const dragControls = useDragControls();

  // Resize Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isMinimized) return;
      if (!windowRef.current) return;

      const newWidth = e.clientX - windowRef.current.getBoundingClientRect().left;
      const newHeight = e.clientY - windowRef.current.getBoundingClientRect().top;

      setSize({
        width: Math.max(minWidth, newWidth),
        height: Math.max(minHeight, newHeight)
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'nwse-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, minHeight, isMinimized]);

  const toggleMaximize = () => {
      if (isMinimized) setIsMinimized(false);
      
      if (isMaximized) {
          setSize({ width: initialWidth, height: initialHeight });
      } else {
          setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      }
      setIsMaximized(!isMaximized);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    setIsMaximized(false);
  };

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized && !isMinimized}
      dragListener={!isMinimized}
      dragControls={dragControls}
      dragMomentum={false}
      initial={defaultPosition || { x: window.innerWidth / 2 - initialWidth / 2, y: 100 }}
      animate={isMinimized 
        ? { 
            x: window.innerWidth - 260, 
            y: window.innerHeight - 50,
            width: 250,
            height: 48,
            transition: { type: "spring", stiffness: 300, damping: 30 }
          }
        : {
            width: isMaximized ? window.innerWidth - 40 : size.width,
            height: isMaximized ? window.innerHeight - 40 : size.height,
            // When restoring, we don't force X/Y so it stays where dragged, 
            // BUT framer might need 'layout' prop for smooth transitions or we restart from last drag pos.
            // For simplicity, we let drag system handle position when not minimized.
          }
      }
      style={{ 
        position: 'fixed',
        zIndex: 50
      }}
      className={cn(
        "bg-card border border-border shadow-2xl rounded-xl flex flex-col overflow-hidden backdrop-blur-md",
        isMaximized && "inset-4 !transform-none !w-auto !h-auto",
        isMinimized && "rounded-t-xl rounded-b-none border-b-0",
        className
      )}
    >
      {/* Title Bar (Draggable Area) */}
      <div 
        onPointerDown={(e) => {
            if (!isMaximized && !isMinimized) dragControls.start(e);
        }}
        className={cn(
            "h-10 bg-muted/50 border-b border-border flex items-center justify-between px-3 cursor-grab active:cursor-grabbing select-none",
            isMinimized && "h-12 bg-primary/10 border-none cursor-pointer"
        )}
        onClick={() => isMinimized && toggleMinimize()}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          {icon}
          <span className="text-sm font-medium text-foreground/80 truncate max-w-[120px]">
            {title} {isMinimized && "(Minimized)"}
          </span>
        </div>
        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          {onPopOut && !isMinimized && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPopOut(); }}
              className="p-1.5 hover:bg-black/10 rounded-md transition-colors text-muted-foreground"
              title="Pop Out"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          <button 
             onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
             className="p-1.5 hover:bg-black/10 rounded-md transition-colors text-muted-foreground"
             title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          </button>
          {!isMinimized && (
            <>
                <button 
                    onClick={toggleMaximize}
                    className="p-1.5 hover:bg-black/10 rounded-md transition-colors text-muted-foreground"
                >
                    <Maximize2 className="w-3 h-3" />
                </button>
                <button 
                    onClick={onClose}
                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors text-muted-foreground"
                >
                    <X className="w-3 h-3" />
                </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
          "flex-1 overflow-hidden relative flex flex-col transition-all",
          isMinimized && "opacity-0 h-0 flex-none"
      )}>
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && !isMinimized && (
        <div 
           onMouseDown={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setIsResizing(true);
           }}
           className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 z-50 hover:bg-primary/20 rounded-tl-lg"
        >
           <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
        </div>
      )}
    </motion.div>
  );
}
