// TON Connect wallet integration
import { TonConnect, CHAIN, toUserFriendlyAddress } from '@tonconnect/sdk'
import { CONFIG } from '../config'

interface WalletState {
  address: string | null
  balance: bigint
  network: 'testnet' | 'mainnet' | null
  connected: boolean
}

const tonConnect = new TonConnect({ manifestUrl: CONFIG.TON_CONNECT_MANIFEST_URL })

let walletState: WalletState = {
  address: null,
  balance: 0n,
  network: null,
  connected: false
}

const walletChangeListeners: ((wallet: WalletState | null) => void)[] = []

export function initTonConnect(): void {
  tonConnect.onStatusChange(async wallet => {
    if (wallet) {
      walletState = {
        address: toUserFriendlyAddress(
          wallet.account.address,
          wallet.account.chain === CHAIN.TESTNET
        ),
        balance: 0n,
        network: wallet.account.chain === CHAIN.TESTNET ? 'testnet' : 'mainnet',
        connected: true
      }

      try {
        const balance = await (tonConnect as any).getBalance(wallet.account.address)
        walletState.balance = BigInt(balance)
      } catch (err) {
        console.error('Failed to fetch wallet balance:', err)
      }

      localStorage.setItem('tonWalletConnected', 'true')
      walletChangeListeners.forEach(listener => listener({ ...walletState }))
    } else {
      walletState = { address: null, balance: 0n, network: null, connected: false }
      localStorage.removeItem('tonWalletConnected')
      walletChangeListeners.forEach(listener => listener(null))
    }
  })

  tonConnect.restoreConnection().catch(err => {
    console.error('Failed to restore wallet connection:', err)
  })
}

export function getUserFriendlyAddress(): string | null {
  return walletState.address
}

export function isWalletConnected(): boolean {
  return walletState.connected
}

export async function getWalletBalance(): Promise<bigint> {
  if (!tonConnect.account) return 0n
  try {
    const balance = await (tonConnect as any).getBalance(tonConnect.account.address)
    walletState.balance = BigInt(balance)
    return walletState.balance
  } catch (err) {
    console.error('Failed to get wallet balance:', err)
    return 0n
  }
}

export function validateNetwork(): boolean {
  return walletState.network === CONFIG.NETWORK
}

export function getWalletNetwork(): 'testnet' | 'mainnet' | null {
  return walletState.network
}

export async function restoreConnection(): Promise<void> {
  await tonConnect.restoreConnection()
}

export function subscribeToWalletChanges(callback: (wallet: WalletState | null) => void): () => void {
  walletChangeListeners.push(callback)
  return () => {
    const index = walletChangeListeners.indexOf(callback)
    if (index > -1) walletChangeListeners.splice(index, 1)
  }
}

export async function connectWallet(): Promise<void> {
  await (tonConnect as any).connectWallet()
}

export async function disconnectWallet(): Promise<void> {
  await tonConnect.disconnect()
}

export async function sendTransaction(params: {
  to: string
  amount: string
  payload?: string
}): Promise<{ hash: string } | null> {
  if (!tonConnect.account) throw new Error('Wallet not connected')
  if (!validateNetwork()) throw new Error('Invalid network')
  const tx = {
    validUntil: Math.floor(Date.now() / 1000) + 60,
    messages: [
      {
        address: params.to,
        amount: params.amount,
        payload: params.payload
      }
    ]
  }
  const result = await tonConnect.sendTransaction(tx)
  return { hash: result.boc }
}

export function getWalletInfo(): WalletState {
  return { ...walletState }
}
