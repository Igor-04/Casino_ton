// Transparency and proof-of-fairness related types

import { Round } from '../components/GameRound'

// Extended round interface with transparency data
export interface TransparentRound extends Round {
  // User participation data
  userParticipated: boolean
  userPayout?: number
  userProfit?: number
  
  // Timestamp data
  createdAt: number
  
  // Randomness proof for fairness verification
  randomnessProof?: RandomnessProof
  
  // Distribution details for completed rounds
  distributionDetails?: DistributionDetails
}

// Proof of randomness for transparency
export interface RandomnessProof {
  // Seed used for random generation
  seed: string
  
  // Block hash from blockchain for entropy
  blockHash: string
  
  // Block height when randomness was committed
  blockHeight: number
  
  // Hash of the committed seed (before reveal)
  commitHash: string
  
  // Timestamp when randomness was revealed
  revealTimestamp: number
}

// Detailed distribution information
export interface DistributionDetails {
  // Total pool before distribution
  totalPool: number
  
  // Base payout guaranteed to each participant (50% of stake)
  basePayout: number
  
  // Remaining pool to be distributed randomly
  remainingPool: number
  
  // Distribution formula used
  formula: string
  
  // Individual participant results
  participants: ParticipantResult[]
}

// Individual participant's result in a round
export interface ParticipantResult {
  // Participant's wallet address
  address: string
  
  // Amount they paid to enter
  entryFee: number
  
  // Amount they received as payout
  payout: number
  
  // Random value assigned to this participant
  randomValue: number
  
  // Net profit/loss (payout - entryFee)
  profit: number
}

// Verification status for transparency proofs
export interface VerificationStatus {
  // Whether the proof is valid
  isValid: boolean
  
  // Human-readable status message
  message: string
  
  // Detailed verification steps
  steps: VerificationStep[]
}

// Individual verification step
export interface VerificationStep {
  // Step identifier
  id: string
  
  // Human-readable description
  description: string
  
  // Whether this step passed
  passed: boolean
  
  // Additional details or error message
  details?: string
}

// Fairness verification result
export interface FairnessVerification {
  // Round being verified
  roundId: number
  
  // Verification timestamp
  verifiedAt: number
  
  // Overall verification result
  status: VerificationStatus
  
  // Randomness verification
  randomnessVerification: {
    seedValid: boolean
    blockHashValid: boolean
    commitRevealValid: boolean
  }
  
  // Distribution verification
  distributionVerification: {
    totalCorrect: boolean
    formulaCorrect: boolean
    payoutsCorrect: boolean
  }
}

// Historical transparency data for analytics
export interface TransparencyMetrics {
  // Total number of rounds analyzed
  totalRounds: number
  
  // Number of rounds with valid proofs
  verifiedRounds: number
  
  // Verification success rate
  verificationRate: number
  
  // Average time between commit and reveal
  averageRevealTime: number
  
  // Distribution fairness metrics
  distributionMetrics: {
    averageProfit: number
    profitVariance: number
    guaranteedPayoutRate: number
  }
}

// Export utility type guards
export function isTransparentRound(round: Round | TransparentRound): round is TransparentRound {
  return 'userParticipated' in round
}

export function hasRandomnessProof(round: TransparentRound): round is TransparentRound & { randomnessProof: RandomnessProof } {
  return round.randomnessProof !== undefined
}

export function hasDistributionDetails(round: TransparentRound): round is TransparentRound & { distributionDetails: DistributionDetails } {
  return round.distributionDetails !== undefined
}

// Constants for transparency verification
export const TRANSPARENCY_CONSTANTS = {
  // Maximum time allowed between commit and reveal (in seconds)
  MAX_REVEAL_TIME: 3600, // 1 hour
  
  // Minimum block confirmations required
  MIN_BLOCK_CONFIRMATIONS: 3,
  
  // Tolerance for floating point comparisons
  CALCULATION_TOLERANCE: 0.000001,
  
  // Expected distribution variance bounds
  MIN_VARIANCE: 0.1,
  MAX_VARIANCE: 2.0
} as const