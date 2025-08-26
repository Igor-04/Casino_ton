// TON formatting and conversion utilities

/**
 * Convert nanotokens to TON
 * 1 TON = 1,000,000,000 nanotokens (10^9)
 */
export function nanotonToTon(nanoton: bigint): number {
  const TON_DECIMALS = 9
  const divisor = BigInt(10 ** TON_DECIMALS)
  
  // Convert to number for easier handling
  // For very large values, this might lose precision, but for typical game amounts it's fine
  const tonValue = Number(nanoton) / Number(divisor)
  
  return tonValue
}

/**
 * Convert TON to nanotokens
 * 1 TON = 1,000,000,000 nanotokens (10^9)
 */
export function tonToNanoton(ton: number): bigint {
  const TON_DECIMALS = 9
  const multiplier = BigInt(10 ** TON_DECIMALS)
  
  // Handle potential precision issues by rounding to avoid floating point errors
  const nanotonValue = Math.round(ton * Number(multiplier))
  
  return BigInt(nanotonValue)
}

/**
 * Format TON amount for display with appropriate precision
 */
export function formatTon(
  amount: bigint | number, 
  options: {
    decimals?: number
    showSymbol?: boolean
    compact?: boolean
  } = {}
): string {
  const {
    decimals = 4,
    showSymbol = true,
    compact = false
  } = options

  let tonValue: number
  
  if (typeof amount === 'bigint') {
    tonValue = nanotonToTon(amount)
  } else {
    tonValue = amount
  }

  // Handle very small amounts
  if (tonValue === 0) {
    return showSymbol ? '0 TON' : '0'
  }

  // For compact formatting of large numbers
  if (compact && tonValue >= 1000000) {
    const millions = tonValue / 1000000
    const formatted = millions.toFixed(1)
    return showSymbol ? `${formatted}M TON` : `${formatted}M`
  } else if (compact && tonValue >= 1000) {
    const thousands = tonValue / 1000
    const formatted = thousands.toFixed(1)
    return showSymbol ? `${formatted}K TON` : `${formatted}K`
  }

  // Regular formatting
  let formatted: string

  if (tonValue >= 1) {
    // For amounts >= 1 TON, show fewer decimals
    formatted = tonValue.toFixed(Math.min(decimals, 4))
  } else if (tonValue >= 0.01) {
    // For amounts >= 0.01 TON, show more decimals
    formatted = tonValue.toFixed(Math.min(decimals, 6))
  } else {
    // For very small amounts, show even more decimals
    formatted = tonValue.toFixed(Math.min(decimals, 8))
  }

  // Remove trailing zeros
  formatted = formatted.replace(/\.?0+$/, '')

  return showSymbol ? `${formatted} TON` : formatted
}

/**
 * Format TON amount for input fields (no symbol, appropriate precision)
 */
export function formatTonForInput(amount: bigint | number): string {
  return formatTon(amount, { showSymbol: false, decimals: 6 })
}

/**
 * Format TON amount compactly for small displays
 */
export function formatTonCompact(amount: bigint | number): string {
  return formatTon(amount, { compact: true, decimals: 2 })
}

/**
 * Parse TON amount from string input
 */
export function parseTonAmount(input: string): number {
  // Remove any non-numeric characters except decimal point
  const cleaned = input.replace(/[^\d.]/g, '')
  
  // Parse as float
  const parsed = parseFloat(cleaned)
  
  // Return 0 if invalid
  if (isNaN(parsed) || parsed < 0) {
    return 0
  }
  
  return parsed
}

/**
 * Validate TON amount for UI inputs
 */
export function validateTonAmount(
  amount: number, 
  options: {
    min?: number
    max?: number
    maxDecimals?: number
  } = {}
): { valid: boolean; error?: string } {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, maxDecimals = 9 } = options

  if (isNaN(amount)) {
    return { valid: false, error: 'Invalid amount' }
  }

  if (amount < min) {
    return { valid: false, error: `Minimum amount is ${min} TON` }
  }

  if (amount > max) {
    return { valid: false, error: `Maximum amount is ${max} TON` }
  }

  // Check decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length
  if (decimalPlaces > maxDecimals) {
    return { valid: false, error: `Maximum ${maxDecimals} decimal places allowed` }
  }

  return { valid: true }
}

/**
 * Calculate platform fee from stake amount
 */
export function calculatePlatformFee(stakeAmount: number, feePercent: number): number {
  return stakeAmount * (feePercent / 100)
}

/**
 * Calculate guaranteed minimum payout (50% of stake after fees)
 */
export function calculateMinPayout(stakeAmount: number, feePercent: number): number {
  const afterFees = stakeAmount * (1 - feePercent / 100)
  return afterFees * 0.5
}

/**
 * Format percentage values
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Safe conversion from string to number for TON amounts
 */
export function safeTonStringToNumber(value: string): number {
  const parsed = parseTonAmount(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Check if two TON amounts are approximately equal (within small tolerance)
 */
export function tonAmountsEqual(a: number, b: number, tolerance: number = 0.000001): boolean {
  return Math.abs(a - b) < tolerance
}

/**
 * Constants for TON blockchain
 */
export const TON_CONSTANTS = {
  DECIMALS: 9,
  MIN_TRANSACTION_FEE: 0.005, // Typical minimum transaction fee in TON
  TYPICAL_GAS_FEE: 0.01, // Typical gas fee for contract interactions
  MAX_PRECISION: 9, // Maximum decimal precision for TON
  NANOTON_PER_TON: 1000000000, // 10^9 nanotokens per TON
} as const

/**
 * Format duration in seconds to human readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  } else {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  }
}

/**
 * Format timestamp to human readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000) // Convert from seconds to milliseconds
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Relative time for recent dates
  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  // Absolute date for older dates
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}