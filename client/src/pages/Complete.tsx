import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useExperience } from "@/contexts/ExperienceContext";
import { ExternalLink, Download, Share2, RotateCcw, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useArtwork } from "@/lib/artworkGenerator";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Complete() {
  const [, setLocation] = useLocation();
  const { soulboundToken, visitorProfile, resetExperience, conversations, synthesisData } = useExperience();
  
  // Generate dynamic artwork based on token themes
  const themes = soulboundToken?.metadata.themes || [];
  const agentIds = conversations.map((c) => c.agentId);
  const artworkUrl = useArtwork(themes, agentIds, soulboundToken?.tokenId);

  useEffect(() => {
    if (!soulboundToken || !visitorProfile) {
      // Allow viewing if we have data in localStorage even if not in context yet (handled by provider)
      // But if provider is initialized and still null, then redirect
      // For now, reliance on the provider's initial state from localStorage is sufficient
      // if it's still null after a moment, we might redirect, but let's assume if it's null it's really empty.
      // However, since we just added persistence, we might need to check if we are just reloading.
      // The context initializes from localStorage synchronously, so this check is fine.
       if (!localStorage.getItem('soulboundToken')) {
          setLocation("/");
       }
    }
  }, [soulboundToken, visitorProfile, setLocation]);

  if (!soulboundToken || !visitorProfile) return null;

  const handleShare = () => {
    toast.success("Share functionality would open social media options");
  };

  const handleDownload = () => {
    toast.success("NFT metadata would be downloaded as JSON");
  };

  const handleViewOnChain = () => {
    window.open(`https://explorer.testnet.near.org/transactions/${soulboundToken.transactionHash}`, '_blank');
  };

  const handleReset = () => {
    resetExperience();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold text-foreground">Your Digital Soul Awaits</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Congratulations, {visitorProfile.name}! Your Soulbound Token has been successfully
            minted. The Hall of Echoes has listened, and this is your story echoed back.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: NFT & Interpretation */}
          <div className="space-y-8">
            {/* NFT Display */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card border-border p-6 space-y-6">
                <motion.div
                  className="aspect-square rounded-lg relative overflow-hidden bg-muted"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {artworkUrl ? (
                    <img
                      src={artworkUrl}
                      alt={soulboundToken.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3">
                      <div className="w-48 h-48 border-4 border-white/30 rounded-full animate-spin" />
                    </div>
                  )}
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-card-foreground">{soulboundToken.title}</h3>
                  <p className="text-sm text-muted-foreground">{soulboundToken.description}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>
            </motion.div>

             {/* Interpretation / Synthesis */}
            {synthesisData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-card border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <h3 className="text-xl font-semibold text-card-foreground">Soul Synthesis</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">The Oracle's Interpretation</h4>
                      <p className="text-sm italic text-foreground/90 leading-relaxed border-l-2 border-accent pl-4 py-1">
                        "{synthesisData.conversationSummary}"
                      </p>
                    </div>

                    {synthesisData.insights && synthesisData.insights.length > 0 && (
                       <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Insights</h4>
                        <ul className="space-y-2">
                          {synthesisData.insights.map((insight, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-accent mt-1">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column: Echoes & Details */}
          <div className="space-y-6">
             {/* Conversation History */}
             <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card border-border p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4 shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold text-card-foreground">Echoes of Conversation</h3>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {conversations.map((conv, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{conv.agentName}</Badge>
                          <span className="text-xs text-muted-foreground">Agent</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-2 border-l border-border space-y-4 py-2">
                          {conv.exchanges.map((exchange, exIdx) => (
                            <div key={exIdx} className="space-y-1">
                              <p className="text-sm text-muted-foreground italic">"{exchange.agent}"</p>
                              <p className="text-sm font-medium text-foreground">You: "{exchange.visitor}"</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </motion.div>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <Card className="bg-card border-border p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Token Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token ID</span>
                    <span className="text-card-foreground font-mono">{soulboundToken.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wallet</span>
                    <span className="text-card-foreground font-mono">{visitorProfile.walletAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span className="text-card-foreground">NEAR Protocol</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-accent font-medium">Soulbound (Non-transferable)</span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground text-xs mb-3 text-center">Wallet QR Code</p>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCodeSVG
                        value={visitorProfile.walletAddress}
                        size={160}
                        level="H"
                        includeMargin={true}
                        fgColor="#000000"
                        bgColor="#ffffff"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Scan to view wallet address
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Blockchain Data</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">IPFS Hash</span>
                    <code className="text-xs text-card-foreground bg-muted p-2 rounded block break-all">
                      {soulboundToken.ipfsHash}
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Transaction Hash</span>
                    <code className="text-xs text-card-foreground bg-muted p-2 rounded block break-all">
                      {soulboundToken.transactionHash}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewOnChain}
                    className="w-full mt-2"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on NEAR Explorer
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-6 pt-8"
        >
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            className="text-lg px-8"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Start New Journey
          </Button>

          <p className="text-sm text-muted-foreground">
            This is an interactive proof-of-concept demonstration
          </p>
        </motion.div>
      </div>
    </div>
  );
}
