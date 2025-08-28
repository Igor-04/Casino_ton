import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react'
import { Wallet, LogOut, ExternalLink, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { CONFIG } from '../src/config'
import { fetchWalletBalance } from '../src/lib/ton' // <-- ВАЖНО: правильный относительный путь!

export function WalletConnect() {
  const [tonConnectUI] = useTonConnectUI()
  const address = useTonAddress()
  const wallet = useTonWallet()

  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!address) {
        setBalance(null)
        return
      }
      try {
        setLoadingBalance(true)
        const b = await fetchWalletBalance(address)
        if (!cancelled) setBalance(b)
      } catch (e) {
        console.error('Failed to fetch balance', e)
        if (!cancelled) setBalance(null)
      } finally {
        if (!cancelled) setLoadingBalance(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [address])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await tonConnectUI.openModal()
      setIsConnecting(false)
    } catch (error) {
      setIsConnecting(false)
      console.error('Connection failed:', error)
      toast.error('Не удалось подключить кошелек')
    }
  }

  const handleDisconnect = async () => {
    try {
      await tonConnectUI.disconnect()
      toast.success('Кошелек отключен')
      setBalance(null)
    } catch (error) {
      console.error('Disconnect failed:', error)
      toast.error('Не удалось отключить кошелек')
    }
  }

  const copyAddress = async () => {
    try {
      if (address) {
        await navigator.clipboard.writeText(address)
        toast.success('Адрес скопирован!')
      }
    } catch {
      toast.error('Не удалось скопировать адрес')
    }
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`
  const balanceText = balance == null ? (loadingBalance ? '…' : '—') : `${balance.toFixed(5)} TON`

  if (!address || !wallet) {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium">Подключить кошелек</h3>
              <p className="text-xs text-muted-foreground">Для участия в играх</p>
            </div>
          </div>
          <Button onClick={handleConnect} disabled={isConnecting} className="shrink-0" size="sm">
            {isConnecting ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
            ) : (
              <Wallet className="h-3 w-3 mr-1" />
            )}
            {isConnecting ? 'Подключение' : 'Подключить'}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 shrink-0">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-medium truncate">{wallet.device.appName}</h3>
              {CONFIG.NETWORK === 'testnet' && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  testnet
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs shrink-0">Онлайн</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <button
                onClick={copyAddress}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                title="Скопировать адрес"
              >
                <code className="text-xs">{formatAddress(address)}</code>
                <Copy className="h-3 w-3" />
              </button>
              <span>•</span>
              <span title="Баланс">{balanceText}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://tonviewer.com/${address}`, '_blank')}
            className="h-7 w-7 p-0"
            title="Открыть в Tonviewer"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="h-7 w-7 p-0"
            title="Отключить"
          >
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
