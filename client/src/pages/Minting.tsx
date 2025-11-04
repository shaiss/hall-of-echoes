import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useExperience } from "@/contexts/ExperienceContext";
import { Check, Loader2 } from "lucide-react";

interface MintingStep {
  id: string;
  label: string;
  status: "pending" | "processing" | "complete";
}

export default function Minting() {
  const [, setLocation] = useLocation();
  const { synthesisData, setSoulboundToken, visitorProfile } = useExperience();
  const [steps, setSteps] = useState<MintingStep[]>([
    { id: "prepare", label: "Preparing metadata", status: "pending" },
    { id: "ipfs", label: "Uploading to IPFS", status: "pending" },
    { id: "contract", label: "Calling smart contract", status: "pending" },
    { id: "mint", label: "Minting Soulbound Token", status: "pending" },
    { id: "confirm", label: "Confirming transaction", status: "pending" },
  ]);

  useEffect(() => {
    if (!visitorProfile || !synthesisData) {
      setLocation("/");
      return;
    }

    // Helper function to add randomness to timing
    const randomDelay = (base: number, variance: number = 0.4) => {
      const jitter = base * variance * (Math.random() * 2 - 1); // -variance to +variance
      return Math.max(300, base + jitter); // Minimum 300ms
    };

    // Simulate minting process with randomness
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Random delay before starting step (600-1800ms)
        await new Promise((resolve) => setTimeout(resolve, randomDelay(1200, 0.5)));
        
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index === i ? "processing" : index < i ? "complete" : "pending",
          }))
        );

        // Random processing time per step (1000-2500ms)
        // Some steps take longer (IPFS upload, contract call)
        const isSlowStep = i === 1 || i === 2; // IPFS and contract steps
        const baseTime = isSlowStep ? 2000 : 1500;
        await new Promise((resolve) => setTimeout(resolve, randomDelay(baseTime, 0.5)));
        
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index <= i ? "complete" : "pending",
          }))
        );
      }

      // Small random delay before generating token
      await new Promise((resolve) => setTimeout(resolve, randomDelay(800, 0.3)));

      // Generate soulbound token
      const token = {
        tokenId: `HOE-${Date.now().toString(36).toUpperCase()}`,
        title: "Hall of Echoes Experience",
        description: `Sovereign identity credential for ${visitorProfile.name}'s journey through the Hall of Echoes`,
        artworkUrl: "/generated-artwork.png",
        metadata: {
          timestamp: new Date().toISOString(),
          duration: 25,
          agentsEngaged: ["Philosopher", "Scientist", "Artist", "Storyteller", "Futurist"],
          themes: synthesisData.keyThemes,
        },
        ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      };

      setSoulboundToken(token);
      
      // Random delay before navigation (1500-2500ms)
      setTimeout(() => {
        setLocation("/complete");
      }, randomDelay(2000, 0.25));
    };

    processSteps();
  }, [synthesisData, setSoulboundToken, setLocation, visitorProfile]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-foreground">Creating Your Digital Soul</h1>
          <p className="text-lg text-muted-foreground">
            Minting your Soulbound Token on the NEAR blockchain
          </p>
        </motion.div>

        <Card className="bg-card border-border p-8">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex-shrink-0">
                  {step.status === "complete" ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: 1, 
                        rotate: 0,
                        y: [0, -2, 0],
                      }}
                      transition={{ 
                        scale: { duration: 0.3, type: "spring", stiffness: 200 },
                        rotate: { duration: 0.3 },
                        y: { duration: 0.5, delay: 0.3 }
                      }}
                      className="w-10 h-10 rounded-full bg-accent flex items-center justify-center"
                    >
                      <Check className="w-6 h-6 text-accent-foreground" />
                    </motion.div>
                  ) : step.status === "processing" ? (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ 
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                    >
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    </motion.div>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`text-lg font-medium ${
                      step.status === "complete"
                        ? "text-accent"
                        : step.status === "processing"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.status === "processing" && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: "100%",
                        opacity: [1, 0.7, 1],
                      }}
                      transition={{ 
                        width: { duration: 1.5, ease: "easeInOut" },
                        opacity: { duration: 0.8, repeat: Infinity, repeatType: "reverse" }
                      }}
                      className="h-1 bg-primary rounded-full mt-2"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {steps.every((s) => s.status === "complete") && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1,
              }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              className="mt-8 p-4 bg-accent/10 border border-accent rounded-lg"
            >
              <motion.p
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-sm text-accent text-center font-medium"
              >
                ✓ Transaction confirmed on NEAR blockchain
              </motion.p>
            </motion.div>
          )}
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>This process typically takes 10-15 seconds</p>
          <p className="mt-2">Your Soulbound Token will be non-transferable and permanently tied to your wallet</p>
        </motion.div>
      </div>
    </div>
  );
}
