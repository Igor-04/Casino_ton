interface GameEvent {
  type: 'round_created' | 'round_joined' | 'round_completed' | 'referral_used' | 'payout_received'
  timestamp: number
  userId: string
  data: Record<string, any>
}

interface UserAnalytics {
  userId: string
  sessionStart: number
  totalSessions: number
  totalTimeSpent: number
  gamesPlayed: number
  gamesWon: number
  totalProfit: number
  referralsUsed: number
  referralsEarned: number
  favoriteGameMode: 'TIME_LOCKED' | 'CAPACITY_LOCKED' | null
  avgStakeSize: number
  lastActive: number
}

interface PlatformAnalytics {
  totalUsers: number
  activeUsers: number
  totalRounds: number
  completedRounds: number
  totalVolume: number
  platformRevenue: number
  avgRoundSize: number
  popularGameMode: 'TIME_LOCKED' | 'CAPACITY_LOCKED' | null
  retentionRate: number
  conversionRate: number
}

class AnalyticsService {
  private static instance: AnalyticsService
  private events: GameEvent[] = []
  private userAnalytics: Map<string, UserAnalytics> = new Map()
  private storageKey = 'tonGamesAnalytics'
  private eventsKey = 'tonGamesEvents'

  private constructor() {
    this.loadFromStorage()
    this.setupPeriodicSave()
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  private loadFromStorage() {
    try {
      // Load user analytics
      const analyticsData = localStorage.getItem(this.storageKey)
      if (analyticsData) {
        const parsed = JSON.parse(analyticsData)
        this.userAnalytics = new Map(Object.entries(parsed))
      }

      // Load events
      const eventsData = localStorage.getItem(this.eventsKey)
      if (eventsData) {
        this.events = JSON.parse(eventsData)
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error)
    }
  }

  private saveToStorage() {
    try {
      // Save user analytics
      const analyticsObj = Object.fromEntries(this.userAnalytics)
      localStorage.setItem(this.storageKey, JSON.stringify(analyticsObj))

      // Save events (keep only last 1000 events)
      const recentEvents = this.events.slice(-1000)
      localStorage.setItem(this.eventsKey, JSON.stringify(recentEvents))
      this.events = recentEvents
    } catch (error) {
      console.error('Failed to save analytics to storage:', error)
    }
  }

  private setupPeriodicSave() {
    setInterval(() => {
      this.saveToStorage()
    }, 30000) // Save every 30 seconds
  }

  // Track events
  trackEvent(type: GameEvent['type'], userId: string, data: Record<string, any> = {}) {
    const event: GameEvent = {
      type,
      timestamp: Date.now(),
      userId,
      data
    }

    this.events.push(event)
    this.updateUserAnalytics(userId, event)
  }

  // Initialize user session
  initializeUser(userId: string) {
    if (!this.userAnalytics.has(userId)) {
      const analytics: UserAnalytics = {
        userId,
        sessionStart: Date.now(),
        totalSessions: 1,
        totalTimeSpent: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        totalProfit: 0,
        referralsUsed: 0,
        referralsEarned: 0,
        favoriteGameMode: null,
        avgStakeSize: 0,
        lastActive: Date.now()
      }
      this.userAnalytics.set(userId, analytics)
    } else {
      // Update session info
      const analytics = this.userAnalytics.get(userId)!
      analytics.sessionStart = Date.now()
      analytics.totalSessions += 1
      analytics.lastActive = Date.now()
    }
  }

  // Update user analytics based on events
  private updateUserAnalytics(userId: string, event: GameEvent) {
    let analytics = this.userAnalytics.get(userId)
    
    if (!analytics) {
      this.initializeUser(userId)
      analytics = this.userAnalytics.get(userId)!
    }

    analytics.lastActive = Date.now()

    switch (event.type) {
      case 'round_created':
      case 'round_joined':
        analytics.gamesPlayed += 1
        if (event.data.stakeAmount) {
          const currentAvg = analytics.avgStakeSize
          const totalGames = analytics.gamesPlayed
          analytics.avgStakeSize = ((currentAvg * (totalGames - 1)) + event.data.stakeAmount) / totalGames
        }
        if (event.data.mode) {
          // Track favorite game mode
          const userEvents = this.events.filter(e => e.userId === userId && (e.type === 'round_created' || e.type === 'round_joined'))
          const timeLocked = userEvents.filter(e => e.data.mode === 'TIME_LOCKED').length
          const capacityLocked = userEvents.filter(e => e.data.mode === 'CAPACITY_LOCKED').length
          analytics.favoriteGameMode = timeLocked > capacityLocked ? 'TIME_LOCKED' : 'CAPACITY_LOCKED'
        }
        break

      case 'round_completed':
        if (event.data.userWon) {
          analytics.gamesWon += 1
        }
        break

      case 'payout_received':
        if (event.data.profit) {
          analytics.totalProfit += event.data.profit
        }
        break

      case 'referral_used':
        analytics.referralsUsed += 1
        break
    }

    this.userAnalytics.set(userId, analytics)
  }

  // Get user analytics
  getUserAnalytics(userId: string): UserAnalytics | null {
    return this.userAnalytics.get(userId) || null
  }

  // Get platform analytics
  getPlatformAnalytics(): PlatformAnalytics {
    const now = Date.now()
    const dayAgo = now - (24 * 60 * 60 * 1000)
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000)

    // Calculate active users (active in last 24h)
    const activeUsers = Array.from(this.userAnalytics.values())
      .filter(u => u.lastActive > dayAgo).length

    // Calculate total stats
    const allUsers = Array.from(this.userAnalytics.values())
    const totalUsers = allUsers.length
    const totalVolume = allUsers.reduce((sum, u) => sum + (u.avgStakeSize * u.gamesPlayed), 0)
    const platformRevenue = totalVolume * 0.05 // 5% platform fee

    // Calculate game mode popularity
    const recentRounds = this.events.filter(e => 
      (e.type === 'round_created' || e.type === 'round_joined') && 
      e.timestamp > weekAgo
    )
    const timeLocked = recentRounds.filter(e => e.data.mode === 'TIME_LOCKED').length
    const capacityLocked = recentRounds.filter(e => e.data.mode === 'CAPACITY_LOCKED').length
    const popularGameMode = timeLocked > capacityLocked ? 'TIME_LOCKED' : 'CAPACITY_LOCKED'

    // Calculate retention (simplified - users who played more than once)
    const multiGameUsers = allUsers.filter(u => u.gamesPlayed > 1).length
    const retentionRate = totalUsers > 0 ? (multiGameUsers / totalUsers) * 100 : 0

    // Calculate conversion (users who won at least once)
    const winningUsers = allUsers.filter(u => u.gamesWon > 0).length
    const conversionRate = totalUsers > 0 ? (winningUsers / totalUsers) * 100 : 0

    return {
      totalUsers,
      activeUsers,
      totalRounds: this.events.filter(e => e.type === 'round_created').length,
      completedRounds: this.events.filter(e => e.type === 'round_completed').length,
      totalVolume,
      platformRevenue,
      avgRoundSize: totalUsers > 0 ? totalVolume / totalUsers : 0,
      popularGameMode,
      retentionRate,
      conversionRate
    }
  }

