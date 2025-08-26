import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Wallet, 
  Target, 
  Trophy, 
  ArrowRight, 
  Shield,
  Zap,
  Users,
  X 
} from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Добро пожаловать!',
      description: 'Присоединяйтесь к честным играм в блокчейне TON',
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-2">Добро пожаловать в TON Игры!</h2>
            <p className="text-muted-foreground">
              Честные игры с прозрачным распределением призов в блокчейне TON
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium">Защита от потерь</p>
                <p className="text-sm text-muted-foreground">Максимальная потеря 50%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium">Мгновенные выплаты</p>
                <p className="text-sm text-muted-foreground">Автоматическое распределение</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-medium">Реферальная система</p>
                <p className="text-sm text-muted-foreground">Зарабатывайте 2% с друзей</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Как это работает',
      description: 'Простой процесс участия в играх',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-2">Как это работает</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium">Подключите кошелек</h3>
                <p className="text-sm text-muted-foreground">
                  Безопасно подключите свой TON кошелек для участия
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium">Выберите игру</h3>
                <p className="text-sm text-muted-foreground">
                  Найдите игру с подходящим взносом и присоединитесь
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium">Получите выплату</h3>
                <p className="text-sm text-muted-foreground">
                  Выиграйте до 2x от своего взноса с гарантией возврата 50%
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Начать игру',
      description: 'Подключите кошелек и начните играть',
      icon: Wallet,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-2">Готовы начать?</h2>
            <p className="text-muted-foreground mb-6">
              Подключите свой TON кошелек и присоединяйтесь к играм
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Важная информация:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Все игры проводятся в тестовой сети TON</li>
              <li>• Используйте только тестовые токены</li>
              <li>• Максимальная потеря составляет 50% от взноса</li>
              <li>• Все транзакции прозрачны и проверяемы</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {currentStep + 1} из {steps.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Назад
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleSkip}>
                Пропустить
              </Button>
            )}

            <Button onClick={handleNext} className="ml-auto">
              {currentStep === steps.length - 1 ? 'Начать' : 'Далее'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}