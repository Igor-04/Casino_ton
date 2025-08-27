/**
 * Data conversion utilities for transforming contract data to UI format
 */
import { ContractRound, RoundMode, RoundStatus } from '../lib/ton'
import { nanotonToTon } from '../lib/ton-format'
import { getUserFriendlyAddress } from '../lib/tonConnect'

/**
 * Convert contract round to component format
 */
export const convertContractRound = (contractRound: ContractRound) => ({
  id: contractRound.id,
  mode: contractRound.mode === RoundMode.TIME_LOCKED ? 'TIME_LOCKED' as const : 'CAPACITY_LOCKED' as const,
  stakeTON: nanotonToTon(contractRound.stakeNanoton),
  status: contractRound.status === RoundStatus.OPEN ? 'OPEN' as const : 
          contractRound.status === RoundStatus.LOCKED ? 'LOCKED' as const :
          contractRound.status === RoundStatus.DISTRIBUTED ? 'DISTRIBUTED' as const : 'REFUNDED' as const,
  participants: contractRound.participants.length,
  deadline: contractRound.deadline,
  targetParticipants: contractRound.targetParticipants,
  bank: nanotonToTon(contractRound.totalPool + contractRound.platformFee),
  platformFee: nanotonToTon(contractRound.platformFee),
  minPayout: nanotonToTon(contractRound.stakeNanoton) * 0.95 * 0.5, // 50% after platform fee
  maxPayout: nanotonToTon(contractRound.totalPool), // Theoretical maximum
  createdBy: contractRound.creator,
  createdAt: contractRound.createdAt
})

/**
 * Convert contract round to history format with transparency data
 */
export const convertContractRoundToHistory = (round: ContractRound) => {
  const userAddress = getUserFriendlyAddress()
  const userPayout = userAddress && round.payouts.has(userAddress) ? 
    nanotonToTon(round.payouts.get(userAddress)!) : undefined

  return {
    ...convertContractRound(round),
    // Add transparency data
    seed: round.seed,
    blockHash: round.blockHash,
    blockHeight: round.blockHeight,
    userParticipated: userAddress ? round.participants.includes(userAddress) : false,
    userPayout,
    // Calculate profit
    userProfit: userPayout !== undefined ? userPayout - nanotonToTon(round.stakeNanoton) : undefined
  }
}

/**
 * Convert referral stats from contract format to UI format
 */
export const convertReferralStats = (referralStats: any, userAddress: string) => ({
  userAddress,
  referralCode: userAddress,
  stats: {
    totalInvited: referralStats.totalInvited,
    totalEarned: nanotonToTon(referralStats.totalEarned),
    activeInvitees: referralStats.activeInvitees
  },
  invitedUsers: referralStats.invitedUsers.map((user: any) => ({
    ...user,
    totalVolume: nanotonToTon(user.totalVolume),
    earnedFromUser: nanotonToTon(user.earnedFromUser)
  }))
})

/**
 * Convert UI round data to contract format for creation
 */
export const convertUIRoundToContract = (roundData: {
  mode: 'TIME_LOCKED' | 'CAPACITY_LOCKED'
  stakeTON: number
  deadline?: number
  targetParticipants?: number
}) => ({
  mode: roundData.mode === 'TIME_LOCKED' ? RoundMode.TIME_LOCKED : RoundMode.CAPACITY_LOCKED,
  stakeNanoton: BigInt(Math.floor(roundData.stakeTON * 1000000000)),
  deadline: roundData.deadline,
  targetParticipants: roundData.targetParticipants
})

/**
 * Create user participation map from contract rounds
 */
export const createParticipationMap = (contractRounds: ContractRound[], userAddress: string | null): Record<number, boolean> => {
  if (!userAddress) return {}
  
  const participation: Record<number, boolean> = {}
  for (const round of contractRounds) {
    participation[round.id] = round.participants.includes(userAddress)
  }
  return participation
}