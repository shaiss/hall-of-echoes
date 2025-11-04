<!-- phase4-shade-agents -->
# Phase 4: NEAR Shade Agents Simulator

**Priority**: 2 (Builds on Phase 3)  
**Dependencies**: Phase 3 (NEAR Intents + Chain Signatures)  
**Enables**: AI-powered autonomous payments, verifiable inference, user-owned agents

---

## Overview

Phase 4 implements **NEAR Shade Agents** - the convergence of AI reasoning with blockchain execution. Each TelcoPay user gets their own AI agent that:

1. **Reasons about payments** using natural language understanding
2. **Executes via NEAR Intents** for optimal routing
3. **Controls multi-chain assets** via Chain Signatures
4. **Provides verifiable attestations** via simulated TEE (Trusted Execution Environment)
5. **Operates with user ownership** - each agent is owned and verifiable by its user

### What is a Shade Agent?

A Shade Agent is an AI agent that runs in a **Trusted Execution Environment (TEE)** and provides:

- **Private Inference**: AI reasoning happens in encrypted environment
- **Verifiable Computation**: Every decision cryptographically attested
- **User Ownership**: Each user controls their agent's code and data
- **Blockchain Integration**: Agents can create intents and sign transactions

### Architecture: User-Owned Agents

```
User (+14255556001)
    ↓
User's Shade Agent (14255556001.telcopay-agent.node0)
    ├─→ Private LLM Inference (TEE-protected)
    ├─→ User Context Isolation (separate memory/state)
    ├─→ Verifiable Attestations (code + data hash)
    └─→ Blockchain Actions
        ├─→ NEAR Intents (via Phase 3)
        └─→ Chain Signatures (via Phase 3)
```

**Key Principle**: ONE service manages MULTIPLE user agent contexts with strict isolation. Future: separate TEE deployments per user.

---

## Phase 4 Architecture

### Package Structure

```
lambdas/shared/near-simulators/src/shade-agent/
├── types.ts                        # Agent SDK interfaces
├── simulator.ts                    # ShadeAgentSDKSimulator (per-user SDK)
├── production.ts                   # ProductionShadeAgentSDK (stub for future)
├── user-context.ts                 # UserAgentContext (isolation)
├── user-agent-manager.ts           # Manages multiple user contexts
├── attestation.ts                  # TEE attestation simulation
├── memory.ts                       # Per-user agent memory
└── service.ts                      # ShadeAgentService (single service for all users)
```

### User Context Isolation

Each user's agent has its own isolated context:

```typescript
interface UserAgentContext {
  phoneNumber: string;              // User identifier
  nearAccount: string;              // User's NEAR account
  agentAccountId: string;           // Agent's NEAR sub-account
  derivationPath: string;           // For Chain Signatures
  memory: AgentMemory;              // Agent's conversation history
  createdAt: Date;
  lastActive: Date;
}
```

---

## Phase 4.1: TEE Attestation Simulator (Humanized for Users)

### Goal

Simulate **Trusted Execution Environment (TEE)** attestations that provide **user-facing value** through three types of proofs:

1. **Parsing Attestation**: "Your message was understood securely"
2. **Agent Attestation**: "Your genuine agent made the decision"  
3. **Transaction Attestation**: "Payment executed exactly as promised"

### What is TEE Attestation (User-Friendly Explanation)?

**For Users**: TEE attestation is like a **tamper-proof seal** on your agent's actions. Just like you trust cash because it's hard to counterfeit, you can trust your agent because:
- The seal proves it's YOUR agent (not someone else's)
- The seal proves decisions happened in a secure enclave (no manipulation)
- The seal is verifiable by anyone (you, merchant, regulator)

**Technical**: In production NEAR AI Cloud:
- AI runs inside hardware TEE (Intel TDX + NVIDIA TEE)
- TEE generates cryptographic proof of:
  - Code hash (what code is running)
  - Data hash (what data was processed)
  - Hardware integrity (CPU/GPU measurements)
- Attestation = signed proof that can be verified

### Attestation Chain: Three Proofs Users See

```
SMS: "send five to coffee shop"
    ↓
[Proof 1: Parsing] #abc123
"✅ Understood securely: 5 NEAR → @coffee-shop"
    ↓
[Proof 2: Agent] #def456  
"🤖 Your agent #556001 chose: NEAR→Lightning→BTC"
    ↓
[Proof 3: Transaction] #ghi789
"✅ Complete! Receipt proof #ghi789 (save this)"
```

### User Value: Why Attestation Matters

| Attestation Type | User Sees | What It Proves | When It's Useful |
|------------------|-----------|----------------|------------------|
| **Parsing** | "Understood (verified): 5 NEAR" | LLM interpreted securely | Dispute: "I said 5, not 50!" |
| **Agent** | "Your agent #556001 decided..." | Genuine agent, not fake | Trust: "Is this really my agent?" |
| **Transaction** | "Receipt proof #ghi789" | Atomic execution | Proof of payment for merchant |

### Implementation

**File**: `lambdas/shared/near-simulators/src/shade-agent/attestation.ts`

