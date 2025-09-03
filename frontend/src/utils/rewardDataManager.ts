import { 
  RewardConfig, 
  Achievement, 
  PopupSettings, 
  AdSenseConfig,
  RewardPreviewData,
  REWARD_STORAGE_KEYS,
  DEFAULT_REWARD_CONFIG,
  DEFAULT_ACHIEVEMENT_TEMPLATES 
} from '@/types/reward'

// Validation rules for reward configuration
export const REWARD_VALIDATION_RULES = {
  COIN_MIN_VALUE: 1,
  COIN_MAX_VALUE: 1000,
  STREAK_MIN_MULTIPLIER: 1,
  STREAK_MAX_MULTIPLIER: 10,
  POPUP_MIN_DURATION: 1,
  POPUP_MAX_DURATION: 10,
  AD_MIN_FREQUENCY: 1,
  AD_MAX_FREQUENCY: 20,
  ACHIEVEMENT_NAME_MIN_LENGTH: 3,
  ACHIEVEMENT_NAME_MAX_LENGTH: 50,
  ACHIEVEMENT_DESC_MIN_LENGTH: 10,
  ACHIEVEMENT_DESC_MAX_LENGTH: 200,
  REQUIREMENT_MIN_VALUE: 1,
  REQUIREMENT_MAX_VALUE: 1000
} as const

// Error types
export class RewardDataError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'RewardDataError'
  }
}

// Utility functions for localStorage operations
class RewardDataManager {
  private static instance: RewardDataManager

  static getInstance(): RewardDataManager {
    if (!RewardDataManager.instance) {
      RewardDataManager.instance = new RewardDataManager()
    }
    return RewardDataManager.instance
  }

