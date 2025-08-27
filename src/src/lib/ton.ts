// TON blockchain contract interactions
import { CONFIG } from '../config'
import { TonClient, Address } from 'ton'
import { beginCell } from '@ton/core'
import { sendTransaction } from './tonConnect'

// Resolved contract address from environment configuration
const CONTRACT_ADDRESS: string = CONFIG.CONTRACT_ADDRESS

// Enums matching the smart contract
export enum RoundMode {
  TIME_LOCKED = 0,
  CAPACITY_LOCKED = 1
}

export enum RoundStatus {
  OPEN = 0,
  LOCKED = 1,
  DISTRIBUTED = 2,
  REFUNDED = 3
}

// Contract data structures
export interface ContractRound {
  id: number
  mode: RoundMode
  stakeNanoton: bigint
  status: RoundStatus
  participants: string[]
  deadline?: number
  targetParticipants?: number
  totalPool: bigint
  platformFee: bigint
  creator: string
  createdAt: number
  
  // For completed rounds
  seed?: string
  blockHash?: string
  blockHeight?: number
  payouts: Map<string, bigint>
}

export interface ReferralStats {
  totalInvited: number
  totalEarned: bigint
  activeInvitees: number
  invitedUsers: {
    address: string
    invitedAt: number
    totalContributions: number
    totalVolume: bigint
    earnedFromUser: bigint
    lastActivity: number
  }[]
}

export interface TransactionResult {
  success: boolean
  hash?: string
  error?: string
}

export interface CreateRoundParams {
  mode: RoundMode
  stakeNanoton: bigint
  deadline?: number
  targetParticipants?: number
}

let client: TonClient | null = null

function getClient(): TonClient {
  if (client) return client
  const endpoint =
    CONFIG.NETWORK === 'mainnet'
      ? 'https://toncenter.com/api/v2/jsonRPC'
      : 'https://testnet.toncenter.com/api/v2/jsonRPC'
  client = new TonClient({ endpoint })
  return client
}

function parseRounds(res: any): ContractRound[] {
  const items = (res?.stack?.items ?? []) as any[]
  return items.map((item, idx) => {
    try {
      const cell = item.cell
      const slice = cell.beginParse()
      const id = Number(slice.loadUint(32))
      const mode = slice.loadUint(8) as RoundMode
      const stakeNanoton = slice.loadCoins()
      const status = slice.loadUint(8) as RoundStatus
      const creator = slice.loadAddress().toString()
      const createdAt = Number(slice.loadUint(32))
      const totalPool = slice.loadCoins()
      const platformFee = slice.loadCoins()
      return {
        id,
        mode,
        stakeNanoton,
        status,
        participants: [],
        totalPool,
        platformFee,
        creator,
        createdAt,
        payouts: new Map()
      }
    } catch {
      return {
        id: idx,
        mode: RoundMode.TIME_LOCKED,
        stakeNanoton: 0n,
        status: RoundStatus.OPEN,
        participants: [],
        totalPool: 0n,
        platformFee: 0n,
        creator: '',
        createdAt: 0,
        payouts: new Map()
      }
    }
  })
}

function parseReferral(res: any): ReferralStats {
  try {
    const slice = res?.stack?.items?.[0]?.cell?.beginParse()
    if (!slice) {
      return { totalInvited: 0, totalEarned: 0n, activeInvitees: 0, invitedUsers: [] }
    }
    const totalInvited = Number(slice.loadUint(16))
    const totalEarned = slice.loadCoins()
    const activeInvitees = Number(slice.loadUint(16))
    return { totalInvited, totalEarned, activeInvitees, invitedUsers: [] }
  } catch {
    return { totalInvited: 0, totalEarned: 0n, activeInvitees: 0, invitedUsers: [] }
  }
}

