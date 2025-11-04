# Hall of Echoes - Interactive Experience Flow

## Design Style
- **Theme**: Dark, immersive, futuristic art installation
- **Color Palette**: Deep purples, blues, with neon accents (cyan, magenta)
- **Typography**: Modern sans-serif with distinct fonts for each agent personality
- **Layout**: Full-screen immersive experiences with smooth transitions
- **Atmosphere**: Contemplative, mysterious, technologically advanced

## Page Structure

### 1. Welcome Page
- Hero section with title and atmospheric background
- Brief introduction to the experience
- "Begin Journey" CTA button
- Estimated time: 20-25 minutes

### 2. Registration Phase
- Simulated camera capture with countdown
- Visitor profile creation (name input)
- Mock NEAR wallet generation with animation
- Human-readable account name display

### 3. Conversation Corridor
Five sequential agent conversations, each with:
- Agent introduction with personality/visual identity
- 3-5 pre-scripted conversation exchanges
- User can click responses to advance
- Conversation builds context from previous agents
- Progress bar showing position in journey

**Agent Personalities**:
1. **Philosopher** - Existential, contemplative (purple theme)
2. **Scientist** - Analytical, future-focused (blue theme)
3. **Artist** - Creative, expressive (magenta theme)
4. **Storyteller** - Narrative, personal (amber theme)
5. **Futurist** - Blockchain, identity, Web3 (cyan theme)

### 4. Synthesis Phase
- Animated data processing visualization
- Key themes extracted from conversations
- Personalized insights display
- Preview of AI-generated artwork (abstract geometric)

### 5. Minting Phase
- Blockchain transaction animation
- Smart contract interaction visualization
- Progress steps: Preparing → Uploading to IPFS → Minting → Complete
- Transaction hash display (mocked)

### 6. Completion Page
- Congratulations message
- NFT/SBT display card with artwork
- Metadata summary (themes, timestamp, agents engaged)
- Mock QR code for wallet
- Social sharing options
- "Experience Again" button

## Mock Data Structure

```typescript
interface VisitorProfile {
  name: string;
  walletAddress: string;
  captureTimestamp: string;
  imageUrl: string; // placeholder
}

interface Conversation {
  agentId: string;
  agentName: string;
  exchanges: {
    agent: string;
    visitor: string;
  }[];
  themes: string[];
}

interface SynthesisData {
  keyThemes: string[];
  insights: string[];
  artworkStyle: string;
  conversationSummary: string;
}

interface SoulboundToken {
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
```

## Technical Implementation Notes
- Use React Router or Wouter for page navigation
- Store conversation state in Context/useState
- Implement typing animation with delay
- Use Framer Motion for transitions
- Mock all backend calls with setTimeout delays
- Generate deterministic "random" data based on user input
