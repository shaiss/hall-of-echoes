import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useExperience } from "@/contexts/ExperienceContext";
import { agentData } from "@/lib/conversationData";
import { Brain, Atom, Palette, BookOpen, Rocket } from "lucide-react";

const iconMap: Record<string, any> = {
  brain: Brain,
  atom: Atom,
  palette: Palette,
  "book-open": BookOpen,
  rocket: Rocket,
};

export default function Conversation() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [, setLocation] = useLocation();
  const { addConversation, conversations, visitorProfile } = useExperience();

  const agent = agentData.find((a) => a.id === agentId);
  const [currentExchange, setCurrentExchange] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const agentIndex = agentData.findIndex((a) => a.id === agentId);
  const progress = ((agentIndex + 1) / agentData.length) * 100;

  const Icon = agent ? iconMap[agent.icon] : Brain;

  useEffect(() => {
    if (!agent || !visitorProfile) {
      setLocation("/");
    }
  }, [agent, visitorProfile, setLocation]);

  if (!agent) return null;

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setShowResponse(true);
    }, 1500);
  };

  const handleContinue = () => {
    if (currentExchange < agent.exchanges.length - 1) {
      setCurrentExchange(currentExchange + 1);
      setSelectedOption(null);
      setShowResponse(false);
    } else {
      // Save conversation
      const conversation = {
        agentId: agent.id,
        agentName: agent.name,
        exchanges: agent.exchanges.map((ex, idx) => ({
          agent: ex.agentQuestion,
          visitor: ex.visitorOptions[selectedOption ?? 0], // Use selected option or default to first
        })),
        themes: agent.themes,
      };
      addConversation(conversation);

      // Navigate to next agent or synthesis
      // Use setTimeout to ensure state update completes before navigation
      const nextAgentIndex = agentIndex + 1;
      setTimeout(() => {
        if (nextAgentIndex < agentData.length) {
          setLocation(`/corridor/${agentData[nextAgentIndex].id}`);
        } else {
          setLocation("/synthesis");
        }
      }, 50); // Small delay to ensure state propagates
    }
  };

  const exchange = agent.exchanges[currentExchange];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Journey Progress</span>
            <span>{agentIndex + 1} of {agentData.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main conversation area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-8">
          {/* Agent header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <motion.div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${agent.color}20`,
                border: `2px solid ${agent.color}`,
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${agent.color}40`,
                  `0 0 40px ${agent.color}60`,
                  `0 0 20px ${agent.color}40`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className="w-12 h-12" style={{ color: agent.color }} />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{agent.name}</h1>
              <p className="text-lg text-muted-foreground">{agent.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{agent.description}</p>
            </div>
          </motion.div>

          {/* Conversation exchange */}
          <div className="space-y-6">
            {/* Agent question */}
            <motion.div
              key={`question-${currentExchange}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card border-border p-6">
                <p className="text-lg text-card-foreground leading-relaxed">
                  {exchange.agentQuestion}
                </p>
              </Card>
            </motion.div>

            {/* Visitor options */}
            {!showResponse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                {exchange.visitorOptions.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Button
                      variant={selectedOption === index ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto py-4 px-6"
                      style={{
                        backgroundColor: selectedOption === index ? agent.color : undefined,
                        borderColor: agent.color,
                      }}
                      onClick={() => handleOptionSelect(index)}
                      disabled={selectedOption !== null}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm">{agent.name} is thinking...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agent response */}
            <AnimatePresence>
              {showResponse && selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-card border-border p-6">
                    <p className="text-lg text-card-foreground leading-relaxed">
                      {exchange.agentResponse}
                    </p>
                  </Card>
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleContinue}
                      style={{ backgroundColor: agent.color }}
                      className="text-primary-foreground"
                    >
                      {currentExchange < agent.exchanges.length - 1 ? "Continue" : "Complete"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
