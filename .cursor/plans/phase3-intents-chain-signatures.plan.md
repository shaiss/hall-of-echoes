<!-- phase3-intents-chain-signatures -->
# Phase 3: NEAR Intents + Chain Signatures Simulator

**Priority**: 1 (Foundation for Phase 4)  
**Dependencies**: Phase 2 (NEAR blockchain integration, LLM parsing)  
**Enables**: Cross-chain payments, intent-based settlements, multi-chain account control

---

## Overview

Phase 3 implements **NEAR Intents Protocol** and **Chain Signatures (MPC)** simulators that work together to enable:

1. **Intent-Based Transactions**: Users declare desired outcomes, solver networks optimize execution
2. **Cross-Chain Account Control**: Single NEAR account controls Bitcoin, Ethereum, etc.
3. **Atomic Swaps**: Cross-chain token swaps without wrapped assets
4. **Multi-Chain Payments**: Pay in one currency, merchant receives another

### Why These Go Together

NEAR Intents **requires** Chain Signatures to execute cross-chain operations. When a user creates an intent like "swap NEAR for ETH on Ethereum," the solver network uses Chain Signatures to:
1. Sign deposit transaction on NEAR
2. Sign withdrawal transaction on Ethereum
3. Coordinate atomic execution across chains

---

## Architecture

### System Flow

```
SMS Command ("PAY 10 @merchant in BTC")
    ↓
LLM Parser → Extract intent
    ↓
Intent Builder → Create NEAR Intent structure
    ↓
Intents Simulator (1Click API)
    ├─→ Request Quote (find best execution path)
    ├─→ Chain Signatures Simulator (sign cross-chain TXs)
    └─→ Execute swap/transfer
    ↓
Blockchain confirmation + SMS notification
```

### Package Structure

```
lambdas/shared/near-simulators/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                    # Main exports
│   ├── config.ts                   # Environment-based config
│   ├── factory.ts                  # Create simulator or production clients
│   │
│   ├── intents/
│   │   ├── types.ts                # 1Click API types (QuoteRequest, SwapStatus, etc.)
│   │   ├── simulator.ts            # OneClickSimulator implementation
│   │   ├── production.ts           # ProductionOneClickClient (stub for future)
│   │   └── mock-solver.ts          # Simulated solver network logic
│   │
│   ├── chain-signatures/
│   │   ├── types.ts                # MPC types (SignatureRequest, DerivedAddress, etc.)
│   │   ├── simulator.ts            # ChainSignaturesSimulator implementation
│   │   ├── production.ts           # ProductionMPCClient (stub for future)
│   │   ├── derivation.ts           # Address derivation for BTC, ETH, DOGE, etc.
│   │   └── mock-mpc.ts             # Simulated MPC signing process
│   │
│   └── shared/
│       ├── errors.ts               # Custom error types
│       ├── validation.ts           # Input validation
│       └── constants.ts            # Chain IDs, asset identifiers
```

---

## Phase 3.1: NEAR Intents Simulator (1Click API)

### Goal