  // Safe localStorage operations with error handling
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
      if (error instanceof DOMException && error.code === 22) {
        throw new RewardDataError('Storage quota exceeded. Please clear some data.', 'QUOTA_EXCEEDED')
      }
      return false
    }
  }

  // Reward Configuration CRUD operations
  getRewardConfig(): RewardConfig {
    const data = this.safeGetItem(REWARD_STORAGE_KEYS.CONFIG)
    if (!data) return this.initializeWithDefaults()
    
    try {
      const config = JSON.parse(data)
      return this.validateAndMigrateConfig(config)
    } catch (error) {
      console.error('Error parsing reward config data:', error)
      return this.initializeWithDefaults()
    }
  }

  saveRewardConfig(config: Partial<Omit<RewardConfig, 'id' | 'createdAt'>>): RewardConfig {
    const currentConfig = this.getRewardConfig()
    const updatedConfig: RewardConfig = {
      ...currentConfig,
      ...config,
      updatedAt: Date.now()
    }
    
    this.validateRewardConfig(updatedConfig)
    this.safeSetItem(REWARD_STORAGE_KEYS.CONFIG, JSON.stringify(updatedConfig))
    return updatedConfig
  }

  // Achievement CRUD operations
  getAchievements(): Achievement[] {
    const config = this.getRewardConfig()
    return config.achievements || []
  }

  // Alias for getAchievements for compatibility
  getAllAchievements(): Achievement[] {
    return this.getAchievements()
  }

  saveAchievement(achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>): Achievement {
    this.validateAchievement(achievement)
    
    const config = this.getRewardConfig()
    const now = Date.now()
    const newAchievement: Achievement = {
      ...achievement,
      id: this.generateId('ach'),
      createdAt: now,
      updatedAt: now
    }
    
    config.achievements.push(newAchievement)
    this.saveRewardConfig({ achievements: config.achievements })
    return newAchievement
  }

  updateAchievement(id: string, updates: Partial<Omit<Achievement, 'id' | 'createdAt'>>): Achievement {
    const config = this.getRewardConfig()
    const index = config.achievements.findIndex(a => a.id === id)
    
    if (index === -1) {
      throw new RewardDataError(`Achievement with id ${id} not found`, 'NOT_FOUND')
    }
    
    const updatedAchievement = {
      ...config.achievements[index],
      ...updates,
      updatedAt: Date.now()
    }
    
    this.validateAchievement(updatedAchievement)
    config.achievements[index] = updatedAchievement
    this.saveRewardConfig({ achievements: config.achievements })
    return updatedAchievement
  }

  deleteAchievement(id: string): boolean {
    const config = this.getRewardConfig()
    const filteredAchievements = config.achievements.filter(a => a.id !== id)
    
    if (filteredAchievements.length === config.achievements.length) {
      throw new RewardDataError(`Achievement with id ${id} not found`, 'NOT_FOUND')
    }
    
    this.saveRewardConfig({ achievements: filteredAchievements })
    return true
  }

  // Achievement template operations
  createAchievementFromTemplate(templateIndex: number): Achievement {
    if (templateIndex < 0 || templateIndex >= DEFAULT_ACHIEVEMENT_TEMPLATES.length) {
      throw new RewardDataError('Invalid template index', 'INVALID_TEMPLATE')
    }
    
    const template = DEFAULT_ACHIEVEMENT_TEMPLATES[templateIndex]
    return this.saveAchievement(template)
  }

  // Preview data generation
  generatePreviewData(type: RewardPreviewData['type'], customCoins?: number): RewardPreviewData {
    const config = this.getRewardConfig()
    
    switch (type) {
      case 'correct':
        return {
          type: 'correct',
          coins: customCoins || config.coinValues.correct,
          message: config.popupSettings.customMessages.correct.replace('{coins}', (customCoins || config.coinValues.correct).toString()),
          funFact: config.popupSettings.showFunFact ? 'This is a sample fun fact for preview!' : undefined
        }
      
      case 'incorrect':
        return {
          type: 'incorrect',
          coins: customCoins || config.coinValues.incorrect,
          message: config.popupSettings.customMessages.incorrect.replace('{coins}', (customCoins || config.coinValues.incorrect).toString())
        }
      
      case 'bonus':
        return {
          type: 'bonus',
          coins: customCoins || config.coinValues.bonus,
          message: config.popupSettings.customMessages.bonus.replace('{coins}', (customCoins || config.coinValues.bonus).toString()),
          funFact: config.popupSettings.showFunFact ? 'Bonus questions often contain interesting trivia!' : undefined
        }
      
      case 'achievement':
        const sampleAchievementTemplate = config.achievements[0] || DEFAULT_ACHIEVEMENT_TEMPLATES[0]
        const sampleAchievement = {
          ...sampleAchievementTemplate,
          id: `achievement_${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        return {
          type: 'achievement',
          coins: sampleAchievement.reward.coins,
          message: `Achievement Unlocked: ${sampleAchievement.name}!`,
          achievement: sampleAchievement
        }
      
      default:
        throw new RewardDataError('Invalid preview type', 'INVALID_PREVIEW_TYPE')
    }
  }

  // Validation methods
  private validateRewardConfig(config: any): void {
    // Validate coin values
    if (!config.coinValues) {
      throw new RewardDataError('Coin values are required', 'INVALID_COIN_VALUES')
    }
    
    Object.entries(config.coinValues).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < REWARD_VALIDATION_RULES.COIN_MIN_VALUE || value > REWARD_VALIDATION_RULES.COIN_MAX_VALUE) {
        throw new RewardDataError(
          `Invalid coin value for ${key}. Must be between ${REWARD_VALIDATION_RULES.COIN_MIN_VALUE} and ${REWARD_VALIDATION_RULES.COIN_MAX_VALUE}`,
          'INVALID_COIN_VALUE'
        )
      }
    })
    
    // Validate streak settings
    if (config.streakSettings) {
      if (typeof config.streakSettings.multiplierPerDay !== 'number' || 
          config.streakSettings.multiplierPerDay < REWARD_VALIDATION_RULES.STREAK_MIN_MULTIPLIER ||
          config.streakSettings.multiplierPerDay > REWARD_VALIDATION_RULES.STREAK_MAX_MULTIPLIER) {
        throw new RewardDataError(
          `Invalid streak multiplier. Must be between ${REWARD_VALIDATION_RULES.STREAK_MIN_MULTIPLIER} and ${REWARD_VALIDATION_RULES.STREAK_MAX_MULTIPLIER}`,
          'INVALID_STREAK_MULTIPLIER'
        )
      }
    }
    
    // Validate popup settings
    if (config.popupSettings) {
      if (typeof config.popupSettings.duration !== 'number' || 
          config.popupSettings.duration < REWARD_VALIDATION_RULES.POPUP_MIN_DURATION ||
          config.popupSettings.duration > REWARD_VALIDATION_RULES.POPUP_MAX_DURATION) {
        throw new RewardDataError(
          `Invalid popup duration. Must be between ${REWARD_VALIDATION_RULES.POPUP_MIN_DURATION} and ${REWARD_VALIDATION_RULES.POPUP_MAX_DURATION}`,
          'INVALID_POPUP_DURATION'
        )
      }
    }
    
    // Validate ad settings
    if (config.adSettings) {
      if (typeof config.adSettings.frequency !== 'number' || 
          config.adSettings.frequency < REWARD_VALIDATION_RULES.AD_MIN_FREQUENCY ||
          config.adSettings.frequency > REWARD_VALIDATION_RULES.AD_MAX_FREQUENCY) {
        throw new RewardDataError(
          `Invalid ad frequency. Must be between ${REWARD_VALIDATION_RULES.AD_MIN_FREQUENCY} and ${REWARD_VALIDATION_RULES.AD_MAX_FREQUENCY}`,
          'INVALID_AD_FREQUENCY'
        )
      }
    }
  }

  private validateAchievement(achievement: any): void {
    if (!achievement.name || achievement.name.length < REWARD_VALIDATION_RULES.ACHIEVEMENT_NAME_MIN_LENGTH || achievement.name.length > REWARD_VALIDATION_RULES.ACHIEVEMENT_NAME_MAX_LENGTH) {
      throw new RewardDataError(
        `Achievement name must be between ${REWARD_VALIDATION_RULES.ACHIEVEMENT_NAME_MIN_LENGTH} and ${REWARD_VALIDATION_RULES.ACHIEVEMENT_NAME_MAX_LENGTH} characters`,
        'INVALID_ACHIEVEMENT_NAME'
      )
    }
    
    if (!achievement.description || achievement.description.length < REWARD_VALIDATION_RULES.ACHIEVEMENT_DESC_MIN_LENGTH || achievement.description.length > REWARD_VALIDATION_RULES.ACHIEVEMENT_DESC_MAX_LENGTH) {
      throw new RewardDataError(
        `Achievement description must be between ${REWARD_VALIDATION_RULES.ACHIEVEMENT_DESC_MIN_LENGTH} and ${REWARD_VALIDATION_RULES.ACHIEVEMENT_DESC_MAX_LENGTH} characters`,
        'INVALID_ACHIEVEMENT_DESCRIPTION'
      )
    }
    
    if (!achievement.requirement || !achievement.requirement.type || typeof achievement.requirement.value !== 'number' || achievement.requirement.value < REWARD_VALIDATION_RULES.REQUIREMENT_MIN_VALUE || achievement.requirement.value > REWARD_VALIDATION_RULES.REQUIREMENT_MAX_VALUE) {
      throw new RewardDataError(
        `Invalid achievement requirement. Type is required and value must be between ${REWARD_VALIDATION_RULES.REQUIREMENT_MIN_VALUE} and ${REWARD_VALIDATION_RULES.REQUIREMENT_MAX_VALUE}`,
        'INVALID_ACHIEVEMENT_REQUIREMENT'
      )
    }
  }

  // Config migration for backward compatibility
  private validateAndMigrateConfig(config: any): RewardConfig {
    // Ensure all required fields exist
    const validatedConfig: RewardConfig = {
      id: config.id || this.generateId('rc'),
      coinValues: {
        correct: config.coinValues?.correct || DEFAULT_REWARD_CONFIG.coinValues.correct,
        incorrect: config.coinValues?.incorrect || DEFAULT_REWARD_CONFIG.coinValues.incorrect,
        bonus: config.coinValues?.bonus || DEFAULT_REWARD_CONFIG.coinValues.bonus,
        dailyBonus: config.coinValues?.dailyBonus || DEFAULT_REWARD_CONFIG.coinValues.dailyBonus,
        streakBonus: config.coinValues?.streakBonus || DEFAULT_REWARD_CONFIG.coinValues.streakBonus
      },
      streakSettings: {
        enabled: config.streakSettings?.enabled !== undefined ? config.streakSettings.enabled : DEFAULT_REWARD_CONFIG.streakSettings.enabled,
        multiplierPerDay: config.streakSettings?.multiplierPerDay || DEFAULT_REWARD_CONFIG.streakSettings.multiplierPerDay,
        maxMultiplier: config.streakSettings?.maxMultiplier || DEFAULT_REWARD_CONFIG.streakSettings.maxMultiplier,
        resetOnWrongAnswer: config.streakSettings?.resetOnWrongAnswer !== undefined ? config.streakSettings.resetOnWrongAnswer : DEFAULT_REWARD_CONFIG.streakSettings.resetOnWrongAnswer
      },
      popupSettings: {
        enabled: config.popupSettings?.enabled !== undefined ? config.popupSettings.enabled : DEFAULT_REWARD_CONFIG.popupSettings.enabled,
        showAfterQuestions: config.popupSettings?.showAfterQuestions || DEFAULT_REWARD_CONFIG.popupSettings.showAfterQuestions,
        duration: config.popupSettings?.duration || DEFAULT_REWARD_CONFIG.popupSettings.duration,
        showFunFact: config.popupSettings?.showFunFact !== undefined ? config.popupSettings.showFunFact : DEFAULT_REWARD_CONFIG.popupSettings.showFunFact,
        customMessages: {
          correct: config.popupSettings?.customMessages?.correct || DEFAULT_REWARD_CONFIG.popupSettings.customMessages.correct,
          incorrect: config.popupSettings?.customMessages?.incorrect || DEFAULT_REWARD_CONFIG.popupSettings.customMessages.incorrect,
          bonus: config.popupSettings?.customMessages?.bonus || DEFAULT_REWARD_CONFIG.popupSettings.customMessages.bonus
        }
      },
      adSettings: {
        enabled: config.adSettings?.enabled !== undefined ? config.adSettings.enabled : DEFAULT_REWARD_CONFIG.adSettings.enabled,
        frequency: config.adSettings?.frequency || DEFAULT_REWARD_CONFIG.adSettings.frequency,
        minQuestionsBetweenAds: config.adSettings?.minQuestionsBetweenAds || DEFAULT_REWARD_CONFIG.adSettings.minQuestionsBetweenAds,
        rewardCoins: config.adSettings?.rewardCoins || DEFAULT_REWARD_CONFIG.adSettings.rewardCoins
      },
      achievements: Array.isArray(config.achievements) ? config.achievements : DEFAULT_REWARD_CONFIG.achievements,
      createdAt: config.createdAt || Date.now(),
      updatedAt: config.updatedAt || Date.now()
    }
    
    return validatedConfig
  }

  // Helper methods
  private initializeWithDefaults(): RewardConfig {
    const now = Date.now()
    const defaultConfig: RewardConfig = {
      id: this.generateId('rc'),
      ...DEFAULT_REWARD_CONFIG,
      achievements: [...DEFAULT_ACHIEVEMENT_TEMPLATES.map(template => ({
        ...template,
        id: this.generateId('ach'),
        createdAt: now,
        updatedAt: now
      }))],
      createdAt: now,
      updatedAt: now
    }
    
    this.safeSetItem(REWARD_STORAGE_KEYS.CONFIG, JSON.stringify(defaultConfig))
    return defaultConfig
  }

  private generateId(prefix: string = ''): string {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`
  }

  // Create backup
  createBackup(): string {
    const backupData = {
      config: this.getRewardConfig(),
      timestamp: Date.now(),
      version: '1.0'
    }
    
    const backupString = JSON.stringify(backupData)
    this.safeSetItem(REWARD_STORAGE_KEYS.BACKUP, backupString)
    return backupString
  }

  // Restore from backup
  restoreFromBackup(backupData: string): void {
    try {
      const parsedData = JSON.parse(backupData)
      
      if (parsedData.config) {
        this.safeSetItem(REWARD_STORAGE_KEYS.CONFIG, JSON.stringify(parsedData.config))
      }
      
      console.log('✅ Successfully restored reward data from backup')
    } catch (error) {
      throw new RewardDataError(
        `Failed to restore from backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESTORE_FAILED'
      )
    }
  }

  // Get backup
  getBackup(): string | null {
    return this.safeGetItem(REWARD_STORAGE_KEYS.BACKUP)
  }

  // Clear all reward data
  clearAllData(): void {
    Object.values(REWARD_STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error clearing reward data for key ${key}:`, error)
      }
    })
  }
}

// Export singleton instance
export const rewardDataManager = RewardDataManager.getInstance()