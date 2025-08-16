export type AdminSectionId = 
  | 'dashboard' 
  | 'quiz-management' 
  | 'reward-config' 
  | 'analytics' 
  | 'settings' 
  | 'file-management'

export interface AdminSection {
  id: AdminSectionId
  name: string
  icon: React.ReactNode
  badge?: string | number
}

export type FileType = 'ads.txt' | 'robots.txt' | 'llms.txt'

export interface FileContent {
  type: FileType
  content: string
  lastModified: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'regular' | 'bonus'
  section: 'onboarding' | 'homepage' | 'category' | 'general'
  subcategory?: string
  funFact?: string
  tags?: string[]
  rewardCoins?: number
  visualOptions?: string[]
  personalityTrait?: string
  predictionYear?: string
  createdAt: number
  updatedAt: number
}

export interface QuizCategory {
  id: string
  name: string
  description?: string
  questionCount: number
}

export interface SearchFilters {
  searchText: string
  category: string | 'all'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all'
  type: 'regular' | 'bonus' | 'all'
  section: 'onboarding' | 'homepage' | 'category' | 'general' | 'all'
  subcategory: string | 'all'
}

export interface BulkOperationResult {
  success: boolean
  processedCount: number
  errorCount: number
  errors: string[]
}

export interface QuestionDraft {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'regular' | 'bonus'
  funFact?: string
  tags?: string[]
  lastSaved: number
}

export interface QuizManagementSettings {
  pageSize: number
  sortBy: 'question' | 'category' | 'difficulty' | 'createdAt' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
  filters: SearchFilters
  selectedQuestions: string[]
}

// Reward Configuration Interfaces
export interface RewardConfig {
  id: string
  coinValues: {
    correct: number
    incorrect: number
    bonus: number
    streakMultiplier: number
  }
  achievements: Achievement[]
  popupSettings: PopupSettings
  adSenseConfig: AdSenseConfig
  isEnabled: boolean
  createdAt: number
  updatedAt: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: {
    type: 'questions_answered' | 'correct_streak' | 'category_master' | 'daily_login'
    value: number
    category?: string
  }
  reward: {
    coins: number
    badge?: string
  }
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface PopupSettings {
  animationType: 'treasure_chest' | 'coin_burst' | 'achievement_badge'
  duration: number
  showFunFact: boolean
  autoClose: boolean
  adSenseEnabled: boolean
  customMessages: {
    correct: string
    incorrect: string
    bonus: string
    achievement: string
  }
}

export interface AdSenseConfig {
  enabled: boolean
  adUnitId: string
  adSlotId: string
  testMode: boolean
  placement: 'popup' | 'sidebar' | 'banner'
  frequency: number // Show ad every N questions
}

export interface RewardPreviewData {
  type: 'correct' | 'incorrect' | 'bonus' | 'achievement'
  coins: number
  message: string
  funFact?: string
  achievement?: Achievement
}

// localStorage keys
export const QUIZ_STORAGE_KEYS = {
  QUESTIONS: 'admin_quiz_questions',
  DRAFTS: 'admin_quiz_drafts',
  SETTINGS: 'admin_quiz_settings',
  BACKUP: 'admin_quiz_backup'
} as const

export const REWARD_STORAGE_KEYS = {
  CONFIG: 'admin_reward_config',
  ACHIEVEMENTS: 'admin_achievements',
  SETTINGS: 'admin_reward_settings',
  BACKUP: 'admin_reward_backup'
} as const

export const ANALYTICS_STORAGE_KEYS = {
  DATA: 'admin_analytics_data',
  SETTINGS: 'admin_analytics_settings',
  CACHE: 'admin_analytics_cache',
  EXPORT_HISTORY: 'admin_analytics_exports'
} as const

export const SETTINGS_STORAGE_KEYS = {
  SYSTEM: 'admin_system_settings',
  USER_PREFERENCES: 'admin_user_preferences',
  SECURITY: 'admin_security_settings',
  INTEGRATIONS: 'admin_integration_settings',
  BACKUP: 'admin_settings_backup'
} as const

export const FILE_STORAGE_KEYS = {
  FILES: 'admin_files',
  FOLDERS: 'admin_folders',
  SETTINGS: 'admin_file_settings',
  QUOTA: 'admin_storage_quota',
  CACHE: 'admin_file_cache'
} as const

// Default time ranges for analytics
export const DEFAULT_TIME_RANGES: TimeRange[] = [
  {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 7 days'
  },
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 days'
  },
  {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 3 months'
  },
  {
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last year'
  }
]

// Chart color palette
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6'
} as const

