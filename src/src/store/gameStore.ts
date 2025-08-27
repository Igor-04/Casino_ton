interface GameStore {
  rounds: GameRound[]
  roundHistory: TransparentRound[]
  userParticipation: Record<number, boolean>
  userStats: UserStats
  referralData: ReferralData | null
  isLoading: boolean
  error: string | null
}

interface GameRound {
  id: number
  mode: 'TIME_LOCKED' | 'CAPACITY_LOCKED'
  stakeTON: number
  status: 'OPEN' | 'ACTIVE' | 'DISTRIBUTED' | 'CANCELLED'
  participants: number
  targetParticipants?: number
  deadline?: number
  bank: number
  platformFee: number
  minPayout: number
  maxPayout: number
  createdBy: string
  createdAt: number
  participantsList: string[]
  payoutDistribution?: PayoutDistribution[]
  randomSeed?: string
  blockHash?: string
}

interface TransparentRound {
  id: number
  mode: 'TIME_LOCKED' | 'CAPACITY_LOCKED'
  stakeTON: number
  status: 'DISTRIBUTED' | 'CANCELLED'
  participants: number
  bank: number
  platformFee: number
  minPayout: number
  maxPayout: number
  createdBy: string
  userParticipated: boolean
  userPayout?: number
  userProfit?: number
  createdAt: number
  completedAt: number
  randomnessProof: {
    seed: string
    blockHash: string
    blockHeight: number
    commitHash: string
    revealTimestamp: number
  }
  payoutDistribution: PayoutDistribution[]
}

interface PayoutDistribution {
  userAddress: string
  amount: number
  profit: number
  isWinner: boolean
}

interface UserStats {
  totalGames: number
  totalWon: number
  totalLost: number
  totalProfit: number
  winRate: number
  avgProfit: number
  bestWin: number
  totalDeposited: number
  totalWithdrawn: number
}

interface ReferralData {
  userAddress: string
  referralCode: string
  stats: {
    totalInvited: number
    totalEarned: number
    activeInvitees: number
  }
  invitedUsers: Array<{
    address: string
    joinedAt: number
    totalPlayed: number
    earned: number
  }>
  rewards: Array<{
    id: string
    fromUser: string
    amount: number
    timestamp: number
    roundId: number
  }>
}

class GameDataStore {
  private static instance: GameDataStore
  private data: GameStore = {
    rounds: [],
    roundHistory: [],
    userParticipation: {},
    userStats: {
      totalGames: 0,
      totalWon: 0,
      totalLost: 0,
      totalProfit: 0,
      winRate: 0,
      avgProfit: 0,
      bestWin: 0,
      totalDeposited: 0,
      totalWithdrawn: 0
    },
    referralData: null,
    isLoading: false,
    error: null
  }
  
  private listeners: Set<() => void> = new Set()
  private storageKey = 'tonGamesData'

  private constructor() {
    this.loadFromStorage()
    this.setupStorageListener()
  }

  static getInstance(): GameDataStore {
    if (!GameDataStore.instance) {
      GameDataStore.instance = new GameDataStore()
    }
    return GameDataStore.instance
  }

