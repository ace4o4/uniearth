import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane } from "lucide-react";

interface FlightAnimationProps {
  isActive: boolean;
  startRect: DOMRect | null;
  destinationName: string;
  onComplete: () => void;
}

export function FlightAnimation({ isActive, startRect, destinationName, onComplete }: FlightAnimationProps) {
  
  useEffect(() => {
    if (isActive) {
      // Play takeoff sound? (Optional)
    }
  }, [isActive]);

  const handleAnimationComplete = () => {
    // Text to Speech
    const utterance = new SpeechSynthesisUtterance(`Destination reached: ${destinationName}`);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    
    onComplete();
  };

  if (!isActive || !startRect) return null;

  // Center of screen
  const endX = window.innerWidth / 2 - 48; // -half icon width (w-24 = 96px / 2 = 48)
  const endY = window.innerHeight / 2 - 48;

  // Calculate control point for curved path (Bezier-like)
  const deltaX = endX - startRect.left;
  const deltaY = endY - startRect.top;
  const midX = startRect.left + deltaX * 0.5 - deltaY * 0.2; // Offset for curve
  const midY = startRect.top + deltaY * 0.5 + deltaX * 0.2;

  // Determine rotation based on direction
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <motion.div
          initial={{ 
            x: startRect.left, 
            y: startRect.top, 
            scale: 0.8, 
            opacity: 1,
            rotate: angle // Start point towards dest
          }}
          animate={{ 
            x: [startRect.left, midX, endX], // Curved Path
            y: [startRect.top, midY, endY], 
            scale: [0.8, 1.8, 0.5], // Zoom up high then land small
            rotate: [angle, angle + 25, 0], // Bank into the turn, then level out
            opacity: [1, 1, 0] 
          }}
          transition={{ 
            duration: 3, 
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
          onAnimationComplete={handleAnimationComplete}
          className="absolute"
        >
            <div className="relative w-24 h-24 flex items-center justify-center">
              
              {/* Shockwave Rings */}
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [0.8, 2, 2.5] }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: i * 0.2,
                    ease: "easeOut" 
                  }}
                  className="absolute inset-0 rounded-full border border-sky-400/30"
                />
              ))}

              {/* Main Plane Container */}
              <motion.div 
                 className="relative z-10 p-4 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.8)] border border-white/40"
                 animate={{ scale: [1, 1.1, 0.95, 1] }} // Engine throttling effect
                 transition={{ duration: 0.4, repeat: Infinity }}
              >
                  <Plane className="w-10 h-10 text-white fill-white/20 transform -rotate-45 drop-shadow-lg" />
                  
                  {/* Afterburner Glow - Pulse */}
                  <motion.div 
                    animate={{ opacity: [0.6, 1, 0.6], scaleX: [1, 1.5, 1] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="absolute top-1/2 right-full w-8 h-4 bg-cyan-400 blur-md rounded-full -translate-y-1/2 translate-x-3" 
                  />
              </motion.div>
              
              {/* High-Speed Contrail */}
              <motion.div 
                 initial={{ opacity: 0, width: 0 }}
                 animate={{ opacity: [0, 0.8, 0], width: 250 }}
                 transition={{ duration: 2, delay: 0.2 }}
                 className="absolute top-1/2 right-[60%] h-2 bg-gradient-to-l from-cyan-400 via-blue-600 to-transparent rounded-full -translate-y-1/2 origin-right blur-[2px]"
              />
            </div>
        </motion.div>

        {/* Use a separate landing ripple effect at the center */}
      </div>
    </AnimatePresence>
  );
}