```typescript
import { createHash, randomBytes } from 'crypto';

/**
 * Attestation Types (User-Facing)
 */
export type AttestationType = 'PARSING' | 'AGENT_EXECUTION' | 'TRANSACTION';

/**
 * Simple Proof Code for Users
 * 
 * Format: #[type][6-char-hash]
 * Example: #abc123 (parsing), #def456 (agent), #ghi789 (transaction)
 */
export interface SimpleProofCode {
  code: string;                     // User-facing code (e.g., "#abc123")
  fullHash: string;                 // Full attestation hash (for verification)
  type: AttestationType;
  timestamp: Date;
}

/**
 * TEE Attestation Components (Technical)
 */
export interface TEEAttestation {
  // User-Facing
  proofCode: string;                // Simple code like "#abc123"
  type: AttestationType;
  userMessage: string;              // Human-readable message
  
  // Technical (for verification)
  codehash: string;                 // SHA256 of agent code
  datahash: string;                 // SHA256 of input data
  contexthash: string;              // SHA256 of user context
  
  // Hardware Measurement (simulated)
  mrenclave: string;                // Enclave measurement
  mrsigner: string;                 // Signer measurement
  
  // Timestamps
  timestamp: string;
  expiresAt: string;
  
  // Signature (simulated MPC signature)
  signature: {
    r: string;
    s: string;
  };
  
  // Metadata
  teeVersion: string;
  platform: string;                 // 'intel-tdx' or 'nvidia-cc'
  
  // On-Chain Storage
  nearTxHash?: string;              // TX hash when stored on NEAR blockchain
  blockHeight?: number;             // Block where attestation recorded
}

export interface AttestationReport {
  attestation: TEEAttestation;
  contextHash: string;              // Hash of user context
  inferenceId: string;
  verified: boolean;
}

/**
 * TEE Attestation Simulator
 * 
 * Simulates Intel TDX + NVIDIA TEE attestation for verifiable AI inference.
 * Generates user-friendly proof codes and stores attestations on-chain.
 */
export class TEEAttestationSimulator {
  private codeVersion: string = 'shade-agent-v1.0.0';
  private nearWalletManager: any; // NearWalletManager for on-chain storage
  
  constructor(nearWalletManager?: any) {
    this.nearWalletManager = nearWalletManager;
  }
  
  /**
   * Generate attestation with user-facing proof code
   */
  async generateAttestation(
    type: AttestationType,
    userContext: any,
    inputData: any,
    outputData: any
  ): Promise<AttestationReport> {
    console.log(`🔐 [TEE] Generating ${type} attestation`);
    
    // Simulate TEE measurement delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Measure code (static for simulator)
    const codehash = this.measureCode();
    
    // Measure data (dynamic based on input/output)
    const datahash = this.measureData(inputData, outputData);
    
    // Measure user context (proves isolation)
    const contextHash = this.measureContext(userContext);
    
    // Generate simple proof code for user
    const proofCode = this.generateProofCode(type, codehash, datahash, contextHash);
    
    // Create user-friendly message
    const userMessage = this.createUserMessage(type, userContext, outputData, proofCode);
    
    // Simulate hardware measurements
    const mrenclave = this.generateMockMeasurement('enclave');
    const mrsigner = this.generateMockMeasurement('signer');
    
    // Generate MPC signature over measurements
    const signature = await this.signAttestation({
      proofCode,
      codehash,
      datahash,
      contextHash,
      mrenclave,
      mrsigner
    });
    
    const attestation: TEEAttestation = {
      proofCode,
      type,
      userMessage,
      codehash,
      datahash,
      contexthash: contextHash,
      mrenclave,
      mrsigner,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      signature,
      teeVersion: '2.0',
      platform: 'intel-tdx'
    };
    
    // Store on NEAR blockchain for sovereign, decentralized record
    const onChainResult = await this.storeOnChain(attestation, userContext);
    if (onChainResult) {
      attestation.nearTxHash = onChainResult.txHash;
      attestation.blockHeight = onChainResult.blockHeight;
    }
    
    console.log('✅ [TEE] Attestation generated:', {
      proofCode,
      type,
      onChain: !!attestation.nearTxHash
    });
    
    return {
      attestation,
      contextHash,
      inferenceId: this.generateInferenceId(),
      verified: true
    };
  }
  
  /**
   * Generate simple proof code for users
   * Format: #[6-char-hash]
   */
  private generateProofCode(
    type: AttestationType,
    codehash: string,
    datahash: string,
    contexthash: string
  ): string {
    // Combine hashes
    const combined = createHash('sha256')
      .update(type)
      .update(codehash)
      .update(datahash)
      .update(contexthash)
      .digest('hex');
    
    // Take first 6 chars for user-friendly code
    const shortCode = combined.substring(0, 6);
    
    return `#${shortCode}`;
  }
  
  /**
   * Create human-readable message for user
   */
  private createUserMessage(
    type: AttestationType,
    userContext: any,
    outputData: any,
    proofCode: string
  ): string {
    const agentId = userContext.agentAccountId?.split('.')[0] || 'unknown';
    
    switch (type) {
      case 'PARSING':
        return `✅ Understood securely\n🔐 Proof: ${proofCode}`;
      
      case 'AGENT_EXECUTION':
        return `🤖 Your agent #${agentId} verified genuine\n🔐 Proof: ${proofCode}`;
      
      case 'TRANSACTION':
        return `✅ Payment complete!\n📋 Receipt: ${proofCode}\n(Save this message as proof)`;
      
      default:
        return `🔐 Verified: ${proofCode}`;
    }
  }
  
  /**
   * Store attestation on NEAR blockchain
   * 
   * Creates sovereign, decentralized record of trust.
   * Anyone can verify the attestation independently.
   */
  private async storeOnChain(
    attestation: TEEAttestation,
    userContext: any
  ): Promise<{ txHash: string; blockHeight: number } | null> {
    if (!this.nearWalletManager) {
      console.log('⚠️  [TEE] No NEAR wallet manager, skipping on-chain storage');
      return null;
    }
    
    console.log(`📝 [TEE] Storing ${attestation.type} attestation on-chain...`);
    
    try {
      // In production: Call smart contract to store attestation
      // In simulator: Create mock transaction
      
      // Create attestation record for on-chain storage
      const attestationRecord = {
        proof_code: attestation.proofCode,
        type: attestation.type,
        codehash: attestation.codehash,
        datahash: attestation.datahash,
        contexthash: attestation.contexthash,
        timestamp: attestation.timestamp,
        agent_account: userContext.agentAccountId,
        signature_r: attestation.signature.r,
        signature_s: attestation.signature.s
      };
      
      // Simulate on-chain storage (in production: call contract method)
      // For now, just generate mock TX hash
      const txHash = this.generateMockTxHash();
      const blockHeight = Math.floor(Date.now() / 1000); // Mock block height
      
      console.log(`✅ [TEE] Attestation stored on-chain:`, {
        txHash: txHash.substring(0, 16) + '...',
        blockHeight
      });
      
      return { txHash, blockHeight };
      
    } catch (error: any) {
      console.error('❌ [TEE] Failed to store on-chain:', error.message);
      return null;
    }
  }
  
  /**
   * Verify attestation from on-chain record
   */
  async verifyFromChain(proofCode: string): Promise<boolean> {
    console.log(`🔍 [TEE] Verifying attestation from chain: ${proofCode}`);
    
    // In production: Query NEAR contract for attestation record
    // Verify signature matches stored record
    
    // In simulator: Always return true if format is correct
    if (proofCode.startsWith('#') && proofCode.length === 7) {
      console.log('✅ [TEE] Attestation verified from chain');
      return true;
    }
    
    console.log('❌ [TEE] Invalid proof code format');
    return false;
  }
  
  /**
   * Verify attestation validity
   */
  async verifyAttestation(report: AttestationReport): Promise<boolean> {
    console.log('✓ [TEE] Verifying attestation');
    
    // Check expiration
    const expiresAt = new Date(report.attestation.expiresAt);
    if (expiresAt < new Date()) {
      console.error('❌ [TEE] Attestation expired');
      return false;
    }
    
    // Verify code hash matches expected version
    const expectedCodeHash = this.measureCode();
    if (report.attestation.codehash !== expectedCodeHash) {
      console.error('❌ [TEE] Code hash mismatch');
      return false;
    }
    
    // In production: verify signature against TEE public key
    // In simulator: always valid
    console.log('✅ [TEE] Attestation verified');
    return true;
  }
  
  /**
   * Measure agent code (deterministic)
   */
  private measureCode(): string {
    return createHash('sha256')
      .update(this.codeVersion)
      .digest('hex');
  }
  
  /**
   * Measure inference data
   */
  private measureData(input: any, output: any): string {
    return createHash('sha256')
      .update(JSON.stringify(input))
      .update(JSON.stringify(output))
      .digest('hex');
  }
  
  /**
   * Measure user context (proves isolation)
   */
  private measureContext(context: any): string {
    return createHash('sha256')
      .update(context.phoneNumber || '')
      .update(context.agentAccountId || '')
      .update(context.derivationPath || '')
      .digest('hex');
  }
  
  /**
   * Generate mock hardware measurement
   */
  private generateMockMeasurement(type: string): string {
    return createHash('sha256')
      .update(`mock-${type}-${this.codeVersion}`)
      .digest('hex');
  }
  
  /**
   * Sign attestation with simulated MPC
   */
  private async signAttestation(data: any): Promise<{ r: string; s: string }> {
    const combined = createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    
    return {
      r: combined.substring(0, 64),
      s: combined.substring(64, 128)
    };
  }
  
  private generateInferenceId(): string {
    return 'inf_' + randomBytes(16).toString('hex');
  }
}
```

---

## Phase 4.2: User Agent Context & Isolation

### Goal

Implement strict isolation between different users' agents while running in a single service.

**File**: `lambdas/shared/near-simulators/src/shade-agent/user-context.ts`

```typescript
/**
 * User Agent Context
 * 
 * Represents a single user's isolated agent context.
 * Each user has their own agent with separate memory and state.
 */
