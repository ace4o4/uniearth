import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { format, subDays, addDays } from "date-fns";

interface TimeRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
}

export function TimeRangeSelector({ startDate, endDate, onRangeChange }: TimeRangeSelectorProps) {
  const [range, setRange] = useState([0, 30]);
  const baseDate = new Date();
  
  const handleRangeChange = (values: number[]) => {
    setRange(values);
    const newStart = subDays(baseDate, 60 - values[0]);
    const newEnd = subDays(baseDate, 60 - values[1]);
    onRangeChange(newStart, newEnd);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Time Machine
      </h3>
      
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <div className="flex justify-between items-center mb-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Analysis Window</div>
            <div className="font-mono text-sm text-primary">
              {format(startDate, "MMM dd")} — {format(endDate, "MMM dd, yyyy")}
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="relative pt-2">
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 rounded" 
               style={{ 
                 left: `${(range[0] / 60) * 100}%`, 
                 width: `${((range[1] - range[0]) / 60) * 100}%` 
               }} 
          />
          <Slider
            value={range}
            onValueChange={handleRangeChange}
            max={60}
            step={1}
            className="relative z-10"
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs font-mono text-muted-foreground">
          <span>-60 days</span>
          <span>Today</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {['7D', '14D', '30D'].map((preset) => (
          <button
            key={preset}
            className="py-2 px-3 rounded-lg border border-border bg-card text-xs font-mono text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
