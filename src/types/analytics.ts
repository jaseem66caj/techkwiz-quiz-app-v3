// Analytics data interface
export interface AnalyticsData {
  id: string
  quizMetrics: QuizMetrics
  rewardMetrics: RewardMetrics
  userActivity: UserActivity
  timeRange: TimeRange
  createdAt: number
  updatedAt: number
}

// Additional analytics interfaces
export interface CategoryPerformance {
  category: string
  questionsAnswered: number
  correctAnswers: number
  successRate: number
  averageTime: number
}

export interface DifficultyDistribution {
  beginner: number
  intermediate: number
  advanced: number
}

export interface TimeBasedPerformance {
  date: string
  questionsAnswered: number
  successRate: number
  activeUsers: number
}

export interface AchievementStats {
  totalAchievements: number
  mostCommonAchievements: string[]
  achievementDistribution: { [key: string]: number }
}

export interface CoinDistribution {
  correct: number
  incorrect: number
  bonus: number
  achievements: number
}

export interface RewardTrend {
  date: string
  coinsEarned: number
  achievementsUnlocked: number
  activeUsers: number
}

export interface DeviceBreakdown {
  mobile: number
  desktop: number
  tablet: number
}

export interface SessionDistribution {
  morning: number
  afternoon: number
  evening: number
  night: number
}

export interface UserJourneyStep {
  step: string
  completionRate: number
  dropOffRate: number
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  dateRange: TimeRange
  includeUserData: boolean
  includeQuizData: boolean
  includeMetrics: boolean
}

// Quiz metrics interface
export interface QuizMetrics {
  totalQuestions: number
  questionsAnswered: number
  correctAnswers: number
  incorrectAnswers: number
  successRate: number
  categoryPerformance: CategoryPerformance[]
  averageSessionTime: number
  popularCategories: string[]
  difficultyDistribution: DifficultyDistribution
  timeBasedPerformance: TimeBasedPerformance[]
}

// Reward metrics interface
export interface RewardMetrics {
  totalCoinsEarned: number
  achievementsUnlocked: number
  activeUsers: number
  engagementRate: number
  averageCoinsPerSession: number
  topAchievements: any[]
  coinDistribution: CoinDistribution
  rewardTrends: RewardTrend[]
}

// User activity interface
export interface UserActivity {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  userRetention: {
    day1: number
    day7: number
    day30: number
  }
  deviceBreakdown: DeviceBreakdown
  sessionDistribution: SessionDistribution
  userJourney: UserJourneyStep[]
}

// Time range interface
export interface TimeRange {
  id: string
  name: string
  days: number
  startDate: string
  endDate: string
}

// Category performance interface
export interface CategoryPerformance {
  category: string
  questionsAnswered: number
  correctAnswers: number
  successRate: number
  averageTime: number
}

// Difficulty distribution interface
export interface DifficultyDistribution {
  beginner: number
  intermediate: number
  advanced: number
}

// Time-based performance interface
export interface TimeBasedPerformance {
  date: string
  questionsAnswered: number
  successRate: number
  activeUsers: number
}

// Achievement stats interface
export interface AchievementStats {
  id: string
  name: string
  unlockedCount: number
  unlockRate: number
}

// Coin distribution interface
export interface CoinDistribution {
  correct: number
  incorrect: number
  bonus: number
  achievements: number
}

// Reward trend interface
export interface RewardTrend {
  date: string
  coinsEarned: number
  achievementsUnlocked: number
  activeUsers: number
}

// Device breakdown interface
export interface DeviceBreakdown {
  desktop: number
  mobile: number
  tablet: number
}

// Session distribution interface
export interface SessionDistribution {
  morning: number
  afternoon: number
  evening: number
  night: number
}

// User journey step interface
export interface UserJourneyStep {
  step: string
  completionRate: number
  dropOffRate: number
}



// Analytics storage keys
export const ANALYTICS_STORAGE_KEYS = {
  DATA: 'admin_analytics_data',
  SETTINGS: 'admin_analytics_settings',
  CACHE: 'admin_analytics_cache',
  EXPORT_HISTORY: 'admin_analytics_exports'
} as const

// Default time ranges
export const DEFAULT_TIME_RANGES: TimeRange[] = [
  {
    id: '7d',
    name: 'Last 7 Days',
    days: 7,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  {
    id: '30d',
    name: 'Last 30 Days',
    days: 30,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  {
    id: '90d',
    name: 'Last 90 Days',
    days: 90,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  }
]

// Default categories
export const DEFAULT_CATEGORIES = [
  {
    id: 'movies',
    name: 'Movies',
    description: 'Test your knowledge of movies and cinema',
    icon: '🎬',
    color: 'bg-blue-500'
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'How well do you know social media platforms?',
    icon: '📱',
    color: 'bg-purple-500'
  },
  {
    id: 'influencers',
    name: 'Influencers',
    description: 'Test your knowledge of popular influencers',
    icon: '🌟',
    color: 'bg-pink-500'
  }
] as const