/**
 * Event handlers for app actions
 */
import { toast } from 'sonner@2.0.3'
import { createRound, joinRound } from '../lib/ton'
import { getUserFriendlyAddress } from '../lib/tonConnect'
import { convertUIRoundToContract } from './dataConverters'
import { t } from '../i18n'
import { CreateRoundData } from '../types/app'

/**
 * Create event handlers with dependencies injected
 */
export function createEventHandlers(
  loadActiveRounds: () => Promise<void>,
  loadUserData: () => Promise<void>,
  setActiveTab: (tab: string) => void
) {
  const translations = t()

  /**
   * Handle round creation
   */
  const handleCreateRound = async (roundData: CreateRoundData) => {
    try {
      const contractParams = convertUIRoundToContract(roundData)
      const result = await createRound(contractParams)

      if (result.success) {
        toast.success(translations.messages.roundCreated)
        setActiveTab('games')
        await loadActiveRounds() // Refresh rounds list
      } else {
        toast.error(translations.errors.transactionFailed)
      }
    } catch (error) {
      console.error('Failed to create round:', error)
      toast.error(error instanceof Error ? error.message : translations.errors.transactionFailed)
    }
  }

  /**
   * Confirm join round with referrer handling
   */
  const confirmJoinRound = async (roundId: number) => {
    try {
      // Get stored referrer if any
      const referrer = localStorage.getItem('tonGamesReferrer')
      
      const result = await joinRound(roundId, referrer || undefined)
      
      if (result.success) {
        toast.success(translations.messages.joinedRound)
        
        // Clear referrer after first use
        if (referrer) {
          localStorage.removeItem('tonGamesReferrer')
        }
        
        // Refresh data
        await loadActiveRounds()
        await loadUserData()
      } else {
        toast.error(translations.errors.transactionFailed)
      }
    } catch (error) {
      console.error('Failed to join round:', error)
      toast.error(error instanceof Error ? error.message : translations.errors.transactionFailed)
    }
  }

  /**
   * Handle withdraw (mock implementation)
   */
  const handleWithdraw = async (roundId: number) => {
    try {
      // Mock implementation - in real app this would call contract withdraw
      toast.success(`Withdrawn from round #${roundId}`)
      await loadActiveRounds()
      await loadUserData()
    } catch (error) {
      console.error('Failed to withdraw:', error)
      toast.error(translations.errors.transactionFailed)
    }
  }

  /**
   * Copy referral link to clipboard
   */
  const copyReferralLink = async () => {
    try {
      const userAddress = getUserFriendlyAddress()
      if (!userAddress) {
        toast.error(translations.errors.walletNotConnected)
        return
      }
      
      const link = `${window.location.origin}?ref=${userAddress}`
      await navigator.clipboard.writeText(link)
      toast.success(translations.messages.linkCopied)
    } catch (error) {
      toast.error(translations.error)
    }
  }

  /**
   * Handle onboarding completion
   */
  const handleOnboardingComplete = () => {
    localStorage.setItem('tonGamesOnboardingCompleted', 'true')
  }

  return {
    handleCreateRound,
    confirmJoinRound,
    handleWithdraw,
    copyReferralLink,
    handleOnboardingComplete
  }
}