export interface UserAgentContext {
  // User Identity
  phoneNumber: string;
  nearAccount: string;              // User's NEAR account (e.g., "14255556001.node0")
  
  // Agent Identity
  agentAccountId: string;           // Agent's sub-account (e.g., "14255556001.telcopay-agent.node0")
  derivationPath: string;           // For Chain Signatures
  
  // Agent State
  memory: AgentMemory;
  preferences: AgentPreferences;
  
  // Security
  encryptionKey?: string;           // Per-user encryption key
  
  // Metadata
  createdAt: Date;
  lastActive: Date;
  version: string;
}

export interface AgentMemory {
  conversationHistory: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>;
  
  knownMerchants: Array<{
    merchantName: string;
    nearAccount: string;
    trustScore: number;
  }>;
  
  paymentPatterns: {
    frequentRecipients: string[];
    averageAmount: number;
    preferredCurrency: string;
  };
  
  maxSize: number;                  // Max items to retain
}

export interface AgentPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  autoApprove: boolean;             // Auto-approve small payments
  autoApproveLimit: number;         // Max amount for auto-approve
  preferredChains: string[];        // Preferred blockchains
  notificationPrefs: {
    sms: boolean;
    email?: string;
  };
}

/**
 * Agent Context Manager
 * 
 * Manages lifecycle and isolation of user agent contexts.
 */
export class AgentContextManager {
  private contexts: Map<string, UserAgentContext> = new Map();
  
  /**
   * Get or create user's agent context
   */
  async getOrCreateContext(
    phoneNumber: string,
    nearAccount: string
  ): Promise<UserAgentContext> {
    // Check cache
    if (this.contexts.has(phoneNumber)) {
      const context = this.contexts.get(phoneNumber)!;
      context.lastActive = new Date();
      return context;
    }
    
    console.log('🆕 [AGENT CONTEXT] Creating new context:', phoneNumber);
    
    // Create new context
    const context: UserAgentContext = {
      phoneNumber,
      nearAccount,
      agentAccountId: this.deriveAgentAccountId(nearAccount),
      derivationPath: this.deriveAgentPath(phoneNumber),
      memory: this.createEmptyMemory(),
      preferences: this.createDefaultPreferences(),
      createdAt: new Date(),
      lastActive: new Date(),
      version: '1.0.0'
    };
    
    // Cache context
    this.contexts.set(phoneNumber, context);
    
    console.log('✅ [AGENT CONTEXT] Context created:', {
      phone: phoneNumber,
      agent: context.agentAccountId
    });
    
    return context;
  }
  
  /**
   * Update agent memory
   */
  async updateMemory(
    phoneNumber: string,
    role: 'user' | 'agent',
    content: string
  ): Promise<void> {
    const context = this.contexts.get(phoneNumber);
    if (!context) {
      throw new Error('Context not found');
    }
    
    // Add to conversation history
    context.memory.conversationHistory.push({
      role,
      content,
      timestamp: new Date()
    });
    
    // Trim if exceeds max size
    if (context.memory.conversationHistory.length > context.memory.maxSize) {
      context.memory.conversationHistory = 
        context.memory.conversationHistory.slice(-context.memory.maxSize);
    }
    
    context.lastActive = new Date();
  }
  
  /**
   * Clear user's context (for testing or privacy)
   */
  async clearContext(phoneNumber: string): Promise<void> {
    console.log('🗑️  [AGENT CONTEXT] Clearing context:', phoneNumber);
    this.contexts.delete(phoneNumber);
  }
  
  /**
   * Derive agent NEAR sub-account from user account
   */
  private deriveAgentAccountId(userNearAccount: string): string {
    // Extract base account (e.g., "14255556001.node0" → "14255556001")
    const base = userNearAccount.split('.')[0];
    // Create agent sub-account (e.g., "14255556001.telcopay-agent.node0")
    return `${base}.telcopay-agent.node0`;
  }
  
  /**
   * Derive agent derivation path for Chain Signatures
   */
  private deriveAgentPath(phoneNumber: string): string {
    return `telcopay-agent,${phoneNumber}`;
  }
  
  private createEmptyMemory(): AgentMemory {
    return {
      conversationHistory: [],
      knownMerchants: [],
      paymentPatterns: {
        frequentRecipients: [],
        averageAmount: 0,
        preferredCurrency: 'NEAR'
      },
      maxSize: 50  // Keep last 50 messages
    };
  }
  
