import { useState } from "react";
import { motion } from "framer-motion";
import { Satellite, Bell, Settings, User, LogIn } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { AuthDialog } from "./AuthDialog";

interface UserData {
  email: string;
  name: string;
}

interface HeaderProps {
  onAuthSuccess?: (user: UserData) => void;
}

export function Header({ onAuthSuccess }: HeaderProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    onAuthSuccess?.(userData);
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
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
              <h1 className="font-semibold text-foreground tracking-tight">MSDF-D</h1>
              <p className="text-xs text-muted-foreground font-mono">Multi-Satellite Data Fusion</p>
            </div>
          </motion.div>

          <div className="h-8 w-px bg-border" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
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
          <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          </button>
          <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-border mx-2" />
          
          {user ? (
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                  {user.email}
                </div>
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
    </>
  );
}
