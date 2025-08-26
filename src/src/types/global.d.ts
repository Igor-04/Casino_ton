// Global type declarations for TON Games app

declare global {
  interface Window {
    __tonConnectInitialized?: boolean
    customElements?: {
      get?(tagName: string): CustomElementConstructor | undefined
      define?(tagName: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions): void
    }
  }
}

export {}