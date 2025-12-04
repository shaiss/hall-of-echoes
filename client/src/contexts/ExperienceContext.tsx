import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  // Initialize state from localStorage if available
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile | null>(() => {
    const saved = localStorage.getItem('visitorProfile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [synthesisData, setSynthesisData] = useState<SynthesisData | null>(() => {
    const saved = localStorage.getItem('synthesisData');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [soulboundToken, setSoulboundToken] = useState<SoulboundToken | null>(() => {
    const saved = localStorage.getItem('soulboundToken');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentPhase, setCurrentPhase] = useState(() => {
    const saved = localStorage.getItem('currentPhase');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persist state changes to localStorage
  useEffect(() => {
    if (visitorProfile) {
      localStorage.setItem('visitorProfile', JSON.stringify(visitorProfile));
    } else {
      localStorage.removeItem('visitorProfile');
    }
  }, [visitorProfile]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (synthesisData) {
      localStorage.setItem('synthesisData', JSON.stringify(synthesisData));
    } else {
      localStorage.removeItem('synthesisData');
    }
  }, [synthesisData]);

  useEffect(() => {
    if (soulboundToken) {
      localStorage.setItem('soulboundToken', JSON.stringify(soulboundToken));
    } else {
      localStorage.removeItem('soulboundToken');
    }
  }, [soulboundToken]);

  useEffect(() => {
    localStorage.setItem('currentPhase', currentPhase.toString());
  }, [currentPhase]);

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => [...prev, conversation]);
  };

  const resetExperience = () => {
    setVisitorProfile(null);
    setConversations([]);
    setSynthesisData(null);
    setSoulboundToken(null);
    setCurrentPhase(0);
    localStorage.clear();
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
