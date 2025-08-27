import { useState, useEffect, useCallback } from 'react'
import { GameService, CreateRoundParams, RoundResult } from '../services/gameService'
import { GameDataStore, GameRound, TransparentRound, UserStats, ReferralData } from '../store/gameStore'

interface UseGameServiceReturn {
  // Data
  rounds: GameRound[]
  roundHistory: TransparentRound[]
  userParticipation: Record<number, boolean>
  userStats: UserStats
  referralData: ReferralData | null
  
  // Loading states
  isLoadingRounds: boolean
  isLoadingHistory: boolean
  isLoadingReferrals: boolean
  
  // Actions
  createRound: (params: CreateRoundParams) => Promise<RoundResult>
  joinRound: (roundId: number, userAddress: string) => Promise<RoundResult>
  loadRoundHistory: () => Promise<void>
  refreshRounds: () => Promise<void>
  initializeUser: (userAddress: string) => void
  
  // Error handling
  error: string | null
  clearError: () => void
}

export function useGameService(): UseGameServiceReturn {
  const [gameService] = useState(() => GameService.getInstance())
  const [gameStore] = useState(() => GameDataStore.getInstance())
  
  // State from store
  const [rounds, setRounds] = useState<GameRound[]>([])
  const [roundHistory, setRoundHistory] = useState<TransparentRound[]>([])
  const [userParticipation, setUserParticipation] = useState<Record<number, boolean>>({})
  const [userStats, setUserStats] = useState<UserStats>({
    totalGames: 0,
    totalWon: 0,
    totalLost: 0,
    totalProfit: 0,
    winRate: 0,
    avgProfit: 0,
    bestWin: 0,
    totalDeposited: 0,
    totalWithdrawn: 0
  })
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  
  // Loading states
  const [isLoadingRounds, setIsLoadingRounds] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  // Subscribe to store changes
  useEffect(() => {
    const updateFromStore = () => {
      const data = gameStore.getData()
      setRounds(data.rounds)
      setRoundHistory(data.roundHistory)
      setUserParticipation(data.userParticipation)
      setUserStats(data.userStats)
      setReferralData(data.referralData)
    }
    
    // Initial load
    updateFromStore()
    setIsLoadingRounds(false)
    
    // Subscribe to changes
    const unsubscribe = gameStore.subscribe(updateFromStore)
    
    return unsubscribe
  }, [gameStore])

  // Create round
  const createRound = useCallback(async (params: CreateRoundParams): Promise<RoundResult> => {
    try {
      setError(null)
      const result = await gameService.createRound(params)
      
      if (!result.success && result.error) {
        setError(result.error)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create round'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [gameService])

  // Join round
  const joinRound = useCallback(async (roundId: number, userAddress: string): Promise<RoundResult> => {
    try {
      setError(null)
      const result = await gameService.joinRound(roundId, userAddress)
      
      if (!result.success && result.error) {
        setError(result.error)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join round'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [gameService])

  // Load round history
  const loadRoundHistory = useCallback(async (): Promise<void> => {
    try {
      setIsLoadingHistory(true)
      setError(null)
      
      // History is automatically loaded from store
      // This function exists for compatibility with existing components
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load round history'
      setError(errorMessage)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  // Refresh rounds
  const refreshRounds = useCallback(async (): Promise<void> => {
    try {
      setIsLoadingRounds(true)
      setError(null)
      
      // Rounds are automatically updated through the store subscription
      // This function exists for compatibility with existing components
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh rounds'
      setError(errorMessage)
    } finally {
      setIsLoadingRounds(false)
    }
  }, [])

  // Initialize user
  const initializeUser = useCallback((userAddress: string) => {
    try {
      gameService.initializeUserReferral(userAddress)
      gameStore.updateUserStats(userAddress)
    } catch (err) {
      console.error('Failed to initialize user:', err)
    }
  }, [gameService, gameStore])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Data
    rounds,
    roundHistory,
    userParticipation,
    userStats,
    referralData,
    
    // Loading states
    isLoadingRounds,
    isLoadingHistory,
    isLoadingReferrals,
    
    // Actions
    createRound,
    joinRound,
    loadRoundHistory,
    refreshRounds,
    initializeUser,
    
    // Error handling
    error,
    clearError
  }
}