// Settings Interfaces
export interface GoogleAnalyticsConfig {
  enabled: boolean
  trackingId: string
  measurementId: string
  customCode: string
  trackPageViews: boolean
  trackEvents: boolean
  anonymizeIp: boolean
  updatedAt: number
}

export interface SystemSettings {
  id: string
  applicationName: string
  applicationVersion: string
  maintenanceMode: boolean
  debugMode: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug'
  maxUsers: number
  sessionTimeout: number
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  googleAnalytics?: GoogleAnalyticsConfig
  createdAt: number
  updatedAt: number
}

export interface UserPreferences {
  id: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  dashboardLayout: 'compact' | 'comfortable' | 'spacious'
  notifications: NotificationSettings
  accessibility: AccessibilitySettings
  createdAt: number
  updatedAt: number
}

export interface SecuritySettings {
  id: string
  passwordPolicy: PasswordPolicy
  sessionSecurity: SessionSecurity
  loginAttempts: LoginAttempts
  twoFactorAuth: boolean
  ipWhitelist: string[]
  auditLogging: boolean
  encryptionEnabled: boolean
  createdAt: number
  updatedAt: number
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  systemAlerts: boolean
  maintenanceAlerts: boolean
  securityAlerts: boolean
  digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

export interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  expirationDays: number
  preventReuse: number
}

export interface SessionSecurity {
  maxConcurrentSessions: number
  idleTimeout: number
  forceLogoutOnPasswordChange: boolean
  requireReauthForSensitive: boolean
}

export interface LoginAttempts {
  maxAttempts: number
  lockoutDuration: number
  resetAfter: number
  notifyOnLockout: boolean
}

export interface IntegrationSettings {
  id: string
  apiConfiguration: ApiConfiguration
  thirdPartyServices: ThirdPartyServices
  webhooks: WebhookSettings
  socialMedia: SocialMediaSettings
  analytics: AnalyticsIntegration
  notifications: NotificationServices
  createdAt: number
  updatedAt: number
}

export interface ApiConfiguration {
  baseUrl: string
  apiKey: string
  rateLimit: number
  timeout: number
  retryAttempts: number
  enableCaching: boolean
}

export interface ThirdPartyServices {
  googleAnalytics: {
    enabled: boolean
    trackingId: string
    anonymizeIp: boolean
  }
  adSense: {
    enabled: boolean
    publisherId: string
    adSlotId: string
  }
  emailService: {
    enabled: boolean
    provider: 'sendgrid' | 'mailgun' | 'ses'
    apiKey: string
    fromEmail: string
  }
}

export interface WebhookSettings {
  enabled: boolean
  endpoints: WebhookEndpoint[]
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    maxBackoffTime: number
  }
}

export interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  secret: string
  active: boolean
}

export interface SocialMediaSettings {
  twitter: {
    enabled: boolean
    apiKey: string
    apiSecret: string
  }
  facebook: {
    enabled: boolean
    appId: string
    appSecret: string
  }
  linkedin: {
    enabled: boolean
    clientId: string
    clientSecret: string
  }
}

export interface AnalyticsIntegration {
  customAnalytics: {
    enabled: boolean
    endpoint: string
    apiKey: string
  }
  heatmaps: {
    enabled: boolean
    provider: 'hotjar' | 'fullstory' | 'logrocket'
    trackingId: string
  }
}

export interface NotificationServices {
  email: {
    enabled: boolean
    smtpHost: string
    smtpPort: number
    username: string
    password: string
  }
  sms: {
    enabled: boolean
    provider: 'twilio' | 'nexmo' | 'aws-sns'
    apiKey: string
    fromNumber: string
  }
  push: {
    enabled: boolean
    vapidPublicKey: string
    vapidPrivateKey: string
  }
}

// Default categories
export const DEFAULT_CATEGORIES: QuizCategory[] = [
  { id: 'movies', name: 'Movies', description: 'Film and cinema questions', questionCount: 0 },
  { id: 'social-media', name: 'Social Media', description: 'Social platforms and trends', questionCount: 0 },
  { id: 'influencers', name: 'Influencers', description: 'Content creators and personalities', questionCount: 0 },
  { id: 'gen-z', name: 'Gen Z', description: 'Generation Z culture and trends', questionCount: 0 },
  { id: 'gaming', name: 'Gaming', description: 'Video games and gaming culture', questionCount: 0 },
  { id: 'music', name: 'Music', description: 'Artists, songs, and music industry', questionCount: 0 },
  { id: 'travel', name: 'Travel', description: 'Destinations and travel culture', questionCount: 0 },
  { id: 'food', name: 'Food', description: 'Cuisine and food trends', questionCount: 0 },
  { id: 'animals', name: 'Animals', description: 'Wildlife and pets', questionCount: 0 },
  { id: 'facts', name: 'Facts', description: 'Interesting facts and trivia', questionCount: 0 }
]

