/**
 * App-specific types and interfaces
 */

export type TabType = 'games' | 'history' | 'create' | 'profile'

export interface AppState {
  activeTab: TabType
  showOnboarding: boolean
  currentLanguage: string
}

export interface LoadingState {
  isLoadingRounds: boolean
  isLoadingHistory: boolean
  isLoadingReferrals: boolean
}

export interface DataState {
  rounds: any[]
  historyRounds: any[]
  userParticipation: Record<number, boolean>
  userReferralData: any
  walletBalance: bigint
}

export interface DialogState {
  confirmJoinDialog: {
    isOpen: boolean
    round: any | null
  }
}

export interface CreateRoundData {
  mode: 'TIME_LOCKED' | 'CAPACITY_LOCKED'
  stakeTON: number
  deadline?: number
  targetParticipants?: number
}

export interface AppActions {
  handleCreateRound: (roundData: CreateRoundData) => Promise<void>
  handleJoinRound: (roundId: number) => void
  confirmJoinRound: () => Promise<void>
  handleWithdraw: (roundId: number) => Promise<void>
  copyReferralLink: () => Promise<void>
  handleOnboardingComplete: () => void
}