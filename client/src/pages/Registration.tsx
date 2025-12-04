import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useExperience } from "@/contexts/ExperienceContext";
import { Camera, Wallet, Loader2, AlertCircle } from "lucide-react";

// Helper function to generate a random avatar using DiceBear
function generateRandomAvatar(seed: string): string {
  const style = 'avataaars'; // Fun avatar style
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export default function Registration() {
  const [, setLocation] = useLocation();
  const { setVisitorProfile, setCurrentPhase } = useExperience();
  const [name, setName] = useState("");
  const [step, setStep] = useState<"name" | "capture" | "wallet">("name");
  const [countdown, setCountdown] = useState(5); // 5 second countdown for photobooth feel
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletCreated, setWalletCreated] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Request camera access when entering capture step
  useEffect(() => {
    if (step === "capture") {
      requestCamera();
    }
    
    return () => {
      // Cleanup: stop camera when leaving capture step
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: "user" 
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch (error) {
      console.error("Camera access denied:", error);
      setCameraError("Camera access denied. Using generated avatar.");
      // Generate random avatar as fallback
      const avatar = generateRandomAvatar(name || "anonymous");
      setCapturedImage(avatar);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 640;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image as data URL
        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);
        
        // Stop camera stream
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } else if (!capturedImage) {
      // Fallback to random avatar if no camera
      const avatar = generateRandomAvatar(name);
      setCapturedImage(avatar);
    }
  };

  // Photobooth-style countdown timer
  useEffect(() => {
    if (step === "capture" && countdown > 0 && !cameraError) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === "capture" && countdown === 0) {
      // Capture photo when countdown reaches 0
      capturePhoto();
      
      setTimeout(() => {
        setStep("wallet");
        setIsProcessing(true);
      }, 800);
    } else if (step === "capture" && cameraError) {
      // If camera error, proceed immediately with avatar
      setTimeout(() => {
        setStep("wallet");
        setIsProcessing(true);
      }, 1500);
    }
  }, [step, countdown, cameraError]);
  
  // Reset countdown when entering capture step
  useEffect(() => {
    if (step === "capture") {
      setCountdown(5);
    }
  }, [step]);

  // Wallet creation simulation
  // TODO: Replace with LLM-generated wallet name based on metadata/personality/SBT
  useEffect(() => {
    if (step === "wallet" && isProcessing) {
      setTimeout(() => {
        // Generate temporary wallet address - will be replaced with LLM-generated name later
        // Using timestamp + random string for uniqueness
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        const address = `echo-${timestamp}-${random}.near`;
        setWalletAddress(address);
        
        const profile = {
          name,
          walletAddress: address,
          captureTimestamp: new Date().toISOString(),
          imageUrl: capturedImage || generateRandomAvatar(name),
        };
        setVisitorProfile(profile);
        setCurrentPhase(1);
        setIsProcessing(false);
        setWalletCreated(true);
      }, 3000);
    }
  }, [step, isProcessing, name, capturedImage, setVisitorProfile, setCurrentPhase]);

  const handleEnterHall = () => {
    setLocation("/corridor/philosopher");
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep("capture");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {step === "name" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">Welcome to Hall of Echoes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Let's begin by getting to know you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-card-foreground block mb-2">
                    What's your name?
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-input border-border text-foreground"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!name.trim()}
                >
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "capture" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">Capturing Your Essence</CardTitle>
              <CardDescription className="text-muted-foreground">
                {cameraError ? "Using generated avatar" : "Please look at the camera"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <motion.div
                className="w-64 h-64 rounded-full bg-secondary flex items-center justify-center relative overflow-hidden"
                animate={{
                  boxShadow: [
                    "0 0 20px oklch(0.65 0.25 280 / 0.3)",
                    "0 0 40px oklch(0.65 0.25 280 / 0.6)",
                    "0 0 20px oklch(0.65 0.25 280 / 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Video element for camera feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover ${cameraError ? 'hidden' : ''}`}
                />
                
                {/* Generated avatar when camera is not available */}
                {cameraError && capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Generated avatar"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                
                {/* Fallback icon when no camera and no avatar yet */}
                {cameraError && !capturedImage && (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-24 h-24 text-muted-foreground" />
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                )}
                
                {/* Countdown overlay on video */}
                {!cameraError && countdown > 0 && countdown <= 3 && (
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20"
                  >
                    <span className="text-9xl font-bold text-white drop-shadow-2xl">
                      {countdown}
                    </span>
                  </motion.div>
                )}
              </motion.div>
              
              {!cameraError && countdown > 3 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  Get ready... Photo in {countdown} seconds
                </motion.p>
              )}
              
              {!cameraError && countdown <= 3 && countdown > 0 && (
                <motion.p
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-lg font-bold text-primary"
                >
                  Say cheese! 📸
                </motion.p>
              )}
              
              {cameraError && (
                <p className="text-xs text-yellow-600 text-center max-w-xs">
                  {cameraError}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hidden canvas for capturing photo */}
        <canvas ref={canvasRef} className="hidden" />

        {step === "wallet" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">Creating Your Digital Identity</CardTitle>
              <CardDescription className="text-muted-foreground">
                Generating your NEAR wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <motion.div
                className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wallet className="w-16 h-16 text-primary" />
              </motion.div>

            {walletCreated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-lg font-medium text-card-foreground font-mono">
                    {walletAddress}
                  </p>
                  <p className="text-sm text-accent font-medium">✓ Wallet created successfully</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Your NEAR wallet has been generated and is ready. This is your sovereign digital identity.
                  </p>
                </div>
                
                <Button
                  onClick={handleEnterHall}
                  size="lg"
                  className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Enter the Hall of Echoes
                </Button>
              </motion.div>
            )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
