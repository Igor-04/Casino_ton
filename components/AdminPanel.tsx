import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Settings, Plus, Lock, DollarSign, Clock, Users } from 'lucide-react'
import { Round } from './GameRound'

interface AdminPanelProps {
  isAdmin: boolean
  onCreateRound: (roundData: Partial<Round>) => void
  onLockRound: (roundId: number) => void
  onDistribute: (roundId: number) => void
  activeRounds: Round[]
}

export function AdminPanel({ isAdmin, onCreateRound, onLockRound, onDistribute, activeRounds }: AdminPanelProps) {
  const [formData, setFormData] = useState({
    mode: 'TIME_LOCKED' as 'TIME_LOCKED' | 'CAPACITY_LOCKED',
    stakeTON: 1,
    targetParticipants: 10,
    durationHours: 24,
    serviceFee: 0
  })

  if (!isAdmin) {
    return null
  }

  const handleCreateRound = () => {
    const deadline = formData.mode === 'TIME_LOCKED' 
      ? Math.floor(Date.now() / 1000) + (formData.durationHours * 3600)
      : undefined

    onCreateRound({
      mode: formData.mode,
      stakeTON: formData.stakeTON,
      targetParticipants: formData.mode === 'CAPACITY_LOCKED' ? formData.targetParticipants : undefined,
      deadline,
      status: 'OPEN',
      participants: 0,
      bank: 0,
      minPayout: formData.stakeTON * 0.5
    })
  }

  return (
    <div className="space-y-4">
      {/* Создание нового раунда */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium">Создать раунд</h3>
        </div>
        
        <div className="space-y-4">
          {/* Режим завершения */}
          <div className="space-y-2">
            <Label className="text-sm">Режим завершения</Label>
            <Select 
              value={formData.mode} 
              onValueChange={(value: 'TIME_LOCKED' | 'CAPACITY_LOCKED') => 
                setFormData(prev => ({ ...prev, mode: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TIME_LOCKED">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    По времени
                  </div>
                </SelectItem>
                <SelectItem value="CAPACITY_LOCKED">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    По участникам
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Размер взноса */}
          <div className="space-y-2">
            <Label className="text-sm">Размер взноса (TON)</Label>
            <Input
              type="number"
              min="1"
              value={formData.stakeTON}
              onChange={(e) => setFormData(prev => ({ ...prev, stakeTON: Number(e.target.value) }))}
            />
          </div>

          {/* Условные поля */}
          {formData.mode === 'TIME_LOCKED' && (
            <div className="space-y-2">
              <Label className="text-sm">Длительность (часы)</Label>
              <Input
                type="number"
                min="1"
                value={formData.durationHours}
                onChange={(e) => setFormData(prev => ({ ...prev, durationHours: Number(e.target.value) }))}
              />
            </div>
          )}

          {formData.mode === 'CAPACITY_LOCKED' && (
            <div className="space-y-2">
              <Label className="text-sm">Макс. участников</Label>
              <Input
                type="number"
                min="2"
                value={formData.targetParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, targetParticipants: Number(e.target.value) }))}
              />
            </div>
          )}

          {/* Комиссия */}
          <div className="space-y-2">
            <Label className="text-sm">Комиссия сервиса (%)</Label>
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.serviceFee}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceFee: Number(e.target.value) }))}
            />
          </div>

          <Button onClick={handleCreateRound} className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Создать раунд
          </Button>
        </div>
      </Card>

      {/* Управление активными раундами */}
      {activeRounds.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium">Управление</h3>
          </div>
          
          <div className="space-y-3">
            {activeRounds.map(round => (
              <div key={round.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">Раунд #{round.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {round.participants} участников • {round.bank} TON
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {round.status === 'OPEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLockRound(round.id)}
                      className="flex-1"
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Заблокировать
                    </Button>
                  )}
                  {round.status === 'LOCKED' && (
                    <Button
                      size="sm"
                      onClick={() => onDistribute(round.id)}
                      className="flex-1"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Распределить
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}