import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Info, Coins, Trophy, Users, Clock } from 'lucide-react'
import { formatTon } from '../src/lib/ton-format'
import type { Round } from './GameRound'

interface ConfirmJoinDialogProps {
  round: Round | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  platformFeePercent: number
}

export function ConfirmJoinDialog({
  round,
  isOpen,
  onClose,
  onConfirm,
  platformFeePercent
}: ConfirmJoinDialogProps) {
  if (!round) return null

  const platformFee = round.stakeTON * (platformFeePercent / 100)
  const totalCost = round.stakeTON + platformFee

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Подтверждение участия
          </DialogTitle>
          <DialogDescription>
            Проверьте детали игры и подтвердите свое участие. С вашего кошелька будет списан взнос и комиссия платформы.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Game Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Игра</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">#{round.id}</span>
                <Badge variant="outline">
                  {round.mode === 'TIME_LOCKED' ? 'По времени' : 'По участникам'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Участники</span>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {round.participants}{round.targetParticipants ? `/${round.targetParticipants}` : ''}
                </span>
              </div>
            </div>

            {round.mode === 'TIME_LOCKED' && round.deadline && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Завершение</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(round.deadline * 1000).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Детали платежа
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Взнос в игру</span>
                <span className="font-medium">{round.stakeTON} TON</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Комиссия платформы ({platformFeePercent}%)</span>
                <span className="font-medium">{platformFee.toFixed(4)} TON</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between font-medium">
                <span>Итого к списанию</span>
                <span>{totalCost.toFixed(4)} TON</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payout Information */}
          <div className="space-y-3">
            <h4 className="font-medium">Возможные выплаты</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Минимальная выплата</span>
                <span className="font-medium text-green-600">
                  {formatTon(BigInt(Math.floor(round.minPayout * 1e9)), { decimals: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Максимальная выплата</span>
                <span className="font-medium text-green-600">
                  {formatTon(BigInt(Math.floor(round.maxPayout * 1e9)), { decimals: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Защита от потерь
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Гарантируется возврат минимум 50% от вашего взноса. 
                  Максимальная потеря составляет {(round.stakeTON * 0.5).toFixed(2)} TON.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onConfirm}>
            Подтвердить участие
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}