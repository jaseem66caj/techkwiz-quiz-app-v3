// Comprehensive data synchronization service for TechKwiz admin dashboard
import { realTimeSyncService } from './realTimeSync'
import { quizDataManager } from './quizDataManager'
import { rewardDataManager } from './rewardDataManager'
import { analyticsDataManager } from './analyticsDataManager'
import { settingsDataManager } from './settingsDataManager'

export interface FrontendQuizData {
  totalQuestionsAnswered: number
  correctAnswers: number
  incorrectAnswers: number
  successRate: number
  averageSessionTime: number
  totalCoinsEarned: number
  achievementsUnlocked: number
  userSessions: number
  lastActivity: number
  categoryPerformance: Record<string, {
    answered: number
    correct: number
    successRate: number
  }>
}

export interface FrontendUserActivity {
  sessionId: string
  startTime: number
  endTime?: number
  questionsAnswered: number
  coinsEarned: number
  achievements: string[]
  pageViews: number
  interactions: {
    type: string
    timestamp: number
    data: any
  }[]
}

export interface FrontendAnalytics {
  pageViews: Record<string, number>
  userEngagement: {
    totalSessions: number
    averageSessionDuration: number
    bounceRate: number
    conversionRate: number
  }
  quizMetrics: {
    completionRate: number
    averageScore: number
    popularCategories: string[]
    difficultyDistribution: Record<string, number>
  }
}

export interface SyncedDashboardData {
  quizMetrics: {
    totalQuestions: number
    questionsAnswered: number
    successRate: number
    totalCoinsEarned: number
    averageSessionTime: number
  }
  userActivity: {
    activeSessions: number
    totalUsers: number
    recentActivity: Array<{
      id: string
      type: string
      description: string
      timestamp: number
    }>
  }
  analytics: {
    pageViews: number
    engagement: number
    conversionRate: number
  }
  systemStatus: {
    lastSyncTime: number
    syncStatus: 'idle' | 'syncing' | 'error'
    dataIntegrity: boolean
  }
}

class ComprehensiveDataSyncService {
  private static instance: ComprehensiveDataSyncService
  private syncInProgress = false
  private lastSyncTime = 0
  private syncErrors: string[] = []
  private syncListeners: ((data: SyncedDashboardData) => void)[] = []
  private autoSyncInterval: NodeJS.Timeout | null = null

