import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  Coins,
  TrendingUp,
  Calendar,
  ExternalLink,
  UserPlus,
  Gamepad2,
  Trophy,
  Target,
  Clock,
  BarChart3,
  Percent,
  Clock3,
  TimerReset
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { formatTon } from '../src/lib/ton-format'
import type { ReferralData } from '../src/store/gameStore'
import type { UserStats } from '../src/store/gameStore'

interface ReferralSystemProps {
  userAddress: string
  referralData: ReferralData
  userStats: UserStats
}

export function ReferralSystem({ 
  userAddress, 
  referralData,
  userStats
}: ReferralSystemProps) {
  const [showFullCode, setShowFullCode] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeSinceLastGame = () => {
    if (userStats.totalGames === 0) return 'Еще не играли'
    
    // Calculate from current time since we don't track last game time in stats
    const hoursAgo = Math.floor(Math.random() * 24) + 1 // Mock for demo
    if (hoursAgo < 1) return 'Меньше часа назад'
    if (hoursAgo < 24) return `${hoursAgo} час${hoursAgo > 1 ? 'а' : ''} назад`
    const daysAgo = Math.floor(hoursAgo / 24)
    return `${daysAgo} день${daysAgo > 1 ? 'дня' : ''} назад`
  }

  const copyReferralCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralData.referralCode)
        toast.success('Реферальный код скопирован!')
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = referralData.referralCode
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast.success('Реферальный код скопирован!')
      }
    } catch (error) {
      toast.error('Не удалось скопировать код')
    }
  }

  const copyReferralLink = async () => {
    try {
      const link = `${window.location.origin}?ref=${referralData.referralCode}`
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link)
        toast.success('Реферальная ссылка скопирована!')
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = link
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast.success('Реферальная ссылка скопирована!')
      }
    } catch (error) {
      toast.error('Не удалось скопировать ссылку')
    }
  }

  const shareReferralLink = async () => {
    const link = `${window.location.origin}?ref=${referralData.referralCode}`
    const text = 'Присоединяйся к честным играм в TON блокчейне! Максимальная потеря только 50%.'
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TON Игры',
          text: text,
          url: link
        })
        toast.success('Поделились успешно!')
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('Share cancelled or failed:', error)
          // Fallback to copying link
          await copyReferralLink()
        }
      }
    } else {
      // Fallback to copying link
      await copyReferralLink()
    }
  }

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 60) return 'text-green-600 dark:text-green-400'
    if (winRate >= 45) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600 dark:text-green-400'
    if (profit < 0) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  if (!userAddress) {
    return (
      <Card className="p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-medium mb-2">Профиль игрока</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Подключите кошелек для просмотра статистики и реферальной программы
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h2 className="font-medium mb-1">Профиль игрока</h2>
        <p className="text-muted-foreground text-xs">
          {formatAddress(userAddress)}
        </p>
      </div>

      {/* Игровая статистика */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">
            Статистика игр
          </TabsTrigger>
          <TabsTrigger value="referrals">
            Рефералы ({referralData.stats.totalInvited})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-3">
          {/* Основная статистика */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-2 text-center">
              <Gamepad2 className="h-4 w-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <p className="font-semibold mb-0.5">{userStats.totalGames}</p>
              <p className="text-xs text-muted-foreground">Всего игр</p>
            </Card>
            
            <Card className="p-2 text-center">
              <Percent className={`h-4 w-4 mx-auto mb-1 ${getWinRateColor(userStats.winRate)}`} />
              <p className={`font-semibold mb-0.5 ${getWinRateColor(userStats.winRate)}`}>
                {userStats.winRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Винрейт</p>
            </Card>

            <Card className="p-2 text-center">
              <Coins className="h-4 w-4 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
              <p className="font-semibold mb-0.5 text-sm">
                {formatTon(BigInt(Math.floor(userStats.totalDeposited * 1e9)))}
              </p>
              <p className="text-xs text-muted-foreground">Инвестировано</p>
            </Card>
            
            <Card className="p-2 text-center">
              <Trophy className={`h-4 w-4 mx-auto mb-1 ${getProfitColor(userStats.totalProfit)}`} />
              <p className={`font-semibold mb-0.5 text-sm ${getProfitColor(userStats.totalProfit)}`}>
                {userStats.totalProfit >= 0 ? '+' : ''}{formatTon(BigInt(Math.floor(userStats.totalProfit * 1e9)))}
              </p>
              <p className="text-xs text-muted-foreground">Прибыль/Убыток</p>
            </Card>
          </div>

          {/* Дополнительная статистика */}
          <Card className="p-3">
            <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Детальная статистика
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Побед:</span>
                  <span className="text-xs font-medium text-green-600">{userStats.totalWon}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Поражений:</span>
                  <span className="text-xs font-medium text-red-600">{userStats.totalLost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Лучший выигрыш:</span>
                  <span className="text-xs font-medium text-green-600">
                    {formatTon(BigInt(Math.floor(userStats.bestWin * 1e9)))}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Средняя прибыль:</span>
                  <span className={`text-xs font-medium ${getProfitColor(userStats.avgProfit)}`}>
                    {userStats.avgProfit >= 0 ? '+' : ''}{formatTon(BigInt(Math.floor(userStats.avgProfit * 1e9)))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Выведено:</span>
                  <span className="text-xs font-medium">
                    {formatTon(BigInt(Math.floor(userStats.totalWithdrawn * 1e9)))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Последняя игра:</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {getTimeSinceLastGame()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Реферальная статистика */}
          <Card className="p-3">
            <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Реферальный доход
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="font-semibold text-green-600 text-sm">
                  {formatTon(BigInt(Math.floor(referralData.stats.totalEarned * 1e9)))}
                </p>
                <p className="text-xs text-muted-foreground">Заработано</p>
              </div>
              
              <div className="text-center">
                <p className="font-semibold text-sm">{referralData.stats.totalInvited}</p>
                <p className="text-xs text-muted-foreground">Приглашено</p>
              </div>
              
              <div className="text-center">
                <p className="font-semibold text-blue-600 text-sm">{referralData.stats.activeInvitees}</p>
                <p className="text-xs text-muted-foreground">Активных</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-3">
          {/* Реферальные инструменты */}
          <Card className="p-3">
            <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
              <Share2 className="h-4 w-4" />
              Пригласить друзей
            </h3>
            
            <div className="space-y-2">
              {/* Реферальный код */}
              <div>
                <label className="text-xs font-medium mb-1 block">Ваш реферальный код</label>
                <div className="flex gap-1">
                  <Input
                    value={showFullCode ? referralData.referralCode : formatAddress(referralData.referralCode)}
                    readOnly
                    onClick={() => setShowFullCode(!showFullCode)}
                    className="cursor-pointer text-xs h-8"
                  />
                  <Button variant="outline" size="icon" onClick={copyReferralCode} className="h-8 w-8">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Кнопки поделиться */}
              <div className="flex gap-1">
                <Button onClick={copyReferralLink} className="flex-1 h-7 text-xs px-2">
                  <Copy className="h-3 w-3 mr-1" />
                  Ссылка
                </Button>
                <Button onClick={shareReferralLink} variant="outline" className="flex-1 h-7 text-xs px-2">
                  <Share2 className="h-3 w-3 mr-1" />
                  Поделиться
                </Button>
              </div>

              {/* Информация о программе */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1 text-xs">
                  Реферальная программа
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                  <li>• 2% от комиссии с игр друзей</li>
                  <li>• Автоматические выплаты</li>
                  <li>• Приглашения бессрочны</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Список приглашенных */}
          <Card className="p-3">
            <h3 className="font-medium mb-2 text-sm">
              Приглашенные ({referralData.invitedUsers.length})
            </h3>
            
            {referralData.invitedUsers.length === 0 ? (
              <div className="text-center py-4">
                <UserPlus className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Пока никого не приглашено
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {referralData.invitedUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <div className="min-w-0 flex-1">
                      <code className="text-xs font-mono block">
                        {formatAddress(user.address)}
                      </code>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>Игр: {user.totalPlayed}</span>
                        <span>Заработано: {formatTon(BigInt(Math.floor(user.earned * 1e9)))}</span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-2">
                      <p className="text-xs font-medium text-green-600">
                        +{formatTon(BigInt(Math.floor(user.earned * 1e9)))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(user.joinedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Недавние награды */}
          {referralData.rewards.length > 0 && (
            <Card className="p-3">
              <h3 className="font-medium mb-2 text-sm">
                Недавние награды ({referralData.rewards.length})
              </h3>
              
              <div className="space-y-1">
                {referralData.rewards.slice(0, 10).map((reward, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">
                        Игра #{reward.roundId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        От {formatAddress(reward.fromUser)}
                      </p>
                    </div>
                    
                    <div className="text-right ml-2">
                      <p className="text-xs font-medium text-green-600">
                        +{formatTon(BigInt(Math.floor(reward.amount * 1e9)))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(reward.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}