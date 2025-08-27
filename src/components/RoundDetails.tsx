import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ProofOfFairness } from './ProofOfFairness'
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  Coins, 
  Clock, 
  User,
  Calendar,
  Target,
  TrendingUp,
  ExternalLink 
} from 'lucide-react'
import { TransparentRound } from '../types/transparency'

interface RoundDetailsProps {
  round: TransparentRound
  userAddress?: string
  onBack: () => void
}

export function RoundDetails({ round, userAddress, onBack }: RoundDetailsProps) {
  const getStatusColor = (status: TransparentRound['status']) => {
    switch (status) {
      case 'DISTRIBUTED': return 'bg-green-100 text-green-700 border-green-200'
      case 'REFUNDED': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getStatusText = (status: TransparentRound['status']) => {
    switch (status) {
      case 'DISTRIBUTED': return 'Распределён'
      case 'REFUNDED': return 'Возврат средств'
      default: return 'Завершён'
    }
  }

  const getModeText = (mode: TransparentRound['mode']) => {
    return mode === 'TIME_LOCKED' ? 'По времени' : 'По участникам'
  }

  const userParticipant = round.distributionDetails?.participants.find(
    p => p.address === userAddress
  )

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-medium truncate">Раунд #{round.id}</h2>
        </div>
        <Badge className={`${getStatusColor(round.status)} shrink-0`}>
          {getStatusText(round.status)}
        </Badge>
      </div>

      {/* Основная информация */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Информация о раунде</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3 min-w-0">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Режим</p>
                <p className="font-medium truncate">{getModeText(round.mode)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Coins className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Взнос</p>
                <p className="font-medium">{round.stakeTON} TON</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Участники</p>
                <p className="font-medium">
                  {round.participants}
                  {round.targetParticipants && ` / ${round.targetParticipants}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Общий банк</p>
                <p className="font-medium">{round.bank} TON</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Создатель</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm truncate min-w-0">
                  {round.createdBy.slice(0, 8)}...{round.createdBy.slice(-6)}
                </p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Дата создания</p>
              <p className="font-medium text-sm break-words">
                {new Date(round.createdAt * 1000).toLocaleString()}
              </p>
            </div>
          </div>

          {round.deadline && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Дедлайн</p>
                <p className="font-medium text-sm break-words">
                  {new Date(round.deadline * 1000).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Ваш результат */}
      {userParticipant && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Ваш результат</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Взнос</p>
              <p className="font-medium">{userParticipant.entryFee} TON</p>
            </div>
            
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Выплата</p>
              <p className="font-medium text-blue-700">{userParticipant.payout} TON</p>
            </div>
            
            <div className={`text-center p-3 rounded-lg min-w-0 ${
              userParticipant.profit >= 0 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className="text-sm text-muted-foreground mb-1">Прибыль</p>
              <p className={`font-medium ${
                userParticipant.profit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {userParticipant.profit >= 0 ? '+' : ''}{userParticipant.profit.toFixed(2)} TON
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Пруф честности */}
      {round.randomnessProof && round.distributionDetails && (
        <ProofOfFairness
          roundId={round.id}
          proof={round.randomnessProof}
          distribution={round.distributionDetails}
          userAddress={userAddress}
        />
      )}

      {/* Информация о комиссии */}
      <Card className="p-4 bg-orange-50 border-orange-200">
        <h3 className="font-medium mb-2">Комиссия платформы</h3>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="text-sm text-muted-foreground min-w-0">
            <span className="break-words">
              5% с каждого взноса ({round.participants} × {round.stakeTON * 0.05} TON)
            </span>
          </span>
          <span className="font-medium text-orange-700 shrink-0">
            {round.platformFee} TON
          </span>
        </div>
      </Card>
    </div>
  )
}