interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
  actions?: NotificationAction[]
  data?: Record<string, any>
}

interface NotificationAction {
  label: string
  action: string
  data?: any
}

type NotificationSubscriber = (notifications: Notification[]) => void

class NotificationService {
  private static instance: NotificationService
  private notifications: Notification[] = []
  private subscribers: Set<NotificationSubscriber> = new Set()
  private storageKey = 'tonGamesNotifications'

  private constructor() {
    this.loadFromStorage()
    this.setupStorageListener()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.notifications = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error)
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications))
    } catch (error) {
      console.error('Failed to save notifications to storage:', error)
    }
  }

  private setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          this.notifications = JSON.parse(e.newValue)
          this.notifySubscribers()
        } catch (error) {
          console.error('Failed to sync notifications from storage:', error)
        }
      }
    })
  }

  private notifySubscribers() {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber([...this.notifications])
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  // Subscribe to notifications
  subscribe(subscriber: NotificationSubscriber): () => void {
    this.subscribers.add(subscriber)
    // Immediately notify with current notifications
    subscriber([...this.notifications])
    
    return () => {
      this.subscribers.delete(subscriber)
    }
  }

  // Add notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false
    }

    this.notifications.unshift(newNotification)
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100)
    }

    this.saveToStorage()
    this.notifySubscribers()
    
    return id
  }

  // Quick notification methods
  info(title: string, message: string, actions?: NotificationAction[], data?: Record<string, any>): string {
    return this.addNotification({ type: 'info', title, message, actions, data })
  }

  success(title: string, message: string, actions?: NotificationAction[], data?: Record<string, any>): string {
    return this.addNotification({ type: 'success', title, message, actions, data })
  }

  warning(title: string, message: string, actions?: NotificationAction[], data?: Record<string, any>): string {
    return this.addNotification({ type: 'warning', title, message, actions, data })
  }

  error(title: string, message: string, actions?: NotificationAction[], data?: Record<string, any>): string {
    return this.addNotification({ type: 'error', title, message, actions, data })
  }

  // Game-specific notifications
  roundCompleted(roundId: number, userWon: boolean, payout?: number, profit?: number) {
    if (userWon && payout) {
      this.success(
        '🎉 Поздравляем!',
        `Вы выиграли ${payout.toFixed(2)} TON в игре #${roundId}${profit ? ` (прибыль: +${profit.toFixed(2)} TON)` : ''}`,
        [
          { label: 'Посмотреть', action: 'view_round', data: { roundId } }
        ],
        { roundId, payout, profit }
      )
    } else {
      this.info(
        '🎲 Игра завершена',
        `Игра #${roundId} завершена. ${payout ? `Ваша выплата: ${payout.toFixed(2)} TON` : 'Удачи в следующий раз!'}`,
        [
          { label: 'Посмотреть', action: 'view_round', data: { roundId } }
        ],
        { roundId, payout }
      )
    }
  }

  roundJoined(roundId: number, stakeAmount: number) {
    this.success(
      '✅ Присоединились к игре',
      `Вы успешно присоединились к игре #${roundId} со ставкой ${stakeAmount.toFixed(2)} TON`,
      [
        { label: 'Посмотреть', action: 'view_round', data: { roundId } }
      ],
      { roundId, stakeAmount }
    )
  }

  roundCreated(roundId: number, stakeAmount: number, mode: string) {
    const modeText = mode === 'TIME_LOCKED' ? 'временная' : 'лимитированная'
    this.success(
      '🎮 Игра создана',
      `Ваша ${modeText} игра #${roundId} создана со ставкой ${stakeAmount.toFixed(2)} TON`,
      [
        { label: 'Посмотреть', action: 'view_round', data: { roundId } }
      ],
      { roundId, stakeAmount, mode }
    )
  }

  referralEarned(amount: number, fromUser: string) {
    this.success(
      '💰 Реферальная награда',
      `Вы получили ${amount.toFixed(4)} TON за приглашение пользователя ${fromUser.slice(0, 6)}...`,
      [
        { label: 'Посмотреть профиль', action: 'view_profile' }
      ],
      { amount, fromUser }
    )
  }

  roundExpiringSoon(roundId: number, minutesLeft: number) {
    this.warning(
      '⏰ Игра скоро завершится',
      `Игра #${roundId} завершится через ${minutesLeft} минут`,
      [
        { label: 'Посмотреть', action: 'view_round', data: { roundId } }
      ],
      { roundId, minutesLeft }
    )
  }

  roundCancelled(roundId: number, reason: string) {
    this.warning(
      '❌ Игра отменена',
      `Игра #${roundId} была отменена. Причина: ${reason}`,
      [],
      { roundId, reason }
    )
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      this.saveToStorage()
      this.notifySubscribers()
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    let changed = false
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true
        changed = true
      }
    })
    
    if (changed) {
      this.saveToStorage()
      this.notifySubscribers()
    }
  }

  // Remove notification
  removeNotification(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      this.notifications.splice(index, 1)
      this.saveToStorage()
      this.notifySubscribers()
    }
  }

  // Clear all notifications
  clearAll() {
    this.notifications = []
    this.saveToStorage()
    this.notifySubscribers()
  }

  // Get notifications
  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read)
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  // Cleanup old notifications
  cleanup() {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days
    const before = this.notifications.length
    
    this.notifications = this.notifications.filter(n => n.timestamp > cutoff)
    
    if (this.notifications.length !== before) {
      this.saveToStorage()
      this.notifySubscribers()
    }
  }

  // Handle notification actions
  handleAction(notificationId: string, action: string, data?: any) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (!notification) return

    // Mark as read when action is taken
    this.markAsRead(notificationId)

    // Handle different actions
    switch (action) {
      case 'view_round':
        if (data?.roundId) {
          // This would trigger navigation to round details
          window.dispatchEvent(new CustomEvent('navigate_to_round', { detail: { roundId: data.roundId } }))
        }
        break
        
      case 'view_profile':
        window.dispatchEvent(new CustomEvent('navigate_to_profile'))
        break
        
      default:
        console.log('Unhandled notification action:', action, data)
    }
  }
}

export { NotificationService, type Notification, type NotificationAction }