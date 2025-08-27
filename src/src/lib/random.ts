/**
 * Deterministic random number generator for fairness proof
 * Uses the same algorithm as the smart contract for verifiability
 */

/**
 * Simple hash function (equivalent to contract implementation)
 */
function simpleHash(data: string): bigint {
  let hash = 0n
  const dataBytes = new TextEncoder().encode(data)
  
  for (let i = 0; i < dataBytes.length; i++) {
    hash = ((hash << 5n) - hash + BigInt(dataBytes[i])) & 0xFFFFFFFFn
  }
  
  return hash
}

/**
 * Generate deterministic random values from seed and block hash
 * This must match the smart contract implementation exactly
 */
export function generateRandomValues(
  seed: string,
  blockHash: string,
  participantAddresses: string[]
): bigint[] {
  const combinedSeed = seed + blockHash
  const baseHash = simpleHash(combinedSeed)
  
  return participantAddresses.map((address, index) => {
    const participantSeed = combinedSeed + address + index.toString()
    const participantHash = simpleHash(participantSeed)
    
    // Combine base hash with participant-specific hash
    const combinedHash = (baseHash + participantHash) & 0xFFFFFFFFn
    
    // Ensure non-zero result (contract requirement)
    return combinedHash === 0n ? 1n : combinedHash
  })
}

/**
 * Calculate payout distribution based on random values
 * Guarantees minimum 50% payout for each participant
 */
export function calculatePayoutDistribution(
  stakesNanoton: bigint[],
  randomValues: bigint[],
  platformFeeBps: number
): {
  payouts: bigint[]
  totalPool: bigint
  basePayouts: bigint[]
  bonusPool: bigint
  formula: string
} {
  if (stakesNanoton.length !== randomValues.length) {
    throw new Error('Stakes and random values must have same length')
  }

  // Calculate total pool after platform fee
  const totalStakes = stakesNanoton.reduce((sum, stake) => sum + stake, 0n)
  const platformFee = (totalStakes * BigInt(platformFeeBps)) / 10000n
  const totalPool = totalStakes - platformFee

  // Calculate base payouts (50% of stake after fee deduction)
  const basePayouts = stakesNanoton.map(stake => {
    const stakeAfterFee = stake - (stake * BigInt(platformFeeBps)) / 10000n
    return stakeAfterFee / 2n // 50% guaranteed
  })

  const totalBasePayouts = basePayouts.reduce((sum, payout) => sum + payout, 0n)
  const bonusPool = totalPool - totalBasePayouts

  // Calculate weights from random values
  const totalRandomWeight = randomValues.reduce((sum, val) => sum + val, 0n)
  
  // Distribute bonus pool based on random weights
  const payouts = basePayouts.map((basePayout, index) => {
    if (totalRandomWeight === 0n) {
      return basePayout // fallback if all random values are zero
    }
    
    const bonusShare = (bonusPool * randomValues[index]) / totalRandomWeight
    return basePayout + bonusShare
  })

  return {
    payouts,
    totalPool,
    basePayouts,
    bonusPool,
    formula: 'payout_i = basePayout_i + bonusPool * (random_i / sum(all_randoms))'
  }
}

/**
 * Verify fairness proof by recalculating distribution
 */
export function verifyFairnessProof(
  seed: string,
  blockHash: string,
  participantAddresses: string[],
  stakes: bigint[],
  expectedPayouts: bigint[],
  platformFeeBps: number
): {
  isValid: boolean
  calculatedPayouts: bigint[]
  differences: bigint[]
  explanation: string
} {
  try {
    // Generate same random values that contract would generate
    const randomValues = generateRandomValues(seed, blockHash, participantAddresses)
    
    // Calculate distribution using same algorithm
    const { payouts: calculatedPayouts } = calculatePayoutDistribution(
      stakes,
      randomValues,
      platformFeeBps
    )

    // Compare with expected payouts
    const differences = expectedPayouts.map((expected, i) => 
      expected > calculatedPayouts[i] 
        ? expected - calculatedPayouts[i]
        : calculatedPayouts[i] - expected
    )

    // Allow small differences due to rounding (up to 1 nanoton)
    const isValid = differences.every(diff => diff <= 1n)

    return {
      isValid,
      calculatedPayouts,
      differences,
      explanation: isValid 
        ? 'Fairness proof verified: calculated payouts match on-chain data'
        : 'Fairness proof failed: calculated payouts do not match on-chain data'
    }
  } catch (error) {
    return {
      isValid: false,
      calculatedPayouts: [],
      differences: [],
      explanation: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Generate commit hash for seed (used in commit-reveal scheme)
 */
export function generateCommitHash(seed: string, salt: string): string {
  const combined = seed + salt
  const hash = simpleHash(combined)
  return '0x' + hash.toString(16).padStart(64, '0')
}

/**
 * Validate seed format
 */
export function isValidSeed(seed: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(seed)
}

/**
 * Validate block hash format
 */
export function isValidBlockHash(blockHash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(blockHash)
}

/**
 * Generate random seed for testing/demo purposes
 * In production, this would be generated securely
 */
export function generateRandomSeed(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Simulate block hash for testing/demo purposes
 */
export function generateMockBlockHash(blockHeight: number): string {
  const hash = simpleHash(`block_${blockHeight}_${Date.now()}`)
  return '0x' + hash.toString(16).padStart(64, '0')
}