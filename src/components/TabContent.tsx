import { useEffect } from 'react'
import { GameRound } from './GameRound'
import { CreateGamePanel } from './CreateGamePanel'
import { RoundHistory } from './RoundHistory'
import { ReferralSystem } from './ReferralSystem'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Gamepad2, History, Plus, RefreshCw } from 'lucide-react'
import { t } from '../src/i18n'
import { CONFIG } from '../src/config'

interface TabContentProps {
  activeTab: 'games' | 'history' | 'create' | 'profile'
  // Games tab props
  rounds: any[]
  userParticipation: Record<number, boolean>
  isLoadingRounds: boolean
  onJoinRound: (roundId: number) => void
  onWithdraw: (roundId: number) => void
  onSetActiveTab: (tab: 'games' | 'history' | 'create' | 'profile') => void
  onRefreshRounds: () => void
  // History tab props
  historyRounds: any[]
  userAddress: string | null
  isLoadingHistory: boolean
  onLoadHistory: () => void
  // Create tab props
  onCreateRound: (roundData: any) => void
  walletBalance: bigint
  // Profile tab props
  userReferralData: any
  userStats: any // Add userStats prop
  isLoadingReferrals: boolean
  // Wallet connection status
  isWalletConnected: boolean
  isValidNetwork: boolean
}

export function TabContent({
  activeTab,
  rounds,
  userParticipation,
  isLoadingRounds,
  onJoinRound,
  onWithdraw,
  onSetActiveTab,
  onRefreshRounds,
  historyRounds,
  userAddress,
  isLoadingHistory,
  onLoadHistory,
  onCreateRound,
  walletBalance,
  userReferralData,
  userStats, // Add userStats parameter
  isLoadingReferrals,
  isWalletConnected,
  isValidNetwork
}: TabContentProps) {
  const translations = t()

  // Load history when switching to history tab
  useEffect(() => {
    if (activeTab === 'history' && historyRounds.length === 0 && !isLoadingHistory) {
      onLoadHistory()
    }
  }, [activeTab, historyRounds.length, isLoadingHistory, onLoadHistory])

  if (activeTab === 'games') {
    return (
      <div className="space-y-3 mb-2">
        {isLoadingRounds ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-3 animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        ) : rounds.length === 0 ? (
          <Card className="p-4 text-center">
            <Gamepad2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-base mb-1">Нет активных игр</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {isWalletConnected 
                ? "Создайте новую игру или обновите список"
                : "Подключите кошелек"
              }
            </p>
            <div className="space-y-1.5">
              {isWalletConnected && isValidNetwork && (
                <Button 
                  onClick={() => onSetActiveTab('create')}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Создать
                </Button>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                <Button 
                  variant="outline"
                  onClick={() => onSetActiveTab('history')}
                  size="sm"
                >
                  <History className="h-3 w-3 mr-1" />
                  История
                </Button>
                <Button 
                  variant="outline"
                  onClick={onRefreshRounds}
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Обновить
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          rounds.map(round => (
            <GameRound
              key={round.id}
              round={round}
              onJoin={onJoinRound}
              onWithdraw={onWithdraw}
              userParticipating={userParticipation[round.id]}
              userPayout={round.status === 'DISTRIBUTED' && userParticipation[round.id] ? 1.71 : undefined}
            />
          ))
        )}
      </div>
    )
  }

  if (activeTab === 'history') {
    return (
      <div className="py-2">
        <RoundHistory 
          rounds={historyRounds} 
          userAddress={userAddress || ''}
          isLoading={isLoadingHistory}
          onLoadMore={onLoadHistory}
        />
      </div>
    )
  }

  if (activeTab === 'create') {
    return (
      <div className="py-2">
        <CreateGamePanel
          onCreateRound={onCreateRound}
          platformFeePercent={CONFIG.PLATFORM_FEE_BPS / 100}
          disabled={!isWalletConnected || !isValidNetwork}
          walletBalance={walletBalance}
        />
      </div>
    )
  }

  if (activeTab === 'profile') {
    if (isLoadingReferrals) {
      return (
        <div className="py-2">
          <Card className="p-3 animate-pulse">
            <div className="h-24 bg-muted rounded"></div>
          </Card>
        </div>
      )
    }

    return (
      <div className="py-2">
        <ReferralSystem
          userAddress={userAddress || ''}
          referralData={userReferralData || {
            userAddress: '',
            referralCode: '',
            stats: { totalInvited: 0, totalEarned: 0, activeInvitees: 0 },
            invitedUsers: [],
            rewards: []
          }}
          userStats={userStats} // Pass real user stats
        />
      </div>
    )
  }

  return null
}