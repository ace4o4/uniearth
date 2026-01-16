import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Satellite, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Globe,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: { email: string; name: string }) => void;
}

type AuthMode = 'login' | 'signup';

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    organization: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    onSuccess?.({ email: formData.email, name: formData.name || 'Operator' });
    onOpenChange(false);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-8">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Satellite className="w-7 h-7 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-mono text-xs mt-1">
                {mode === 'login' 
                  ? 'Access the Multi-Satellite Fusion Dashboard'
                  : 'Join the Earth Observation Platform'
                }
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="bg-muted/50 rounded-lg p-1 flex">
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-mono text-muted-foreground">
                    FULL NAME
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Dr. Sarah Chen"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      className="pl-10 bg-muted/30 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-xs font-mono text-muted-foreground">
                    ORGANIZATION
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="organization"
                      placeholder="ISRO / NASA / ESA"
                      value={formData.organization}
                      onChange={handleInputChange('organization')}
                      className="pl-10 bg-muted/30 border-border focus:border-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-mono text-muted-foreground">
              EMAIL ADDRESS
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="operator@isro.gov.in"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="pl-10 bg-muted/30 border-border focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono text-muted-foreground">
              PASSWORD
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange('password')}
                className="pl-10 pr-10 bg-muted/30 border-border focus:border-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
              </div>
            ) : (
              <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}</span>
            )}
          </Button>

          {/* OAuth options */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-mono">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 border-border hover:bg-muted hover:border-primary/30"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="font-mono text-xs">ISRO SSO</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 border-border hover:bg-muted hover:border-primary/30"
            >
              <Globe className="w-4 h-4 mr-2" />
              <span className="font-mono text-xs">Bhoonidhi</span>
            </Button>
          </div>

          {/* Security note */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Protected by end-to-end encryption. Your data stays secure.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
