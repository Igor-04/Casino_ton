import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 2

  public state: State = {
    hasError: false,
    retryCount: 0
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Специальная обработка для TonConnect ошибок
    if (error.message.includes('Cannot define multiple custom elements')) {
      this.cleanupTonConnect()
    }
  }

  private cleanupTonConnect = () => {
    try {
      // Безопасная очистка TonConnect состояния
      if (typeof window !== 'undefined') {
        // Удаляем глобальные переменные TonConnect
        delete (window as any).TonConnectUI
        delete (window as any).__tonconnect_sdk_loaded
        delete (window as any).__tonConnectInitialized
        
        // Используем более безопасные селекторы для удаления элементов
        const tonConnectSelectors = [
          '[id*="ton-connect"]',
          '[class*="ton-connect"]',
          'tc-root',
          'ton-connect-button'
        ]
        
        tonConnectSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector)
            elements.forEach(el => {
              try {
                el.remove()
              } catch (e) {
                console.warn('Error removing TonConnect element:', e)
              }
            })
          } catch (e) {
            console.warn('Error with selector:', selector, e)
          }
        })

        // Очистка localStorage от TonConnect данных
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.includes('tonconnect') || key.includes('ton-connect')) {
              localStorage.removeItem(key)
            }
          })
        } catch (e) {
          console.warn('Error clearing localStorage:', e)
        }
      }
    } catch (error) {
      console.error('Error during TonConnect cleanup:', error)
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      // Если превышено количество попыток, перезагружаем страницу
      this.handleForceReload()
      return
    }

    // Очистка TonConnect при повторной попытке
    this.cleanupTonConnect()
    
    // Ждем немного перед сбросом ошибки
    setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: undefined,
        retryCount: this.state.retryCount + 1
      })
    }, 1000)
  }

  private handleForceReload = () => {
    // Полная очистка перед перезагрузкой
    this.cleanupTonConnect()
    
    // Принудительная перезагрузка страницы
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  public render() {
    if (this.state.hasError) {
      const isTonConnectError = this.state.error?.message?.includes('Cannot define multiple custom elements') ||
                               this.state.error?.message?.includes('tonconnect') ||
                               this.state.error?.message?.includes('ton-connect')

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 mx-auto">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-xl">Произошла ошибка</h2>
            
            <Alert className="text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isTonConnectError 
                  ? 'Ошибка инициализации кошелька. Попробуйте перезагрузить страницу.'
                  : this.state.error?.message || 'Что-то пошло не так. Попробуйте обновить страницу.'
                }
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {this.state.retryCount < this.maxRetries ? (
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Попробовать снова ({this.maxRetries - this.state.retryCount} попыток осталось)
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground mb-2">
                  Требуется перезагрузка страницы
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={this.handleForceReload} 
                className="w-full"
              >
                Перезагрузить страницу
              </Button>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left mt-4">
                  <summary className="text-sm text-muted-foreground cursor-pointer">
                    Подробности ошибки
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                    {this.state.error?.stack || this.state.error?.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}