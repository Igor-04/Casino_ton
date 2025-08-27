/**
 * Custom hooks for managing app data loading and state
 */
import { useState, useEffect } from 'react'
import { toast } from 'sonner@2.0.3'
import { CONFIG } from '../config'
import { t } from '../i18n'
import { 
  getActiveRounds, 
  getRoundHistory, 
  getUserReferralStats,
  ContractRound
} from '../lib/ton'
import { 
  getUserFriendlyAddress, 
  getWalletBalance,
  subscribeToWalletChanges
} from '../lib/tonConnect'
import { 
  convertContractRound, 
  convertContractRoundToHistory, 
  convertReferralStats,
  createParticipationMap
} from '../utils/dataConverters'

/**
 * Hook for managing active rounds data
 */
export function useActiveRounds() {
  const [rounds, setRounds] = useState<any[]>([])
  const [userParticipation, setUserParticipation] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const translations = t()

  const loadActiveRounds = async () => {
    try {
      setIsLoading(true)
      const contractRounds = await getActiveRounds()
      const convertedRounds = contractRounds.map(convertContractRound)
      setRounds(convertedRounds)

      // Update user participation status
      const userAddress = getUserFriendlyAddress()
      const participation = createParticipationMap(contractRounds, userAddress)
      setUserParticipation(participation)
    } catch (error) {
      console.error('Failed to load active rounds:', error)
      toast.error(translations.errors.transactionFailed)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    rounds,
    userParticipation,
    isLoading,
    loadActiveRounds,
    setUserParticipation
  }
}

/**
 * Hook for managing round history data
 */
export function useRoundHistory() {
  const [historyRounds, setHistoryRounds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const translations = t()

  const loadRoundHistory = async () => {
    try {
      setIsLoading(true)
      const contractRounds = await getRoundHistory(CONFIG.ROUNDS_PER_PAGE)
      const convertedRounds = contractRounds.map(convertContractRoundToHistory)
      setHistoryRounds(convertedRounds)
    } catch (error) {
      console.error('Failed to load round history:', error)
      toast.error(translations.errors.transactionFailed)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    historyRounds,
    isLoading,
    loadRoundHistory
  }
}

/**
 * Hook for managing user data (balance, referrals, etc.)
 */
export function useUserData() {
  const [walletBalance, setWalletBalance] = useState<bigint>(0n)
  const [userReferralData, setUserReferralData] = useState<any>(null)
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false)

  const loadUserData = async () => {
    const userAddress = getUserFriendlyAddress()
    if (!userAddress) return

    try {
      // Load wallet balance
      const balance = await getWalletBalance()
      setWalletBalance(balance)

      // Load referral data
      setIsLoadingReferrals(true)
      const referralStats = await getUserReferralStats(userAddress)
      const convertedReferralData = convertReferralStats(referralStats, userAddress)
      setUserReferralData(convertedReferralData)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setIsLoadingReferrals(false)
    }
  }

  const clearUserData = () => {
    setWalletBalance(0n)
    setUserReferralData(null)
  }

  return {
    walletBalance,
    userReferralData,
    isLoadingReferrals,
    loadUserData,
    clearUserData
  }
}

/**
 * Hook for managing wallet connection changes
 */
export function useWalletConnection(onWalletChange: (connected: boolean) => void) {
  useEffect(() => {
    const unsubscribe = subscribeToWalletChanges(async (wallet) => {
      onWalletChange(!!wallet)
    })

    return unsubscribe
  }, [onWalletChange])
}

/**
 * Hook for managing referral URL parameters
 */
export function useReferralHandling() {
  const translations = t()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const referralCode = urlParams.get('ref')
    
    if (referralCode) {
      const currentAddress = getUserFriendlyAddress()
      if (referralCode !== currentAddress) {
        // Store referrer in localStorage for use when user first joins a game
        localStorage.setItem('tonGamesReferrer', referralCode)
        toast.success(`Welcome! Invited by ${referralCode.slice(0, 6)}...`)
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [translations])
}