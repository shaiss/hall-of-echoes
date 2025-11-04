import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useExperience } from "@/contexts/ExperienceContext";
import { Loader2, Sparkles, Coins } from "lucide-react";
import { useArtwork } from "@/lib/artworkGenerator";

export default function Synthesis() {
  const [, setLocation] = useLocation();
  const { conversations, setSynthesisData, visitorProfile, synthesisData } = useExperience();
  const [step, setStep] = useState<"analyzing" | "generating" | "complete">("analyzing");
  const hasStartedRef = useRef(false);
  
  // Generate dynamic artwork based on themes
  const themes = synthesisData?.keyThemes || conversations.flatMap((c) => c.themes);
  const agentIds = conversations.map((c) => c.agentId);
  const artworkUrl = useArtwork(themes, agentIds, visitorProfile?.name);

  const handleMint = () => {
    setLocation("/minting");
  };

  useEffect(() => {
    // Early return if no visitor profile
    if (!visitorProfile) {
      setLocation("/");
      return;
    }

    // If we already have conversations, start immediately
    if (conversations.length > 0 && !hasStartedRef.current) {
      hasStartedRef.current = true;
      
      // Simulate analysis
      setTimeout(() => setStep("generating"), 2000);
      setTimeout(() => {
        setStep("complete");
        
        // Generate synthesis data when complete
        const allThemes = conversations.flatMap((c) => c.themes);
        const uniqueThemes = Array.from(new Set(allThemes));
        
        const synthesis = {
          keyThemes: uniqueThemes.slice(0, 5),
          insights: [
            "Your journey reveals a deep curiosity about the intersection of technology and humanity.",
            "You value authentic connection and meaningful experiences over superficial interactions.",
            "There's a strong thread of creative expression running through your responses.",
            "You approach the future with both wonder and thoughtful consideration.",
          ],
          artworkStyle: "Abstract geometric patterns with flowing organic elements",
          conversationSummary: `Engaged with ${conversations.length} AI agents, exploring themes of ${uniqueThemes.join(", ")}.`,
        };
        
        setSynthesisData(synthesis);
      }, 4000);
      return;
    }

    // If no conversations yet, wait a bit for them to load
    // This happens when navigating from Conversation component before state propagates
    if (conversations.length === 0 && !hasStartedRef.current) {
      const timeoutId = setTimeout(() => {
        // If still no conversations after waiting, redirect back
        if (conversations.length === 0) {
          console.warn("No conversations found in Synthesis, redirecting to home");
          setLocation("/");
        }
      }, 500); // Wait up to 500ms for conversations to load

      return () => clearTimeout(timeoutId);
    }
  }, [conversations, setSynthesisData, setLocation, visitorProfile]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center"
            animate={{
              rotate: step === "analyzing" ? 360 : 0,
              scale: step === "complete" ? [1, 1.1, 1] : 1,
            }}
            transition={{
              rotate: { duration: 3, repeat: step === "analyzing" ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.5 },
            }}
          >
            {step === "complete" ? (
              <Sparkles className="w-16 h-16 text-primary-foreground" />
            ) : (
              <Loader2 className="w-16 h-16 text-primary-foreground animate-spin" />
            )}
          </motion.div>

          <h1 className="text-4xl font-bold text-foreground">
            {step === "analyzing" && "Analyzing Your Journey"}
            {step === "generating" && "Generating Insights"}
            {step === "complete" && "Synthesis Complete"}
          </h1>

          <p className="text-lg text-muted-foreground">
            {step === "analyzing" && "Processing your conversations with the agents..."}
            {step === "generating" && "Creating your unique artwork and metadata..."}
            {step === "complete" && "Your digital essence has been captured"}
          </p>
        </motion.div>

        {step === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <Card className="bg-card border-border p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Key Themes Discovered</h3>
              <div className="flex flex-wrap gap-2">
                {["meaning", "technology", "creativity", "identity", "future"].map((theme, index) => (
                  <motion.span
                    key={theme}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `oklch(0.65 0.25 ${280 + index * 40})20`,
                      color: `oklch(0.65 0.25 ${280 + index * 40})`,
                      border: `1px solid oklch(0.65 0.25 ${280 + index * 40})`,
                    }}
                  >
                    {theme}
                  </motion.span>
                ))}
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Artwork Preview</h3>
              <motion.div
                className="w-full aspect-square rounded-lg relative overflow-hidden bg-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {artworkUrl ? (
                  <img
                    src={artworkUrl}
                    alt="Generated artwork based on your conversation themes"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </motion.div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Unique generative art based on your conversation themes
              </p>
            </Card>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center pt-4"
            >
              <Button
                size="lg"
                onClick={handleMint}
                className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Coins className="w-5 h-5 mr-2" />
                Mint Your Digital Soul
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
