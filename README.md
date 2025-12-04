# Hall of Echoes

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![NEAR Protocol](https://img.shields.io/badge/NEAR-Protocol-000000?logo=near&logoColor=white)](https://near.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/shaiss/hall-of-echoes?style=social)](https://github.com/shaiss/hall-of-echoes/stargazers)


> A groundbreaking interactive journey through AI consciousness and blockchain identity. Engage with autonomous agents, explore the depths of conversation, and claim your sovereign digital soul.

Hall of Echoes is an immersive art installation experience that combines AI-powered conversations with blockchain technology to create unique, non-transferable Soulbound Tokens (SBTs) on the NEAR Protocol. Each journey through the Hall creates a permanent, verifiable record of your digital identity exploration.

![Hall of Echoes Demo](docs/screenshots/hall-of-echoes-demo.gif?v=2)

## 🌟 Features

- **5 Unique AI Agents**: Engage in thoughtful conversations with autonomous agents, each with distinct personalities and perspectives
- **Immersive Experience**: Dark, atmospheric UI with smooth animations and transitions
- **Personalized Synthesis**: AI analyzes your conversations to extract key themes and insights
- **Blockchain Integration**: Mint your unique Soulbound Token on NEAR Protocol
- **Sovereign Digital Identity**: Create a permanent, non-transferable credential tied to your wallet
- **QR Code Wallet Display**: Easy sharing and verification of your digital soul
- **Photobooth Camera Experience**: Real-time webcam capture with 5-second photobooth countdown
- **DiceBear Avatar Fallback**: Beautiful generated avatars if camera access is denied

## 🎭 The Experience Flow

### 1. Welcome
The journey begins with an atmospheric introduction to the Hall of Echoes. Users are presented with an overview of the experience and can begin their journey with a single click.

### 2. Registration
Users provide their name and go through a **photobooth-style camera capture**:
- Name input
- 5-second countdown before automatic capture (3-2-1 with giant numbers)
- Live video preview with DiceBear avatar fallback
- Automatic NEAR wallet generation with human-readable account name (e.g., `your-name.near`)
- **Button to acknowledge wallet creation before proceeding** ← New UX improvement!

### 3. Conversation Corridor
Travel through five sequential agent stations, each exploring different aspects of consciousness, identity, and technology:

- **The Philosopher** (Purple) - Seeker of Meaning, exploring existential questions
- **The Scientist** (Blue) - Analytical and future-focused, examining technology and humanity
- **The Artist** (Magenta) - Creative and expressive, exploring beauty and creation
- **The Storyteller** (Amber) - Keeper of Narratives, weaving threads of experience
- **The Futurist** (Cyan) - Visionary of Web3, exploring blockchain identity and digital sovereignty

Each conversation includes multiple exchanges where users select responses, building a unique dialogue pattern.

### 4. Synthesis
After completing all conversations, the AI synthesizes the journey:
- Extracts key themes from your responses
- Generates personalized insights
- Creates a preview of your unique **dynamically generated digital artwork**
- Prepares metadata for minting
- **New**: Button to explicitly proceed to minting (no more auto-jump) ← UX improvement!

### 5. Minting
Watch as your Soulbound Token is created on the blockchain:
- Metadata preparation
- IPFS upload simulation
- Smart contract interaction
- Transaction confirmation

The process includes **realistic timing variations and visual jitter** to simulate real blockchain operations, making it feel more authentic.

### 6. Completion
View your completed Soulbound Token:
- Beautiful NFT/SBT display card with **dynamically generated animated artwork** based on your themes
- Complete metadata summary
- Wallet QR code for easy sharing
- Transaction and IPFS hash details
- Social sharing options

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/pnpm
- **pnpm** (recommended) - Install with `npm install -g pnpm`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hall-of-echoes
```

2. Install dependencies:
```bash
pnpm install
```

If you don't have pnpm installed, you can use npm:
```bash
npm install
```

### Development

Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Building for Production

Build the application:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

The production build will be served from the `dist` directory.

### Preview Production Build

Preview the production build locally:
```bash
pnpm preview
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS 4 with custom animations
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion
- **QR Codes**: qrcode.react
- **Icons**: Lucide React
- **Backend**: Express.js (for production static serving)
- **Package Manager**: pnpm

## 📁 Project Structure

```
hall-of-echoes/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and data
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # Application entry point
│   └── index.html         # HTML template
├── server/                # Express server for production
│   └── index.ts          # Server entry point
├── shared/                # Shared constants and types
├── patches/               # Package patches (wouter)
├── dist/                  # Build output (gitignored)
└── docs/                  # Documentation and screenshots
    └── screenshots/        # App screenshots (to be added)
```

## 🎨 Design Philosophy

Hall of Echoes is designed as an **immersive art installation** with:

- **Dark, atmospheric aesthetic** - Deep purples, blues, and neon accents
- **Smooth transitions** - Every page change is animated
- **Contemplative atmosphere** - Encourages reflection and introspection
- **Technologically advanced** - Modern UI with subtle blockchain themes
- **Full-screen experiences** - Minimal distractions, maximum immersion

## 🔧 Configuration

### Environment Variables

Create a `.env` file for local development (optional):

```env
VITE_APP_TITLE=Hall of Echoes
PORT=3000
```

### Customization

- **Agent Conversations**: Edit `client/src/lib/conversationData.ts` to modify agent dialogues
- **Themes**: Update color schemes in `client/src/index.css`
- **Experience Flow**: Modify page components in `client/src/pages/`

## 📝 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm preview` - Preview production build
- `pnpm check` - Type check without emitting files
- `pnpm format` - Format code with Prettier

## 🧪 Development Notes

### Mock Data

This is a **proof-of-concept demonstration**. All blockchain operations are simulated:
- Wallet creation is mocked
- IPFS uploads are simulated
- Smart contract calls are simulated
- Transaction hashes are randomly generated

### State Management

The app uses React Context (`ExperienceContext`) to manage:
- Visitor profile
- Conversation history
- Synthesis data
- Soulbound token data

### Routing

Uses Wouter for lightweight client-side routing:
- `/` - Welcome page
- `/registration` - Registration flow
- `/corridor/:agentId`

## 🚧 Known Limitations

- This is a demo/proof-of-concept - no real blockchain transactions occur
- All wallet operations are mocked
- Camera fallback uses generated avatars (DiceBear)
- Artwork generation is done client-side with Canvas API (planned: LLM-powered generation)

## 📄 Yellow Paper

For a comprehensive exploration of the conceptual vision behind humanizing private AI through journey-based identity exploration, see our **[Yellow Paper](./docs/YELLOW_PAPER.md)**.

**Key Concepts**:
- 🧠 **Living Agents**: AI that evolves through collective wisdom while preserving individual privacy
- 📜 **Witness Protocol**: Cryptographic attestation of journey essence without literal recording
- 🌀 **Quantum Synthesis**: Multiple psychological interpretations in superposition until user-selected collapse
- 🔒 **TEE-Protected Inference**: NEAR AI Cloud ensures conversations never leave trusted execution environment
- 🗺️ **Journey Architecture**: Modular assessment frameworks exploring identity through different lenses

## 🔮 Future Enhancements

Potential improvements for a production version:
- [ ] NEAR AI Cloud TEE integration for private inference
- [ ] Journey-based architecture with selectable assessment frameworks
- [ ] Living agent evolution with aggregate learning
- [ ] Quantum synthesis with multi-interpretation collapse UX
- [ ] Real NEAR wallet integration (currently mocked)
- [ ] Actual IPFS storage (currently simulated)
- [ ] Real smart contract deployment with cryptographic attestations
- [ ] Journey marketplace for community-created assessment frameworks
- [ ] Cross-journey synthesis and longitudinal tracking
- [ ] Advanced blockchain features (Chain Signatures, Intent protocol integration)

## 📸 Screenshots

> **Note**: Screenshots should be manually captured using browser developer tools or a screenshot utility. The following screenshots showcase the key stages of the Hall of Echoes experience:

### Screenshot Coverage:
- **Welcome Page** (`docs/screenshots/welcome.png`) - The atmospheric landing page with "Begin Your Journey" CTA, featuring the dark purple theme and elegant typography
- **Registration - Name Input** (`docs/screenshots/registration-name.png`) - Clean card-based form asking for the user's name
- **Registration - Camera Capture** (`docs/screenshots/registration-camera.png`) - Photobooth-style interface with live video feed, 5-second countdown overlay, and "Say cheese!" prompt
- **Registration - Wallet Creation** (`docs/screenshots/registration-wallet.png`) - Wallet generation confirmation screen showing the NEAR account (e.g., `your-name.near`) with "Enter the Hall of Echoes" button
- **Conversation Interface** (`docs/screenshots/conversation-intro.png`) - Agent conversation page showing the agent's greeting, color-coded theme, and response options
- **Synthesis Results** (`docs/screenshots/synthesis.png`) - The synthesis complete page displaying key themes, insights, and dynamically generated artwork preview with "Mint Your Digital Soul" button
- **Minting Process** (`docs/screenshots/minting.png`) - The minting animation page showing the 5-step process with realistic timing variations and visual jitter
- **Completion Page** (`docs/screenshots/complete.png`) - Final SBT display with artwork, metadata, wallet QR code, transaction hash, and social sharing options

**To capture screenshots:**
1. Run the app with `pnpm dev`
2. Navigate through each stage manually
3. Use browser DevTools (F12) or a screenshot tool to capture each page
4. Save screenshots to `docs/screenshots/` with the filenames listed above

### Recent Feature Updates:
✅ **Photobooth Camera Experience** - 5-second countdown, live video feed, DiceBear fallback
✅ **Dynamic Artwork Generation** - Canvas-based artwork tied to conversation themes
✅ **Wallet Creation Confirmation** - Button to explicitly acknowledge wallet before proceeding
✅ **Synthesis Button** - No auto-jump to minting; users click "Mint Your Digital Soul" button
✅ **Realistic Minting Animation** - Random delays and jitter for authentic blockchain feel
