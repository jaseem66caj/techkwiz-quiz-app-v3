import { 
  AnalyticsData, 
  QuizMetrics, 
  RewardMetrics, 
  UserActivity,
  TimeRange,
  CategoryPerformance,
  DifficultyDistribution,
  TimeBasedPerformance,
  CoinDistribution,
  RewardTrend,
  ExportOptions,
  ANALYTICS_STORAGE_KEYS,
  DEFAULT_TIME_RANGES,
  DEFAULT_CATEGORIES
} from '@/types/analytics'
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
        category: typeof category === 'string' ? category : category.name,
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
    const coinDistribution: CoinDistribution = {
      correct: Math.floor(totalCoinsEarned * 0.6), // 60% from correct answers
      incorrect: Math.floor(totalCoinsEarned * 0.2), // 20% from incorrect answers
      bonus: Math.floor(totalCoinsEarned * 0.15), // 15% from bonus questions
      achievements: Math.floor(totalCoinsEarned * 0.05) // 5% from achievements
    }
    
    // Generate reward trends (last 30 days)
    const rewardTrends: RewardTrend[] = []
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
    return {
      dailyActiveUsers: Math.floor(Math.random() * 50) + 25,
      weeklyActiveUsers: Math.floor(Math.random() * 200) + 100,
      monthlyActiveUsers: Math.floor(Math.random() * 500) + 300,
      userRetention: {
        day1: 85 + Math.random() * 10, // 85-95%
        day7: 65 + Math.random() * 15, // 65-80%
        day30: 45 + Math.random() * 15  // 45-60%
      },
      deviceBreakdown: {
        desktop: 35 + Math.random() * 15, // 35-50%
        mobile: 55 + Math.random() * 20,  // 55-75%
        tablet: 5 + Math.random() * 10    // 5-15%
      },
      sessionDistribution: {
        morning: 25 + Math.random() * 10,   // 25-35%
        afternoon: 30 + Math.random() * 15, // 30-45%
        evening: 35 + Math.random() * 15,   // 35-50%
        night: 10 + Math.random() * 10      // 10-20%
      },
      userJourney: [
        { step: 'Landing', completionRate: 100, dropOffRate: 0 },
        { step: 'Category Selection', completionRate: 90, dropOffRate: 10 },
        { step: 'Quiz Start', completionRate: 85, dropOffRate: 15 },
        { step: 'Question 1', completionRate: 80, dropOffRate: 20 },
        { step: 'Question 2', completionRate: 75, dropOffRate: 25 },
        { step: 'Question 3', completionRate: 70, dropOffRate: 30 },
        { step: 'Question 4', completionRate: 65, dropOffRate: 35 },
        { step: 'Question 5', completionRate: 60, dropOffRate: 40 },
        { step: 'Results', completionRate: 55, dropOffRate: 45 }
      ]
    }
  }

  // Validate and migrate data for backward compatibility
  private validateAndMigrateData(data: any, timeRange?: TimeRange): AnalyticsData {
    // Ensure all required fields exist
    const validatedData: AnalyticsData = {
      id: data.id || `analytics_${Date.now()}`,
      quizMetrics: data.quizMetrics || this.generateQuizMetrics(0),
      rewardMetrics: data.rewardMetrics || this.generateRewardMetrics(0),
      userActivity: data.userActivity || this.generateUserActivity(),
      timeRange: data.timeRange || timeRange || DEFAULT_TIME_RANGES[1],
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now()
    }
    
    return validatedData
  }

  // Update analytics data
  updateAnalyticsData(updates: Partial<Omit<AnalyticsData, 'id' | 'createdAt'>>): AnalyticsData {
    const currentData = this.getAnalyticsData()
    const updatedData: AnalyticsData = {
      ...currentData,
      ...updates,
      updatedAt: Date.now()
    }
    
    this.safeSetItem(ANALYTICS_STORAGE_KEYS.DATA, JSON.stringify(updatedData))
    return updatedData
  }

  // Export analytics data
  exportAnalyticsData(options: ExportOptions): string {
    const data = this.getAnalyticsData()
    
    switch (options.format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      
      case 'csv':
        // Simple CSV export of key metrics
        let csv = 'Metric,Value\n'
        csv += `Total Questions,${data.quizMetrics.totalQuestions}\n`
        csv += `Questions Answered,${data.quizMetrics.questionsAnswered}\n`
        csv += `Success Rate,${data.quizMetrics.successRate.toFixed(2)}%\n`
        csv += `Total Coins Earned,${data.rewardMetrics.totalCoinsEarned}\n`
        csv += `Achievements Unlocked,${data.rewardMetrics.achievementsUnlocked}\n`
        csv += `Active Users,${data.rewardMetrics.activeUsers}\n`
        return csv
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  // Clear analytics data
  clearAnalyticsData(): void {
    Object.values(ANALYTICS_STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error clearing analytics data for key ${key}:`, error)
      }
    })
  }
}

// Export singleton instance
export const analyticsDataManager = AnalyticsDataManager.getInstance()
