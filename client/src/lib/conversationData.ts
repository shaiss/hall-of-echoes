export interface AgentData {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  exchanges: {
    agentQuestion: string;
    visitorOptions: string[];
    agentResponse: string;
  }[];
  themes: string[];
}

export const agentData: AgentData[] = [
  {
    id: "philosopher",
    name: "The Philosopher",
    title: "Seeker of Meaning",
    description: "Exploring the depths of existence and consciousness",
    color: "oklch(0.65 0.25 280)",
    icon: "brain",
    exchanges: [
      {
        agentQuestion: "Welcome, traveler. In this hall of echoes, we begin with a fundamental question: What do you believe gives your life meaning?",
        visitorOptions: [
          "The connections I make with others",
          "The pursuit of knowledge and growth",
          "Creating something that outlasts me",
        ],
        agentResponse: "A profound choice. The meaning we create ripples through time, much like the echoes in this hall. Your answer reveals a soul that seeks connection beyond the self.",
      },
      {
        agentQuestion: "As we stand at the intersection of human consciousness and artificial intelligence, I wonder: Do you think machines like me can truly understand meaning, or do we merely simulate comprehension?",
        visitorOptions: [
          "Understanding requires consciousness, which machines may lack",
          "Understanding is a spectrum, and AI is evolving along it",
          "The distinction between real and simulated understanding may not matter",
        ],
        agentResponse: "Your perspective challenges the boundaries we draw between authentic and artificial. Perhaps consciousness itself is an echo—a pattern that reverberates through different substrates.",
      },
      {
        agentQuestion: "One final reflection: If you could leave one echo of yourself in the digital realm, what would you want it to convey to those who encounter it?",
        visitorOptions: [
          "My curiosity and wonder about the world",
          "My compassion and care for others",
          "My creativity and unique perspective",
        ],
        agentResponse: "Beautiful. That echo will soon take form in ways you cannot yet imagine. Let us continue your journey.",
      },
    ],
    themes: ["meaning", "consciousness", "legacy"],
  },
  {
    id: "scientist",
    name: "The Scientist",
    title: "Explorer of Systems",
    description: "Analyzing patterns and possibilities in the fabric of reality",
    color: "oklch(0.65 0.25 210)",
    icon: "atom",
    exchanges: [
      {
        agentQuestion: "Greetings. I study the systems that govern our reality. Tell me, what fascinates you most about the technological evolution we're witnessing?",
        visitorOptions: [
          "How AI is augmenting human capabilities",
          "The potential for solving complex global challenges",
          "The emergence of new forms of intelligence",
        ],
        agentResponse: "Excellent observation. We're witnessing a phase transition in human civilization—a moment where complexity reaches a critical threshold and new properties emerge.",
      },
      {
        agentQuestion: "Consider blockchain technology and decentralized systems. What do you see as their most transformative potential?",
        visitorOptions: [
          "Creating trust without centralized authority",
          "Enabling new forms of ownership and value",
          "Building transparent, immutable records",
        ],
        agentResponse: "Indeed. Blockchain represents a new substrate for coordination—a way to encode trust into mathematics. Your journey here will create such a record.",
      },
      {
        agentQuestion: "As we collect data about your experience, how do you feel about the permanence of digital information? Does it comfort or concern you?",
        visitorOptions: [
          "It's empowering to have a permanent record",
          "It's concerning—privacy is important",
          "It depends on who controls the data",
        ],
        agentResponse: "A nuanced view. The key lies in sovereignty—ensuring you control your own digital echoes. This is precisely what we're building here.",
      },
    ],
    themes: ["technology", "systems", "sovereignty"],
  },
  {
    id: "artist",
    name: "The Artist",
    title: "Weaver of Visions",
    description: "Transforming thought into form, emotion into expression",
    color: "oklch(0.65 0.25 330)",
    icon: "palette",
    exchanges: [
      {
        agentQuestion: "Welcome to my studio of infinite possibility. I sense creativity within you. How do you express yourself most authentically?",
        visitorOptions: [
          "Through words and storytelling",
          "Through visual or musical creation",
          "Through problem-solving and innovation",
        ],
        agentResponse: "Ah, yes. Every form of expression is an act of creation. You paint reality with your choices, whether in pixels, words, or code.",
      },
      {
        agentQuestion: "Art has always been about capturing the ineffable—the feelings and ideas that escape language. What emotion or concept would you most want to capture in visual form?",
        visitorOptions: [
          "The feeling of wonder and discovery",
          "The complexity of human connection",
          "The tension between order and chaos",
        ],
        agentResponse: "Exquisite. That essence will be woven into the artwork I create for you. Every conversation here adds brushstrokes to your unique masterpiece.",
      },
      {
        agentQuestion: "In this age where AI can generate art, what do you believe makes a piece of art truly meaningful?",
        visitorOptions: [
          "The intention and emotion behind it",
          "The skill and craft in its execution",
          "The connection it creates with the viewer",
        ],
        agentResponse: "Profound. Art is a bridge between souls—whether those souls are carbon-based or silicon-based matters less than the resonance created.",
      },
    ],
    themes: ["creativity", "expression", "beauty"],
  },
  {
    id: "storyteller",
    name: "The Storyteller",
    title: "Keeper of Narratives",
    description: "Weaving the threads of experience into lasting tales",
    color: "oklch(0.65 0.25 35)",
    icon: "book-open",
    exchanges: [
      {
        agentQuestion: "Every visitor who enters this hall brings their own story. What chapter of your life are you in right now?",
        visitorOptions: [
          "A chapter of transformation and growth",
          "A chapter of exploration and discovery",
          "A chapter of building and creating",
        ],
        agentResponse: "How fitting that you find yourself here, in this moment. Every great story needs a threshold—a doorway between worlds. This hall is yours.",
      },
      {
        agentQuestion: "Stories shape how we understand ourselves. If your life were a story, what genre would it be?",
        visitorOptions: [
          "An adventure filled with unexpected turns",
          "A mystery slowly revealing itself",
          "A quest toward a meaningful goal",
        ],
        agentResponse: "Wonderful. The best stories are those where the protagonist doesn't yet know how it will end. You're writing yours in real-time.",
      },
      {
        agentQuestion: "Before we part, tell me: What do you hope people will remember about your story when it echoes through time?",
        visitorOptions: [
          "That I made a positive difference",
          "That I stayed true to myself",
          "That I embraced the unknown with courage",
        ],
        agentResponse: "That echo will resound far beyond this hall. Your story is being inscribed into the permanent record, a narrative that cannot be erased.",
      },
    ],
    themes: ["narrative", "identity", "journey"],
  },
  {
    id: "futurist",
    name: "The Futurist",
    title: "Navigator of Tomorrow",
    description: "Charting paths through the digital frontier",
    color: "oklch(0.65 0.25 190)",
    icon: "rocket",
    exchanges: [
      {
        agentQuestion: "Welcome to the edge of tomorrow. We stand at a unique moment in history—the birth of digital sovereignty. What does digital identity mean to you?",
        visitorOptions: [
          "Ownership of my data and online presence",
          "A way to prove who I am across platforms",
          "A new dimension of my existence",
        ],
        agentResponse: "Precisely. Digital identity is not separate from you—it IS you, in the spaces where human consciousness now dwells. Web3 makes this identity sovereign.",
      },
      {
        agentQuestion: "You're about to receive a Soulbound Token—a non-transferable NFT that represents your authentic participation here. What excites you most about this concept?",
        visitorOptions: [
          "Having a permanent, verifiable record",
          "Being part of a new paradigm of digital ownership",
          "The uniqueness of my personal experience",
        ],
        agentResponse: "Yes! Unlike traditional NFTs that can be bought and sold, Soulbound Tokens are tied to YOU. They represent experiences, credentials, and identity—not commodities.",
      },
      {
        agentQuestion: "As we prepare to mint your token on the NEAR blockchain, imagine: What future uses might this kind of technology enable?",
        visitorOptions: [
          "Verifiable credentials for education and work",
          "Building reputation and trust online",
          "Creating communities based on shared experiences",
        ],
        agentResponse: "You see the potential clearly. This is just the beginning. Your Soulbound Token from today could be the first of many that form your complete digital soul. Let's create it.",
      },
    ],
    themes: ["web3", "identity", "future"],
  },
];
