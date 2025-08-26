/**
 * Tests for TON formatting and conversion utilities
 */
import { describe, it, expect } from 'vitest'
import {
  tonToNanoton,
  nanotonToTon,
  formatTon,
  formatTonCompact,
  parseUserTonInput,
  validateTonAmount,
  calculatePercentage,
  formatAddress,
  isValidTonAddress,
  safeBigIntAdd,
  safeBigIntSubtract,
  safeBigIntMultiply,
  safeBigIntDivide
} from '../ton-format'

describe('TON Format Utilities', () => {
  describe('tonToNanoton', () => {
    it('should convert TON to nanotons correctly', () => {
      expect(tonToNanoton(1)).toBe(1000000000n)
      expect(tonToNanoton(0.1)).toBe(100000000n)
      expect(tonToNanoton(0.000000001)).toBe(1n)
      expect(tonToNanoton(0)).toBe(0n)
      expect(tonToNanoton(1000)).toBe(1000000000000n)
    })

    it('should handle decimal precision correctly', () => {
      expect(tonToNanoton(1.123456789)).toBe(1123456789n)
      expect(tonToNanoton(0.000000001)).toBe(1n)
      expect(tonToNanoton(0.0000000005)).toBe(0n) // Rounds down
    })
  })

  describe('nanotonToTon', () => {
    it('should convert nanotons to TON correctly', () => {
      expect(nanotonToTon(1000000000n)).toBe(1)
      expect(nanotonToTon(100000000n)).toBe(0.1)
      expect(nanotonToTon(1n)).toBe(0.000000001)
      expect(nanotonToTon(0n)).toBe(0)
      expect(nanotonToTon(1500000000n)).toBe(1.5)
    })
  })

  describe('roundtrip conversion', () => {
    it('should preserve values in roundtrip conversion', () => {
      const testValues = [1, 0.1, 0.5, 10, 100, 0.123456789]
      
      testValues.forEach(value => {
        const nanoton = tonToNanoton(value)
        const backToTon = nanotonToTon(nanoton)
        expect(Math.abs(backToTon - value)).toBeLessThan(0.000000001)
      })
    })
  })

  describe('formatTon', () => {
    it('should format TON amounts correctly', () => {
      expect(formatTon(1000000000n)).toBe('1.0000 TON')
      expect(formatTon(1500000000n)).toBe('1.5000 TON')
      expect(formatTon(123456789n)).toBe('0.1235 TON')
      expect(formatTon(1000000000n, 2)).toBe('1.00 TON')
      expect(formatTon(0n)).toBe('0.0000 TON')
    })

    it('should handle custom decimal places', () => {
      expect(formatTon(1123456789n, 6)).toBe('1.123457 TON')
      expect(formatTon(1123456789n, 0)).toBe('1 TON')
    })
  })

  describe('formatTonCompact', () => {
    it('should format large amounts with suffixes', () => {
      expect(formatTonCompact(1000000000000n)).toBe('1.00K TON') // 1K TON
      expect(formatTonCompact(1500000000000n)).toBe('1.50K TON') // 1.5K TON
      expect(formatTonCompact(1000000000000000n)).toBe('1.00M TON') // 1M TON
      expect(formatTonCompact(1500000000000000n)).toBe('1.50M TON') // 1.5M TON
    })

    it('should format small amounts normally', () => {
      expect(formatTonCompact(1000000000n)).toBe('1.0000 TON')
      expect(formatTonCompact(500000000n)).toBe('0.5000 TON')
      expect(formatTonCompact(1000000n)).toBe('0.001000 TON')
    })
  })

  describe('parseUserTonInput', () => {
    it('should parse valid user input', () => {
      expect(parseUserTonInput('1')).toBe(1000000000n)
      expect(parseUserTonInput('1.5')).toBe(1500000000n)
      expect(parseUserTonInput('0.1')).toBe(100000000n)
      expect(parseUserTonInput('10 TON')).toBe(10000000000n)
      expect(parseUserTonInput('1,000.5')).toBe(1000500000000n)
    })

    it('should throw error for invalid input', () => {
      expect(() => parseUserTonInput('invalid')).toThrow('Invalid TON amount')
      expect(() => parseUserTonInput('-1')).toThrow('Invalid TON amount')
      expect(() => parseUserTonInput('')).toThrow('Invalid TON amount')
    })
  })

  describe('validateTonAmount', () => {
    const min = 100000000n // 0.1 TON
    const max = 10000000000000n // 10,000 TON

    it('should validate amounts within range', () => {
      expect(validateTonAmount(1000000000n, min, max)).toBe(true) // 1 TON
      expect(validateTonAmount(min, min, max)).toBe(true)
      expect(validateTonAmount(max, min, max)).toBe(true)
    })

    it('should reject amounts outside range', () => {
      expect(validateTonAmount(50000000n, min, max)).toBe(false) // Too small
      expect(validateTonAmount(20000000000000n, min, max)).toBe(false) // Too large
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentages correctly', () => {
      expect(calculatePercentage(1000000000n, 500)).toBe(50000000n) // 5% of 1 TON
      expect(calculatePercentage(1000000000n, 100)).toBe(10000000n) // 1% of 1 TON
      expect(calculatePercentage(1000000000n, 10000)).toBe(1000000000n) // 100% of 1 TON
      expect(calculatePercentage(1000000000n, 0)).toBe(0n) // 0% of 1 TON
    })

    it('should handle large amounts', () => {
      const largeAmount = 10000000000000n // 10K TON
      expect(calculatePercentage(largeAmount, 500)).toBe(500000000000n) // 5% of 10K TON
    })
  })

  describe('formatAddress', () => {
    const testAddress = 'UQD-_wVnNm3_LVVkl8X2GRGJptest123456789'

    it('should format addresses correctly', () => {
      expect(formatAddress(testAddress)).toBe('UQD-_w...test')
      expect(formatAddress(testAddress, 8, 6)).toBe('UQD-_wVn...123456')
    })

    it('should return full address if shorter than limits', () => {
      const shortAddress = 'UQ123'
      expect(formatAddress(shortAddress)).toBe('UQ123')
    })
  })

  describe('isValidTonAddress', () => {
    it('should validate correct TON addresses', () => {
      expect(isValidTonAddress('UQD-_wVnNm3_LVVkl8X2GRGJptest123456789abcdef')).toBe(true)
      expect(isValidTonAddress('EQA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0')).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(isValidTonAddress('invalid')).toBe(false)
      expect(isValidTonAddress('UQ123')).toBe(false) // Too short
      expect(isValidTonAddress('0QD-_wVnNm3_LVVkl8X2GRGJptest123456789abcdef')).toBe(false) // Wrong prefix
      expect(isValidTonAddress('')).toBe(false)
    })
  })

  describe('safe BigInt arithmetic', () => {
    describe('safeBigIntAdd', () => {
      it('should add BigInts safely', () => {
        expect(safeBigIntAdd(100n, 200n)).toBe(300n)
        expect(safeBigIntAdd(0n, 100n)).toBe(100n)
      })
    })

    describe('safeBigIntSubtract', () => {
      it('should subtract BigInts safely', () => {
        expect(safeBigIntSubtract(300n, 200n)).toBe(100n)
        expect(safeBigIntSubtract(100n, 100n)).toBe(0n)
      })

      it('should throw error for negative results', () => {
        expect(() => safeBigIntSubtract(100n, 200n)).toThrow('Insufficient amount')
      })
    })

    describe('safeBigIntMultiply', () => {
      it('should multiply BigInts safely', () => {
        expect(safeBigIntMultiply(100n, 2n)).toBe(200n)
        expect(safeBigIntMultiply(0n, 100n)).toBe(0n)
      })
    })

    describe('safeBigIntDivide', () => {
      it('should divide BigInts safely', () => {
        expect(safeBigIntDivide(200n, 2n)).toBe(100n)
        expect(safeBigIntDivide(100n, 3n)).toBe(33n) // Integer division
      })

      it('should throw error for division by zero', () => {
        expect(() => safeBigIntDivide(100n, 0n)).toThrow('Division by zero')
      })
    })
  })
})