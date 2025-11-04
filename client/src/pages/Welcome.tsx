import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Sparkles, Brain, Fingerprint } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, oklch(0.2 0.15 280) 0%, oklch(0.12 0.04 280) 50%)",
          }}
          animate={{
            background: [
              "radial-gradient(circle at 50% 50%, oklch(0.2 0.15 280) 0%, oklch(0.12 0.04 280) 50%)",
              "radial-gradient(circle at 60% 40%, oklch(0.2 0.15 190) 0%, oklch(0.12 0.04 280) 50%)",
              "radial-gradient(circle at 40% 60%, oklch(0.2 0.15 330) 0%, oklch(0.12 0.04 280) 50%)",
              "radial-gradient(circle at 50% 50%, oklch(0.2 0.15 280) 0%, oklch(0.12 0.04 280) 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            Hall of Echoes
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            A groundbreaking journey through AI consciousness and blockchain identity.
            Engage with autonomous agents, explore the depths of conversation, and claim
            your sovereign digital soul.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-8 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-chart-1" />
              <span className="text-foreground">5 AI Agents</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-chart-2" />
              <span className="text-foreground">20-25 Minutes</span>
            </div>
            <div className="flex items-center gap-3">
              <Fingerprint className="w-6 h-6 text-chart-3" />
              <span className="text-foreground">Unique NFT</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Button
              size="lg"
              className="text-lg px-12 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setLocation("/registration")}
            >
              Begin Your Journey
            </Button>
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            This is an interactive proof-of-concept demonstration
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