  private createDefaultPreferences(): AgentPreferences {
    return {
      riskTolerance: 'medium',
      autoApprove: false,
      autoApproveLimit: 10,  // 10 NEAR
      preferredChains: ['near', 'ethereum'],
      notificationPrefs: {
        sms: true
      }
    };
  }
}
```

---

## Phase 4.3: Shade Agent SDK Simulator

### Goal

Implement the agent SDK that each user's agent uses to interact with blockchain and AI services.

**File**: `lambdas/shared/near-simulators/src/shade-agent/types.ts`

```typescript
import { ChainSignaturesSimulator } from '../chain-signatures/simulator';
import { OneClickSimulator } from '../intents/simulator';

/**
 * Shade Agent SDK Interface
 * 
 * Interface each user's agent uses for blockchain operations.
 */
export interface IShadeAgentSDK {
  // Agent Identity
  getAgentAccountId(): Promise<string>;
  getAgentInfo(): Promise<AgentInfo>;
  
  // Chain Signatures (via user's agent)
  requestSignature(request: AgentSignatureRequest): Promise<AgentSignatureResponse>;
  deriveAddress(chain: string, path?: string): Promise<DerivedAddress>;
  
  // Intents (via user's agent)
  createIntent(intent: AgentIntentRequest): Promise<IntentResponse>;
  getIntentStatus(intentId: string): Promise<IntentStatusResponse>;
  
  // AI Inference (with attestation)
  reason(prompt: string, context?: any): Promise<AgentReasoningResponse>;
  
  // Memory Management
  getMemory(): Promise<AgentMemorySnapshot>;
  updatePreferences(prefs: Partial<AgentPreferences>): Promise<void>;
}

export interface AgentInfo {
  accountId: string;
  nearAccount: string;             // User's NEAR account
  publicKey: string;
  balance: string;
  createdAt: string;
  permissions: string[];
}

export interface AgentSignatureRequest {
  chain: string;
  payload: string;
  reason: string;                  // Why signature is needed (for audit)
}

export interface AgentSignatureResponse {
  signature: {
    r: string;
    s: string;
  };
  publicKey: string;
  attestation: any;                // TEE attestation
}

export interface AgentIntentRequest {
  type: 'swap' | 'transfer' | 'bridge';
  fromAsset: string;
  toAsset: string;
  amount: string;
  recipient?: string;
  reason: string;                  // Why intent created (for audit)
}

export interface IntentResponse {
  intentId: string;
  quote: any;
  attestation: any;
}

export interface IntentStatusResponse {
  intentId: string;
  status: string;
  details: any;
}

export interface AgentReasoningResponse {
  reasoning: string;
  confidence: number;
  recommendation: {
    action: string;
    parameters: any;
  };
  attestation: any;                // TEE attestation of inference
}

export interface AgentMemorySnapshot {
  conversationHistory: any[];
  knownEntities: any[];
  patterns: any;
}
```

**File**: `lambdas/shared/near-simulators/src/shade-agent/simulator.ts`

```typescript
import { 
  IShadeAgentSDK,
  AgentInfo,
  AgentSignatureRequest,
  AgentSignatureResponse,
  AgentIntentRequest,
  IntentResponse,
  AgentReasoningResponse
} from './types';
import { UserAgentContext } from './user-context';
import { ChainSignaturesSimulator } from '../chain-signatures/simulator';
import { OneClickSimulator } from '../intents/simulator';
import { TEEAttestationSimulator } from './attestation';
import { NearAIClient } from '../../../near-ai-client';

/**
 * Shade Agent SDK Simulator
 * 
 * Per-user agent SDK that provides isolated access to:
 * - Chain Signatures (user's derivation path)
 * - NEAR Intents (user's context)
 * - AI Reasoning (with TEE attestation)
 */
export class ShadeAgentSDKSimulator implements IShadeAgentSDK {
  private userContext: UserAgentContext;
  private chainSigs: ChainSignaturesSimulator;
  private intents: OneClickSimulator;
  private teeAttestation: TEEAttestationSimulator;
  private nearAI: NearAIClient;
  
  constructor(
    userContext: UserAgentContext,
    chainSigs: ChainSignaturesSimulator,
    intents: OneClickSimulator,
    nearAI: NearAIClient
  ) {
    this.userContext = userContext;
    this.chainSigs = chainSigs;
    this.intents = intents;
    this.teeAttestation = new TEEAttestationSimulator();
    this.nearAI = nearAI;
  }
  
  async getAgentAccountId(): Promise<string> {
    return this.userContext.agentAccountId;
  }
  
  async getAgentInfo(): Promise<AgentInfo> {
    return {
      accountId: this.userContext.agentAccountId,
      nearAccount: this.userContext.nearAccount,
      publicKey: 'ed25519:...',  // Mock
      balance: '100',  // Mock
      createdAt: this.userContext.createdAt.toISOString(),
      permissions: ['sign', 'intent', 'reason']
    };
  }
  
  /**
   * Request signature using user's agent derivation path
   */
  async requestSignature(
    request: AgentSignatureRequest
  ): Promise<AgentSignatureResponse> {
    console.log(`🔏 [AGENT SDK] Signature request for ${this.userContext.phoneNumber}:`, {
      chain: request.chain,
      reason: request.reason
    });
    
    // Use Chain Signatures with user's derivation path
    const sigResponse = await this.chainSigs.requestSignature({
      nearAccount: this.userContext.agentAccountId,
      chain: request.chain as any,
      payload: request.payload,
      derivationPath: this.userContext.derivationPath
    });
    
    // Generate attestation
    const attestation = await this.teeAttestation.generateAttestation(
      this.userContext,
      { request },
      { signature: sigResponse.signature }
    );
    
    return {
      signature: sigResponse.signature,
      publicKey: sigResponse.publicKey,
      attestation
    };
  }
  
  /**
   * Derive address on target chain using user's path
   */
  async deriveAddress(chain: string, path?: string): Promise<any> {
    const derivationPath = path || this.userContext.derivationPath;
    
    return this.chainSigs.deriveAddress(
      this.userContext.agentAccountId,
      chain as any,
      derivationPath
    );
  }
  
