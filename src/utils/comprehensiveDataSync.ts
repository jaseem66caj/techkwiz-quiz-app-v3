// ===================================================================
// TechKwiz Comprehensive Data Synchronization Service
// ===================================================================
// This service handles comprehensive data synchronization between the frontend
// quiz application and the admin dashboard. It collects, processes, and consolidates
// data from multiple sources including quiz performance, user activity, and analytics
// to provide a unified view for administrators. The service supports both manual
// and automatic synchronization with real-time update capabilities.

import { realTimeSyncService } from './realTimeSync'
import { quizDataManager } from './quizDataManager'
import { rewardDataManager } from './rewardDataManager'
import { analyticsDataManager } from './analyticsDataManager'
import { settingsDataManager } from './settingsDataManager'

// Interface defining the structure of frontend quiz data
export interface FrontendQuizData {
  // Total number of questions answered by all users
  totalQuestionsAnswered: number
  // Number of correct answers
  correctAnswers: number
  // Number of incorrect answers
  incorrectAnswers: number
  // Percentage of correct answers (success rate)
  successRate: number
  // Average time users spend per session
  averageSessionTime: number
  // Total coins earned by all users
  totalCoinsEarned: number
  // Number of achievements unlocked by users
  achievementsUnlocked: number
  // Total number of user sessions
  userSessions: number
  // Timestamp of last user activity
  lastActivity: number
  // Performance metrics broken down by category
  categoryPerformance: Record<string, {
    answered: number        // Questions answered in this category
    correct: number         // Correct answers in this category
    successRate: number     // Success rate for this category
  }>
}

// Interface defining the structure of frontend user activity data
export interface FrontendUserActivity {
  // Unique identifier for the session
  sessionId: string
  // Timestamp when session started
  startTime: number
  // Timestamp when session ended (optional)
  endTime?: number
  // Number of questions answered in this session
  questionsAnswered: number
  // Coins earned during this session
  coinsEarned: number
  // Achievements unlocked during this session
  achievements: string[]
  // Number of page views during this session
  pageViews: number
  // User interactions recorded during session
  interactions: {
    type: string      // Type of interaction (e.g., 'click', 'scroll')
    timestamp: number // When the interaction occurred
    data: any         // Additional data about the interaction
  }[]
}

// Interface defining the structure of frontend analytics data
export interface FrontendAnalytics {
  // Page view counts keyed by page path
  pageViews: Record<string, number>
  // User engagement metrics
  userEngagement: {
    totalSessions: number              // Total number of sessions
    averageSessionDuration: number     // Average time spent per session
    bounceRate: number                 // Percentage of single-page sessions
    conversionRate: number             // Percentage of users who complete desired actions
  }
  // Quiz-specific metrics
  quizMetrics: {
    completionRate: number                    // Percentage of quizzes completed
    averageScore: number                      // Average score across all quizzes
    popularCategories: string[]               // Most frequently played categories
    difficultyDistribution: Record<string, number> // Distribution of questions by difficulty
  }
}

// Interface defining the structure of synchronized dashboard data
export interface SyncedDashboardData {
  // Quiz performance metrics
  quizMetrics: {
    totalQuestions: number      // Total number of questions in the system
    questionsAnswered: number   // Total questions answered by users
    successRate: number         // Overall success rate percentage
    totalCoinsEarned: number    // Total coins earned by all users
    averageSessionTime: number  // Average time spent per session
  }
  // User activity information
  userActivity: {
    activeSessions: number      // Number of currently active sessions
    totalUsers: number          // Total number of users
    recentActivity: Array<{     // Recent user activities
      id: string                // Activity identifier
      type: string              // Type of activity
      description: string       // Description of the activity
      timestamp: number         // When the activity occurred
    }>
  }
  // Analytics data for the dashboard
  analytics: {
    pageViews: number           // Total page views
    engagement: number          // User engagement score
    conversionRate: number      // Conversion rate percentage
  }
  // System status information
  systemStatus: {
    lastSyncTime: number                    // Timestamp of last successful sync
    syncStatus: 'idle' | 'syncing' | 'error' // Current synchronization status
    dataIntegrity: boolean                  // Whether data integrity is maintained
  }
}

