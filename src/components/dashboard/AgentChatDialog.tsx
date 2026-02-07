import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, X, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ResizableWindow } from "@/components/ui/ResizableWindow";
import { supabase } from "@/lib/supabase"; // Import Supabase

interface AgentChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction?: (action: any) => void;
}

interface Thread {
  role: "user" | "agent";
  content: string;
  thoughts?: string[];
  actions?: any[];
}

export function AgentChatDialog({ open, onOpenChange, onAction }: AgentChatDialogProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState<Thread[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to select a "futuristic" or "native" voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setQuery("");
    setLoading(true);
    setThread(prev => [...prev, { role: "user", content: userMsg }]);

    try {
      // Fetch latest user profile for context
      const { data: { user } } = await supabase.auth.getUser();
      const userProfile = user?.user_metadata || {};

      const res = await api.agentReason(userMsg, { user_profile: userProfile });

      setLoading(false);
      setThread(prev => [...prev, {
        role: "agent",
        content: res.answer,
        thoughts: res.thoughts,
        actions: res.actions
      }]);

      // 1. Speak Answer
      speak(res.answer);

      // 2. Execute Actions
      if (res.actions && res.actions.length > 0 && onAction) {
        res.actions.forEach((action: any) => {
          // Small delay to sync with speech
          setTimeout(() => onAction(action), 1000);
        });
      }
    } catch (e) {
      setLoading(false);
      setThread(prev => [...prev, { role: "agent", content: "I lost connection to the mainframe." }]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <ResizableWindow
          title="Sat-Fusion Agent"
          icon={<Brain className="w-4 h-4 text-primary" />}
          onClose={() => onOpenChange(false)}
          initialWidth={500}
          initialHeight={600}
          className="z-[100]"
        >
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {thread.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <Brain className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">How can I help you today?</p>
                <p className="text-sm text-muted-foreground">Ask me to check crop health, flood damage, or find plot boundaries.</p>
              </div>
            )}

            {thread.map((msg, i) => (
              <div key={i} className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
                {/* Message Bubble */}
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                )}>
                  {msg.content}
                </div>

                {/* Agent Thoughts (Collapsible/Visible) */}
                {msg.role === "agent" && msg.thoughts && msg.thoughts.length > 0 && (
                  <div className="max-w-[90%] text-xs font-mono text-muted-foreground bg-black/5 p-3 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Sparkles className="w-3 h-3" />
                      <span>Reasoning Process</span>
                    </div>
                    {msg.thoughts.map((thought, tidx) => (
                      <div key={tidx} className="pl-2 border-l-2 border-primary/20">
                        {thought}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm p-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about crops, floods, or satellites..."
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </ResizableWindow>
      )}
    </AnimatePresence>
  );
}
