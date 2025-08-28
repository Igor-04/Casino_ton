// Safe environment variable access
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    return (
      // Vite exposes variables through import.meta.env
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) ||
      (typeof process !== 'undefined' && (process as any).env?.[key]) ||
      defaultValue
    )
  } catch {
    return defaultValue
  }
}

const getOrigin = (): string => {
  try {
    return typeof window !== 'undefined' ? window.location.origin : ''
  } catch {
    return ''
  }
}

// Configuration constants for the TON Games application
export const CONFIG = {
  // Network configuration
  NETWORK: 'testnet' as 'testnet' | 'mainnet',
  
  // Contract configuration  
  CONTRACT_ADDRESS: getEnvVar('VITE_CONTRACT_ADDRESS'),
  
  // Platform fees
  PLATFORM_FEE_BPS: 500, // 5% in basis points
  
  // Pagination
  ROUNDS_PER_PAGE: 20,
  
  // Game limits
  MIN_STAKE_TON: 0.1,
  MAX_STAKE_TON: 10000,
  MIN_PARTICIPANTS: 2,
  MAX_PARTICIPANTS: 1000,
  
  // Time limits
  MIN_ROUND_DURATION_MINUTES: 10,
  MAX_ROUND_DURATION_DAYS: 7,
  
  // UI Configuration
  DEFAULT_LANGUAGE: 'en',
  ENABLE_DEBUG: getEnvVar('NODE_ENV') === 'development',
  
  // TON Connect
TON_CONNECT_MANIFEST_URL:
  getEnvVar('VITE_TON_CONNECT_MANIFEST_URL') ||
  `${getOrigin()}${(typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || '/'}tonconnect-manifest.json?v=${Date.now()}`,
  
  // API endpoints (if using backend)
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL'),
  
  // Feature flags
  FEATURES: {
    REFERRAL_SYSTEM: true,
    ADMIN_PANEL: true,
    TRANSPARENCY_PROOFS: true,
    PUSH_NOTIFICATIONS: false
  }
}

// Validate required environment variables
export const validateConfig = () => {
  const errors: string[] = []
  
  if (!CONFIG.CONTRACT_ADDRESS && CONFIG.NETWORK === 'mainnet') {
    errors.push('VITE_CONTRACT_ADDRESS is required for mainnet')
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:', errors)
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`)
  }
}

// Export environment-specific configs
export const DEVELOPMENT_CONFIG = {
  ...CONFIG,
  ENABLE_DEBUG: true,
  NETWORK: 'testnet' as const
}

export const PRODUCTION_CONFIG = {
  ...CONFIG,
  ENABLE_DEBUG: false,
  NETWORK: 'mainnet' as const
}