// ===================================================================
// Comprehensive Data Synchronization Service Class
// ===================================================================
// Singleton class that manages all data synchronization operations between
// frontend and backend systems. Handles automatic syncing, real-time updates,
// error management, and data consolidation for the admin dashboard.

class ComprehensiveDataSyncService {
  // Singleton instance of the service
  private static instance: ComprehensiveDataSyncService
  // Flag to prevent concurrent sync operations
  private syncInProgress = false
  // Timestamp of last successful synchronization
  private lastSyncTime = 0
  // Collection of synchronization errors
  private syncErrors: string[] = []
  // Listeners to notify when data is synchronized
  private syncListeners: ((data: SyncedDashboardData) => void)[] = []
  // Interval timer for automatic synchronization
  private autoSyncInterval: NodeJS.Timeout | null = null

  // Get singleton instance of the ComprehensiveDataSyncService
  static getInstance(): ComprehensiveDataSyncService {
    if (!ComprehensiveDataSyncService.instance) {
      ComprehensiveDataSyncService.instance = new ComprehensiveDataSyncService()
    }
    return ComprehensiveDataSyncService.instance
  }

  // Constructor initializes the service and starts automatic synchronization
  constructor() {
    if (typeof window !== 'undefined') {
      this.startAutoSync()
      this.setupStorageListeners()
    }
  }

  // ===================================================================
  // Initialization and Setup Methods
  // ===================================================================

  // Start automatic synchronization every 5 seconds
  private startAutoSync(): void {
    this.autoSyncInterval = setInterval(() => {
      this.syncFromFrontend()
    }, 5000)
  }

  // Setup storage listeners for real-time updates from frontend
  private setupStorageListeners(): void {
    if (typeof window === 'undefined') return

    // Listen for frontend data changes in localStorage
    window.addEventListener('storage', (e) => {
      // Trigger sync when relevant data changes
      if (e.key?.startsWith('quiz_') || 
          e.key?.startsWith('user_') || 
          e.key?.startsWith('analytics_') ||
          e.key?.startsWith('game_')) {
        console.log('🔄 Frontend data changed, triggering sync:', e.key)
        this.syncFromFrontend()
      }
    })

    // Listen for real-time sync events from other services
    realTimeSyncService.addEventListener('quiz_updated', () => this.syncFromFrontend())
    realTimeSyncService.addEventListener('reward_updated', () => this.syncFromFrontend())
    realTimeSyncService.addEventListener('analytics_updated', () => this.syncFromFrontend())
  }

  // ===================================================================
  // Data Synchronization Methods
  // ===================================================================

  // Pull comprehensive data from frontend quiz application
  async syncFromFrontend(): Promise<SyncedDashboardData> {
    // Prevent concurrent synchronization operations
    if (this.syncInProgress) {
      console.log('🔄 Sync already in progress, skipping...')
      return this.getLastSyncedData()
    }

    // Record start time for performance monitoring
    const startTime = performance.now()
    console.log('🔄 Starting comprehensive data sync from frontend...')
    
    // Set sync in progress flag
    this.syncInProgress = true
    // Clear previous sync errors
    this.syncErrors = []

    try {
      // Pull quiz performance data from various sources
      const quizData = await this.pullQuizData()
      
      // Pull user activity data
      const activityData = await this.pullUserActivityData()
      
      // Pull analytics data
      const analyticsData = await this.pullAnalyticsData()
      
      // Combine all data into a unified dashboard structure
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

      // Store the synchronized data for future reference
      this.storeSyncedData(syncedData)
      
      // Notify all registered listeners of the new data
      this.notifyListeners(syncedData)
      
      // Update last sync time
      this.lastSyncTime = Date.now()
      
      // Log sync completion with performance metrics
      const syncTime = performance.now() - startTime
      console.log(`🔄 Comprehensive sync completed in ${syncTime.toFixed(2)}ms`)
      
      return syncedData

    } catch (error) {
      // Handle synchronization errors
      console.error('🔄 Sync error:', error)
      this.syncErrors.push(error instanceof Error ? error.message : 'Unknown sync error')
      
      // Return last known good data or empty structure
      return this.getLastSyncedData()
    } finally {
      // Always reset sync in progress flag
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

  // ===================================================================
  // Utility Methods
  // ===================================================================

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
