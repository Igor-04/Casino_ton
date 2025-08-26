import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Calculator, 
  Hash,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { verifyFairnessProof, generateRandomValues, calculatePayoutDistribution } from '../lib/random'
import { formatTon, formatAddress, createExplorerLink } from '../lib/ton-format'
import { CONFIG, NETWORK_CONFIG } from '../config'
import { t } from '../i18n'

interface FairnessVerificationProps {
  roundId: number
  seed: string
  blockHash: string
  blockHeight: number
  participantAddresses: string[]
  stakes: bigint[]
  actualPayouts: bigint[]
  platformFeeBps: number
}

export function FairnessVerification({
  roundId,
  seed,
  blockHash,
  blockHeight,
  participantAddresses,
  stakes,
  actualPayouts,
  platformFeeBps
}: FairnessVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    calculatedPayouts: bigint[]
    differences: bigint[]
    explanation: string
    randomValues: bigint[]
    distributionDetails: any
  } | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const translations = t()

  // Perform fairness verification
  const handleVerifyFairness = async () => {
    setIsVerifying(true)
    
    try {
      // Add small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate same random values that contract used
      const randomValues = generateRandomValues(seed, blockHash, participantAddresses)
      
      // Calculate distribution using same algorithm
      const distributionDetails = calculatePayoutDistribution(stakes, randomValues, platformFeeBps)
      
      // Verify against actual payouts
      const verification = verifyFairnessProof(
        seed,
        blockHash,
        participantAddresses,
        stakes,
        actualPayouts,
        platformFeeBps
      )

      setVerificationResult({
        ...verification,
        randomValues,
        distributionDetails
      })

      if (verification.isValid) {
        toast.success(translations.messages.fairnessVerified)
      } else {
        toast.error(translations.messages.fairnessVerificationFailed)
      }
    } catch (error) {
      console.error('Verification failed:', error)
      toast.error(translations.errors.transactionFailed)
      setVerificationResult({
        isValid: false,
        calculatedPayouts: [],
        differences: [],
        explanation: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        randomValues: [],
        distributionDetails: null
      })
    } finally {
      setIsVerifying(false)
    }
  }

  // Copy seed to clipboard
  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(seed)
      toast.success(translations.messages.linkCopied)
    } catch (error) {
      toast.error(translations.error)
    }
  }

  // Copy block hash to clipboard
  const copyBlockHash = async () => {
    try {
      await navigator.clipboard.writeText(blockHash)
      toast.success(translations.messages.linkCopied)
    } catch (error) {
      toast.error(translations.error)
    }
  }

  // Open block in explorer
  const openBlockInExplorer = () => {
    const explorerUrl = NETWORK_CONFIG[CONFIG.NETWORK].explorerUrl
    window.open(`${explorerUrl}/block/${blockHeight}`, '_blank')
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium">{translations.history.fairnessProof}</h3>
        </div>

        {/* Proof Data */}
        <div className="space-y-4">
          {/* Seed */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{translations.history.seed}:</label>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <code className="flex-1 text-xs font-mono break-all">{seed}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copySeed}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Block Hash */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{translations.history.blockHash}:</label>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <code className="flex-1 text-xs font-mono break-all">{blockHash}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyBlockHash}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openBlockInExplorer}
                className="shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Block Height */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Block Height:</span>
            <Badge variant="outline">{blockHeight.toLocaleString()}</Badge>
          </div>

          {/* Distribution Formula */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{translations.history.formula}:</label>
            <div className="p-3 bg-muted/30 rounded-lg">
              <code className="text-xs">
                payout_i = basePayout_i + bonusPool × (random_i ÷ sum(all_randoms))
              </code>
            </div>
          </div>
        </div>

        <Separator />

        {/* Verification Button */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleVerifyFairness}
            disabled={isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </div>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                {translations.history.verifyFairness}
              </>
            )}
          </Button>

          {/* Verification Result */}
          {verificationResult && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                verificationResult.isValid 
                  ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
              }`}>
                {verificationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    verificationResult.isValid 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {verificationResult.isValid ? 'Verification Successful' : 'Verification Failed'}
                  </p>
                  <p className={`text-sm ${
                    verificationResult.isValid 
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {verificationResult.explanation}
                  </p>
                </div>
              </div>

              {/* Toggle Details */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>

              {/* Detailed Results */}
              {showDetails && (
                <div className="space-y-4 p-4 bg-muted/10 rounded-lg">
                  <h4 className="font-medium">Verification Details</h4>
                  
                  {/* Random Values */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Generated Random Values:</h5>
                    <div className="space-y-1">
                      {participantAddresses.map((address, index) => (
                        <div key={address} className="flex items-center justify-between text-xs">
                          <span className="font-mono">{formatAddress(address)}</span>
                          <span className="font-mono">{verificationResult.randomValues[index]?.toString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Payout Comparison */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Payout Comparison:</h5>
                    <div className="space-y-1">
                      {participantAddresses.map((address, index) => (
                        <div key={address} className="space-y-1 p-2 bg-muted/30 rounded">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono">{formatAddress(address)}</span>
                            <div className="flex items-center gap-2">
                              <span>Expected: {formatTon(verificationResult.calculatedPayouts[index] || 0n)}</span>
                              <span>Actual: {formatTon(actualPayouts[index])}</span>
                              {verificationResult.differences[index] > 0n && (
                                <span className="text-red-600">
                                  (±{formatTon(verificationResult.differences[index])})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distribution Breakdown */}
                  {verificationResult.distributionDetails && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Distribution Breakdown:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Total Pool: {formatTon(verificationResult.distributionDetails.totalPool)}</div>
                          <div>Bonus Pool: {formatTon(verificationResult.distributionDetails.bonusPool)}</div>
                          <div>Platform Fee: {(platformFeeBps / 100).toFixed(1)}%</div>
                          <div>Min Payout: 50% of stake</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Information */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              How Verification Works
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
              This verification recalculates the exact same random distribution that the smart contract used, 
              ensuring complete transparency and fairness. The seed was revealed only after all participants joined.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}