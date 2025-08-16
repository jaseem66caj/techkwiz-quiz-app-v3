import { 
  RewardConfig, 
  Achievement, 
  PopupSettings, 
  AdSenseConfig,
  RewardPreviewData,
  REWARD_STORAGE_KEYS,
  DEFAULT_REWARD_CONFIG,
  DEFAULT_ACHIEVEMENT_TEMPLATES 
} from '@/types/admin'

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
        const sampleAchievement = config.achievements[0] || DEFAULT_ACHIEVEMENT_TEMPLATES[0]
        return {
          type: 'achievement',
          coins: sampleAchievement.reward.coins,
          message: config.popupSettings.customMessages.achievement.replace('{achievement}', sampleAchievement.name),
          achievement: sampleAchievement as Achievement
        }
      
      default:
        throw new RewardDataError('Invalid preview type', 'INVALID_PREVIEW_TYPE')
    }
  }

  // Validation methods
  private validateRewardConfig(config: RewardConfig): void {
    // Validate coin values
    if (config.coinValues.correct < REWARD_VALIDATION_RULES.COIN_MIN_VALUE || 
        config.coinValues.correct > REWARD_VALIDATION_RULES.COIN_MAX_VALUE) {
      throw new RewardDataError(
        `Correct answer coins must be between ${REWARD_VALIDATION_RULES.COIN_MIN_VALUE} and ${REWARD_VALIDATION_RULES.COIN_MAX_VALUE}`,
        'INVALID_COIN_VALUE'
      )
    }
    
    if (config.coinValues.incorrect < REWARD_VALIDATION_RULES.COIN_MIN_VALUE || 
        config.coinValues.incorrect > REWARD_VALIDATION_RULES.COIN_MAX_VALUE) {
      throw new RewardDataError(
        `Incorrect answer coins must be between ${REWARD_VALIDATION_RULES.COIN_MIN_VALUE} and ${REWARD_VALIDATION_RULES.COIN_MAX_VALUE}`,
        'INVALID_COIN_VALUE'
      )
    }
    
    if (config.coinValues.bonus < REWARD_VALIDATION_RULES.COIN_MIN_VALUE || 
        config.coinValues.bonus > REWARD_VALIDATION_RULES.COIN_MAX_VALUE) {
      throw new RewardDataError(
        `Bonus question coins must be between ${REWARD_VALIDATION_RULES.COIN_MIN_VALUE} and ${REWARD_VALIDATION_RULES.COIN_MAX_VALUE}`,
        'INVALID_COIN_VALUE'
      )
    }
    
    if (config.coinValues.streakMultiplier < REWARD_VALIDATION_RULES.STREAK_MIN_MULTIPLIER || 
        config.coinValues.streakMultiplier > REWARD_VALIDATION_RULES.STREAK_MAX_MULTIPLIER) {
      throw new RewardDataError(
        `Streak multiplier must be between ${REWARD_VALIDATION_RULES.STREAK_MIN_MULTIPLIER} and ${REWARD_VALIDATION_RULES.STREAK_MAX_MULTIPLIER}`,
        'INVALID_STREAK_MULTIPLIER'
      )
    }
    
    // Validate popup settings
    if (config.popupSettings.duration < REWARD_VALIDATION_RULES.POPUP_MIN_DURATION || 
        config.popupSettings.duration > REWARD_VALIDATION_RULES.POPUP_MAX_DURATION) {
      throw new RewardDataError(
        `Popup duration must be between ${REWARD_VALIDATION_RULES.POPUP_MIN_DURATION} and ${REWARD_VALIDATION_RULES.POPUP_MAX_DURATION} seconds`,
        'INVALID_POPUP_DURATION'
      )
    }
    
    // Validate AdSense config
    if (config.adSenseConfig.frequency < REWARD_VALIDATION_RULES.AD_MIN_FREQUENCY || 
        config.adSenseConfig.frequency > REWARD_VALIDATION_RULES.AD_MAX_FREQUENCY) {
      throw new RewardDataError(
        `Ad frequency must be between ${REWARD_VALIDATION_RULES.AD_MIN_FREQUENCY} and ${REWARD_VALIDATION_RULES.AD_MAX_FREQUENCY}`,
        'INVALID_AD_FREQUENCY'
      )
    }
  }

  private validateAchievement(achievement: Partial<Achievement>): void {
    if (!achievement.name || achievement.name.length < REWARD_VALIDATION_RULES.ACHIEVEMENT_NAME_MIN_LENGTH) {
      throw new RewardDataError(
        `Achievement name must be at least ${REWARD_VALIDATION_RULES.ACHIEVEMENT_NAME_MIN_LENGTH} characters long`,
        'INVALID_ACHIEVEMENT_NAME'
      )
    }
    
    if (achievement.name.length > REWARD_VALIDATION_RULES.ACHIEVEMENT_NAME_MAX_LENGTH) {
      throw new RewardDataError(
        `Achievement name must be no more than ${REWARD_VALIDATION_RULES.ACHIEVEMENT_NAME_MAX_LENGTH} characters long`,
        'INVALID_ACHIEVEMENT_NAME'
      )
    }
    
    if (!achievement.description || achievement.description.length < REWARD_VALIDATION_RULES.ACHIEVEMENT_DESC_MIN_LENGTH) {
      throw new RewardDataError(
        `Achievement description must be at least ${REWARD_VALIDATION_RULES.ACHIEVEMENT_DESC_MIN_LENGTH} characters long`,
        'INVALID_ACHIEVEMENT_DESCRIPTION'
      )
    }
    
    if (achievement.description.length > REWARD_VALIDATION_RULES.ACHIEVEMENT_DESC_MAX_LENGTH) {
      throw new RewardDataError(
        `Achievement description must be no more than ${REWARD_VALIDATION_RULES.ACHIEVEMENT_DESC_MAX_LENGTH} characters long`,
        'INVALID_ACHIEVEMENT_DESCRIPTION'
      )
    }
    
    if (!achievement.requirement || 
        achievement.requirement.value < REWARD_VALIDATION_RULES.REQUIREMENT_MIN_VALUE || 
        achievement.requirement.value > REWARD_VALIDATION_RULES.REQUIREMENT_MAX_VALUE) {
      throw new RewardDataError(
        `Achievement requirement value must be between ${REWARD_VALIDATION_RULES.REQUIREMENT_MIN_VALUE} and ${REWARD_VALIDATION_RULES.REQUIREMENT_MAX_VALUE}`,
        'INVALID_REQUIREMENT_VALUE'
      )
    }
    
    if (!achievement.reward || 
        achievement.reward.coins < REWARD_VALIDATION_RULES.COIN_MIN_VALUE || 
        achievement.reward.coins > REWARD_VALIDATION_RULES.COIN_MAX_VALUE) {
      throw new RewardDataError(
        `Achievement reward coins must be between ${REWARD_VALIDATION_RULES.COIN_MIN_VALUE} and ${REWARD_VALIDATION_RULES.COIN_MAX_VALUE}`,
        'INVALID_REWARD_COINS'
      )
    }
  }

  // Utility methods
  private initializeWithDefaults(): RewardConfig {
    const now = Date.now()
    const defaultConfig: RewardConfig = {
      ...DEFAULT_REWARD_CONFIG,
      id: this.generateId('config'),
      createdAt: now,
      updatedAt: now
    }
    
    this.safeSetItem(REWARD_STORAGE_KEYS.CONFIG, JSON.stringify(defaultConfig))
    return defaultConfig
  }

  private validateAndMigrateConfig(config: any): RewardConfig {
    // Ensure all required properties exist with defaults
    const migratedConfig: RewardConfig = {
      id: config.id || this.generateId('config'),
      coinValues: {
        correct: config.coinValues?.correct ?? DEFAULT_REWARD_CONFIG.coinValues.correct,
        incorrect: config.coinValues?.incorrect ?? DEFAULT_REWARD_CONFIG.coinValues.incorrect,
        bonus: config.coinValues?.bonus ?? DEFAULT_REWARD_CONFIG.coinValues.bonus,
        streakMultiplier: config.coinValues?.streakMultiplier ?? DEFAULT_REWARD_CONFIG.coinValues.streakMultiplier
      },
      achievements: config.achievements || [],
      popupSettings: {
        ...DEFAULT_REWARD_CONFIG.popupSettings,
        ...config.popupSettings
      },
      adSenseConfig: {
        ...DEFAULT_REWARD_CONFIG.adSenseConfig,
        ...config.adSenseConfig
      },
      isEnabled: config.isEnabled ?? DEFAULT_REWARD_CONFIG.isEnabled,
      createdAt: config.createdAt || Date.now(),
      updatedAt: config.updatedAt || Date.now()
    }
    
    return migratedConfig
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Backup and restore functionality
  createBackup(): string {
    const backup = {
      rewardConfig: this.getRewardConfig(),
      timestamp: Date.now(),
      version: '1.0'
    }

    return JSON.stringify(backup, null, 2)
  }

  restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData)

      if (!backup.rewardConfig) {
        throw new RewardDataError('Invalid backup format: missing reward config', 'INVALID_BACKUP')
      }

      // Validate the backup data
      this.validateRewardConfig(backup.rewardConfig)

      // Create current backup before restore
      const currentBackup = this.createBackup()
      this.safeSetItem(REWARD_STORAGE_KEYS.BACKUP, currentBackup)

      // Restore data
      this.safeSetItem(REWARD_STORAGE_KEYS.CONFIG, JSON.stringify(backup.rewardConfig))

      return true
    } catch (error) {
      throw new RewardDataError(
        `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESTORE_FAILED'
      )
    }
  }

  // Reset to defaults
  resetToDefaults(): RewardConfig {
    // Create backup before reset
    const currentBackup = this.createBackup()
    this.safeSetItem(REWARD_STORAGE_KEYS.BACKUP, currentBackup)

    // Clear current config and reinitialize
    localStorage.removeItem(REWARD_STORAGE_KEYS.CONFIG)
    return this.initializeWithDefaults()
  }

  // Export configuration as JSON
  exportConfig(): string {
    const config = this.getRewardConfig()
    return JSON.stringify(config, null, 2)
  }

  // Import configuration from JSON
  importConfig(configData: string): RewardConfig {
    try {
      const config = JSON.parse(configData)
      this.validateRewardConfig(config)

      // Create backup before import
      const currentBackup = this.createBackup()
      this.safeSetItem(REWARD_STORAGE_KEYS.BACKUP, currentBackup)

      // Import the new configuration
      const importedConfig = this.validateAndMigrateConfig(config)
      this.safeSetItem(REWARD_STORAGE_KEYS.CONFIG, JSON.stringify(importedConfig))

      return importedConfig
    } catch (error) {
      throw new RewardDataError(
        `Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'IMPORT_FAILED'
      )
    }
  }
}

// Export singleton instance
export const rewardDataManager = RewardDataManager.getInstance()