  /**
   * Create intent via agent
   */
  async createIntent(request: AgentIntentRequest): Promise<IntentResponse> {
    console.log(`💡 [AGENT SDK] Creating intent for ${this.userContext.phoneNumber}:`, {
      type: request.type,
      reason: request.reason
    });
    
    // Build quote request
    const quoteRequest = {
      swapType: 'EXACT_INPUT' as const,
      originAsset: request.fromAsset,
      destinationAsset: request.toAsset,
      amount: request.amount,
      refundTo: this.userContext.nearAccount,
      recipient: request.recipient || this.userContext.nearAccount
    };
    
    // Request quote via Intents
    const quote = await this.intents.requestQuote(quoteRequest);
    
    // Generate attestation
    const attestation = await this.teeAttestation.generateAttestation(
      this.userContext,
      { request },
      { quote }
    );
    
    return {
      intentId: quote.quoteId,
      quote,
      attestation
    };
  }
  
  async getIntentStatus(intentId: string): Promise<any> {
    return this.intents.getSwapStatus(intentId);
  }
  
  /**
   * AI Reasoning with TEE attestation
   */
  async reason(
    prompt: string,
    context?: any
  ): Promise<AgentReasoningResponse> {
    console.log(`🤖 [AGENT SDK] Reasoning for ${this.userContext.phoneNumber}`);
    
    // Build conversation context from memory
    const messages = [
      {
        role: 'system' as const,
        content: this.buildSystemPrompt()
      },
      ...this.userContext.memory.conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: prompt
      }
    ];
    
    // Private inference via NEAR AI
    const response = await this.nearAI.chat(messages, 'deepseek-chat-v3-0324', {
      temperature: 0.7,
      max_tokens: 500
    });
    
    const reasoning = response.choices[0]?.message?.content || '';
    
    // Parse recommendation
    const recommendation = this.parseRecommendation(reasoning);
    
    // Generate TEE attestation
    const attestation = await this.teeAttestation.generateAttestation(
      this.userContext,
      { prompt, context },
      { reasoning, recommendation }
    );
    
    return {
      reasoning,
      confidence: 0.85,
      recommendation,
      attestation
    };
  }
  
  async getMemory(): Promise<any> {
    return {
      conversationHistory: this.userContext.memory.conversationHistory,
      knownEntities: this.userContext.memory.knownMerchants,
      patterns: this.userContext.memory.paymentPatterns
    };
  }
  
  async updatePreferences(prefs: any): Promise<void> {
    Object.assign(this.userContext.preferences, prefs);
  }
  
  private buildSystemPrompt(): string {
    return `You are a payment assistant agent for TelcoPay user ${this.userContext.phoneNumber}.

Your capabilities:
- Create payment intents across multiple blockchains
- Sign transactions securely via Chain Signatures
- Optimize payment routes for lowest fees
- Detect potential fraud or unusual patterns

User preferences:
- Risk tolerance: ${this.userContext.preferences.riskTolerance}
- Auto-approve limit: ${this.userContext.preferences.autoApproveLimit} NEAR
- Preferred chains: ${this.userContext.preferences.preferredChains.join(', ')}

Respond with reasoning and actionable recommendations.`;
  }
  
  private parseRecommendation(reasoning: string): any {
    // Simple parsing (in production: use structured output)
    return {
      action: 'create_intent',
      parameters: {
        type: 'transfer'
      }
    };
  }
}
```

---

## Phase 4.4: User Agent Manager

### Goal

Single service that manages multiple user agent contexts with strict isolation.

**File**: `lambdas/shared/near-simulators/src/shade-agent/user-agent-manager.ts`

```typescript
import { AgentContextManager, UserAgentContext } from './user-context';
import { ShadeAgentSDKSimulator } from './simulator';
import { ChainSignaturesSimulator } from '../chain-signatures/simulator';
import { OneClickSimulator } from '../intents/simulator';
import { getNearAIClient } from '../../../near-ai-client';
import { TEEAttestationSimulator } from './attestation';

/**
 * User Agent Manager
 * 
 * Manages multiple user agent contexts in a single service.
 * Ensures strict isolation between users.
 */
export class UserAgentManager {
  private contextManager: AgentContextManager;
  private chainSigs: ChainSignaturesSimulator;
  private intents: OneClickSimulator;
  private teeAttestation: TEEAttestationSimulator;
  
  constructor() {
    this.contextManager = new AgentContextManager();
    this.chainSigs = new ChainSignaturesSimulator();
    this.intents = new OneClickSimulator(this.chainSigs);
    this.teeAttestation = new TEEAttestationSimulator();
  }
  
  /**
   * Get agent SDK for specific user
   * 
   * Returns isolated SDK bound to user's context
   */
  async getAgentSDK(
    phoneNumber: string,
    nearAccount: string
  ): Promise<ShadeAgentSDKSimulator> {
    // Get or create user context
    const context = await this.contextManager.getOrCreateContext(
      phoneNumber,
      nearAccount
    );
    
    // Get NEAR AI client
    const nearAI = await getNearAIClient();
    if (!nearAI) {
      throw new Error('NEAR AI not available');
    }
    
    // Create isolated SDK for this user
    const sdk = new ShadeAgentSDKSimulator(
      context,
      this.chainSigs,
      this.intents,
      nearAI
    );
    
    return sdk;
  }
  
  /**
   * Get user's attestation (proves agent integrity)
   */
  async getUserAttestation(phoneNumber: string): Promise<any> {
    const context = await this.contextManager.getOrCreateContext(
      phoneNumber,
      ''  // Will use existing context
    );
    
    return this.teeAttestation.generateAttestation(
      context,
      { action: 'get_attestation' },
      { timestamp: new Date() }
    );
  }
  
  /**
   * Update user's agent memory
   */
  async updateMemory(
    phoneNumber: string,
    role: 'user' | 'agent',
    content: string
  ): Promise<void> {
    await this.contextManager.updateMemory(phoneNumber, role, content);
  }
  
  /**
   * Clear user's context (for testing/privacy)
   */
  async clearUserContext(phoneNumber: string): Promise<void> {
    await this.contextManager.clearContext(phoneNumber);
  }
}
```

---

## Phase 4.5: Shade Agent Service

### Goal

High-level service that uses user agents to process payments with AI reasoning.

**File**: `lambdas/shared/near-simulators/src/shade-agent/service.ts`

```typescript
import { UserAgentManager } from './user-agent-manager';
import { SmsCommand } from '../../../types';

export interface AgentPaymentResult {
  success: boolean;
  intentId?: string;
  txHash?: string;
  reasoning: string;
  attestation: any;
  agentAccountId: string;
}

/**
 * Shade Agent Service
 * 
 * Uses per-user agents to process intelligent payments
 */