// Default reward configuration
export const DEFAULT_REWARD_CONFIG: Omit<RewardConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  coinValues: {
    correct: 14,
    incorrect: 5,
    bonus: 50,
    streakMultiplier: 2
  },
  achievements: [],
  popupSettings: {
    animationType: 'treasure_chest',
    duration: 3,
    showFunFact: true,
    autoClose: true,
    adSenseEnabled: false,
    customMessages: {
      correct: 'Great job! You earned {coins} coins!',
      incorrect: 'Keep trying! You earned {coins} coins for the attempt.',
      bonus: 'Bonus question! You earned {coins} coins!',
      achievement: 'Achievement unlocked: {achievement}!'
    }
  },
  adSenseConfig: {
    enabled: false,
    adUnitId: '',
    adSlotId: '',
    testMode: true,
    placement: 'popup',
    frequency: 5
  },
  isEnabled: true
}

// Default achievement templates
export const DEFAULT_ACHIEVEMENT_TEMPLATES: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'First Steps',
    description: 'Answer your first question',
    icon: '🎯',
    requirement: {
      type: 'questions_answered',
      value: 1
    },
    reward: {
      coins: 25,
      badge: 'beginner'
    },
    isActive: true
  },
  {
    name: 'Streak Master',
    description: 'Get 5 questions correct in a row',
    icon: '🔥',
    requirement: {
      type: 'correct_streak',
      value: 5
    },
    reward: {
      coins: 100,
      badge: 'streak'
    },
    isActive: true
  },
  {
    name: 'Category Expert',
    description: 'Answer 10 questions correctly in any category',
    icon: '👑',
    requirement: {
      type: 'category_master',
      value: 10
    },
    reward: {
      coins: 200,
      badge: 'expert'
    },
    isActive: true
  }
]

// Achievement icons
export const ACHIEVEMENT_ICONS = [
  '🎯', '🔥', '👑', '🏆', '⭐', '💎', '🎖️', '🥇', '🥈', '🥉',
  '🎪', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎸', '🎺', '🎻'
]

// File type configurations
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/ogg']
} as const

export const FILE_SIZE_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB per file
  maxTotalSize: 100 * 1024 * 1024, // 100MB total
  thumbnailSize: 200, // 200px thumbnails
  previewSize: 800 // 800px previews
} as const

// Default file settings
export const DEFAULT_FILE_SETTINGS: Omit<FileSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  maxFileSize: FILE_SIZE_LIMITS.maxFileSize,
  allowedTypes: [
    ...ALLOWED_FILE_TYPES.images,
    ...ALLOWED_FILE_TYPES.documents,
    ...ALLOWED_FILE_TYPES.audio,
    ...ALLOWED_FILE_TYPES.video
  ],
  autoOptimize: true,
  generateThumbnails: true,
  defaultFolder: 'uploads',
  compressionLevel: 80
}

// File icons mapping
export const FILE_ICONS = {
  // Images
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🎞️',
  'image/webp': '🖼️',
  // Documents
  'application/pdf': '📄',
  'text/plain': '📝',
  'application/msword': '📄',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📄',
  // Audio
  'audio/mpeg': '🎵',
  'audio/wav': '🎵',
  'audio/ogg': '🎵',
  // Video
  'video/mp4': '🎬',
  'video/webm': '🎬',
  'video/ogg': '🎬',
  // Folders
  'folder': '📁',
  // Default
  'default': '📎'
} as const

// Default system settings
export const DEFAULT_SYSTEM_SETTINGS: Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  applicationName: 'TechKwiz',
  applicationVersion: '1.0.0',
  maintenanceMode: false,
  debugMode: false,
  logLevel: 'info',
  maxUsers: 100,
  sessionTimeout: 30,
  autoBackup: true,
  backupFrequency: 'weekly',
  googleAnalytics: {
    enabled: false,
    trackingId: '',
    measurementId: '',
    customCode: '',
    trackPageViews: true,
    trackEvents: true,
    anonymizeIp: true,
    updatedAt: Date.now()
  }
}

// Default user preferences
export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'> = {
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  dashboardLayout: 'comfortable',
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    systemAlerts: true,
    maintenanceAlerts: true,
    securityAlerts: true,
    digestFrequency: 'daily'
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true
  }
}

// Default security settings
export const DEFAULT_SECURITY_SETTINGS: Omit<SecuritySettings, 'id' | 'createdAt' | 'updatedAt'> = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expirationDays: 90,
    preventReuse: 5
  },
  sessionSecurity: {
    maxConcurrentSessions: 3,
    idleTimeout: 30,
    forceLogoutOnPasswordChange: true,
    requireReauthForSensitive: true
  },
  loginAttempts: {
    maxAttempts: 5,
    lockoutDuration: 15,
    resetAfter: 60,
    notifyOnLockout: true
  },
  twoFactorAuth: false,
  ipWhitelist: [],
  auditLogging: true,
  encryptionEnabled: true
}

