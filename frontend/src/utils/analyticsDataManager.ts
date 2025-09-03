import { 
  AnalyticsData, 
  QuizMetrics, 
  RewardMetrics, 
  UserActivity,
  TimeRange,
  CategoryPerformance,
  DifficultyDistribution,
  TimeBasedPerformance
} from '@/types/analytics'

// Storage keys
const ANALYTICS_STORAGE_KEYS = {
  DATA: 'admin_analytics_data',
  CACHE: 'admin_analytics_cache',
  SETTINGS: 'admin_analytics_settings'
} as const

// Default time ranges
const DEFAULT_TIME_RANGES: TimeRange[] = [
  { 
    id: '7d', 
    name: 'Last 7 days', 
    days: 7,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  },
  { 
    id: '30d', 
    name: 'Last 30 days', 
    days: 30,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  },
  { 
    id: '90d', 
    name: 'Last 90 days', 
    days: 90,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  }
]

// Default categories
const DEFAULT_CATEGORIES = [
  { id: 'movies', name: 'Movies' },
  { id: 'social-media', name: 'Social Media' },
  { id: 'influencers', name: 'Influencers' }
]
import { quizDataManager } from './quizDataManager'
import { rewardDataManager } from './rewardDataManager'

// Analytics data manager class
class AnalyticsDataManager {
  private static instance: AnalyticsDataManager

  static getInstance(): AnalyticsDataManager {
    if (!AnalyticsDataManager.instance) {
      AnalyticsDataManager.instance = new AnalyticsDataManager()
    }
    return AnalyticsDataManager.instance
  }