  // Storage management
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsedData = JSON.parse(stored)
        this.data = { ...this.data, ...parsedData }
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error)
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data))
    } catch (error) {
      console.error('Failed to save data to storage:', error)
    }
  }

  private setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          this.data = JSON.parse(e.newValue)
          this.notifyListeners()
        } catch (error) {
          console.error('Failed to sync data from storage:', error)
        }
      }
    })
  }

  // Subscription management
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  private updateData(updater: (data: GameStore) => Partial<GameStore>) {
    const updates = updater(this.data)
    this.data = { ...this.data, ...updates }
    this.saveToStorage()
    this.notifyListeners()
  }

  // Getters
  getData(): GameStore {
    return this.data
  }

  getRounds(): GameRound[] {
    return this.data.rounds
  }

  getRoundHistory(): TransparentRound[] {
    return this.data.roundHistory
  }

  getUserParticipation(): Record<number, boolean> {
    return this.data.userParticipation
  }

  getUserStats(): UserStats {
    return this.data.userStats
  }

  getReferralData(): ReferralData | null {
    return this.data.referralData
  }

  // Round management
  createRound(roundData: Omit<GameRound, 'id' | 'createdAt' | 'participantsList' | 'bank' | 'platformFee' | 'minPayout' | 'maxPayout'>): GameRound {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const platformFee = roundData.stakeTON * 0.05
    const bank = roundData.stakeTON - platformFee
    const minPayout = roundData.stakeTON * 0.5
    const maxPayout = roundData.stakeTON * 2.0

    const newRound: GameRound = {
      ...roundData,
      id,
      createdAt: Math.floor(Date.now() / 1000),
      participantsList: [roundData.createdBy],
      participants: 1,
      bank,
      platformFee,
      minPayout,
      maxPayout
    }

    this.updateData(data => ({
      rounds: [newRound, ...data.rounds],
      userParticipation: {
        ...data.userParticipation,
        [id]: true
      }
    }))

    return newRound
  }

  joinRound(roundId: number, userAddress: string): boolean {
    const round = this.data.rounds.find(r => r.id === roundId)
    if (!round || round.status !== 'OPEN' || round.participantsList.includes(userAddress)) {
      return false
    }

    // Check capacity limits
    if (round.mode === 'CAPACITY_LOCKED' && round.participants >= (round.targetParticipants || 0)) {
      return false
    }

    // Check time limits
    if (round.mode === 'TIME_LOCKED' && round.deadline && Date.now() / 1000 > round.deadline) {
      return false
    }

    const updatedRound = {
      ...round,
      participants: round.participants + 1,
      participantsList: [...round.participantsList, userAddress],
      bank: round.bank + round.stakeTON - (round.stakeTON * 0.05)
    }

    this.updateData(data => ({
      rounds: data.rounds.map(r => r.id === roundId ? updatedRound : r),
      userParticipation: {
        ...data.userParticipation,
        [roundId]: true
      }
    }))

    // Process referral reward
    this.processReferralReward(userAddress, round.stakeTON * 0.05 * 0.4) // 40% of platform fee

    return true
  }

  updateRoundStatus(roundId: number, status: GameRound['status']) {
    this.updateData(data => ({
      rounds: data.rounds.map(r => 
        r.id === roundId ? { ...r, status } : r
      )
    }))
  }

  distributeRound(roundId: number, payouts: PayoutDistribution[], randomSeed: string, blockHash: string): TransparentRound | null {
    const round = this.data.rounds.find(r => r.id === roundId)
    if (!round) return null

    const completedRound: TransparentRound = {
      id: round.id,
      mode: round.mode,
      stakeTON: round.stakeTON,
      status: 'DISTRIBUTED',
      participants: round.participants,
      bank: round.bank,
      platformFee: round.platformFee,
      minPayout: round.minPayout,
      maxPayout: round.maxPayout,
      createdBy: round.createdBy,
      userParticipated: false, // Will be updated
      createdAt: round.createdAt,
      completedAt: Math.floor(Date.now() / 1000),
      randomnessProof: {
        seed: randomSeed,
        blockHash,
        blockHeight: Math.floor(Math.random() * 1000000),
        commitHash: 'commit-' + randomSeed,
        revealTimestamp: Math.floor(Date.now() / 1000)
      },
      payoutDistribution: payouts
    }

    // Remove from active rounds and add to history
    this.updateData(data => ({
      rounds: data.rounds.filter(r => r.id !== roundId),
      roundHistory: [completedRound, ...data.roundHistory]
    }))

    return completedRound
  }

  // User statistics
  updateUserStats(userAddress: string) {
    const userHistory = this.data.roundHistory.filter(r => 
      r.payoutDistribution?.some(p => p.userAddress === userAddress)
    )

    if (userHistory.length === 0) {
      this.updateData(data => ({
        userStats: {
          totalGames: 0,
          totalWon: 0,
          totalLost: 0,
          totalProfit: 0,
          winRate: 0,
          avgProfit: 0,
          bestWin: 0,
          totalDeposited: 0,
          totalWithdrawn: 0
        }
      }))
      return
    }

    let totalGames = 0
    let totalWon = 0
    let totalLost = 0
    let totalProfit = 0
    let totalDeposited = 0
    let totalWithdrawn = 0
    let bestWin = 0

    userHistory.forEach(round => {
      const userPayout = round.payoutDistribution?.find(p => p.userAddress === userAddress)
      if (userPayout) {
        totalGames++
        totalDeposited += round.stakeTON
        totalWithdrawn += userPayout.amount
        
        if (userPayout.profit > 0) {
          totalWon++
          totalProfit += userPayout.profit
          bestWin = Math.max(bestWin, userPayout.profit)
        } else {
          totalLost++
          totalProfit += userPayout.profit // negative value
        }
      }
    })

    const winRate = totalGames > 0 ? (totalWon / totalGames) * 100 : 0
    const avgProfit = totalGames > 0 ? totalProfit / totalGames : 0

    this.updateData(data => ({
      userStats: {
        totalGames,
        totalWon,
        totalLost,
        totalProfit,
        winRate,
        avgProfit,
        bestWin,
        totalDeposited,
        totalWithdrawn
      }
    }))
  }

  // Referral system
  initializeReferralData(userAddress: string) {
    if (this.data.referralData?.userAddress === userAddress) return

    const referralData: ReferralData = {
      userAddress,
      referralCode: userAddress,
      stats: {
        totalInvited: 0,
        totalEarned: 0,
        activeInvitees: 0
      },
      invitedUsers: [],
      rewards: []
    }

    this.updateData(data => ({ referralData }))
  }

  private processReferralReward(userAddress: string, amount: number) {
    const referrer = localStorage.getItem('tonGamesReferrer')
    if (!referrer || referrer === userAddress) return

    // Add referral reward
    const reward = {
      id: Date.now().toString(),
      fromUser: userAddress,
      amount,
      timestamp: Math.floor(Date.now() / 1000),
      roundId: 0 // Will be updated when implementing real contract integration
    }

    this.updateData(data => {
      if (!data.referralData) return data

      const existingInvitee = data.referralData.invitedUsers.find(u => u.address === userAddress)
      const updatedInvitedUsers = existingInvitee
        ? data.referralData.invitedUsers.map(u => 
            u.address === userAddress 
              ? { ...u, totalPlayed: u.totalPlayed + 1, earned: u.earned + amount }
              : u
          )
        : [
            ...data.referralData.invitedUsers,
            {
              address: userAddress,
              joinedAt: Math.floor(Date.now() / 1000),
              totalPlayed: 1,
              earned: amount
            }
          ]

      return {
        referralData: {
          ...data.referralData,
          stats: {
            totalInvited: updatedInvitedUsers.length,
            totalEarned: data.referralData.stats.totalEarned + amount,
            activeInvitees: updatedInvitedUsers.filter(u => u.totalPlayed > 0).length
          },
          invitedUsers: updatedInvitedUsers,
          rewards: [reward, ...data.referralData.rewards]
        }
      }
    })
  }

  // Cleanup old data
  cleanup() {
    const cutoffTime = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // 30 days

    this.updateData(data => ({
      roundHistory: data.roundHistory.filter(r => r.completedAt > cutoffTime),
      rounds: data.rounds.filter(r => {
        // Remove expired rounds
        if (r.mode === 'TIME_LOCKED' && r.deadline && r.deadline < Math.floor(Date.now() / 1000)) {
          return false
        }
        return true
      })
    }))
  }

  // Reset all data (for development/testing)
  reset() {
    this.data = {
      rounds: [],
      roundHistory: [],
      userParticipation: {},
      userStats: {
        totalGames: 0,
        totalWon: 0,
        totalLost: 0,
        totalProfit: 0,
        winRate: 0,
        avgProfit: 0,
        bestWin: 0,
        totalDeposited: 0,
        totalWithdrawn: 0
      },
      referralData: null,
      isLoading: false,
      error: null
    }
    this.saveToStorage()
    this.notifyListeners()
  }
}

export { GameDataStore, type GameStore, type GameRound, type TransparentRound, type UserStats, type ReferralData, type PayoutDistribution }