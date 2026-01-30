import { useState, useEffect } from "react";
import { MonitorX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // Check if width is less than 1024px (covers mobile and portrait tablets)
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <AnimatePresence>
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MonitorX className="w-10 h-10 text-destructive" />
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Desktop Experience Required
            </h1>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Sat-Fusion-AI is a professional geospatial workstation designed for high-resolution analysis.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 border border-border text-sm font-mono text-muted-foreground">
              Please switch to a desktop or laptop device with a screen width of at least 1024px.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
