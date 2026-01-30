import { useState } from "react";
import { motion } from "framer-motion";
import { Satellite, User, LogIn, Brain } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { AuthDialog } from "./AuthDialog";
import { AgentChatDialog } from "./AgentChatDialog";
import { NotificationCenter } from "./NotificationCenter";
import { LocationSearch } from "./LocationSearch";

interface UserData {
  email: string;
  name: string;
}

interface HeaderProps {
  onAuthSuccess?: (user: UserData) => void;
  onLocationSelect: (lat: number, lon: number, zoom?: number, startRect?: DOMRect, name?: string, geojson?: any, bbox?: string[]) => void;
}

export function Header({ onAuthSuccess, onLocationSelect }: HeaderProps) {
  const [agentOpen, setAgentOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    onAuthSuccess?.(userData);
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Satellite className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground tracking-tight">Sat-Fusion-AI</h1>
              <p className="text-xs text-muted-foreground font-mono">Autonomous Fusion Agent</p>
            </div>
          </motion.div>

          <div className="h-8 w-px bg-border" />

          <LocationSearch 
            onLocationSelect={onLocationSelect} 
            className="w-80"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 hidden xl:flex"
          >
            <StatusIndicator status="online" label="Sentinel-2" />
            <StatusIndicator status="syncing" label="Landsat-8" />
            <StatusIndicator status="online" label="ISRO" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          {/* AGENT BUTTON */}
          <button 
            onClick={() => setAgentOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border border-pink-500/20 mr-2 transition-all"
          >
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">Ask Agent</span>
          </button>

          <div className="mr-2">
            <NotificationCenter />
          </div>
          
          <div className="h-8 w-px bg-border mx-2" />
          
          {user ? (
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user.name}</div>
              </div>
            </button>
          ) : (
            <motion.button 
              onClick={() => setAuthDialogOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-medium">Sign In</span>
            </motion.button>
          )}
        </motion.div>
      </header>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onSuccess={handleAuthSuccess}
      />

      <AgentChatDialog 
        open={agentOpen}
        onOpenChange={setAgentOpen}
      />
    </>
  );
}