Implement a local simulator matching the production **1Click API** (https://1click.chaindefuser.com/) for testing intent-based transactions without deploying to mainnet.

### 1Click API Surface Area

The simulator must match these production endpoints:

#### POST /quote
**Request**:
```typescript
{
  dry?: boolean;                    // Dry run (no execution)
  swapType: 'EXACT_INPUT' | 'EXACT_OUTPUT' | 'ANY_INPUT';
  slippageTolerance?: number;       // Default: 0.01 (1%)
  originAsset: string;              // e.g., "nep141:wrap.near"
  destinationAsset: string;         // e.g., "ethereum:usdc.eth"
  amount: string;                   // In smallest unit (yoctoNEAR, wei, etc.)
  refundTo: string;                 // NEAR account for refunds
  recipient: string;                // Destination address on target chain
  deadline?: string;                // ISO timestamp
}
```

**Response**:
```typescript
{
  timestamp: string;
  quoteRequest: QuoteRequest;       // Echo back request
  quote: {
    depositAddress: string;         // Where to send funds
    amountIn: string;               // Actual input amount
    amountOut: string;              // Expected output amount
    amountOutFormatted: string;     // Human-readable (e.g., "95.50 USDC")
    deadline: string;               // When quote expires
    timeEstimate: number;           // Estimated seconds to complete
  };
}
```

#### GET /swap/{quoteId}
**Response**:
```typescript
{
  quoteResponse: QuoteResponse;
  status: 'PENDING_DEPOSIT' | 'PROCESSING' | 'SUCCESS' | 
          'INCOMPLETE_DEPOSIT' | 'REFUNDED' | 'FAILED';
  updatedAt: string;
  swapDetails?: {
    nearTxHashes?: string[];        // NEAR transaction hashes
    destinationTxHash?: string;     // ETH/BTC transaction hash
    amountIn: string;
    amountOut: string;
  };
}
```

### Implementation Steps

#### Step 1: Define Types

**File**: `lambdas/shared/near-simulators/src/intents/types.ts`

```typescript
export type SwapType = 'EXACT_INPUT' | 'EXACT_OUTPUT' | 'ANY_INPUT';
export type SwapStatus = 
  | 'PENDING_DEPOSIT'    // Waiting for user deposit
  | 'PROCESSING'         // Solver executing
  | 'SUCCESS'            // Completed
  | 'INCOMPLETE_DEPOSIT' // Partial deposit
  | 'REFUNDED'           // Returned to user
  | 'FAILED';            // Error occurred

export interface AssetIdentifier {
  chain: string;         // 'near', 'ethereum', 'bitcoin', etc.
  token: string;         // Token address or 'native'
  decimals: number;      // For formatting
  symbol: string;        // 'NEAR', 'ETH', 'USDC', etc.
}

export interface QuoteRequest {
  dry?: boolean;
  swapType: SwapType;
  slippageTolerance?: number;
  originAsset: string;
  destinationAsset: string;
  amount: string;
  refundTo: string;
  recipient: string;
  deadline?: string;
}

export interface Quote {
  depositAddress: string;
  amountIn: string;
  amountOut: string;
  amountOutFormatted: string;
  deadline: string;
  timeEstimate: number;
  fee: string;                    // Solver fee
  route: {                        // Execution path
    steps: Array<{
      from: string;
      to: string;
      protocol: string;           // 'ref-finance', 'uniswap', etc.
    }>;
  };
}

export interface QuoteResponse {
  quoteId: string;
  timestamp: string;
  quoteRequest: QuoteRequest;
  quote: Quote;
}

export interface SwapStatusResponse {
  quoteResponse: QuoteResponse;
  status: SwapStatus;
  updatedAt: string;
  swapDetails?: {
    nearTxHashes?: string[];
    destinationTxHash?: string;
    amountIn: string;
    amountOut: string;
    executionTime?: number;       // Actual time in seconds
  };
  error?: string;
}

export interface IOneClickClient {
  requestQuote(request: QuoteRequest): Promise<QuoteResponse>;
  getSwapStatus(quoteId: string): Promise<SwapStatusResponse>;
  executeSwap?(quoteId: string): Promise<SwapStatusResponse>; // Optional: for manual execution
}
```

#### Step 2: Implement Mock Solver Network

**File**: `lambdas/shared/near-simulators/src/intents/mock-solver.ts`

```typescript
import { QuoteRequest, Quote, AssetIdentifier } from './types';
import { ChainSignaturesSimulator } from '../chain-signatures/simulator';

/**
 * Mock Solver Network
 * 
 * Simulates competitive solver network that:
 * 1. Finds optimal execution paths
 * 2. Calculates fees and slippage
 * 3. Uses Chain Signatures for cross-chain coordination
 */
export class MockSolverNetwork {
  private chainSigs: ChainSignaturesSimulator;
  
  constructor(chainSigs: ChainSignaturesSimulator) {
    this.chainSigs = chainSigs;
  }
  
  /**
   * Calculate best quote for intent
   */
  async calculateQuote(request: QuoteRequest): Promise<Quote> {
    const originAsset = this.parseAssetIdentifier(request.originAsset);
    const destAsset = this.parseAssetIdentifier(request.destinationAsset);
    
    // Parse amount
    const amountInNum = parseFloat(request.amount);
    
    // Calculate output (simplified: 1:1 with 0.3% fee for demo)
    const feePercent = 0.003;
    const amountOutNum = amountInNum * (1 - feePercent);
    
    // Apply slippage tolerance
    const slippage = request.slippageTolerance || 0.01;
    const amountOutWithSlippage = amountOutNum * (1 - slippage);
    
    // Generate deposit address using Chain Signatures
    const depositAddress = await this.generateDepositAddress(
      originAsset,
      request.refundTo
    );
    
    // Calculate deadline (quote valid for 5 minutes)
    const deadline = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    // Estimate execution time (cross-chain: 30-60s, same-chain: 5-10s)
    const isCrossChain = originAsset.chain !== destAsset.chain;
    const timeEstimate = isCrossChain ? 45 : 7;
    
    return {
      depositAddress,
      amountIn: request.amount,
      amountOut: amountOutWithSlippage.toFixed(destAsset.decimals),
      amountOutFormatted: `${amountOutWithSlippage.toFixed(2)} ${destAsset.symbol}`,
      deadline,
      timeEstimate,
      fee: (amountInNum * feePercent).toFixed(originAsset.decimals),
      route: {
        steps: this.calculateRoute(originAsset, destAsset)
      }
    };
  }
  
  /**
   * Parse asset identifier string
   * Format: "chain:token" (e.g., "near:wrap.near", "ethereum:usdc.eth")
   */
  private parseAssetIdentifier(assetId: string): AssetIdentifier {
    const [chain, token] = assetId.split(':');
    
    // Asset registry (simplified)
    const registry: Record<string, Partial<AssetIdentifier>> = {
      'near:native': { decimals: 24, symbol: 'NEAR' },
      'near:wrap.near': { decimals: 24, symbol: 'wNEAR' },
      'near:usdc.near': { decimals: 6, symbol: 'USDC' },
      'ethereum:native': { decimals: 18, symbol: 'ETH' },
      'ethereum:usdc.eth': { decimals: 6, symbol: 'USDC' },
      'bitcoin:native': { decimals: 8, symbol: 'BTC' },
    };
    
    const key = `${chain}:${token}`;
    const config = registry[key] || { decimals: 18, symbol: token };
    
    return {
      chain,
      token,
      ...config
    } as AssetIdentifier;
  }
  
  /**
   * Calculate execution route
   */
  private calculateRoute(
    origin: AssetIdentifier,
    dest: AssetIdentifier
  ): Array<{ from: string; to: string; protocol: string }> {
    // Same chain: single DEX swap
    if (origin.chain === dest.chain) {
      return [{
        from: origin.symbol,
        to: dest.symbol,
        protocol: origin.chain === 'near' ? 'ref-finance' : 'uniswap-v3'
      }];
    }
    
    // Cross-chain: bridge + swap
    return [
      {
        from: origin.symbol,
        to: `${origin.symbol} (bridged)`,
        protocol: 'rainbow-bridge'
      },
      {
        from: `${origin.symbol} (bridged)`,
        to: dest.symbol,
        protocol: 'uniswap-v3'
      }
    ];
  }
  
  /**
   * Generate deposit address using Chain Signatures
   */
  private async generateDepositAddress(
    asset: AssetIdentifier,
    nearAccount: string
  ): Promise<string> {
    // For NEAR assets, use NEAR account
    if (asset.chain === 'near') {
      return nearAccount;
    }
    
    // For other chains, derive address via Chain Signatures
    const derivedAddress = await this.chainSigs.deriveAddress(
      nearAccount,
      asset.chain
    );
    
    return derivedAddress.address;
  }
}
```

#### Step 3: Implement OneClick Simulator

**File**: `lambdas/shared/near-simulators/src/intents/simulator.ts`

```typescript
import { 
  IOneClickClient, 
  QuoteRequest, 
  QuoteResponse, 
  SwapStatusResponse,
  SwapStatus 
} from './types';
import { MockSolverNetwork } from './mock-solver';
import { ChainSignaturesSimulator } from '../chain-signatures/simulator';
import { randomUUID } from 'crypto';

interface StoredSwap {
  quoteResponse: QuoteResponse;
  status: SwapStatus;
  createdAt: Date;
  updatedAt: Date;
  swapDetails?: any;
  error?: string;
}

/**
 * NEAR Intents Simulator (1Click API)
 * 
 * Simulates the production 1Click API for local testing.
 * Coordinates with Chain Signatures for cross-chain operations.
 */
export class OneClickSimulator implements IOneClickClient {
  private solver: MockSolverNetwork;
  private swaps: Map<string, StoredSwap> = new Map();
  
  constructor(chainSigs: ChainSignaturesSimulator) {
    this.solver = new MockSolverNetwork(chainSigs);
  }
  
  /**
   * Request a quote for an intent
   */
  async requestQuote(request: QuoteRequest): Promise<QuoteResponse> {
    console.log('🔄 [INTENTS] Requesting quote:', {
      from: request.originAsset,
      to: request.destinationAsset,
      amount: request.amount
    });
    
    // Validate request
    this.validateQuoteRequest(request);
    
    // Get quote from solver network
    const quote = await this.solver.calculateQuote(request);
    
    // Create quote response
    const quoteId = randomUUID();
    const quoteResponse: QuoteResponse = {
      quoteId,
      timestamp: new Date().toISOString(),
      quoteRequest: request,
      quote
    };
    
    // Store swap with initial status
    this.swaps.set(quoteId, {
      quoteResponse,
      status: 'PENDING_DEPOSIT',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ [INTENTS] Quote generated:', {
      quoteId,
      amountOut: quote.amountOutFormatted,
      timeEstimate: quote.timeEstimate
    });
    
    // Auto-execute for dry runs or immediate execution
    if (!request.dry) {
      // Simulate async execution
      setTimeout(() => this.simulateExecution(quoteId), 1000);
    }
    
    return quoteResponse;
  }
  
  /**
   * Get status of a swap
   */
  async getSwapStatus(quoteId: string): Promise<SwapStatusResponse> {
    const swap = this.swaps.get(quoteId);
    
    if (!swap) {
      throw new Error(`Quote not found: ${quoteId}`);
    }
    
    return {
      quoteResponse: swap.quoteResponse,
      status: swap.status,
      updatedAt: swap.updatedAt.toISOString(),
      swapDetails: swap.swapDetails,
      error: swap.error
    };
  }
  
  /**
   * Simulate swap execution (private, automatic)
   */
  private async simulateExecution(quoteId: string): Promise<void> {
    const swap = this.swaps.get(quoteId);
    if (!swap) return;
    
    try {
      console.log('⚙️  [INTENTS] Executing swap:', quoteId);
      
      // Update to PROCESSING
      swap.status = 'PROCESSING';
      swap.updatedAt = new Date();
      
      // Simulate execution time
      await new Promise(resolve => 
        setTimeout(resolve, swap.quoteResponse.quote.timeEstimate * 100) // 100ms per second
      );
      
      // Generate mock transaction hashes
      const nearTxHash = this.generateMockTxHash('NEAR');
      const destChain = swap.quoteResponse.quoteRequest.destinationAsset.split(':')[0];
      const destTxHash = destChain !== 'near' 
        ? this.generateMockTxHash(destChain.toUpperCase())
        : undefined;
      
      // Update to SUCCESS
      swap.status = 'SUCCESS';
      swap.updatedAt = new Date();
      swap.swapDetails = {
        nearTxHashes: [nearTxHash],
        destinationTxHash: destTxHash,
        amountIn: swap.quoteResponse.quote.amountIn,
        amountOut: swap.quoteResponse.quote.amountOut,
        executionTime: Math.floor(
          (swap.updatedAt.getTime() - swap.createdAt.getTime()) / 1000
        )
      };
      
      console.log('✅ [INTENTS] Swap completed:', {
        quoteId,
        status: 'SUCCESS',
        nearTx: nearTxHash,
        destTx: destTxHash
      });
      
    } catch (error: any) {
      console.error('❌ [INTENTS] Swap failed:', error.message);
      
      swap.status = 'FAILED';
      swap.updatedAt = new Date();
      swap.error = error.message;
    }
  }
  
  private validateQuoteRequest(request: QuoteRequest): void {
    if (!request.originAsset || !request.destinationAsset) {
      throw new Error('Origin and destination assets required');
    }
    
    if (!request.amount || parseFloat(request.amount) <= 0) {
      throw new Error('Valid amount required');
    }
    
    if (!request.refundTo || !request.recipient) {
      throw new Error('Refund and recipient addresses required');
    }
  }
  
  private generateMockTxHash(chain: string): string {
    const prefix = {
      'NEAR': '',
      'ETHEREUM': '0x',
      'BITCOIN': ''
    }[chain] || '';
    
    const hash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    return prefix + hash;
  }
}
```

---

## Phase 3.2: Chain Signatures Simulator (MPC)

### Goal

Implement a simulator for NEAR's **Chain Signatures (MPC)** that enables a single NEAR account to control addresses on multiple blockchains without exposing private keys.

### Chain Signatures Capabilities

1. **Address Derivation**: Derive addresses on BTC, ETH, DOGE, etc. from NEAR account
2. **Transaction Signing**: Sign transactions for external chains using MPC
3. **Multi-Chain Control**: One NEAR account = one wallet across all chains

### Implementation Steps

#### Step 1: Define Types

**File**: `lambdas/shared/near-simulators/src/chain-signatures/types.ts`

```typescript
export type SupportedChain = 
  | 'bitcoin'
  | 'ethereum'
  | 'dogecoin'
  | 'ripple'
  | 'polygon'
  | 'arbitrum'
  | 'optimism';

export interface DerivedAddress {
  chain: SupportedChain;
  address: string;
  publicKey: string;
  derivationPath: string;
}

export interface SignatureRequest {
  nearAccount: string;
  chain: SupportedChain;
  payload: string;           // Transaction data to sign
  derivationPath?: string;   // Optional custom path
}

export interface Signature {
  big_r: string;             // Signature component r
  s: string;                 // Signature component s
  recovery_id?: number;      // For ECDSA recovery
}

export interface SignatureResponse {
  signature: Signature;
  publicKey: string;
  signedPayload: string;
}

export interface IChainSignatures {
  deriveAddress(nearAccount: string, chain: SupportedChain, path?: string): Promise<DerivedAddress>;
  requestSignature(request: SignatureRequest): Promise<SignatureResponse>;
  verifySignature(response: SignatureResponse, payload: string): Promise<boolean>;
}
```

#### Step 2: Implement Address Derivation

**File**: `lambdas/shared/near-simulators/src/chain-signatures/derivation.ts`

```typescript
import { createHash } from 'crypto';
import { SupportedChain, DerivedAddress } from './types';

/**
 * Address Derivation Logic
 * 
 * Simulates MPC-based address derivation for various chains.
 * In production, this uses actual MPC threshold signatures.
 */
export class AddressDerivation {
  
  /**
   * Derive address for a specific chain
   */
  static deriveAddress(
    nearAccount: string,
    chain: SupportedChain,
    customPath?: string
  ): DerivedAddress {
    // Generate deterministic derivation path
    const path = customPath || this.getDefaultPath(nearAccount, chain);
    
    // Generate mock public key (deterministic for testing)
    const publicKey = this.derivePublicKey(nearAccount, path);
    
    // Derive chain-specific address from public key
    const address = this.publicKeyToAddress(publicKey, chain);
    
    return {
      chain,
      address,
      publicKey,
      derivationPath: path
    };
  }
  
  /**
   * Get default derivation path for NEAR account on specific chain
   */
  private static getDefaultPath(nearAccount: string, chain: SupportedChain): string {
    // Standard path: near-account,chain-id
    const chainId = this.getChainId(chain);
    return `${nearAccount},${chainId}`;
  }
  
  /**
   * Derive deterministic public key from path
   */
  private static derivePublicKey(nearAccount: string, path: string): string {
    // In production: MPC-derived public key
    // In simulator: deterministic hash for testing
    const hash = createHash('sha256')
      .update(`${nearAccount}:${path}`)
      .digest('hex');
    
    // Format as public key (33 bytes compressed for ECDSA)
    return '02' + hash.substring(0, 64);
  }
  
  /**
   * Convert public key to chain-specific address
   */
  private static publicKeyToAddress(publicKey: string, chain: SupportedChain): string {
    const hash = createHash('sha256')
      .update(publicKey)
      .digest('hex');
    
    switch (chain) {
      case 'bitcoin':
      case 'dogecoin':
        return this.toBech32Address(hash, chain);
      
      case 'ethereum':
      case 'polygon':
      case 'arbitrum':
      case 'optimism':
        return this.toEthereumAddress(hash);
      
      case 'ripple':
        return this.toRippleAddress(hash);
      
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }
  
  private static toBech32Address(hash: string, chain: SupportedChain): string {
    // Simplified: real implementation uses bech32 encoding
    const prefix = chain === 'bitcoin' ? 'bc1' : 'dgb1';
    const addr = hash.substring(0, 40);
    return `${prefix}${addr}`;
  }
  
  private static toEthereumAddress(hash: string): string {
    // Take last 20 bytes (40 hex chars)
    const addr = hash.substring(hash.length - 40);
    return `0x${addr}`;
  }
  
  private static toRippleAddress(hash: string): string {
    // Simplified: real implementation uses base58 with checksum
    const addr = hash.substring(0, 40);
    return `r${addr}`;
  }
  
  private static getChainId(chain: SupportedChain): number {
    const chainIds: Record<SupportedChain, number> = {
      'bitcoin': 0,
      'ethereum': 1,
      'dogecoin': 3,
      'ripple': 144,
      'polygon': 137,
      'arbitrum': 42161,
      'optimism': 10
    };
    
    return chainIds[chain];
  }
}
```

#### Step 3: Implement Mock MPC Signing

**File**: `lambdas/shared/near-simulators/src/chain-signatures/mock-mpc.ts`

```typescript
import { createHash, randomBytes } from 'crypto';
import { SignatureRequest, Signature } from './types';

/**
 * Mock MPC Service
 * 
 * Simulates NEAR's 8-node MPC network for threshold signatures.
 * In production, this involves multi-round MPC protocol.
 */
export class MockMPCService {
  
  /**
   * Simulate MPC signature generation
   * 
   * In production:
   * 1. Nodes listen for signature requests on v1.signer contract
   * 2. Each node generates signature-share
   * 3. Shares aggregated through multiple rounds
   * 4. Final signature computed without exposing private key
   */
  async generateSignature(request: SignatureRequest): Promise<Signature> {
    console.log('🔐 [MPC] Generating signature:', {
      account: request.nearAccount,
      chain: request.chain,
      payloadLength: request.payload.length
    });
    
    // Simulate MPC round delay (in production: ~2-5 seconds)
    await this.simulateMPCRounds();
    
    // Generate deterministic signature for testing
    // In production: uses actual threshold ECDSA
    const signatureData = createHash('sha256')
      .update(request.payload)
      .update(request.nearAccount)
      .update(request.chain)
      .digest('hex');
    
    const signature: Signature = {
      big_r: signatureData.substring(0, 64),
      s: signatureData.substring(64, 128),
      recovery_id: 0
    };
    
    console.log('✅ [MPC] Signature generated');
    
    return signature;
  }
  
  /**
   * Simulate MPC multi-round protocol
   */
  private async simulateMPCRounds(): Promise<void> {
    // Simulate 3 rounds of MPC communication
    const rounds = 3;
    const delayPerRound = 100; // 100ms per round
    
    for (let i = 0; i < rounds; i++) {
      await new Promise(resolve => setTimeout(resolve, delayPerRound));
      console.log(`  Round ${i + 1}/${rounds} complete`);
    }
  }
  
  /**
   * Verify MPC-generated signature
   */
  async verifySignature(
    signature: Signature,
    payload: string,
    publicKey: string
  ): Promise<boolean> {
    // In production: actual ECDSA verification
    // In simulator: simplified check
    console.log('✓ [MPC] Signature verified');
    return true;
  }
}
```

#### Step 4: Implement Chain Signatures Simulator

**File**: `lambdas/shared/near-simulators/src/chain-signatures/simulator.ts`

```typescript
import { 
  IChainSignatures,
  SupportedChain,
  DerivedAddress,
  SignatureRequest,
  SignatureResponse
} from './types';
import { AddressDerivation } from './derivation';
import { MockMPCService } from './mock-mpc';

/**
 * Chain Signatures Simulator
 * 
 * Simulates NEAR's Chain Signatures (MPC) for multi-chain account control.
 * Enables single NEAR account to control BTC, ETH, DOGE, etc.
 */
export class ChainSignaturesSimulator implements IChainSignatures {
  private mpc: MockMPCService;
  private addressCache: Map<string, DerivedAddress> = new Map();
  
  constructor() {
    this.mpc = new MockMPCService();
  }
  
  /**
   * Derive address on target chain for NEAR account
   */
  async deriveAddress(
    nearAccount: string,
    chain: SupportedChain,
    path?: string
  ): Promise<DerivedAddress> {
    const cacheKey = `${nearAccount}:${chain}:${path || 'default'}`;
    
    // Return cached if available
    if (this.addressCache.has(cacheKey)) {
      return this.addressCache.get(cacheKey)!;
    }
    
    console.log('🔗 [CHAIN SIG] Deriving address:', {
      nearAccount,
      chain,
      path: path || 'default'
    });
    
    // Derive address using deterministic derivation
    const derived = AddressDerivation.deriveAddress(nearAccount, chain, path);
    
    // Cache for future use
    this.addressCache.set(cacheKey, derived);
    
    console.log('✅ [CHAIN SIG] Address derived:', {
      chain,
      address: derived.address
    });
    
    return derived;
  }
  
  /**
   * Request signature for cross-chain transaction
   */
  async requestSignature(request: SignatureRequest): Promise<SignatureResponse> {
    console.log('📝 [CHAIN SIG] Signature request:', {
      account: request.nearAccount,
      chain: request.chain
    });
    
    // Derive address to get public key
    const derived = await this.deriveAddress(
      request.nearAccount,
      request.chain,
      request.derivationPath
    );
    
    // Generate signature via MPC
    const signature = await this.mpc.generateSignature(request);
    
    return {
      signature,
      publicKey: derived.publicKey,
      signedPayload: request.payload
    };
  }
  
  /**
   * Verify signature validity
   */
  async verifySignature(
    response: SignatureResponse,
    payload: string
  ): Promise<boolean> {
    return this.mpc.verifySignature(
      response.signature,
      payload,
      response.publicKey
    );
  }
}
```

---

## Phase 3.3: Integration with TelcoPay

### Update SMS Handler to Use Intents

**File**: `lambdas/sms-handler/handlers/cross-chain-payment.ts` (NEW)

```typescript
import { OneClickSimulator } from '../../shared/near-simulators/src/intents/simulator';
import { ChainSignaturesSimulator } from '../../shared/near-simulators/src/chain-signatures/simulator';
import { SmsCommand } from '../../shared/types';

/**
 * Handle cross-chain payment via NEAR Intents
 * 
 * Example SMS: "PAY 10 @merchant in BTC"
 */
export async function handleCrossChainPayment(
  command: SmsCommand,
  fromPhone: string
): Promise<void> {
  // Initialize simulators
  const chainSigs = new ChainSignaturesSimulator();
  const intents = new OneClickSimulator(chainSigs);
  
  // Get user's NEAR account
  const user = await getUserByPhone(fromPhone);
  if (!user.near_account_id) {
    throw new Error('User must have NEAR account for cross-chain payments');
  }
  
  // Derive destination address on target chain
  const targetChain = command.target_chain || 'ethereum';
  const recipientAddress = await chainSigs.deriveAddress(
    command.recipient_near_account,
    targetChain
  );
  
  // Build intent
  const quoteRequest = {
    swapType: 'EXACT_INPUT' as const,
    originAsset: 'near:wrap.near',
    destinationAsset: `${targetChain}:native`,
    amount: command.amount.toString(),
    refundTo: user.near_account_id,
    recipient: recipientAddress.address
  };
  
  // Request quote
  const quote = await intents.requestQuote(quoteRequest);
  
  console.log('💱 Cross-chain payment initiated:', {
    from: fromPhone,
    quoteId: quote.quoteId,
    amountOut: quote.quote.amountOutFormatted,
    destChain: targetChain
  });
  
  // Poll for completion
  const status = await waitForSwapCompletion(intents, quote.quoteId);
  
  // Send notification
  await sendSms(
    fromPhone,
    `✅ Cross-chain payment complete!\n` +
    `Sent: ${quote.quote.amountOutFormatted}\n` +
    `TX: ${status.swapDetails?.destinationTxHash?.substring(0, 16)}...`
  );
}

async function waitForSwapCompletion(
  intents: OneClickSimulator,
  quoteId: string,
  maxWait: number = 60000
): Promise<any> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const status = await intents.getSwapStatus(quoteId);
    
    if (status.status === 'SUCCESS') {
      return status;
    }
    
    if (status.status === 'FAILED') {
      throw new Error(`Swap failed: ${status.error}`);
    }
    
    // Wait 2 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Swap timeout');
}
```

---

## Testing Plan

### Test Script 1: Chain Signatures

**File**: `scripts/test-chain-signatures.sh`

```bash
#!/bin/bash

echo "🧪 Testing Chain Signatures Simulator"
echo ""

# Test address derivation
node -e "
const { ChainSignaturesSimulator } = require('./lambdas/shared/near-simulators/dist/chain-signatures/simulator');

(async () => {
  const chainSig = new ChainSignaturesSimulator();
  
  const nearAccount = '14255556001.node0';
  
  // Derive addresses on multiple chains
  const btc = await chainSig.deriveAddress(nearAccount, 'bitcoin');
  const eth = await chainSig.deriveAddress(nearAccount, 'ethereum');
  const doge = await chainSig.deriveAddress(nearAccount, 'dogecoin');
  
  console.log('Derived Addresses:');
  console.log('  Bitcoin:', btc.address);
  console.log('  Ethereum:', eth.address);
  console.log('  Dogecoin:', doge.address);
  
  // Test signature
  const sig = await chainSig.requestSignature({
    nearAccount,
    chain: 'ethereum',
    payload: '0x1234567890abcdef'
  });
  
  console.log('');
  console.log('Signature Generated:');
  console.log('  r:', sig.signature.big_r.substring(0, 16) + '...');
  console.log('  s:', sig.signature.s.substring(0, 16) + '...');
})();
"
```

### Test Script 2: NEAR Intents

**File**: `scripts/test-intents.sh`

```bash
#!/bin/bash

echo "🧪 Testing NEAR Intents Simulator"
echo ""

node -e "
const { ChainSignaturesSimulator } = require('./lambdas/shared/near-simulators/dist/chain-signatures/simulator');
const { OneClickSimulator } = require('./lambdas/shared/near-simulators/dist/intents/simulator');

(async () => {
  const chainSig = new ChainSignaturesSimulator();
  const intents = new OneClickSimulator(chainSig);
  
  // Request quote
  const quote = await intents.requestQuote({
    swapType: 'EXACT_INPUT',
    originAsset: 'near:wrap.near',
    destinationAsset: 'ethereum:usdc.eth',
    amount: '5000000000000000000000000', // 5 NEAR
    refundTo: '14255556001.node0',
    recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  });
  
  console.log('Quote Received:');
  console.log('  Quote ID:', quote.quoteId);
  console.log('  Amount Out:', quote.quote.amountOutFormatted);
  console.log('  Time Estimate:', quote.quote.timeEstimate, 'seconds');
  console.log('  Fee:', quote.quote.fee);
  
  // Wait for execution
  console.log('');
  console.log('Waiting for swap execution...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const status = await intents.getSwapStatus(quote.quoteId);
  
  console.log('');
  console.log('Swap Status:', status.status);
  if (status.swapDetails) {
    console.log('  NEAR TX:', status.swapDetails.nearTxHashes[0].substring(0, 16) + '...');
    console.log('  ETH TX:', status.swapDetails.destinationTxHash?.substring(0, 16) + '...');
    console.log('  Execution Time:', status.swapDetails.executionTime, 'seconds');
  }
})();
"
```

---

## Success Criteria

Phase 3 is complete when:

- ✅ Chain Signatures simulator derives addresses for BTC, ETH, DOGE, XRP
- ✅ MPC signing generates valid signatures (mock implementation)
- ✅ OneClick simulator generates quotes matching production API
- ✅ Intents execute swaps with simulated TX hashes
- ✅ Cross-chain payment handler integrates both simulators
- ✅ Test scripts validate all functionality
- ✅ Demo viewer displays cross-chain events
- ✅ Documentation explains simulator architecture

---

## Documentation

Create `lambdas/shared/near-simulators/README.md` explaining:

1. What NEAR Intents and Chain Signatures are
2. How simulators differ from production
3. API compatibility with production services
4. Testing locally vs. deploying to mainnet
5. Migration path from simulator to production

---

## Timeline Estimate

- **Chain Signatures Types & Derivation**: 2-3 hours
- **MPC Simulator**: 2-3 hours
- **Intents Types & Solver**: 3-4 hours
- **OneClick Simulator**: 3-4 hours
- **Integration with TelcoPay**: 2-3 hours
- **Testing & Documentation**: 2-3 hours

**Total**: 14-20 hours of focused work

---

## Next Steps After Phase 3

With Intents + Chain Signatures working, Phase 4 (Shade Agents) can:
- Use Chain Signatures for multi-chain reasoning
- Create intents based on AI analysis
- Execute complex cross-chain strategies
- Provide verifiable attestations via TEE simulation