  // Safe localStorage operations
  private safeGetItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error)
      return null
    }
  }

  private safeSetItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error)
      return false
    }
  }

  // Get analytics data with mock generation
  getAnalyticsData(timeRange?: TimeRange): AnalyticsData {
    const data = this.safeGetItem(ANALYTICS_STORAGE_KEYS.DATA)
    
    if (!data) {
      return this.generateMockAnalyticsData(timeRange)
    }
    
    try {
      const analyticsData = JSON.parse(data)
      return this.validateAndMigrateData(analyticsData, timeRange)
    } catch (error) {
      console.error('Error parsing analytics data:', error)
      return this.generateMockAnalyticsData(timeRange)
    }
  }

  // Generate realistic mock data based on existing quiz and reward data
  private generateMockAnalyticsData(timeRange?: TimeRange): AnalyticsData {
    const currentTimeRange = timeRange || DEFAULT_TIME_RANGES[1] // Default to last 30 days
    const questions = quizDataManager.getQuestions()
    const rewardConfig = rewardDataManager.getRewardConfig()
    
    // Generate quiz metrics based on actual questions
    const quizMetrics = this.generateQuizMetrics(questions.length)
    
    // Generate reward metrics based on actual achievements
    const rewardMetrics = this.generateRewardMetrics(rewardConfig.achievements.length)
    
    // Generate user activity data
    const userActivity = this.generateUserActivity()
    
    const analyticsData: AnalyticsData = {
      id: `analytics_${Date.now()}`,
      quizMetrics,
      rewardMetrics,
      userActivity,
      timeRange: currentTimeRange,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    // Cache the generated data
    this.safeSetItem(ANALYTICS_STORAGE_KEYS.DATA, JSON.stringify(analyticsData))
    
    return analyticsData
  }

  // Generate quiz metrics
  private generateQuizMetrics(totalQuestions: number): QuizMetrics {
    // Base calculations on actual question count
    const questionsAnswered = Math.floor(totalQuestions * 45 + Math.random() * 100) // Simulate usage
    const correctAnswers = Math.floor(questionsAnswered * (0.65 + Math.random() * 0.2)) // 65-85% success rate
    const incorrectAnswers = questionsAnswered - correctAnswers
    const successRate = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0
    
    // Generate category performance based on DEFAULT_CATEGORIES
    const categoryPerformance: CategoryPerformance[] = DEFAULT_CATEGORIES.map(category => {
      const answered = Math.floor(Math.random() * 20) + 5
      const correct = Math.floor(answered * (0.6 + Math.random() * 0.3))
      return {
        category: category.name,
        questionsAnswered: answered,
        correctAnswers: correct,
        successRate: answered > 0 ? (correct / answered) * 100 : 0,
        averageTime: 15 + Math.random() * 30 // 15-45 seconds
      }
    })
    
    // Generate difficulty distribution
    const difficultyDistribution: DifficultyDistribution = {
      beginner: Math.floor(Math.random() * 40) + 30, // 30-70%
      intermediate: Math.floor(Math.random() * 30) + 20, // 20-50%
      advanced: Math.floor(Math.random() * 20) + 10 // 10-30%
    }
    
    // Generate time-based performance (last 30 days)
    const timeBasedPerformance: TimeBasedPerformance[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      timeBasedPerformance.push({
        date: date.toISOString().split('T')[0],
        questionsAnswered: Math.floor(Math.random() * 50) + 10,
        successRate: 60 + Math.random() * 30,
        activeUsers: Math.floor(Math.random() * 20) + 5
      })
    }
    
    return {
      totalQuestions,
      questionsAnswered,
      correctAnswers,
      incorrectAnswers,
      successRate,
      categoryPerformance,
      averageSessionTime: 8.5 + Math.random() * 5, // 8.5-13.5 minutes
      popularCategories: categoryPerformance
        .sort((a, b) => b.questionsAnswered - a.questionsAnswered)
        .slice(0, 3)
        .map(c => c.category),
      difficultyDistribution,
      timeBasedPerformance
    }
  }

  // Generate reward metrics
  private generateRewardMetrics(totalAchievements: number): RewardMetrics {
    const activeUsers = Math.floor(Math.random() * 50) + 25
    const totalCoinsEarned = Math.floor(Math.random() * 10000) + 5000
    const achievementsUnlocked = Math.floor(totalAchievements * activeUsers * 0.3) // 30% unlock rate
    
    // Generate coin distribution
    const coinDistribution: any = {
      correct: Math.floor(totalCoinsEarned * 0.6), // 60% from correct answers
      incorrect: Math.floor(totalCoinsEarned * 0.2), // 20% from incorrect answers
      bonus: Math.floor(totalCoinsEarned * 0.15), // 15% from bonus questions
      achievements: Math.floor(totalCoinsEarned * 0.05) // 5% from achievements
    }
    
    // Generate reward trends (last 30 days)
    const rewardTrends: any[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      rewardTrends.push({
        date: date.toISOString().split('T')[0],
        coinsEarned: Math.floor(Math.random() * 500) + 100,
        achievementsUnlocked: Math.floor(Math.random() * 5),
        activeUsers: Math.floor(Math.random() * 15) + 5
      })
    }
    
    return {
      totalCoinsEarned,
      achievementsUnlocked,
      activeUsers,
      engagementRate: 75 + Math.random() * 20, // 75-95%
      averageCoinsPerSession: totalCoinsEarned / (activeUsers * 10), // Estimate
      topAchievements: [], // Will be populated with actual achievements
      coinDistribution,
      rewardTrends
    }
  }

  // Generate user activity data
  private generateUserActivity(): UserActivity {
    const totalSessions = Math.floor(Math.random() * 500) + 200
    
    // Generate device breakdown
    const deviceTypes: any = {
      desktop: Math.floor(Math.random() * 40) + 30, // 30-70%
      mobile: Math.floor(Math.random() * 50) + 25, // 25-75%
      tablet: Math.floor(Math.random() * 20) + 5 // 5-25%
    }
    
    // Generate session distribution
    const sessionDistribution: any[] = [
      { duration: '0-2 min', count: Math.floor(totalSessions * 0.15) },
      { duration: '2-5 min', count: Math.floor(totalSessions * 0.25) },
      { duration: '5-10 min', count: Math.floor(totalSessions * 0.35) },
      { duration: '10-20 min', count: Math.floor(totalSessions * 0.20) },
      { duration: '20+ min', count: Math.floor(totalSessions * 0.05) }
    ]
    
    // Generate user journey
    const userJourney: any[] = [
      { step: 'Landing', users: 100, dropoffRate: 0 },
      { step: 'Quiz Start', users: 85, dropoffRate: 15 },
      { step: 'First Question', users: 80, dropoffRate: 6 },
      { step: 'Mid Quiz', users: 70, dropoffRate: 12.5 },
      { step: 'Quiz Complete', users: 65, dropoffRate: 7 },
      { step: 'Reward Claim', users: 60, dropoffRate: 8 }
    ]
    
    return {
      totalSessions,
      averageSessionDuration: 7.5 + Math.random() * 5, // 7.5-12.5 minutes
      returnRate: 45 + Math.random() * 30, // 45-75%
      peakUsageHours: [14, 15, 16, 19, 20, 21], // 2-4 PM and 7-9 PM
      deviceTypes,
      geographicData: {
        'United States': 35,
        'United Kingdom': 20,
        'Canada': 15,
        'Australia': 12,
        'Germany': 8,
        'France': 6,
        'Other': 4
      },
      sessionData: sessionDistribution,
      userJourney
    } as unknown as UserActivity
  }

  // Validate and migrate data
  private validateAndMigrateData(data: any, timeRange?: TimeRange): AnalyticsData {
    // Ensure all required properties exist
    const migratedData: AnalyticsData = {
      id: data.id || `analytics_${Date.now()}`,
      quizMetrics: data.quizMetrics || this.generateQuizMetrics(2),
      rewardMetrics: data.rewardMetrics || this.generateRewardMetrics(1),
      userActivity: data.userActivity || this.generateUserActivity(),
      timeRange: timeRange || data.timeRange || DEFAULT_TIME_RANGES[1],
      createdAt: data.createdAt || Date.now(),
      updatedAt: Date.now()
    }
    
    return migratedData
  }

  // Refresh analytics data
  refreshData(timeRange?: TimeRange): AnalyticsData {
    const newData = this.generateMockAnalyticsData(timeRange)
    this.safeSetItem(ANALYTICS_STORAGE_KEYS.DATA, JSON.stringify(newData))
    return newData
  }

  // Export analytics data
  exportData(options: ExportOptions): string {
    const data = this.getAnalyticsData(options.dateRange)
    
    if (options.format === 'json') {
      return JSON.stringify(data, null, 2)
    } else if (options.format === 'csv') {
      return this.convertToCSV(data, options.sections)
    }
    
    return JSON.stringify(data, null, 2) // Fallback to JSON
  }

  // Convert data to CSV format
  private convertToCSV(data: AnalyticsData, sections: string[]): string {
    let csv = ''
    
    if (sections.includes('quiz')) {
      csv += 'Quiz Analytics\n'
      csv += 'Metric,Value\n'
      csv += `Total Questions,${data.quizMetrics.totalQuestions}\n`
      csv += `Questions Answered,${data.quizMetrics.questionsAnswered}\n`
      csv += `Success Rate,${data.quizMetrics.successRate.toFixed(2)}%\n`
      csv += `Average Session Time,${data.quizMetrics.averageSessionTime.toFixed(1)} minutes\n\n`
    }
    
    if (sections.includes('rewards')) {
      csv += 'Reward Analytics\n'
      csv += 'Metric,Value\n'
      csv += `Total Coins Earned,${data.rewardMetrics.totalCoinsEarned}\n`
      csv += `Achievements Unlocked,${data.rewardMetrics.achievementsUnlocked}\n`
      csv += `Active Users,${data.rewardMetrics.activeUsers}\n`
      csv += `Engagement Rate,${data.rewardMetrics.engagementRate.toFixed(2)}%\n\n`
    }
    
    return csv
  }

  // Get analytics settings
  getSettings(): any {
    const settings = this.safeGetItem(ANALYTICS_STORAGE_KEYS.SETTINGS)
    if (!settings) {
      return {
        defaultTimeRange: DEFAULT_TIME_RANGES[1],
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
        chartType: 'line'
      }
    }
    
    try {
      return JSON.parse(settings)
    } catch (error) {
      console.error('Error parsing analytics settings:', error)
      return {
        defaultTimeRange: DEFAULT_TIME_RANGES[1],
        autoRefresh: true,
        refreshInterval: 30000,
        chartType: 'line'
      }
    }
  }

  // Save analytics settings
  saveSettings(settings: any): boolean {
    return this.safeSetItem(ANALYTICS_STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  }

  // Get quiz metrics for dashboard
  getQuizMetrics(): { totalCoinsEarned: number; questionsAnswered: number; successRate: number } {
    try {
      const analyticsData = this.getAnalyticsData()
      return {
        totalCoinsEarned: analyticsData.rewardMetrics?.totalCoinsEarned || 0,
        questionsAnswered: analyticsData.quizMetrics?.questionsAnswered || 0,
        successRate: analyticsData.quizMetrics?.successRate || 0
      }
    } catch (error) {
      console.error('Error getting quiz metrics:', error)
      return { totalCoinsEarned: 0, questionsAnswered: 0, successRate: 0 }
    }
  }

  // Get activity data for dashboard
  getActivityData(): { averageSessionTime: number } {
    try {
      const analyticsData = this.getAnalyticsData()
      return {
        averageSessionTime: analyticsData.userActivity?.averageSessionDuration || 0
      }
    } catch (error) {
      console.error('Error getting activity data:', error)
      return { averageSessionTime: 0 }
    }
  }

  // Get recent activity for dashboard
  getRecentActivity(): Array<{ id: string; type: string; description: string; timestamp: number }> {
    try {
      const analyticsData = this.getAnalyticsData()

      // Generate mock recent activity based on analytics data
      const activities = []
      const now = Date.now()

      // Add some sample activities based on the analytics data
      if (analyticsData.quizMetrics?.questionsAnswered > 0) {
        activities.push({
          id: 'activity-1',
          type: 'quiz',
          description: `${analyticsData.quizMetrics.questionsAnswered} questions answered today`,
          timestamp: now - (1000 * 60 * 30) // 30 minutes ago
        })
      }

      if (analyticsData.rewardMetrics?.totalCoinsEarned > 0) {
        activities.push({
          id: 'activity-2',
          type: 'reward',
          description: `${analyticsData.rewardMetrics.totalCoinsEarned} coins earned`,
          timestamp: now - (1000 * 60 * 60) // 1 hour ago
        })
      }

      if (analyticsData.rewardMetrics?.achievementsUnlocked > 0) {
        activities.push({
          id: 'activity-3',
          type: 'achievement',
          description: `${analyticsData.rewardMetrics.achievementsUnlocked} achievements unlocked`,
          timestamp: now - (1000 * 60 * 90) // 1.5 hours ago
        })
      }

      // Add some default activities if no data
      if (activities.length === 0) {
        activities.push(
          {
            id: 'activity-default-1',
            type: 'system',
            description: 'Dashboard initialized',
            timestamp: now - (1000 * 60 * 10) // 10 minutes ago
          },
          {
            id: 'activity-default-2',
            type: 'system',
            description: 'Analytics data refreshed',
            timestamp: now - (1000 * 60 * 20) // 20 minutes ago
          }
        )
      }

      return activities.sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
    } catch (error) {
      console.error('Error getting recent activity:', error)
      return []
    }
  }
}

// Export singleton instance
export const analyticsDataManager = AnalyticsDataManager.getInstance()
