import { ReactNode } from 'react'

interface TonConnectWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

// Простая обертка, которая сразу рендерит children
export function TonConnectWrapper({ children }: TonConnectWrapperProps) {
  return <>{children}</>
}