// Contract interaction functions
export async function getActiveRounds(): Promise<ContractRound[]> {
  try {
    if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
    const res = await getClient().callGetMethod(
      Address.parse(CONTRACT_ADDRESS),
      'get_active_rounds',
      []
    )
    return parseRounds(res).filter(
      round =>
        round.status === RoundStatus.OPEN || round.status === RoundStatus.LOCKED
    )
  } catch (error) {
    console.error('Failed to fetch active rounds:', error)
    throw new Error('Failed to load active rounds')
  }
}

export async function getRoundHistory(limit: number = 20): Promise<ContractRound[]> {
  try {
    if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
    const res = await getClient().callGetMethod(
      Address.parse(CONTRACT_ADDRESS),
      'get_round_history',
      []
    )
    return parseRounds(res)
      .filter(
        round =>
          round.status === RoundStatus.DISTRIBUTED ||
          round.status === RoundStatus.REFUNDED
      )
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to fetch round history:', error)
    throw new Error('Failed to load round history')
  }
}

export async function getUserReferralStats(userAddress: string): Promise<ReferralStats> {
  try {
    if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
    const payload = beginCell()
      .storeAddress(Address.parse(userAddress))
      .endCell()
    const res = await getClient().callGetMethod(
      Address.parse(CONTRACT_ADDRESS),
      'get_referral_stats',
      [{ type: 'slice', cell: payload }]
    )
    return parseReferral(res)
  } catch (error) {
    console.error('Failed to fetch referral stats:', error)
    throw new Error('Failed to load referral data')
  }
}

export async function createRound(params: CreateRoundParams): Promise<TransactionResult> {
  try {
    if (!CONTRACT_ADDRESS) {
      return { success: false, error: 'Contract address not configured' }
    }
    const payload = beginCell()
      .storeUint(0x01, 32)
      .storeUint(params.mode, 8)
      .storeCoins(params.stakeNanoton)
      .storeUint(params.deadline ?? 0, 32)
      .storeUint(params.targetParticipants ?? 0, 16)
      .endCell()
    const result = await sendTransaction({
      to: CONTRACT_ADDRESS,
      amount: params.stakeNanoton.toString(),
      payload: payload.toBoc().toString('base64')
    })
    return { success: true, hash: result?.hash }
  } catch (error) {
    console.error('Failed to create round:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create round'
    }
  }
}

export async function joinRound(roundId: number, referrer?: string): Promise<TransactionResult> {
  try {
    if (!CONTRACT_ADDRESS) {
      return { success: false, error: 'Contract address not configured' }
    }
    const builder = beginCell().storeUint(0x02, 32).storeUint(roundId, 32)
    if (referrer) {
      builder.storeAddress(Address.parse(referrer))
    }
    const payload = builder.endCell()
    const result = await sendTransaction({
      to: CONTRACT_ADDRESS,
      amount: '0',
      payload: payload.toBoc().toString('base64')
    })
    return { success: true, hash: result?.hash }
  } catch (error) {
    console.error('Failed to join round:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join round'
    }
  }
}

export async function withdraw(roundId: number): Promise<TransactionResult> {
  try {
    if (!CONTRACT_ADDRESS) {
      return { success: false, error: 'Contract address not configured' }
    }
    const payload = beginCell()
      .storeUint(0x03, 32)
      .storeUint(roundId, 32)
      .endCell()
    const result = await sendTransaction({
      to: CONTRACT_ADDRESS,
      amount: '0',
      payload: payload.toBoc().toString('base64')
    })
    return { success: true, hash: result?.hash }
  } catch (error) {
    console.error('Failed to withdraw:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to withdraw'
    }
  }
}

// Utility functions
export function isContractDeployed(): boolean {
  return !!CONFIG.CONTRACT_ADDRESS
}

export function getContractAddress(): string {
  return CONFIG.CONTRACT_ADDRESS
}

// Initialize contract connection
export async function initializeContract(): Promise<void> {
  try {
    console.log('Initializing contract connection...')

    if (!isContractDeployed()) {
      console.warn('Contract address not configured')
      return
    }

    getClient()
    console.log('Contract initialized successfully')
  } catch (error) {
    console.error('Failed to initialize contract:', error)
    throw new Error('Failed to connect to smart contract')
  }
}