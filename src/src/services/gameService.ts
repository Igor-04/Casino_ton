import { GameDataStore, GameRound, PayoutDistribution } from '../store/gameStore'
import { AnalyticsService } from './analyticsService'
import { NotificationService } from './notificationService'
import { CONFIG } from '../config'

interface CreateRoundParams {
  mode: 'TIME_LOCKED' | 'CAPACITY_LOCKED'
  stakeTON: number
  deadline?: number
  targetParticipants?: number
  creatorAddress: string
}

interface RoundResult {
  success: boolean
  error?: string
  roundId?: number
}

class GameService {
  private static instance: GameService
  private store: GameDataStore
  private analytics: AnalyticsService
  private notifications: NotificationService
  private intervals: Map<number, NodeJS.Timeout> = new Map()
  private checkIntervals: NodeJS.Timeout[] = []

  private constructor() {
    this.store = GameDataStore.getInstance()
    this.analytics = AnalyticsService.getInstance()
    this.notifications = NotificationService.getInstance()
    this.initializeService()
  }

  static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService()
    }
    return GameService.instance
  }

  private initializeService() {
    // Start periodic cleanup
    const cleanupInterval = setInterval(() => {
      this.store.cleanup()
      this.analytics.cleanup()
      this.notifications.cleanup()
    }, 60 * 60 * 1000) // Every hour
    this.checkIntervals.push(cleanupInterval)

    // Check for expired rounds
    const expiredRoundsInterval = setInterval(() => {
      this.checkExpiredRounds()
    }, 30 * 1000) // Every 30 seconds
    this.checkIntervals.push(expiredRoundsInterval)

    // Check for rounds expiring soon (notification)
    const expiringRoundsInterval = setInterval(() => {
      this.checkExpiringRounds()
    }, 60 * 1000) // Every minute
    this.checkIntervals.push(expiringRoundsInterval)

    // Check for completed capacity rounds
    this.store.subscribe(() => {
      this.checkCapacityRounds()
    })
  }

  // Create a new round
  async createRound(params: CreateRoundParams): Promise<RoundResult> {
    try {
      // Validate parameters
      const validation = this.validateRoundParams(params)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Create the round
      const round = this.store.createRound({
        mode: params.mode,
        stakeTON: params.stakeTON,
        status: 'OPEN',
        participants: 0, // Will be set to 1 by store
        createdBy: params.creatorAddress,
        ...(params.mode === 'TIME_LOCKED' 
          ? { deadline: params.deadline }
          : { targetParticipants: params.targetParticipants }
        )
      })

      // Set up round completion timer for time-locked rounds
      if (params.mode === 'TIME_LOCKED' && params.deadline) {
        this.setupRoundTimer(round.id, params.deadline)
      }

      // Track analytics
      this.analytics.trackEvent('round_created', params.creatorAddress, {
        roundId: round.id,
        mode: params.mode,
        stakeAmount: params.stakeTON,
        ...(params.mode === 'TIME_LOCKED' 
          ? { deadline: params.deadline }
          : { targetParticipants: params.targetParticipants }
        )
      })

      // Send notification
      this.notifications.roundCreated(round.id, params.stakeTON, params.mode)

      return { success: true, roundId: round.id }
    } catch (error) {
      console.error('Failed to create round:', error)
      return { success: false, error: 'Failed to create round' }
    }
  }

  // Join an existing round
  async joinRound(roundId: number, userAddress: string): Promise<RoundResult> {
    try {
      const rounds = this.store.getRounds()
      const round = rounds.find(r => r.id === roundId)

      if (!round) {
        return { success: false, error: 'Round not found' }
      }

      if (round.status !== 'OPEN') {
        return { success: false, error: 'Round is not open for joining' }
      }

      if (round.participantsList.includes(userAddress)) {
        return { success: false, error: 'You are already in this round' }
      }

      // Check capacity for capacity-locked rounds
      if (round.mode === 'CAPACITY_LOCKED' && round.targetParticipants) {
        if (round.participants >= round.targetParticipants) {
          return { success: false, error: 'Round is full' }
        }
      }

      // Check deadline for time-locked rounds
      if (round.mode === 'TIME_LOCKED' && round.deadline) {
        if (Math.floor(Date.now() / 1000) >= round.deadline) {
          return { success: false, error: 'Round deadline has passed' }
        }
      }

      // Join the round
      const success = this.store.joinRound(roundId, userAddress)
      if (!success) {
        return { success: false, error: 'Failed to join round' }
      }

      // Track analytics
      this.analytics.trackEvent('round_joined', userAddress, {
        roundId,
        mode: round.mode,
        stakeAmount: round.stakeTON
      })

      // Send notification
      this.notifications.roundJoined(roundId, round.stakeTON)

      return { success: true, roundId }
    } catch (error) {
      console.error('Failed to join round:', error)
      return { success: false, error: 'Failed to join round' }
    }
  }

  // Distribute rewards for a completed round
  private async distributeRound(roundId: number, reason: 'time_expired' | 'capacity_reached' = 'time_expired'): Promise<void> {
    try {
      const rounds = this.store.getRounds()
      const round = rounds.find(r => r.id === roundId)

      if (!round || round.status !== 'OPEN') {
        return
      }

      if (round.participants < CONFIG.MIN_PARTICIPANTS) {
        // Cancel round if not enough participants
        this.store.updateRoundStatus(roundId, 'CANCELLED')
        
        // Notify participants about cancellation
        round.participantsList.forEach(address => {
          this.notifications.roundCancelled(roundId, 'Недостаточно участников')
        })
        
        return
      }

      // Update status to active
      this.store.updateRoundStatus(roundId, 'ACTIVE')

      // Generate deterministic random distribution
      const payouts = this.generatePayoutDistribution(round)
      const randomSeed = this.generateRandomSeed(round)
      const blockHash = this.generateBlockHash()

      // Distribute the round
      const distributedRound = this.store.distributeRound(roundId, payouts, randomSeed, blockHash)

      if (distributedRound) {
        // Track analytics and send notifications for each participant
        round.participantsList.forEach(address => {
          const userPayout = payouts.find(p => p.userAddress === address)
          if (userPayout) {
            const userWon = userPayout.isWinner
            
            // Track analytics
            this.analytics.trackEvent('round_completed', address, {
              roundId,
              userWon,
              payout: userPayout.amount,
              profit: userPayout.profit,
              mode: round.mode
            })
            
            this.analytics.trackEvent('payout_received', address, {
              roundId,
              amount: userPayout.amount,
              profit: userPayout.profit,
              isWinner: userWon
            })
            
            // Send notification
            this.notifications.roundCompleted(
              roundId, 
              userWon, 
              userPayout.amount, 
              userPayout.profit
            )
          }
          
          // Update user statistics
          this.store.updateUserStats(address)
        })

        // Track round completion
        this.analytics.trackEvent('round_completed', 'system', {
          roundId,
          participants: round.participants,
          totalPayout: round.bank,
          mode: round.mode,
          reason
        })
      }
    } catch (error) {
      console.error('Failed to distribute round:', error)
      this.store.updateRoundStatus(roundId, 'CANCELLED')
      
      // Notify about error
      const rounds = this.store.getRounds()
      const round = rounds.find(r => r.id === roundId)
      if (round) {
        round.participantsList.forEach(address => {
          this.notifications.roundCancelled(roundId, 'Техническая ошибка')
        })
      }
    }
  }

  // Generate payout distribution using deterministic algorithm
  private generatePayoutDistribution(round: GameRound): PayoutDistribution[] {
    const participants = round.participantsList
    const totalPayout = round.bank
    const payouts: PayoutDistribution[] = []

    // Create deterministic seed based on round data
    const seed = this.createDeterministicSeed(round)
    const rng = this.createSeededRandom(seed)

    // Ensure minimum payout constraint (50% of stake)
    const minPayout = round.stakeTON * 0.5
    const maxPayout = Math.min(round.stakeTON * 2.0, totalPayout * 0.8) // Max 80% of total pool or 2x stake
    const guaranteedTotal = participants.length * minPayout

    if (guaranteedTotal > totalPayout) {
      // Not enough funds for guaranteed minimum - distribute evenly
      const evenPayout = totalPayout / participants.length
      participants.forEach(address => {
        payouts.push({
          userAddress: address,
          amount: evenPayout,
          profit: evenPayout - round.stakeTON,
          isWinner: evenPayout > round.stakeTON
        })
      })
      return payouts
    }

    // Calculate remaining pool after guaranteeing minimums
    const extraPool = totalPayout - guaranteedTotal
    
    // Generate random weights for distribution
    const weights: number[] = []
    for (let i = 0; i < participants.length; i++) {
      weights.push(rng())
    }
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)

    // Distribute payouts
    participants.forEach((address, index) => {
      const baseAmount = minPayout
      const extraAmount = extraPool > 0 ? (weights[index] / totalWeight) * extraPool : 0
      const rawAmount = baseAmount + extraAmount
      const finalAmount = Math.min(rawAmount, maxPayout)
      
      payouts.push({
        userAddress: address,
        amount: finalAmount,
        profit: finalAmount - round.stakeTON,
        isWinner: finalAmount > round.stakeTON
      })
    })

    // Redistribute any remaining funds due to max payout caps
    const actualTotal = payouts.reduce((sum, p) => sum + p.amount, 0)
    const difference = totalPayout - actualTotal

    if (difference > 0.001) {
      // Distribute the difference proportionally to non-maxed payouts
      const nonMaxedPayouts = payouts.filter(p => p.amount < maxPayout)
      if (nonMaxedPayouts.length > 0) {
        const perPayoutBonus = difference / nonMaxedPayouts.length
        nonMaxedPayouts.forEach(payout => {
          const newAmount = Math.min(payout.amount + perPayoutBonus, maxPayout)
          payout.amount = newAmount
          payout.profit = newAmount - round.stakeTON
          payout.isWinner = newAmount > round.stakeTON
        })
      }
    }

    return payouts
  }

  // Generate deterministic random seed
  private generateRandomSeed(round: GameRound): string {
    // Use round data + current timestamp for deterministic but unpredictable seed
    const data = `${round.id}-${round.createdAt}-${round.participantsList.sort().join(',')}-${Math.floor(Date.now() / 10000)}`
    return this.hash(data)
  }

  private generateBlockHash(): string {
    return 'block-' + this.hash(Date.now().toString() + Math.random().toString())
  }

  // Create deterministic seed from round data
  private createDeterministicSeed(round: GameRound): number {
    const data = `${round.id}-${round.createdAt}-${round.participantsList.sort().join(',')}-${Math.floor(Date.now() / 60000)}` // Changes every minute
    return this.simpleHash(data)
  }

  // Seeded random number generator (Linear Congruential Generator)
  private createSeededRandom(seed: number): () => number {
    let state = seed
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296
      return state / 4294967296
    }
  }

  // Simple hash function
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // SHA-256 like hash (simplified)
  private hash(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  // Validate round creation parameters
  private validateRoundParams(params: CreateRoundParams): { valid: boolean; error?: string } {
    if (params.stakeTON < CONFIG.MIN_STAKE_TON) {
      return { valid: false, error: `Minimum stake is ${CONFIG.MIN_STAKE_TON} TON` }
    }

    if (params.stakeTON > CONFIG.MAX_STAKE_TON) {
      return { valid: false, error: `Maximum stake is ${CONFIG.MAX_STAKE_TON} TON` }
    }

    if (params.mode === 'TIME_LOCKED') {
      if (!params.deadline) {
        return { valid: false, error: 'Deadline is required for time-locked rounds' }
      }

      const now = Math.floor(Date.now() / 1000)
      const minDeadline = now + (CONFIG.MIN_ROUND_DURATION_MINUTES * 60)
      const maxDeadline = now + (CONFIG.MAX_ROUND_DURATION_DAYS * 24 * 60 * 60)

      if (params.deadline < minDeadline) {
        return { valid: false, error: `Minimum round duration is ${CONFIG.MIN_ROUND_DURATION_MINUTES} minutes` }
      }

      if (params.deadline > maxDeadline) {
        return { valid: false, error: `Maximum round duration is ${CONFIG.MAX_ROUND_DURATION_DAYS} days` }
      }
    }

    if (params.mode === 'CAPACITY_LOCKED') {
      if (!params.targetParticipants) {
        return { valid: false, error: 'Target participants is required for capacity-locked rounds' }
      }

      if (params.targetParticipants < CONFIG.MIN_PARTICIPANTS) {
        return { valid: false, error: `Minimum participants is ${CONFIG.MIN_PARTICIPANTS}` }
      }

      if (params.targetParticipants > CONFIG.MAX_PARTICIPANTS) {
        return { valid: false, error: `Maximum participants is ${CONFIG.MAX_PARTICIPANTS}` }
      }
    }

    return { valid: true }
  }

  // Set up timer for time-locked rounds
  private setupRoundTimer(roundId: number, deadline: number) {
    const now = Math.floor(Date.now() / 1000)
    const delay = (deadline - now) * 1000

    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.distributeRound(roundId, 'time_expired')
        this.intervals.delete(roundId)
      }, delay)

      this.intervals.set(roundId, timeout)
    }
  }

  // Check for expired rounds
  private checkExpiredRounds() {
    const rounds = this.store.getRounds()
    const now = Math.floor(Date.now() / 1000)

    rounds.forEach(round => {
      if (round.mode === 'TIME_LOCKED' && 
          round.deadline && 
          now >= round.deadline && 
          round.status === 'OPEN') {
        this.distributeRound(round.id, 'time_expired')
      }
    })
  }

  // Check for rounds expiring soon and send notifications
  private checkExpiringRounds() {
    const rounds = this.store.getRounds()
    const now = Math.floor(Date.now() / 1000)

    rounds.forEach(round => {
      if (round.mode === 'TIME_LOCKED' && 
          round.deadline && 
          round.status === 'OPEN') {
        
        const timeLeft = round.deadline - now
        const minutesLeft = Math.floor(timeLeft / 60)
        
        // Notify when 5 minutes left
        if (minutesLeft === 5 && timeLeft % 60 < 60) {
          round.participantsList.forEach(address => {
            this.notifications.roundExpiringSoon(round.id, minutesLeft)
          })
        }
      }
    })
  }

  // Check for completed capacity rounds
  private checkCapacityRounds() {
    const rounds = this.store.getRounds()

    rounds.forEach(round => {
      if (round.mode === 'CAPACITY_LOCKED' && 
          round.targetParticipants && 
          round.participants >= round.targetParticipants && 
          round.status === 'OPEN') {
        // Small delay to allow UI updates
        setTimeout(() => {
          this.distributeRound(round.id, 'capacity_reached')
        }, 1000)
      }
    })
  }

  // Get active rounds
  getActiveRounds(): GameRound[] {
    return this.store.getRounds()
  }

  // Get user participation status
  getUserParticipation(): Record<number, boolean> {
    return this.store.getUserParticipation()
  }

  // Initialize user referral data and analytics
  initializeUserReferral(userAddress: string) {
    this.store.initializeReferralData(userAddress)
    this.analytics.initializeUser(userAddress)
  }

  // Get user insights from analytics
  getUserInsights(userAddress: string): string[] {
    return this.analytics.getUserInsights(userAddress)
  }

  // Cleanup service
  destroy() {
    this.intervals.forEach(timeout => clearTimeout(timeout))
    this.intervals.clear()
    this.checkIntervals.forEach(interval => clearInterval(interval))
    this.checkIntervals = []
  }
}

export { GameService, type CreateRoundParams, type RoundResult }