  static getInstance(): ComprehensiveDataSyncService {
    if (!ComprehensiveDataSyncService.instance) {
      ComprehensiveDataSyncService.instance = new ComprehensiveDataSyncService()
    }
    return ComprehensiveDataSyncService.instance
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.startAutoSync()
      this.setupStorageListeners()
    }
  }

  // Start automatic sync every 5 seconds
  private startAutoSync(): void {
    this.autoSyncInterval = setInterval(() => {
      this.syncFromFrontend()
    }, 5000)
  }

  // Setup storage listeners for real-time updates
  private setupStorageListeners(): void {
    if (typeof window === 'undefined') return

    // Listen for frontend data changes
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('quiz_') || 
          e.key?.startsWith('user_') || 
          e.key?.startsWith('analytics_') ||
          e.key?.startsWith('game_')) {
        console.log('🔄 Frontend data changed, triggering sync:', e.key)
        this.syncFromFrontend()
      }
    })

    // Listen for real-time sync events
    realTimeSyncService.addEventListener('quiz_updated', () => this.syncFromFrontend())
    realTimeSyncService.addEventListener('reward_updated', () => this.syncFromFrontend())
    realTimeSyncService.addEventListener('analytics_updated', () => this.syncFromFrontend())
  }

  // Pull data from frontend quiz application
  async syncFromFrontend(): Promise<SyncedDashboardData> {
    if (this.syncInProgress) {
      console.log('🔄 Sync already in progress, skipping...')
      return this.getLastSyncedData()
    }

    const startTime = performance.now()
    console.log('🔄 Starting comprehensive data sync from frontend...')
    
    this.syncInProgress = true
    this.syncErrors = []

    try {
      // Pull quiz performance data
      const quizData = await this.pullQuizData()
      
      // Pull user activity data
      const activityData = await this.pullUserActivityData()
      
      // Pull analytics data
      const analyticsData = await this.pullAnalyticsData()
      
      // Combine all data
      const syncedData: SyncedDashboardData = {
        quizMetrics: {
          totalQuestions: quizDataManager.getQuestions().length,
          questionsAnswered: quizData.totalQuestionsAnswered,
          successRate: quizData.successRate,
          totalCoinsEarned: quizData.totalCoinsEarned,
          averageSessionTime: quizData.averageSessionTime
        },
        userActivity: {
          activeSessions: activityData.activeSessions,
          totalUsers: activityData.totalUsers,
          recentActivity: activityData.recentActivity
        },
        analytics: {
          pageViews: analyticsData.totalPageViews,
          engagement: analyticsData.engagementScore,
          conversionRate: analyticsData.conversionRate
        },
        systemStatus: {
          lastSyncTime: Date.now(),
          syncStatus: 'idle',
          dataIntegrity: this.syncErrors.length === 0
        }
      }

      // Store synced data
      this.storeSyncedData(syncedData)
      
      // Notify listeners
      this.notifyListeners(syncedData)
      
      this.lastSyncTime = Date.now()
      
      const syncTime = performance.now() - startTime
      console.log(`🔄 Comprehensive sync completed in ${syncTime.toFixed(2)}ms`)
      
      return syncedData

    } catch (error) {
      console.error('🔄 Sync error:', error)
      this.syncErrors.push(error instanceof Error ? error.message : 'Unknown sync error')
      
      return {
        ...this.getLastSyncedData(),
        systemStatus: {
          lastSyncTime: this.lastSyncTime,
          syncStatus: 'error',
          dataIntegrity: false
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  // Pull quiz performance data from frontend
  private async pullQuizData(): Promise<FrontendQuizData> {
    try {
      // Get quiz session data from frontend localStorage
      const quizSessions = this.getStorageData('quiz_sessions', [])
      const userProgress = this.getStorageData('user_progress', {})
      const gameStats = this.getStorageData('game_stats', {})
      
      let totalAnswered = 0
      let correctAnswers = 0
      let totalCoins = 0
      let totalSessionTime = 0
      let sessionCount = 0
      
      // Process quiz sessions
      quizSessions.forEach((session: any) => {
        if (session.questionsAnswered) {
          totalAnswered += session.questionsAnswered.length
          correctAnswers += session.questionsAnswered.filter((q: any) => q.correct).length
        }
        if (session.coinsEarned) totalCoins += session.coinsEarned
        if (session.duration) totalSessionTime += session.duration
        sessionCount++
      })

      // Get additional data from game stats
      if (gameStats.totalQuestionsAnswered) totalAnswered += gameStats.totalQuestionsAnswered
      if (gameStats.correctAnswers) correctAnswers += gameStats.correctAnswers
      if (gameStats.totalCoinsEarned) totalCoins += gameStats.totalCoinsEarned

      const successRate = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0
      const averageSessionTime = sessionCount > 0 ? totalSessionTime / sessionCount : 0

      return {
        totalQuestionsAnswered: totalAnswered,
        correctAnswers,
        incorrectAnswers: totalAnswered - correctAnswers,
        successRate,
        averageSessionTime,
        totalCoinsEarned: totalCoins,
        achievementsUnlocked: Object.keys(userProgress.achievements || {}).length,
        userSessions: sessionCount,
        lastActivity: Date.now(),
        categoryPerformance: this.calculateCategoryPerformance(quizSessions)
      }
    } catch (error) {
      console.error('Error pulling quiz data:', error)
      this.syncErrors.push('Failed to pull quiz data')
      return this.getDefaultQuizData()
    }
  }

  // Pull user activity data from frontend
  private async pullUserActivityData(): Promise<{
    activeSessions: number
    totalUsers: number
    recentActivity: Array<{
      id: string
      type: string
      description: string
      timestamp: number
    }>
  }> {
    try {
      const userSessions = this.getStorageData('user_sessions', [])
      const recentActions = this.getStorageData('recent_actions', [])
      const activeUsers = this.getStorageData('active_users', [])
      
      // Process recent activity
      const recentActivity = recentActions
        .slice(-10) // Get last 10 activities
        .map((action: any, index: number) => ({
          id: `activity-${index}`,
          type: action.type || 'quiz',
          description: action.description || `${action.type} activity`,
          timestamp: action.timestamp || Date.now()
        }))
        .sort((a: any, b: any) => b.timestamp - a.timestamp)

      return {
        activeSessions: userSessions.filter((s: any) => s.active).length,
        totalUsers: activeUsers.length,
        recentActivity
      }
    } catch (error) {
      console.error('Error pulling user activity data:', error)
      this.syncErrors.push('Failed to pull user activity data')
      return {
        activeSessions: 0,
        totalUsers: 0,
        recentActivity: []
      }
    }
  }

  // Pull analytics data from frontend
  private async pullAnalyticsData(): Promise<{
    totalPageViews: number
    engagementScore: number
    conversionRate: number
  }> {
    try {
      const pageViews = this.getStorageData('page_views', {})
      const userEngagement = this.getStorageData('user_engagement', {})
      const conversionData = this.getStorageData('conversion_data', {})
      
      const totalPageViews = Object.values(pageViews as any).reduce((sum: number, views: any) => sum + (views || 0), 0) as number
      const engagementScore = ((userEngagement as any)?.averageEngagement || 0) as number
      const conversionRate = ((conversionData as any)?.rate || 0) as number

      return {
        totalPageViews,
        engagementScore,
        conversionRate
      }
    } catch (error) {
      console.error('Error pulling analytics data:', error)
      this.syncErrors.push('Failed to pull analytics data')
      return {
        totalPageViews: 0,
        engagementScore: 0,
        conversionRate: 0
      }
    }
  }

  // Helper method to safely get data from localStorage
  private getStorageData(key: string, defaultValue: any): any {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  // Calculate category performance
  private calculateCategoryPerformance(sessions: any[]): Record<string, {
    answered: number
    correct: number
    successRate: number
  }> {
    const categoryStats: Record<string, { answered: number; correct: number }> = {}
    
    sessions.forEach(session => {
      if (session.questionsAnswered) {
        session.questionsAnswered.forEach((q: any) => {
          const category = q.category || 'General'
          if (!categoryStats[category]) {
            categoryStats[category] = { answered: 0, correct: 0 }
          }
          categoryStats[category].answered++
          if (q.correct) categoryStats[category].correct++
        })
      }
    })

    const result: Record<string, { answered: number; correct: number; successRate: number }> = {}
    Object.entries(categoryStats).forEach(([category, stats]) => {
      result[category] = {
        ...stats,
        successRate: stats.answered > 0 ? (stats.correct / stats.answered) * 100 : 0
      }
    })

    return result
  }

  // Get default quiz data when sync fails
  private getDefaultQuizData(): FrontendQuizData {
    return {
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      successRate: 0,
      averageSessionTime: 0,
      totalCoinsEarned: 0,
      achievementsUnlocked: 0,
      userSessions: 0,
      lastActivity: Date.now(),
      categoryPerformance: {}
    }
  }

  // Store synced data
  private storeSyncedData(data: SyncedDashboardData): void {
    try {
      localStorage.setItem('admin_synced_data', JSON.stringify(data))
      localStorage.setItem('admin_last_sync', Date.now().toString())
    } catch (error) {
      console.error('Error storing synced data:', error)
    }
  }

  // Get last synced data
  private getLastSyncedData(): SyncedDashboardData {
    try {
      const data = localStorage.getItem('admin_synced_data')
      if (data) {
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('Error reading last synced data:', error)
    }

    // Return default data
    return {
      quizMetrics: {
        totalQuestions: 0,
        questionsAnswered: 0,
        successRate: 0,
        totalCoinsEarned: 0,
        averageSessionTime: 0
      },
      userActivity: {
        activeSessions: 0,
        totalUsers: 0,
        recentActivity: []
      },
      analytics: {
        pageViews: 0,
        engagement: 0,
        conversionRate: 0
      },
      systemStatus: {
        lastSyncTime: 0,
        syncStatus: 'idle',
        dataIntegrity: true
      }
    }
  }

  // Add sync listener
  addSyncListener(callback: (data: SyncedDashboardData) => void): void {
    this.syncListeners.push(callback)
  }

  // Remove sync listener
  removeSyncListener(callback: (data: SyncedDashboardData) => void): void {
    const index = this.syncListeners.indexOf(callback)
    if (index > -1) {
      this.syncListeners.splice(index, 1)
    }
  }

  // Notify all listeners
  private notifyListeners(data: SyncedDashboardData): void {
    this.syncListeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in sync listener:', error)
      }
    })
  }

  // Manual sync trigger
  async triggerManualSync(): Promise<{ success: boolean; message: string; data?: SyncedDashboardData }> {
    try {
      const data = await this.syncFromFrontend()
      return {
        success: true,
        message: 'Data synchronized successfully',
        data
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed'
      }
    }
  }

  // Force sync all data
  async forceSyncAll(): Promise<{ success: boolean; message: string; data?: SyncedDashboardData }> {
    try {
      // Clear cached data
      localStorage.removeItem('admin_synced_data')
      
      // Force fresh sync
      const data = await this.syncFromFrontend()
      
      return {
        success: true,
        message: 'All data force synchronized successfully',
        data
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Force sync failed'
      }
    }
  }

  // Get sync status
  getSyncStatus(): {
    isInProgress: boolean
    lastSyncTime: number
    syncErrors: string[]
    dataIntegrity: boolean
  } {
    return {
      isInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      syncErrors: [...this.syncErrors],
      dataIntegrity: this.syncErrors.length === 0
    }
  }

  // Cleanup
  destroy(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
      this.autoSyncInterval = null
    }
    this.syncListeners = []
  }
}

// Export singleton instance
export const comprehensiveDataSync = ComprehensiveDataSyncService.getInstance()
