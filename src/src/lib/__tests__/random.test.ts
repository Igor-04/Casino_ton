/**
 * Tests for fairness proof and random distribution
 */
import { describe, it, expect } from 'vitest'
import {
  generateRandomValues,
  calculatePayoutDistribution,
  verifyFairnessProof,
  generateCommitHash,
  isValidSeed,
  isValidBlockHash
} from '../random'
import { tonToNanoton } from '../ton-format'

describe('Random Distribution System', () => {
  const testSeed = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  const testBlockHash = '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
  const testAddresses = [
    'UQD-_wVnNm3_LVV...kl8X2GRGJp',
    'UQA1B2C3D4E5F6G...xyz9ABC',
    'UQF3G4H5I6J7K8L...mno1PQR'
  ]
  const testStakes = [tonToNanoton(1), tonToNanoton(1), tonToNanoton(1)]
  const platformFeeBps = 500 // 5%

  describe('generateRandomValues', () => {
    it('should generate deterministic random values', () => {
      const randomValues1 = generateRandomValues(testSeed, testBlockHash, testAddresses)
      const randomValues2 = generateRandomValues(testSeed, testBlockHash, testAddresses)
      
      expect(randomValues1).toEqual(randomValues2)
      expect(randomValues1).toHaveLength(testAddresses.length)
      
      // All values should be non-zero
      randomValues1.forEach(value => {
        expect(value).toBeGreaterThan(0n)
      })
    })

    it('should generate different values for different seeds', () => {
      const seed1 = '0x1111111111111111111111111111111111111111111111111111111111111111'
      const seed2 = '0x2222222222222222222222222222222222222222222222222222222222222222'
      
      const randomValues1 = generateRandomValues(seed1, testBlockHash, testAddresses)
      const randomValues2 = generateRandomValues(seed2, testBlockHash, testAddresses)
      
      expect(randomValues1).not.toEqual(randomValues2)
    })

    it('should generate different values for different block hashes', () => {
      const blockHash1 = '0x1111111111111111111111111111111111111111111111111111111111111111'
      const blockHash2 = '0x2222222222222222222222222222222222222222222222222222222222222222'
      
      const randomValues1 = generateRandomValues(testSeed, blockHash1, testAddresses)
      const randomValues2 = generateRandomValues(testSeed, blockHash2, testAddresses)
      
      expect(randomValues1).not.toEqual(randomValues2)
    })
  })

  describe('calculatePayoutDistribution', () => {
    it('should guarantee minimum 50% payout for each participant', () => {
      const randomValues = generateRandomValues(testSeed, testBlockHash, testAddresses)
      const { payouts, basePayouts } = calculatePayoutDistribution(testStakes, randomValues, platformFeeBps)
      
      payouts.forEach((payout, index) => {
        const minPayout = basePayouts[index]
        expect(payout).toBeGreaterThanOrEqual(minPayout)
        
        // Verify minimum is 50% of stake after fees
        const stakeAfterFee = testStakes[index] - (testStakes[index] * BigInt(platformFeeBps)) / 10000n
        const expectedMin = stakeAfterFee / 2n
        expect(minPayout).toEqual(expectedMin)
      })
    })

    it('should distribute the entire pool', () => {
      const randomValues = generateRandomValues(testSeed, testBlockHash, testAddresses)
      const { payouts, totalPool } = calculatePayoutDistribution(testStakes, randomValues, platformFeeBps)
      
      const totalPayouts = payouts.reduce((sum, payout) => sum + payout, 0n)
      
      // Allow for small rounding differences (up to participants count in nanotons)
      const difference = totalPool > totalPayouts ? totalPool - totalPayouts : totalPayouts - totalPool
      expect(difference).toBeLessThanOrEqual(BigInt(testAddresses.length))
    })

    it('should calculate correct platform fee', () => {
      const randomValues = generateRandomValues(testSeed, testBlockHash, testAddresses)
      const { totalPool } = calculatePayoutDistribution(testStakes, randomValues, platformFeeBps)
      
      const totalStakes = testStakes.reduce((sum, stake) => sum + stake, 0n)
      const expectedFee = (totalStakes * BigInt(platformFeeBps)) / 10000n
      const expectedPool = totalStakes - expectedFee
      
      expect(totalPool).toEqual(expectedPool)
    })

    it('should handle edge case with zero random values', () => {
      const zeroRandomValues = new Array(testAddresses.length).fill(0n)
      const { payouts, basePayouts } = calculatePayoutDistribution(testStakes, zeroRandomValues, platformFeeBps)
      
      // When all random values are zero, payouts should equal base payouts
      payouts.forEach((payout, index) => {
        expect(payout).toEqual(basePayouts[index])
      })
    })
  })

  describe('verifyFairnessProof', () => {
    it('should verify correct distribution', () => {
      const randomValues = generateRandomValues(testSeed, testBlockHash, testAddresses)
      const { payouts } = calculatePayoutDistribution(testStakes, randomValues, platformFeeBps)
      
      const verification = verifyFairnessProof(
        testSeed,
        testBlockHash,
        testAddresses,
        testStakes,
        payouts,
        platformFeeBps
      )
      
      expect(verification.isValid).toBe(true)
      expect(verification.calculatedPayouts).toEqual(payouts)
    })

    it('should detect incorrect distribution', () => {
      const randomValues = generateRandomValues(testSeed, testBlockHash, testAddresses)
      const { payouts } = calculatePayoutDistribution(testStakes, randomValues, platformFeeBps)
      
      // Tamper with one payout
      const tamperedPayouts = [...payouts]
      tamperedPayouts[0] = tamperedPayouts[0] + tonToNanoton(0.1)
      
      const verification = verifyFairnessProof(
        testSeed,
        testBlockHash,
        testAddresses,
        testStakes,
        tamperedPayouts,
        platformFeeBps
      )
      
      expect(verification.isValid).toBe(false)
    })

    it('should handle verification errors gracefully', () => {
      const verification = verifyFairnessProof(
        'invalid_seed',
        testBlockHash,
        testAddresses,
        testStakes,
        [],
        platformFeeBps
      )
      
      expect(verification.isValid).toBe(false)
      expect(verification.explanation).toContain('error')
    })
  })

  describe('validation functions', () => {
    it('should validate seed format', () => {
      expect(isValidSeed(testSeed)).toBe(true)
      expect(isValidSeed('0x123')).toBe(false)
      expect(isValidSeed('invalid')).toBe(false)
      expect(isValidSeed('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(false)
    })

    it('should validate block hash format', () => {
      expect(isValidBlockHash(testBlockHash)).toBe(true)
      expect(isValidBlockHash('0x123')).toBe(false)
      expect(isValidBlockHash('invalid')).toBe(false)
    })

    it('should generate valid commit hash', () => {
      const commitHash = generateCommitHash(testSeed, 'salt123')
      expect(commitHash).toMatch(/^0x[a-f0-9]{64}$/)
      
      // Same inputs should produce same hash
      const commitHash2 = generateCommitHash(testSeed, 'salt123')
      expect(commitHash).toEqual(commitHash2)
      
      // Different inputs should produce different hash
      const commitHash3 = generateCommitHash(testSeed, 'salt456')
      expect(commitHash).not.toEqual(commitHash3)
    })
  })

  describe('edge cases', () => {
    it('should handle single participant', () => {
      const singleAddress = [testAddresses[0]]
      const singleStake = [testStakes[0]]
      
      const randomValues = generateRandomValues(testSeed, testBlockHash, singleAddress)
      const { payouts } = calculatePayoutDistribution(singleStake, randomValues, platformFeeBps)
      
      expect(payouts).toHaveLength(1)
      
      // With single participant, they get the entire pool minus platform fee
      const expectedPayout = singleStake[0] - (singleStake[0] * BigInt(platformFeeBps)) / 10000n
      expect(payouts[0]).toEqual(expectedPayout)
    })

    it('should handle different stake amounts', () => {
      const differentStakes = [tonToNanoton(0.5), tonToNanoton(1), tonToNanoton(2)]
      
      const randomValues = generateRandomValues(testSeed, testBlockHash, testAddresses)
      const { payouts, basePayouts } = calculatePayoutDistribution(differentStakes, randomValues, platformFeeBps)
      
      // Each participant should get at least 50% of their stake after fees
      payouts.forEach((payout, index) => {
        expect(payout).toBeGreaterThanOrEqual(basePayouts[index])
      })
    })

    it('should handle large number of participants', () => {
      const manyAddresses = Array.from({ length: 100 }, (_, i) => `UQ${i.toString().padStart(46, '0')}`)
      const manyStakes = new Array(100).fill(tonToNanoton(1))
      
      const randomValues = generateRandomValues(testSeed, testBlockHash, manyAddresses)
      const { payouts } = calculatePayoutDistribution(manyStakes, randomValues, platformFeeBps)
      
      expect(payouts).toHaveLength(100)
      
      // All payouts should be positive
      payouts.forEach(payout => {
        expect(payout).toBeGreaterThan(0n)
      })
    })
  })
})