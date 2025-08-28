import { useState, useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TonConnectProvider } from './components/TonConnectProvider'
import { useTonAddress, useTonWallet } from '@tonconnect/ui-react'
import { WalletConnect } from './components/WalletConnect'
import { FeatureCards } from './components/FeatureCards'
import { TabContent } from './components/TabContent'
import { ConfirmJoinDialog } from './components/ConfirmJoinDialog'
import { Onboarding } from './components/Onboarding'
import { ThemeToggle } from './components/ThemeToggle'
import { Button } from './components/ui/button'
import { Alert, AlertDescription } from './components/ui/alert'
import { toast } from 'sonner@2.0.3'
import { 
  Gamepad2, 
  History, 
  Plus, 
  X, 
  Users, 
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react'

// Import configuration and hooks
import { CONFIG } from './src/config'
import { initializeLanguage, t } from './src/i18n'
import { useFeatureCards } from './src/hooks/useFeatureCards'
import { useGameService } from './src/hooks/useGameService'
import { tonToNanoton } from './src/lib/ton-format'
import { fetchWalletBalance } from './src/lib/ton'

function AppContent() {
  // TON Connect hooks (these remain as mocks for now)
  const address = useTonAddress()
  const wallet = useTonWallet()
  const translations = t()
  
  // Game service hook - now using real functionality
  const {
    rounds,
    roundHistory,
    userParticipation,
    userStats,
    referralData,
    isLoadingRounds,
    isLoadingHistory,
    isLoadingReferrals,
    createRound,
    joinRound,
    loadRoundHistory,
    refreshRounds,
    initializeUser,
    error: gameError,
    clearError
  } = useGameService()
  
  // UI State
  const [activeTab, setActiveTab] = useState<'games' | 'history' | 'create' | 'profile'>('games')
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // Wallet balance in nanotons
  const [walletBalance, setWalletBalance] = useState<bigint>(0n)
  
  // Loading States
  const [isInitializing, setIsInitializing] = useState(true)
  
  // Network and Connection State
  const [networkStatus, setNetworkStatus] = useState<{
    connected: boolean
    network: 'testnet' | 'mainnet' | null
    isValidNetwork: boolean
  }>({
    connected: false,
    network: null,
    isValidNetwork: false
  })
  
  // Dialog State
  const [confirmJoinDialog, setConfirmJoinDialog] = useState<{
    isOpen: boolean
    round: any | null
  }>({ isOpen: false, round: null })
  
  // Feature Cards Hook
  const { featureCardsVisibility, hideFeatureCard, hasVisibleFeatureCards } = useFeatureCards()

  // Initialize app
  useEffect(() => {
    const initApp = async () => {
      try {
        setIsInitializing(true)
        
        // Initialize language
        initializeLanguage()
        
        // Check onboarding status
        const hasCompletedOnboarding = localStorage.getItem('tonGamesOnboardingCompleted')
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true)
        }

        // Clear any previous game errors
        clearError()
        
      } catch (error) {
        console.error('Failed to initialize app:', error)
        toast.error('Не удалось инициализировать приложение')
      } finally {
        setIsInitializing(false)
      }
    }

    initApp()
  }, [clearError])

  // Handle wallet connection changes
  useEffect(() => {
    updateNetworkStatus()

    const loadBalance = async () => {
      if (address) {
        // Initialize user in the game system
        initializeUser(address)
        try {
          const bal = await fetchWalletBalance(address)
          setWalletBalance(tonToNanoton(bal))
        } catch {
          setWalletBalance(0n)
        }
      } else {
        // Clear user data when wallet disconnected
        setWalletBalance(0n)
      }
    }

    loadBalance()
  }, [address, initializeUser])

  // Handle referral from URL
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const referralCode = urlParams.get('ref')
      
      if (referralCode && referralCode !== address) {
        // Store referrer for use when user first joins a game
        localStorage.setItem('tonGamesReferrer', referralCode)
        toast.success(`Добро пожаловать! Приглашен пользователем ${referralCode.slice(0, 6)}...`)
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } catch (error) {
      console.error('Error handling referral:', error)
    }
  }, [address])

  // Handle game service errors
  useEffect(() => {
    if (gameError) {
      toast.error(gameError)
      clearError()
    }
  }, [gameError, clearError])

  // Update network status
  const updateNetworkStatus = () => {
    try {
      const connected = Boolean(address && wallet)
      const walletNet = (wallet as any)?.account?.chain?.toLowerCase?.().includes('main') ? 'mainnet' : 'testnet'
      const isValidNetwork = walletNet === CONFIG.NETWORK

      setNetworkStatus({
        connected,
        network: walletNet,
        isValidNetwork
      })
    } catch (error) {
      console.error('Error updating network status:', error)
    }
  }

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem('tonGamesOnboardingCompleted', 'true')
      setShowOnboarding(false)
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  // Copy referral link
  const copyReferralLink = async () => {
    try {
      if (!address) {
        toast.error(translations.errors.walletRequired)
        return
      }
      
      const link = `${window.location.origin}?ref=${address}`
      await navigator.clipboard.writeText(link)
      toast.success('Реферальная ссылка скопирована!')
    } catch (error) {
      toast.error('Не удалось скопировать ссылку')
    }
  }

  // Handle join round
  const handleJoinRound = (roundId: number) => {
    try {
      if (!address) {
        toast.error(translations.errors.walletRequired)
        return
      }

      if (!networkStatus.isValidNetwork) {
        toast.error(`${translations.errors.networkRequired} ${CONFIG.NETWORK}`)
        return
      }

      const round = rounds.find(r => r.id === roundId)
      if (round) {
        setConfirmJoinDialog({ isOpen: true, round })
      }
    } catch (error) {
      console.error('Error handling join round:', error)
      toast.error('Ошибка при попытке присоединиться к игре')
    }
  }

  // Confirm join round
  const confirmJoinRound = async () => {
    const roundId = confirmJoinDialog.round?.id
    if (!roundId || !address) return

    try {
      setConfirmJoinDialog({ isOpen: false, round: null })
      
      const result = await joinRound(roundId, address)
      
      if (result.success) {
        toast.success(translations.games.joinedGame)
        
        // Clear referrer after first use
        const referrer = localStorage.getItem('tonGamesReferrer')
        if (referrer) {
          localStorage.removeItem('tonGamesReferrer')
        }
      } else {
        toast.error(result.error || translations.errors.joinGameFailed)
      }
    } catch (error) {
      console.error('Failed to join round:', error)
      toast.error(error instanceof Error ? error.message : translations.errors.joinGameFailed)
    }
  }

  // Handle withdraw (placeholder for future implementation)
  const handleWithdraw = async (roundId: number) => {
    if (!address) {
      toast.error(translations.errors.walletRequired)
      return
    }

    try {
      // This would be implemented when integrating with TON blockchain
      toast.info('Функция вывода будет доступна после интеграции с блокчейном')
    } catch (error) {
      console.error('Failed to withdraw:', error)
      toast.error(error instanceof Error ? error.message : translations.errors.withdrawFailed)
    }
  }

  // Handle create round
  const handleCreateRound = async (roundData: {
    mode: 'TIME_LOCKED' | 'CAPACITY_LOCKED'
    stakeTON: number
    deadline?: number
    targetParticipants?: number
  }) => {
    console.log('Creating round with data:', roundData)
    
    if (!address) {
      toast.error(translations.errors.walletRequired)
      return
    }

    if (!networkStatus.isValidNetwork) {
      toast.error(`${translations.errors.networkRequired} ${CONFIG.NETWORK}`)
      return
    }

    try {
      const result = await createRound({
        mode: roundData.mode,
        stakeTON: roundData.stakeTON,
        creatorAddress: address,
        ...(roundData.mode === 'TIME_LOCKED' 
          ? { deadline: roundData.deadline }
          : { targetParticipants: roundData.targetParticipants }
        )
      })

      if (result.success) {
        toast.success(translations.games.gameCreated)
        setActiveTab('games')
      } else {
        toast.error(result.error || translations.errors.createGameFailed)
      }
    } catch (error) {
      console.error('Failed to create round:', error)
      toast.error(error instanceof Error ? error.message : translations.errors.createGameFailed)
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{translations.app.initializing}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {/* Join Confirmation Dialog */}
      <ConfirmJoinDialog
        round={confirmJoinDialog.round}
        isOpen={confirmJoinDialog.isOpen}
        onClose={() => setConfirmJoinDialog({ isOpen: false, round: null })}
        onConfirm={confirmJoinRound}
        platformFeePercent={CONFIG.PLATFORM_FEE_BPS / 100}
      />

      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Gamepad2 className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-base font-medium">{translations.app.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Network Status Indicator */}
            {networkStatus.connected && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                networkStatus.isValidNetwork 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {networkStatus.isValidNetwork ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {networkStatus.network}
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3">
        {/* Network Warning */}
        {networkStatus.connected && !networkStatus.isValidNetwork && featureCardsVisibility.networkWarning && (
          <div className="py-2">
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                {translations.wallet.networkWarning} {CONFIG.NETWORK} для использования приложения.
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => hideFeatureCard('networkWarning')}
                  className="float-right -mt-1 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Wallet Connection */}
        <div className="py-2">
          <WalletConnect />
        </div>

        {/* Feature Cards */}
        {activeTab === 'games' && hasVisibleFeatureCards && (
          <FeatureCards
            visibility={featureCardsVisibility}
            onHideCard={hideFeatureCard}
            onCopyReferralLink={copyReferralLink}
          />
        )}

        {/* Tab Content */}
        <TabContent
          activeTab={activeTab}
          rounds={rounds}
          userParticipation={userParticipation}
          isLoadingRounds={isLoadingRounds}
          onJoinRound={handleJoinRound}
          onWithdraw={handleWithdraw}
          onSetActiveTab={setActiveTab}
          onRefreshRounds={refreshRounds}
          historyRounds={roundHistory}
          userAddress={address || ''}
          isLoadingHistory={isLoadingHistory}
          onLoadHistory={loadRoundHistory}
          onCreateRound={handleCreateRound}
          walletBalance={walletBalance}
          userReferralData={referralData}
          userStats={userStats} // Pass real user stats
          isLoadingReferrals={isLoadingReferrals}
          isWalletConnected={networkStatus.connected}
          isValidNetwork={networkStatus.isValidNetwork}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-3 py-1.5 safe-area-pb">
        <div className="grid grid-cols-4 gap-1">
          <Button
            variant={activeTab === 'games' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('games')}
            className="flex flex-col gap-0.5 h-auto py-1.5 text-xs"
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Игры</span>
          </Button>
          
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveTab('history')
              if (roundHistory.length === 0) {
                loadRoundHistory()
              }
            }}
            className="flex flex-col gap-0.5 h-auto py-1.5 text-xs"
          >
            <History className="h-3.5 w-3.5" />
            <span>История</span>
          </Button>

          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('create')}
            className="flex flex-col gap-0.5 h-auto py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Создать</span>
          </Button>

          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('profile')}
            className="flex flex-col gap-0.5 h-auto py-1.5 text-xs"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Профиль</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <TonConnectProvider>
        <AppContent />
      </TonConnectProvider>
    </ErrorBoundary>
  )
}

export default App