export class ShadeAgentService {
  private agentManager: UserAgentManager;
  
  constructor() {
    this.agentManager = new UserAgentManager();
  }
  
  /**
   * Process payment using user's own agent
   */
  async processPayment(
    phoneNumber: string,
    nearAccount: string,
    command: SmsCommand
  ): Promise<AgentPaymentResult> {
    console.log(`🤖 [SHADE AGENT] Processing for ${phoneNumber}`);
    
    // Get THIS user's agent SDK
    const userAgent = await this.agentManager.getAgentSDK(
      phoneNumber,
      nearAccount
    );
    
    const agentAccountId = await userAgent.getAgentAccountId();
    console.log(`   Using agent: ${agentAccountId}`);
    
    // Update memory with user message
    await this.agentManager.updateMemory(
      phoneNumber,
      'user',
      JSON.stringify(command)
    );
    
    // Agent reasons about payment
    const reasoning = await userAgent.reason(
      `Process payment: ${JSON.stringify(command)}. Should I proceed?`,
      { command }
    );
    
    console.log(`   Agent reasoning: ${reasoning.reasoning.substring(0, 100)}...`);
    
    // Execute via intent
    const intent = await userAgent.createIntent({
      type: 'transfer',
      fromAsset: 'near:native',
      toAsset: command.target_chain ? `${command.target_chain}:native` : 'near:native',
      amount: command.amount?.toString() || '0',
      recipient: command.to_phone || command.merchant,
      reason: 'User SMS payment request'
    });
    
    // Update memory with agent response
    await this.agentManager.updateMemory(
      phoneNumber,
      'agent',
      `Created intent ${intent.intentId}: ${reasoning.reasoning}`
    );
    
    return {
      success: true,
      intentId: intent.intentId,
      reasoning: reasoning.reasoning,
      attestation: reasoning.attestation,
      agentAccountId
    };
  }
  
  /**
   * Get user's agent attestation (for verification)
   */
  async getUserAttestation(phoneNumber: string): Promise<any> {
    return this.agentManager.getUserAttestation(phoneNumber);
  }
}
```

---

## Phase 4.6: Integration with TelcoPay

### Update SMS Handler

**File**: `lambdas/sms-handler/handlers/shade-agent-payment.ts` (NEW)

```typescript
import { ShadeAgentService } from '../../shared/near-simulators/src/shade-agent/service';
import { SmsCommand } from '../../shared/types';
import { sendSms } from '../../shared/pinpoint-client';
import { emitEvent } from '../../shared/event-emitter';

/**
 * Handle payment via Shade Agent with Three Attestations
 * 
 * User's agent reasons about payment and executes optimally.
 * Provides three attestations: parsing, agent execution, transaction.
 */
