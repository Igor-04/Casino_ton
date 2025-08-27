// Referral system related types

// Main referral data structure for a user
export interface ReferralData {
  // User's wallet address
  userAddress: string
  
  // User's unique referral code (typically their address)
  referralCode: string
  
  // Referral statistics
  stats: ReferralStats
  
  // List of users invited by this user
  invitedUsers: InvitedUser[]
}

// Referral statistics summary
export interface ReferralStats {
  // Total number of users invited
  totalInvited: number
  
  // Total amount earned from referrals (in TON)
  totalEarned: number
  
  // Number of invitees who are still active
  activeInvitees: number
}

// Information about a user who was invited
export interface InvitedUser {
  // Invited user's wallet address
  address: string
  
  // Timestamp when user was invited
  invitedAt: number
  
  // Number of games this user has participated in
  totalContributions: number
  
  // Total volume of TON this user has staked
  totalVolume: number
  
  // Total amount earned from this specific user
  earnedFromUser: number
  
  // Timestamp of their last activity
  lastActivity: number
}

// Individual referral reward/commission
export interface ReferralReward {
  // Unique identifier for this reward
  id: string
  
  // Wallet address of the referrer who earned this reward
  referrerAddress: string
  
  // Wallet address of the referee who generated this reward
  refereeAddress: string
  
  // Round ID that generated this reward
  roundId: number
  
  // Amount of reward earned (in TON)
  amount: number
  
  // Percentage rate used for this reward
  commissionRate: number
  
  // Original stake amount that generated this commission
  originalStake: number
  
  // Timestamp when reward was earned
  earnedAt: number
  
  // Whether the reward has been paid out
  isPaid: boolean
  
  // Transaction hash of the payout (if paid)
  payoutHash?: string
  
  // Timestamp when reward was paid out
  paidAt?: number
}

// Referral program configuration
export interface ReferralConfig {
  // Commission rate as percentage (e.g., 2 for 2%)
  commissionRate: number
  
  // Minimum stake required to earn referral rewards
  minimumStake: number
  
  // Maximum number of levels in referral chain
  maxLevels: number
  
  // Whether referral rewards are automatically paid out
  autoPayout: boolean
  
  // Minimum amount before payout is triggered
  minimumPayout: number
  
  // Cooldown period between payouts (in seconds)
  payoutCooldown: number
}

// Referral link information
export interface ReferralLink {
  // Full referral URL
  url: string
  
  // Referral code embedded in the link
  code: string
  
  // Number of times this link has been clicked
  clicks: number
  
  // Number of successful conversions from this link
  conversions: number
  
  // Conversion rate (conversions / clicks)
  conversionRate: number
  
  // When this link was first created
  createdAt: number
  
  // When this link was last used
  lastUsed?: number
}

// Referral tier system (for future expansion)
export interface ReferralTier {
  // Tier identifier
  id: string
  
  // Tier name (e.g., "Bronze", "Silver", "Gold")
  name: string
  
  // Commission rate for this tier
  commissionRate: number
  
  // Minimum requirements to reach this tier
  requirements: {
    totalInvited: number
    totalVolume: number
    activeInvitees: number
  }
  
  // Benefits of this tier
  benefits: string[]
}

// Referral analytics for dashboard
export interface ReferralAnalytics {
  // Time period for these analytics
  period: {
    startDate: number
    endDate: number
  }
  
  // Performance metrics
  metrics: {
    newInvites: number
    totalEarnings: number
    averageEarningPerInvite: number
    conversionRate: number
    retentionRate: number
  }
  
  // Daily breakdown of activity
  dailyStats: DailyReferralStats[]
  
  // Top performing invitees
  topInvitees: InvitedUser[]
}

// Daily referral statistics
export interface DailyReferralStats {
  // Date (timestamp at midnight UTC)
  date: number
  
  // Number of new invites on this day
  newInvites: number
  
  // Total earnings on this day
  earnings: number
  
  // Number of link clicks
  clicks: number
  
  // Number of conversions
  conversions: number
}

// Referral payout batch (for processing multiple payouts)
export interface ReferralPayoutBatch {
  // Batch identifier
  batchId: string
  
  // List of rewards in this batch
  rewards: ReferralReward[]
  
  // Total amount to be paid out
  totalAmount: number
  
  // Batch status
  status: 'pending' | 'processing' | 'completed' | 'failed'
  
  // When this batch was created
  createdAt: number
  
  // When this batch was processed
  processedAt?: number
  
  // Transaction hash for the batch payout
  transactionHash?: string
  
  // Error message if batch failed
  error?: string
}

// Type guards and utility functions
export function isValidReferralCode(code: string): boolean {
  // Basic validation - could be extended based on requirements
  return code.length > 10 && code.startsWith('UQ')
}

export function calculateCommission(stakeAmount: number, commissionRate: number): number {
  return stakeAmount * (commissionRate / 100)
}

export function isActiveInvitee(invitee: InvitedUser, activeDays: number = 30): boolean {
  const now = Date.now() / 1000
  const cutoff = now - (activeDays * 24 * 60 * 60)
  return invitee.lastActivity > cutoff
}

// Constants for referral system
export const REFERRAL_CONSTANTS = {
  // Default commission rate (2%)
  DEFAULT_COMMISSION_RATE: 2,
  
  // Minimum stake to earn referral rewards
  MINIMUM_STAKE_FOR_REFERRAL: 0.1,
  
  // Maximum referral chain depth
  MAX_REFERRAL_LEVELS: 1,
  
  // Minimum payout threshold
  MINIMUM_PAYOUT: 0.01,
  
  // Cooldown between payouts (24 hours)
  PAYOUT_COOLDOWN: 24 * 60 * 60,
  
  // Days to consider an invitee "active"
  ACTIVE_DAYS_THRESHOLD: 30,
  
  // Maximum length for referral codes
  MAX_REFERRAL_CODE_LENGTH: 50
} as const

// Export types for external use
export type ReferralStatus = 'active' | 'inactive' | 'suspended'
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ReferralEventType = 'invite' | 'join' | 'reward' | 'payout'