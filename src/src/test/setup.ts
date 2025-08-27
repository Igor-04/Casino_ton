/**
 * Test setup configuration
 */
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock crypto.getRandomValues for tests
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }
  }
})

// Mock navigator.clipboard for tests
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: async (text: string) => {
      return Promise.resolve()
    },
    readText: async () => {
      return Promise.resolve('mocked clipboard content')
    }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => {
    return localStorageMock[key] || null
  },
  setItem: (key: string, value: string) => {
    localStorageMock[key] = value
  },
  removeItem: (key: string) => {
    delete localStorageMock[key]
  },
  clear: () => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key]
      }
    })
  }
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://test.ton-games.com',
    pathname: '/',
    search: '',
    hash: '',
    href: 'https://test.ton-games.com/'
  },
  writable: true
})

// Mock window.open
Object.defineProperty(window, 'open', {
  value: (url: string) => {
    return { location: { href: url } }
  }
})

// Clean up after each test
afterEach(() => {
  cleanup()
  localStorageMock.clear()
})

// Global test setup
beforeAll(() => {
  // Initialize any global test state
})

// Global test cleanup
afterAll(() => {
  // Clean up any global test state
})