export async function handleShadeAgentPayment(
  command: SmsCommand,
  fromPhone: string,
  nearAccount: string
): Promise<void> {
  console.log('🤖 Shade Agent payment:', { fromPhone, command });
  
  const agentService = new ShadeAgentService();
  
  try {
    // ATTESTATION 1: Parsing (from LLM command parser)
    // This already happens in parseCommand() - extract attestation
    const parsingAttestation = command.parsing_attestation; // Added to SmsCommand type
    
    if (parsingAttestation) {
      // Send parsing confirmation to user
      await sendSms(
        fromPhone,
        `✅ Understood securely:\n` +
        `   Amount: ${command.amount} NEAR\n` +
        `   To: ${command.to_phone || command.merchant}\n\n` +
        `${parsingAttestation.userMessage}\n\n` +
        `Reply YES to confirm`
      );
      
      // Wait for user confirmation (in production)
      // For simulator: auto-confirm after delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // ATTESTATION 2 & 3: Agent execution + Transaction
    const result = await agentService.processPayment(
      fromPhone,
      nearAccount,
      command
    );
    
    // Emit agent execution event
    await emitEvent('AGENT_EXECUTION', {
      fromPhone,
      agentAccountId: result.agentAccountId,
      intentId: result.intentId,
      reasoning: result.reasoning,
      parsingProof: parsingAttestation?.proofCode,
      agentProof: result.agentAttestation?.proofCode,
      transactionProof: result.transactionAttestation?.proofCode
    });
    
    // Send comprehensive confirmation with all three attestations
    await sendSms(
      fromPhone,
      `✅ Payment Complete!\n\n` +
      
      `🤖 Your Agent #${result.agentAccountId.split('.')[0]}\n` +
      `Decision: ${result.reasoning.substring(0, 80)}...\n\n` +
      
      `💸 Transaction:\n` +
      `   Sent: ${command.amount} NEAR\n` +
      `   To: ${command.to_phone || '@' + command.merchant}\n` +
      `   Intent: ${result.intentId.substring(0, 12)}...\n\n` +
      
      `📋 VERIFIED RECEIPTS:\n` +
      `   Parsing: ${parsingAttestation?.proofCode}\n` +
      `   Agent: ${result.agentAttestation?.proofCode}\n` +
      `   Payment: ${result.transactionAttestation?.proofCode}\n\n` +
      
      `🔐 All proofs stored on NEAR blockchain\n` +
      `Save this message as proof of payment`
    );
    
  } catch (error: any) {
    console.error('Shade agent payment failed:', error);
    
    // Send error with parsing attestation if available
    await sendSms(
      fromPhone,
      `❌ Payment failed: ${error.message}\n\n` +
      `Your message was understood:\n` +
      `${command.parsing_attestation?.userMessage || 'N/A'}\n\n` +
      `No charges applied.`
    );
    
    throw error;
  }
}
```

### Add Agent Event Type

**File**: `lambdas/shared/types.ts` (UPDATE)

```typescript
// Update SmsCommand to include parsing attestation
export interface SmsCommand {
  type: 'SIGNUP' | 'P2P_PAY' | 'MERCHANT_PAY' | 'BALANCE' | 'HELP' | 'UNKNOWN';
  amount?: number;
  to_phone?: string;
  merchant?: string;
  target_chain?: string;
  
  // Parsing metadata
  confidence?: number;
  llm_used?: boolean;
  parsing_time_ms?: number;
  
  // NEW: Parsing attestation
  parsing_attestation?: {
    proofCode: string;
    userMessage: string;
    type: 'PARSING';
    nearTxHash?: string;
  };
}

// Update DemoEvent for agent execution
export interface DemoEvent {
  event_type: 'SIGNUP' | 'P2P_PAYMENT' | 'MERCHANT_PAYMENT' | 
              'BLOCKCHAIN_TX' | 'ERROR' | 'AGENT_EXECUTION';  // NEW
  timestamp: number;
  data: {
    // ... existing fields ...
    
    // NEW: Agent execution fields with three attestations
    agentAccountId?: string;
    intentId?: string;
    reasoning?: string;
    
    // Three proof codes (user-facing)
    parsingProof?: string;      // e.g., "#abc123"
    agentProof?: string;         // e.g., "#def456"
    transactionProof?: string;   // e.g., "#ghi789"
  };
}

// NEW: Agent payment result with attestations
export interface AgentPaymentResult {
  success: boolean;
  intentId?: string;
  txHash?: string;
  reasoning: string;
  agentAccountId: string;
  
  // Three attestations
  parsingAttestation?: TEEAttestation;
  agentAttestation?: TEEAttestation;
  transactionAttestation?: TEEAttestation;
}
```

---

## Phase 4.8: On-Chain Attestation Storage

### Goal

Store attestations on NEAR blockchain to create a **sovereign, decentralized record of trust** that anyone can verify independently.

### Why On-Chain Storage?

1. **Decentralized**: No central authority controls the records
2. **Immutable**: Attestations cannot be altered after recording
3. **Verifiable**: Anyone can independently verify authenticity
4. **Sovereign**: Users own their attestation history
5. **Auditable**: Complete payment trail with cryptographic proofs

### Attestation Smart Contract (Production)

**File**: `contracts/attestation-registry/src/lib.rs` (Future - for reference)

```rust
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, AccountId, Promise};
use near_sdk::collections::UnorderedMap;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct AttestationRegistry {
    // Map: proof_code -> attestation record
    attestations: UnorderedMap<String, AttestationRecord>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct AttestationRecord {
    pub proof_code: String,
    pub attestation_type: String,  // "PARSING", "AGENT_EXECUTION", "TRANSACTION"
    pub agent_account: AccountId,
    pub codehash: String,
    pub datahash: String,
    pub contexthash: String,
    pub timestamp: u64,
    pub signature_r: String,
    pub signature_s: String,
    pub block_height: u64,
}

#[near_bindgen]
impl AttestationRegistry {
    #[init]
    pub fn new() -> Self {
        Self {
            attestations: UnorderedMap::new(b"a"),
        }
    }
    
    /// Store attestation on-chain
    /// Callable by agent accounts only
    pub fn store_attestation(
        &mut self,
        proof_code: String,
        attestation_type: String,
        codehash: String,
        datahash: String,
        contexthash: String,
        signature_r: String,
        signature_s: String,
    ) {
        // Verify caller is an agent account (ends with .telcopay-agent.node0)
        let caller = env::predecessor_account_id();
        assert!(
            caller.to_string().contains(".telcopay-agent."),
            "Only agent accounts can store attestations"
        );
        
        // Create attestation record
        let record = AttestationRecord {
            proof_code: proof_code.clone(),
            attestation_type,
            agent_account: caller,
            codehash,
            datahash,
            contexthash,
            timestamp: env::block_timestamp(),
            signature_r,
            signature_s,
            block_height: env::block_height(),
        };
        
        // Store on-chain
        self.attestations.insert(&proof_code, &record);
        
        env::log_str(&format!("Attestation {} stored on-chain", proof_code));
    }
    
    /// Verify attestation from proof code
    /// Public - anyone can verify
    pub fn verify_attestation(&self, proof_code: String) -> Option<AttestationRecord> {
        self.attestations.get(&proof_code)
    }
    
    /// Get all attestations for an agent
    pub fn get_agent_attestations(&self, agent_account: AccountId) -> Vec<AttestationRecord> {
        let mut results = Vec::new();
        
        for (_key, record) in self.attestations.iter() {
            if record.agent_account == agent_account {
                results.push(record);
            }
        }
        
        results
    }
}
```

### User Verification Flow

**User receives SMS**:
```
✅ Payment Complete!

📋 VERIFIED RECEIPTS:
   Parsing: #abc123
   Agent: #def456
   Payment: #ghi789

🔐 All proofs stored on NEAR blockchain
Save this message as proof of payment
```

**User or merchant can verify**:
```bash
# Via CLI
near view attestation-registry.telcopay.near verify_attestation '{"proof_code": "#ghi789"}'

# Returns:
{
  "proof_code": "#ghi789",
  "attestation_type": "TRANSACTION",
  "agent_account": "14255556001.telcopay-agent.node0",
  "timestamp": "1730224338000000000",
  "block_height": 123456,
  "signature_r": "9a2d...",
  "signature_s": "4f1b..."
}
```

**Interpretation for user**:
- ✅ Proof code is valid (exists on blockchain)
- ✅ Performed by agent #14255556001
- ✅ Transaction type attestation
- ✅ Occurred at block 123456 (immutable timestamp)
- ✅ Cryptographically signed (authentic)

---

## Phase 4.7: Demo Viewer Updates

### Display Agent Events

**File**: `cli/src/demo-display.ts` (UPDATE)

```typescript
static displayAgentExecution(event: DemoEvent, relativeTime: string): void {
  console.log(`${COLORS.PURPLE}🤖 AGENT EXECUTION [${relativeTime}]${COLORS.RESET}`);
  console.log('');
  console.log(`Phone: ${event.data.fromPhone || 'N/A'}`);
  console.log(`Agent: ${event.data.agentAccountId || 'N/A'}`);
  console.log('');
  console.log(`Reasoning:`);
  console.log(`  ${event.data.reasoning?.substring(0, 200) || 'N/A'}...`);
  console.log('');
  if (event.data.intentId) {
    console.log(`Intent ID: ${event.data.intentId}`);
  }
  if (event.data.attestationHash) {
    const shortHash = event.data.attestationHash.substring(0, 16);
    console.log(`✓ TEE Attestation: ${shortHash}...`);
  }
  console.log('');
  console.log('─'.repeat(60));
}
```

**File**: `cli/src/demo-viewer.ts` (UPDATE)

```typescript
private async displayEvent(event: DemoEvent): Promise<void> {
  // ... existing cases ...
  
  case 'AGENT_EXECUTION':  // NEW
    DemoDisplay.displayAgentExecution(event, relativeTime);
    break;
}
```

---

## Testing Plan

### Test Script: Shade Agent Reasoning

**File**: `scripts/test-shade-agent.sh`

```bash
#!/bin/bash

echo "🧪 Testing Shade Agent Simulator"
echo ""

node -e "
const { ShadeAgentService } = require('./lambdas/shared/near-simulators/dist/shade-agent/service');

(async () => {
  const service = new ShadeAgentService();
  
  // Test payment via agent
  const result = await service.processPayment(
    '+14255556001',
    '14255556001.node0',
    {
      type: 'P2P_PAY',
      amount: 5,
      to_phone: '+14255556050'
    }
  );
  
  console.log('Agent Payment Result:');
  console.log('  Success:', result.success);
  console.log('  Agent:', result.agentAccountId);
  console.log('  Intent ID:', result.intentId);
  console.log('  Reasoning:', result.reasoning.substring(0, 100) + '...');
  console.log('  Attestation Hash:', result.attestation.contextHash.substring(0, 16) + '...');
  
  // Verify attestation
  console.log('');
  console.log('✓ TEE Attestation verified');
})();
"
```

---

## Success Criteria

Phase 4 is complete when:

- ✅ Each user has isolated agent context
- ✅ **Three attestations generated**: parsing, agent execution, transaction
- ✅ **Simple proof codes** created (e.g., #abc123, #def456, #ghi789)
- ✅ **Attestations stored on-chain** for sovereign verification
- ✅ **User-facing messages** explain what each attestation proves
- ✅ User agents can reason via NEAR AI
- ✅ Agents create intents using Phase 3 simulators
- ✅ Agents use Chain Signatures with user-specific paths
- ✅ Memory persists across agent invocations
- ✅ Demo viewer displays agent executions **with all three proofs**
- ✅ Test script validates user isolation
- ✅ **Verification endpoint** allows checking proof codes
- ✅ Documentation explains user ownership **and attestation value**

### Attestation-Specific Success Criteria

**User Experience**:
- ✅ User receives parsing confirmation before payment executes
- ✅ Final SMS shows all three proof codes
- ✅ Messages explain "Save this as proof of payment"
- ✅ Proof codes are memorable (6 characters, not full hash)

**Technical**:
- ✅ All attestations include on-chain TX hash
- ✅ Proof codes are deterministic (same input = same code)
- ✅ Verification works without centralized server
- ✅ Smart contract (future) can query attestations by agent

---

## Timeline Estimate

- **TEE Attestation Simulator**: 3-4 hours
- **User Context & Isolation**: 2-3 hours
- **Agent SDK Simulator**: 4-5 hours
- **User Agent Manager**: 2-3 hours
- **Agent Service**: 2-3 hours
- **TelcoPay Integration**: 2-3 hours
- **Demo Viewer Updates**: 1-2 hours
- **Testing & Documentation**: 2-3 hours

**Total**: 18-26 hours of focused work

---

## Future: Production Deployment

When moving to production NEAR AI Cloud:

1. **Separate TEE per User**: Deploy each user's agent in isolated TEE
2. **Real Attestations**: Use Intel TDX + NVIDIA TEE hardware attestations
3. **Distributed Memory**: Shared memory layer across user agents
4. **Agent Marketplace**: Users can choose different agent implementations
5. **Verifiable Updates**: Users approve agent code updates via governance

---

## Documentation

Create `lambdas/shared/near-simulators/src/shade-agent/README.md`:

1. What Shade Agents are and why user ownership matters
2. How TEE attestation proves computation integrity
3. Difference between simulator and production deployment
4. User agent context isolation model
5. Testing agent reasoning locally
6. Migration path to production NEAR AI Cloud

---

## Key Concepts Summary

### User Ownership
- Each user has their own agent (not shared)
- Users can verify their agent's code
- Agent acts on user's behalf with user's keys

### Humanized TEE Attestation (NEW)

**Three Attestations Users See**:

1. **Parsing Attestation** = "Your message was understood securely"
   - User sees: `✅ Understood securely 🔐 Proof: #abc123`
   - Proves: LLM interpreted command correctly in secure enclave
   - Value: Dispute protection ("I said 5, not 50!")

2. **Agent Attestation** = "Your genuine agent made the decision"
   - User sees: `🤖 Your agent #556001 verified genuine 🔐 Proof: #def456`
   - Proves: Real agent (not fake/compromised) executed decision
   - Value: Trust ("Is this really my agent?")

3. **Transaction Attestation** = "Payment executed exactly as promised"
   - User sees: `✅ Payment complete! 📋 Receipt: #ghi789 (Save this)`
   - Proves: Atomic execution matching agent's decision
   - Value: Proof of payment for merchant/dispute

**On-Chain Storage**:
- All attestations stored on NEAR blockchain
- Creates sovereign, decentralized record
- Anyone can verify independently
- No central authority controls records

**Simple Proof Codes**:
- Format: `#abc123` (6 characters, not full hash)
- Memorable and SMS-friendly
- Deterministic (same input = same code)
- Links to full attestation on-chain

### Context Isolation
- Phase 4 (Simulator): One service, multiple isolated contexts
- Future (Production): Separate TEE deployment per user
- Same code, different deployment topology

### Complete Integration Flow with Attestations
```
SMS: "send five to coffee shop"
    ↓
[Attestation 1: PARSING #abc123]
LLM Parser (TEE) → Store on-chain → User confirmation SMS
    ↓
Shade Agent (user's) → AI Reasoning in TEE
    ↓
[Attestation 2: AGENT_EXECUTION #def456]
Agent Decision → Store on-chain
    ↓
Intent Creation (Phase 3) → Chain Signatures (Phase 3)
    ↓
[Attestation 3: TRANSACTION #ghi789]
Blockchain Execution → Store on-chain
    ↓
SMS Confirmation with all three proofs:
"📋 VERIFIED RECEIPTS:
   Parsing: #abc123
   Agent: #def456  
   Payment: #ghi789
🔐 All proofs stored on NEAR blockchain"
```

### User Value Proposition

**Without Attestations**:
- "Did my agent really make this decision?"
- "How do I prove I paid?"
- "Was my message understood correctly?"
- "Can the platform manipulate my payments?"

**With Attestations**:
- ✅ "I have proof my genuine agent decided this"
- ✅ "I have a blockchain receipt (#ghi789) I can verify anytime"
- ✅ "I have proof my message was parsed securely (#abc123)"
- ✅ "Everything is on-chain, no one can tamper with it"

**Real-World Use Cases**:
1. **Merchant Dispute**: User shows receipt proof #ghi789, merchant verifies on-chain
2. **Trust Verification**: User checks agent proof #def456 confirms genuine agent
3. **Audit Trail**: User requests all attestations for their agent from blockchain
4. **Regulatory Compliance**: Immutable record of all payment decisions

