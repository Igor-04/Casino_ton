import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  History, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Clock,
  ChevronDown,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatTon } from '../src/lib/ton-format'
import type { TransparentRound } from '../types/transparency'

interface RoundHistoryProps {
  rounds: TransparentRound[]
  userAddress: string
  isLoading: boolean
  onLoadMore: () => void
}

export function RoundHistory({ 
  rounds, 
  userAddress, 
  isLoading, 
  onLoadMore 
}: RoundHistoryProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(null)

  // Separate user's rounds and all rounds
  const userRounds = rounds.filter(round => round.userParticipated)
  const allRounds = rounds

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DISTRIBUTED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Завершена</Badge>
      case 'REFUNDED':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Возврат</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getProfitDisplay = (round: TransparentRound) => {
    if (!round.userParticipated || round.userProfit === undefined) return null

    const isProfit = round.userProfit > 0
    const Icon = isProfit ? TrendingUp : TrendingDown
    const colorClass = isProfit 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400'

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span className="font-medium">
          {formatTon(BigInt(Math.floor(round.userProfit * 1e9)))}
        </span>
      </div>
    )
  }

  const toggleExpandRound = (roundId: number) => {
    setExpandedRound(expandedRound === roundId ? null : roundId)
  }

  const RoundCard = ({ round }: { round: TransparentRound }) => (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Игра #{round.id}</h3>
            {getStatusBadge(round.status)}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {formatDate(round.createdAt)}
            </p>
          </div>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Взнос</span>
            </div>
            <p className="font-medium">{round.stakeTON} TON</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Участники</span>
            </div>
            <p className="font-medium">{round.participants}</p>
          </div>
        </div>

        {/* User Participation */}
        {round.userParticipated && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Вы участвовали</span>
              </div>
              {round.userPayout !== undefined && (
                <div className="text-right">
                  <p className="font-medium">
                    Выплата: {formatTon(BigInt(Math.floor(round.userPayout * 1e9)))}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expand Button */}
        {round.randomnessProof && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpandRound(round.id)}
            className="w-full"
          >
            <span className="mr-2">
              {expandedRound === round.id ? 'Скрыть детали' : 'Показать детали'}
            </span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${
                expandedRound === round.id ? 'rotate-180' : ''
              }`} 
            />
          </Button>
        )}

        {/* Expanded Details */}
        {expandedRound === round.id && round.randomnessProof && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Доказательство честности
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seed:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {round.randomnessProof.seed.slice(0, 20)}...
                </code>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block Hash:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {round.randomnessProof.blockHash.slice(0, 20)}...
                </code>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block Height:</span>
                <span>{round.randomnessProof.blockHeight}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Проверить в блокчейне
            </Button>
          </div>
        )}
      </div>
    </Card>
  )

  if (isLoading && rounds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">История раундов</h2>
          <p className="text-muted-foreground">Загрузка истории игр...</p>
        </div>
        
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-24 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (rounds.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">История пуста</h3>
        <p className="text-muted-foreground mb-6">
          История завершенных игр появится здесь
        </p>
        <Button onClick={onLoadMore} variant="outline">
          Обновить
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">История раундов</h2>
        <p className="text-muted-foreground">
          Просмотр завершенных игр и их результатов
        </p>
      </div>

      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ваши игры ({userRounds.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Все игры ({allRounds.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="space-y-4">
          {userRounds.length === 0 ? (
            <Card className="p-8 text-center">
              <XCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-medium mb-2">Нет участий</h3>
              <p className="text-sm text-muted-foreground">
                Вы еще не участвовали в играх
              </p>
            </Card>
          ) : (
            userRounds.map(round => (
              <RoundCard key={round.id} round={round} />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {allRounds.map(round => (
            <RoundCard key={round.id} round={round} />
          ))}
          
          {allRounds.length >= 10 && (
            <div className="text-center">
              <Button 
                onClick={onLoadMore} 
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? 'Загрузка...' : 'Загрузить еще'}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}