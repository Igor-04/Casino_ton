import { Card } from './ui/card'
import { Button } from './ui/button'
import { Shield, Zap, Clock, X, Gift, Share2 } from 'lucide-react'
import { t } from '../src/i18n'
import { FeatureCardsVisibility } from '../src/hooks/useFeatureCards'

interface FeatureCardsProps {
  visibility: FeatureCardsVisibility
  onHideCard: (cardKey: keyof FeatureCardsVisibility) => void
  onCopyReferralLink: () => void
}

export function FeatureCards({ visibility, onHideCard, onCopyReferralLink }: FeatureCardsProps) {
  const translations = t()

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* Protection Card */}
        {visibility.protectionCard && (
          <Card className="p-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onHideCard('protectionCard')}
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950 shrink-0">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium">{translations.features.lossProtection}</h4>
                <p className="text-sm text-muted-foreground">{translations.features.lossProtectionDesc}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Referral Card */}
        {visibility.referralCard && (
          <Card className="p-4 relative bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onHideCard('referralCard')}
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 shrink-0">
                <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                  {translations.referrals.inviteFriends}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-3 leading-relaxed">
                  {translations.referrals.earnFrom}
                </p>
                <Button 
                  size="sm" 
                  onClick={onCopyReferralLink}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {translations.referrals.share}
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* Quick Action Cards */}
        {(visibility.payoutsCard || visibility.transparencyCard) && (
          <div className="grid grid-cols-2 gap-3">
            {visibility.payoutsCard && (
              <Card className="p-3 text-center relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHideCard('payoutsCard')}
                  className="absolute top-1 right-1 h-5 w-5 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="pt-1">
                  <Zap className="h-6 w-6 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium">{translations.features.instantPayouts}</p>
                </div>
              </Card>
            )}
            
            {visibility.transparencyCard && (
              <Card className="p-3 text-center relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHideCard('transparencyCard')}
                  className="absolute top-1 right-1 h-5 w-5 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="pt-1">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                  <p className="text-sm font-medium">{translations.history.transparency}</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}