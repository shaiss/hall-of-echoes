import { createContext, useContext, useState, ReactNode } from 'react';

export interface VisitorProfile {
  name: string;
  walletAddress: string;
  captureTimestamp: string;
  imageUrl: string;
}

export interface ConversationExchange {
  agent: string;
  visitor: string;
}

export interface Conversation {
  agentId: string;
  agentName: string;
  exchanges: ConversationExchange[];
  themes: string[];
}

export interface SynthesisData {
  keyThemes: string[];
  insights: string[];
  artworkStyle: string;
  conversationSummary: string;
}

export interface SoulboundToken {
  tokenId: string;
  title: string;
  description: string;
  artworkUrl: string;
  metadata: {
    timestamp: string;
    duration: number;
    agentsEngaged: string[];
    themes: string[];
  };
  ipfsHash: string;
  transactionHash: string;
}

interface ExperienceContextType {
  visitorProfile: VisitorProfile | null;
  setVisitorProfile: (profile: VisitorProfile) => void;
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  synthesisData: SynthesisData | null;
  setSynthesisData: (data: SynthesisData) => void;
  soulboundToken: SoulboundToken | null;
  setSoulboundToken: (token: SoulboundToken) => void;
  currentPhase: number;
  setCurrentPhase: (phase: number) => void;
  resetExperience: () => void;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [synthesisData, setSynthesisData] = useState<SynthesisData | null>(null);
  const [soulboundToken, setSoulboundToken] = useState<SoulboundToken | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => [...prev, conversation]);
  };

  const resetExperience = () => {
    setVisitorProfile(null);
    setConversations([]);
    setSynthesisData(null);
    setSoulboundToken(null);
    setCurrentPhase(0);
  };

  return (
    <ExperienceContext.Provider
      value={{
        visitorProfile,
        setVisitorProfile,
        conversations,
        addConversation,
        synthesisData,
        setSynthesisData,
        soulboundToken,
        setSoulboundToken,
        currentPhase,
        setCurrentPhase,
        resetExperience,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (context === undefined) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
}