// Available languages
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

// Available timezones
export const AVAILABLE_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
]

// File Management Interfaces
export interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType: string
  size: number
  path: string
  parentId: string | null
  url?: string
  thumbnail?: string
  uploadedAt: number
  modifiedAt: number
  tags: string[]
  metadata: FileMetadata
}

export interface FileMetadata {
  width?: number
  height?: number
  duration?: number
  author?: string
  description?: string
  alt?: string
}

export interface StorageQuota {
  used: number
  total: number
  percentage: number
  breakdown: StorageBreakdown
}

export interface StorageBreakdown {
  images: number
  videos: number
  documents: number
  audio: number
  other: number
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export interface FileSettings {
  id: string
  maxFileSize: number
  allowedTypes: string[]
  autoOptimize: boolean
  generateThumbnails: boolean
  defaultFolder: string
  compressionLevel: number
  createdAt: number
  updatedAt: number
}

// Analytics Interfaces
export interface AnalyticsData {
  id: string
  quizMetrics: QuizMetrics
  rewardMetrics: RewardMetrics
  userActivity: UserActivity
  timeRange: TimeRange
  createdAt: number
  updatedAt: number
}

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

export interface RewardMetrics {
  totalCoinsEarned: number
  achievementsUnlocked: number
  activeUsers: number
  engagementRate: number
  averageCoinsPerSession: number
  topAchievements: AchievementStats[]
  coinDistribution: CoinDistribution
  rewardTrends: RewardTrend[]
}

export interface UserActivity {
  totalSessions: number
  averageSessionDuration: number
  returnRate: number
  peakUsageHours: number[]
  deviceTypes: DeviceBreakdown
  geographicData: GeographicBreakdown
  sessionDistribution: SessionDistribution[]
  userJourney: UserJourneyStep[]
}

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
  achievement: Achievement
  unlockCount: number
  completionRate: number
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
  desktop: number
  mobile: number
  tablet: number
}

export interface GeographicBreakdown {
  [country: string]: number
}

export interface SessionDistribution {
  duration: string
  count: number
}

export interface UserJourneyStep {
  step: string
  users: number
  dropoffRate: number
}

export interface TimeRange {
  start: Date
  end: Date
  label: string
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  dateRange: TimeRange
  includeCharts: boolean
  sections: string[]
}

export interface RewardConfig {
  correctAnswerCoins: number
  incorrectAnswerCoins: number
  bonusQuestionCoins: number
  streakMultiplier: number
  achievements: Achievement[]
  popupSettings: PopupSettings
  adsenseSettings: AdsenseSettings
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  type: 'streak' | 'total_correct' | 'category_master' | 'speed_demon'
  isActive: boolean
  coinReward: number
}

export interface PopupSettings {
  showAnimation: boolean
  animationDuration: number
  autoCloseDelay: number
  showCoinAnimation: boolean
  showAchievementBadge: boolean
  customMessages: {
    correct: string[]
    incorrect: string[]
    bonus: string[]
  }
}

export interface AdsenseSettings {
  enabled: boolean
  adUnitId: string
  rewardMultiplier: number
  showAdButton: boolean
  adButtonText: string
}

export interface AnalyticsData {
  totalQuestions: number
  totalCategories: number
  activeAchievements: number
  averageScore: number
  popularCategories: Array<{
    name: string
    count: number
    percentage: number
  }>
  difficultyDistribution: Array<{
    difficulty: string
    count: number
    percentage: number
  }>
  recentActivity: Array<{
    timestamp: number
    action: string
    details: string
  }>
}

export interface SettingsTab {
  id: string
  name: string
  icon: React.ReactNode
  component: React.ComponentType
}

export interface AdminSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    maintenanceMode: boolean
  }
  quiz: {
    defaultTimerSeconds: number
    questionsPerQuiz: number
    enableHints: boolean
    shuffleQuestions: boolean
    shuffleOptions: boolean
  }
  rewards: {
    enableRewards: boolean
    enableAchievements: boolean
    enableStreaks: boolean
    maxDailyRewards: number
  }
  appearance: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    enableDarkMode: boolean
  }
  advanced: {
    enableAnalytics: boolean
    enableLogging: boolean
    cacheTimeout: number
    apiTimeout: number
  }
  security: {
    sessionTimeout: number
    maxFailedAttempts: number
    lockoutDuration: number
    enableActivityLogging: boolean
  }
}
