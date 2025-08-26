import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Clock, 
  Users, 
  TrendingUp, 
  Timer, 
  Coins,
  Play,
  Download,
  CheckCircle,
  Lock,
  Shield,
  Trophy
} from 'lucide-react'
import { formatTon } from '../src/lib/ton-format'

export interface Round {
  id: number
  mode: 'TIME_LOCKED' | 'CAPACITY_LOCKED'
  stakeTON: number
  status: 'OPEN' | 'LOCKED' | 'DISTRIBUTED' | 'REFUNDED'
  participants: number
  deadline?: number
  targetParticipants?: number
  bank: number
  platformFee: number
  minPayout: number
  maxPayout: number
  createdBy: string
}

interface GameRoundProps {
  round: Round
  onJoin: (roundId: number) => void
  onWithdraw: (roundId: number) => void
  userParticipating?: boolean
  userPayout?: number
}

export function GameRound({ 
  round, 
  onJoin, 
  onWithdraw, 
  userParticipating = false,
  userPayout 
}: GameRoundProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (round.mode === 'TIME_LOCKED' && round.deadline) {
      const updateTimer = () => {
        const now = Date.now() / 1000
        const remaining = round.deadline! - now
        
        if (remaining <= 0) {
          setTimeLeft('Завершено')
          return
        }

        const hours = Math.floor(remaining / 3600)
        const minutes = Math.floor((remaining % 3600) / 60)

        setTimeLeft(`${hours}ч ${minutes}м`)
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [round.mode, round.deadline])

  const getStatusBadge = () => {
    switch (round.status) {
      case 'OPEN':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-1.5 py-0.5">Открыт</Badge>
      case 'LOCKED':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-1.5 py-0.5">Заблокирована</Badge>
      case 'DISTRIBUTED':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-1.5 py-0.5">Завершена</Badge>
      case 'REFUNDED':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 text-xs px-1.5 py-0.5">Возврат</Badge>
      default:
        return <Badge variant="outline" className="text-xs px-1.5 py-0.5">{round.status}</Badge>
    }
  }

  const getProgress = () => {
    if (round.mode === 'CAPACITY_LOCKED' && round.targetParticipants) {
      return (round.participants / round.targetParticipants) * 100
    }
    if (round.mode === 'TIME_LOCKED' && round.deadline) {
      const now = Date.now() / 1000
      const remaining = round.deadline - now
      // Предполагаем, что игра длится 1 час (3600 секунд)
      const totalDuration = 3600
      const elapsed = totalDuration - remaining
      return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
    }
    return 0
  }

  const canJoin = round.status === 'OPEN' && !userParticipating
  const canWithdraw = round.status === 'DISTRIBUTED' && userParticipating && userPayout

  const getActionButton = () => {
    if (userParticipating) {
      if (canWithdraw) {
        return (
          <Button 
            onClick={() => onWithdraw(round.id)}
            className="w-full bg-green-600 hover:bg-green-700 h-7 text-xs"
            size="sm"
          >
            <Download className="h-2.5 w-2.5 mr-1" />
            Вывести {formatTon(BigInt(Math.floor((userPayout || 0) * 1e9)))}
          </Button>
        )
      } else if (round.status === 'OPEN') {
        return (
          <Button disabled className="w-full h-7 text-xs" size="sm">
            <CheckCircle className="h-2.5 w-2.5 mr-1" />
            Участвуете
          </Button>
        )
      } else if (round.status === 'LOCKED') {
        return (
          <Button disabled className="w-full h-7 text-xs" size="sm">
            <Lock className="h-2.5 w-2.5 mr-1" />
            Ожидание
          </Button>
        )
      }
    }

    if (canJoin) {
      return (
        <Button 
          onClick={() => onJoin(round.id)}
          className="w-full h-7 text-xs"
          size="sm"
        >
          <Play className="h-2.5 w-2.5 mr-1" />
          Играть {(Math.round(round.stakeTON * 100) / 100).toFixed(2)} TON
        </Button>
      )
    }

    return (
      <Button disabled className="w-full h-7 text-xs" size="sm">
        {round.status === 'DISTRIBUTED' ? 'Завершена' : 'Недоступна'}
      </Button>
    )
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getParticipantsDisplay = () => {
    if (round.mode === 'CAPACITY_LOCKED' && round.targetParticipants) {
      return `${round.participants}/${round.targetParticipants}`
    }
    return round.participants.toString()
  }

  // Вычисляем гарантированный минимум (50% от ставки) и округляем до сотых
  const guaranteedMinimum = Math.round(round.stakeTON * 0.5 * 100) / 100

  return (
    <Card className="p-2.5 space-y-2">
      {/* Заголовок с номером игры и статусом */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-sm font-medium">Раунд {round.id}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Создатель с подписью */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground/80">Создатель:</span>
        <span className="text-xs text-muted-foreground font-mono">
          {formatAddress(round.createdBy)}
        </span>
      </div>

      {/* Основная информация в три колонки с серым фоном */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-muted/50 dark:bg-muted/20 p-1.5 rounded text-center">
          <div className="flex items-center justify-center gap-0.5 text-xs text-muted-foreground mb-0.5">
            <Coins className="h-2.5 w-2.5" />
            <span>Взнос</span>
          </div>
          <div className="text-xs font-medium">{(Math.round(round.stakeTON * 100) / 100).toFixed(2)} TON</div>
        </div>
        
        <div className="bg-muted/50 dark:bg-muted/20 p-1.5 rounded text-center">
          <div className="flex items-center justify-center gap-0.5 text-xs text-muted-foreground mb-0.5">
            <Users className="h-2.5 w-2.5" />
            <span>Игроки</span>
          </div>
          <div className="text-xs font-medium">{getParticipantsDisplay()}</div>
        </div>
        
        <div className="bg-muted/50 dark:bg-muted/20 p-1.5 rounded text-center">
          <div className="flex items-center justify-center gap-0.5 text-xs text-muted-foreground mb-0.5">
            <TrendingUp className="h-2.5 w-2.5" />
            <span>Банк</span>
          </div>
          <div className="text-xs font-medium">{(Math.round(round.bank * 100) / 100).toFixed(2)} TON</div>
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {round.mode === 'TIME_LOCKED' ? 'Осталось' : 'Прогресс'}
          </span>
          <span>
            {round.mode === 'TIME_LOCKED' ? timeLeft : `${Math.round(getProgress())}%`}
          </span>
        </div>
        <Progress value={getProgress()} className="h-1" />
      </div>

      {/* Синий блок с щитом и гарантированным минимумом */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-1.5">
        <div className="flex items-center gap-1.5">
          <Shield className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs text-blue-800 dark:text-blue-200">
            Гарантированный возврат
          </span>
          <span className="text-xs font-medium text-blue-800 dark:text-blue-200 ml-auto">
            {guaranteedMinimum.toFixed(2)} TON
          </span>
        </div>
      </div>

      {/* Выплата пользователя (если есть) */}
      {userParticipating && userPayout && (
        <div className="p-1.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
          <div className="flex justify-between items-center">
            <span className="text-xs text-green-800 dark:text-green-200">Выплата</span>
            <span className="text-xs font-medium text-green-800 dark:text-green-200">
              {formatTon(BigInt(Math.floor(userPayout * 1e9)))}
            </span>
          </div>
        </div>
      )}

      {/* Кнопка действия */}
      <div className="pt-0.5">
        {getActionButton()}
      </div>
    </Card>
  )
}