  // Get user insights
  getUserInsights(userId: string): string[] {
    const analytics = this.getUserAnalytics(userId)
    if (!analytics) return []

    const insights: string[] = []

    // Win rate insights
    if (analytics.gamesPlayed > 0) {
      const winRate = (analytics.gamesWon / analytics.gamesPlayed) * 100
      if (winRate > 60) {
        insights.push(`🎯 Отличная статистика! Ваш процент побед: ${winRate.toFixed(1)}%`)
      } else if (winRate < 30) {
        insights.push(`🎲 Попробуйте изменить стратегию - ваш процент побед: ${winRate.toFixed(1)}%`)
      }
    }

    // Profit insights
    if (analytics.totalProfit > 0) {
      insights.push(`💰 Вы в плюсе на ${analytics.totalProfit.toFixed(2)} TON!`)
    } else if (analytics.totalProfit < -10) {
      insights.push(`⚠️ Будьте осторожны - убыток составляет ${Math.abs(analytics.totalProfit).toFixed(2)} TON`)
    }

    // Game frequency insights
    if (analytics.gamesPlayed > 50) {
      insights.push(`🔥 Вы активный игрок! Сыграно игр: ${analytics.gamesPlayed}`)
    }

    // Favorite mode insights
    if (analytics.favoriteGameMode) {
      const modeName = analytics.favoriteGameMode === 'TIME_LOCKED' ? 'временные' : 'лимитированные'
      insights.push(`⭐ Вы предпочитаете ${modeName} игры`)
    }

    return insights
  }

  // Export analytics data
  exportUserData(userId: string): any {
    return {
      analytics: this.getUserAnalytics(userId),
      events: this.events.filter(e => e.userId === userId),
      insights: this.getUserInsights(userId)
    }
  }

  // Clear old data
  cleanup() {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days
    
    // Remove old events
    this.events = this.events.filter(e => e.timestamp > cutoff)
    
    // Remove inactive users (no activity for 30 days)
    for (const [userId, analytics] of this.userAnalytics.entries()) {
      if (analytics.lastActive < cutoff) {
        this.userAnalytics.delete(userId)
      }
    }
    
    this.saveToStorage()
  }

  // Reset analytics (for development)
  reset() {
    this.events = []
    this.userAnalytics.clear()
    this.saveToStorage()
  }
}

export { AnalyticsService, type GameEvent, type UserAnalytics, type PlatformAnalytics }