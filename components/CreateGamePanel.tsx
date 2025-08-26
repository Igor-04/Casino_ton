import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Separator } from './ui/separator'
import { 
  Clock, 
  Users, 
  Coins, 
  Plus, 
  Info,
  Calendar,
  Target
} from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

interface CreateGamePanelProps {
  onCreateRound: (roundData: {
    mode: 'TIME_LOCKED' | 'CAPACITY_LOCKED'
    stakeTON: number
    deadline?: number
    targetParticipants?: number
  }) => void
  platformFeePercent: number
  disabled?: boolean
  walletBalance: string
}

export function CreateGamePanel({ 
  onCreateRound, 
  platformFeePercent, 
  disabled = false,
  walletBalance 
}: CreateGamePanelProps) {
  const [mode, setMode] = useState<'TIME_LOCKED' | 'CAPACITY_LOCKED'>('TIME_LOCKED')
  const [stakeTON, setStakeTON] = useState('')
  const [hours, setHours] = useState('1')
  const [targetParticipants, setTargetParticipants] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isCreating || disabled) return

    const stake = parseFloat(stakeTON)
    if (isNaN(stake) || stake <= 0) {
      return
    }

    setIsCreating(true)

    try {
      const roundData: any = {
        mode,
        stakeTON: stake
      }

      if (mode === 'TIME_LOCKED') {
        const hoursValue = parseFloat(hours)
        if (isNaN(hoursValue) || hoursValue <= 0) {
          return
        }
        roundData.deadline = Math.floor(Date.now() / 1000) + (hoursValue * 3600)
      } else {
        const participants = parseInt(targetParticipants)
        if (isNaN(participants) || participants < 2) {
          return
        }
        roundData.targetParticipants = participants
      }

      await onCreateRound(roundData)
      
      // Reset form
      setStakeTON('')
      setHours('1')
      setTargetParticipants('')
    } finally {
      setIsCreating(false)
    }
  }

  const isValidForm = () => {
    const stake = parseFloat(stakeTON)
    if (isNaN(stake) || stake <= 0) return false

    if (mode === 'TIME_LOCKED') {
      const hoursValue = parseFloat(hours)
      return !isNaN(hoursValue) && hoursValue > 0
    } else {
      const participants = parseInt(targetParticipants)
      return !isNaN(participants) && participants >= 2
    }
  }

  const estimatedPlatformFee = () => {
    const stake = parseFloat(stakeTON)
    if (isNaN(stake)) return 0
    return Math.round(stake * (platformFeePercent / 100) * 100) / 100
  }

  const guaranteedMinimum = () => {
    const stake = parseFloat(stakeTON)
    if (isNaN(stake)) return 0
    return Math.round(stake * 0.5 * 100) / 100
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-medium mb-2">Создать новую игру</h2>
        <p className="text-muted-foreground">
          Настройте параметры игры и пригласите других участников
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base">Режим игры</Label>
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as 'TIME_LOCKED' | 'CAPACITY_LOCKED')}
              className="grid grid-cols-1 gap-3"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="TIME_LOCKED" id="time-locked" />
                <Label htmlFor="time-locked" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">По времени</div>
                    <div className="text-sm text-muted-foreground">
                      Игра завершается в указанное время
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="CAPACITY_LOCKED" id="capacity-locked" />
                <Label htmlFor="capacity-locked" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium">По участникам</div>
                    <div className="text-sm text-muted-foreground">
                      Игра завершается при достижении лимита участников
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label htmlFor="stake" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Размер взноса (TON)
            </Label>
            <Input
              id="stake"
              type="number"
              step="0.01"
              min="0.1"
              value={stakeTON}
              onChange={(e) => setStakeTON(e.target.value)}
              placeholder="Например, 1.0"
              disabled={disabled}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Минимум: 0.1 TON</span>
              <span>Баланс: {walletBalance}</span>
            </div>
          </div>

          {/* Conditional Parameters */}
          {mode === 'TIME_LOCKED' && (
            <div className="space-y-2">
              <Label htmlFor="hours" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Длительность (часы)
              </Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0.5"
                max="168"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="1"
                disabled={disabled}
              />
              <p className="text-sm text-muted-foreground">
                От 30 минут до 7 дней
              </p>
            </div>
          )}

          {mode === 'CAPACITY_LOCKED' && (
            <div className="space-y-2">
              <Label htmlFor="participants" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Максимум участников
              </Label>
              <Input
                id="participants"
                type="number"
                min="2"
                max="100"
                value={targetParticipants}
                onChange={(e) => setTargetParticipants(e.target.value)}
                placeholder="10"
                disabled={disabled}
              />
              <p className="text-sm text-muted-foreground">
                От 2 до 100 участников
              </p>
            </div>
          )}

          <Separator />

          {/* Fee Information */}
          {stakeTON && !isNaN(parseFloat(stakeTON)) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ваш взнос:</span>
                <span className="font-medium">{parseFloat(stakeTON).toFixed(2)} TON</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Комиссия платформы ({platformFeePercent}%):</span>
                <span className="font-medium">{estimatedPlatformFee().toFixed(2)} TON</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium border-t pt-3">
                <span>К списанию:</span>
                <span>{(Math.round((parseFloat(stakeTON) + estimatedPlatformFee()) * 100) / 100).toFixed(2)} TON</span>
              </div>
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
                <span>Гарантированный минимум:</span>
                <span className="font-medium">{guaranteedMinimum().toFixed(2)} TON</span>
              </div>
            </div>
          )}

          {/* Minimum Payout Info */}
          {stakeTON && !isNaN(parseFloat(stakeTON)) && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Участник получит минимум {guaranteedMinimum().toFixed(2)} TON</strong><br />
                Максимальная потеря не превысит 50% от взноса.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isValidForm() || isCreating || disabled}
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Создание...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Создать игру
              </>
            )}
          </Button>

          {disabled && (
            <p className="text-center text-sm text-muted-foreground">
              Подключите кошелек для создания игры
            </p>
          )}
        </form>
      </Card>
    </div>
  )
}