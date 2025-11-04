import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-accent/95 backdrop-blur-sm border-b border-accent"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Info className="w-5 h-5 text-accent-foreground flex-shrink-0" />
            <p className="text-sm text-accent-foreground">
              <strong>Demo Mode:</strong> This is an interactive proof-of-concept. All blockchain
              transactions and AI conversations are simulated. Browser wallet extensions may show
              errors - this is expected behavior.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-accent-foreground hover:bg-accent-foreground/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
