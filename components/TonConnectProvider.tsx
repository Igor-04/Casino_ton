import { ReactNode, createContext, useContext, useState, useCallback } from 'react'

// Mock TonConnect типы для демо
interface MockWallet {
  account: {
    address: string
    chain: string
    walletStateInit: string
    publicKey: string
  }
  device: {
    appName: string
    appVersion: string
    maxProtocolVersion: number
    platform: string
  }
}

interface MockTonConnectUI {
  connected: boolean
  account: MockWallet['account'] | null
  wallet: MockWallet | null
  openModal: () => void
  closeModal: () => void
  disconnect: () => Promise<void>
  sendTransaction: (transaction: any) => Promise<any>
}

// Mock контекст
const MockTonConnectContext = createContext<{
  tonConnectUI: MockTonConnectUI
  setConnectionState: (connected: boolean) => void
} | null>(null)

// Mock адрес для демо
const DEMO_ADDRESS = 'UQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL'

export function TonConnectProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [wallet, setWallet] = useState<MockWallet | null>(null)

  const mockAccount = connected ? {
    address: DEMO_ADDRESS,
    chain: '-239',
    walletStateInit: 'mock-state-init',
    publicKey: 'mock-public-key'
  } : null

  const mockWallet = connected ? {
    account: mockAccount!,
    device: {
      appName: 'Demo Wallet',
      appVersion: '1.0.0',
      maxProtocolVersion: 2,
      platform: 'web'
    }
  } : null

  const tonConnectUI: MockTonConnectUI = {
    connected,
    account: mockAccount,
    wallet: mockWallet,
    openModal: useCallback(() => {
      // Имитируем подключение кошелька
      setTimeout(() => {
        setConnected(true)
        setWallet(mockWallet)
      }, 1000)
    }, [mockWallet]),
    closeModal: useCallback(() => {
      // Закрытие модала (ничего не делаем в демо)
    }, []),
    disconnect: useCallback(async () => {
      setConnected(false)
      setWallet(null)
    }, []),
    sendTransaction: useCallback(async (transaction: any) => {
      // Имитируем отправку транзакции
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ hash: 'mock-transaction-hash' })
        }, 2000)
      })
    }, [])
  }

  const setConnectionState = useCallback((newConnected: boolean) => {
    setConnected(newConnected)
    if (newConnected) {
      setWallet(mockWallet)
    } else {
      setWallet(null)
    }
  }, [mockWallet])

  return (
    <MockTonConnectContext.Provider value={{ tonConnectUI, setConnectionState }}>
      {children}
    </MockTonConnectContext.Provider>
  )
}

// Mock hooks для замены реальных TonConnect hooks
export function useTonConnectUI(): [MockTonConnectUI] {
  const context = useContext(MockTonConnectContext)
  if (!context) {
    throw new Error('useTonConnectUI must be used within TonConnectProvider')
  }
  return [context.tonConnectUI]
}

export function useTonAddress(): string {
  const context = useContext(MockTonConnectContext)
  if (!context) {
    throw new Error('useTonAddress must be used within TonConnectProvider')
  }
  return context.tonConnectUI.account?.address || ''
}

export function useTonWallet(): MockWallet | null {
  const context = useContext(MockTonConnectContext)
  if (!context) {
    throw new Error('useTonWallet must be used within TonConnectProvider')
  }
  return context.tonConnectUI.wallet
}