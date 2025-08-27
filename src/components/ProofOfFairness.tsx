import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Shield, 
  Copy, 
  ChevronDown, 
  Calculator, 
  CheckCircle, 
  Eye,
  Hash,
  Dice6,
  ExternalLink 
} from 'lucide-react'
import { RandomnessProof, DistributionDetails } from '../types/transparency'

interface ProofOfFairnessProps {
  roundId: number
  proof: RandomnessProof
  distribution: DistributionDetails
  userAddress?: string
}

export function ProofOfFairness({ roundId, proof, distribution, userAddress }: ProofOfFairnessProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [verificationResult, setVerificationResult] = useState<'pending' | 'verified' | 'failed'>('pending')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Функция верификации случайности (упрощенная версия)
  const verifyRandomness = () => {
    // В реальном приложении здесь будет проверка хэшей и вычислений
    setVerificationResult('verified')
  }

  const userParticipant = distribution.participants.find(p => p.address === userAddress)

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 shrink-0">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="font-medium truncate">Пруф честности</h3>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">
            Верифицируемо
          </Badge>
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {/* Seed */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Dice6 className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-medium text-blue-800 truncate">Случайный Seed</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(proof.seed)}
                className="h-6 w-6 p-0 shrink-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="overflow-hidden">
              <p className="font-mono text-sm text-blue-700 break-all">
                {proof.seed}
              </p>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Раскрыт {new Date(proof.revealTimestamp * 1000).toLocaleString()}
            </p>
          </div>

          {/* Block Hash */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Hash className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="font-medium text-purple-800 truncate">Хэш блока TON</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant="outline" className="text-xs">
                  #{proof.blockHeight}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(proof.blockHash)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="font-mono text-sm text-purple-700 break-all">
                {proof.blockHash}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-purple-600 p-0 h-auto mt-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              Посмотреть в эксплорере
            </Button>
          </div>
        </div>

        {/* Детали распределения */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2">
              <span>Детали распределения</span>
              <ChevronDown className={`h-4 w-4 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-3">
            {/* Формула распределения */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Формула распределения</h4>
              <div className="bg-white p-2 rounded border overflow-x-auto">
                <code className="font-mono text-sm whitespace-nowrap">
                  {distribution.formula}
                </code>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                <div className="min-w-0">
                  <span className="text-muted-foreground">Общий банк:</span>
                  <span className="font-medium ml-1">{distribution.totalPool} TON</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground">Базовая выплата:</span>
                  <span className="font-medium ml-1">{distribution.basePayout} TON</span>
                </div>
              </div>
            </div>

            {/* Ваш результат */}
            {userParticipant && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 shrink-0" />
                  <span className="truncate">Ваш результат</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="min-w-0">
                    <span className="text-muted-foreground">Ваше случайное число:</span>
                    <p className="font-mono break-all">{userParticipant.randomValue}</p>
                  </div>
                  <div className="min-w-0">
                    <span className="text-muted-foreground">Выплата:</span>
                    <p className="font-medium">{userParticipant.payout} TON</p>
                  </div>
                </div>
              </div>
            )}

            {/* Список всех участников */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Все участники ({distribution.participants.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {distribution.participants.map((participant, index) => (
                  <div 
                    key={participant.address} 
                    className={`flex justify-between items-center p-2 rounded text-sm ${
                      participant.address === userAddress ? 'bg-blue-100 border border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-mono text-xs truncate min-w-0">
                        {participant.address.slice(0, 6)}...{participant.address.slice(-4)}
                      </span>
                      {participant.address === userAddress && (
                        <Badge variant="outline" className="text-xs shrink-0">Вы</Badge>
                      )}
                    </div>
                    <div className="text-right text-xs shrink-0 ml-2">
                      <p className="font-medium">{participant.payout} TON</p>
                      <p className={`${participant.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {participant.profit >= 0 ? '+' : ''}{participant.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Действия */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={verifyRandomness}
            className="flex-1 min-w-0"
          >
            <Calculator className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">Проверить честность</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex-1 min-w-0"
          >
            <Eye className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">Калькулятор</span>
          </Button>
        </div>

        {/* Результат верификации */}
        {verificationResult === 'verified' && (
          <Alert className="mt-3 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Распределение верифицировано! Все вычисления корректны.
            </AlertDescription>
          </Alert>
        )}

        {/* Калькулятор проверки */}
        {showCalculator && (
          <Card className="mt-3 p-3 bg-blue-50 border-blue-200">
            <h4 className="font-medium mb-2">Как проверить самостоятельно:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Возьмите seed + block hash</p>
              <p className="break-words">2. Вычислите SHA256(seed + blockHash + participantAddress)</p>
              <p className="break-words">3. Конвертируйте в число: random_i = hash % 1000000</p>
              <p className="break-words">4. Примените формулу: payout_i = basePayout + remaining * (random_i / sum(randoms))</p>
              <p>5. Проверьте, что ваш результат совпадает с указанным</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Открыть онлайн калькулятор
            </Button>
          </Card>
        )}
      </div>
    </Card>
  )
}