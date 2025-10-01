// ===================================================================
// TechKwiz Reward Data Management System
// ===================================================================
// This file contains the RewardDataManager class responsible for handling
// all reward-related data operations including CRUD operations for achievements,
// reward configurations, and preview data generation. It uses localStorage for persistence.

import { 
  RewardConfig, 
  Achievement,
  RewardPreviewData,
  REWARD_STORAGE_KEYS,
  DEFAULT_REWARD_CONFIG,
  DEFAULT_ACHIEVEMENT_TEMPLATES 
} from '@/types/reward'

// Validation rules to ensure reward configuration data integrity
export const REWARD_VALIDATION_RULES = {
  COIN_MIN_VALUE: 1,                    // Minimum coin value
  COIN_MAX_VALUE: 1000,                 // Maximum coin value
  STREAK_MIN_MULTIPLIER: 1,             // Minimum streak multiplier
  STREAK_MAX_MULTIPLIER: 10,            // Maximum streak multiplier
  POPUP_MIN_DURATION: 1,                // Minimum popup duration (seconds)
  POPUP_MAX_DURATION: 10,               // Maximum popup duration (seconds)
  AD_MIN_FREQUENCY: 1,                  // Minimum ad frequency
  AD_MAX_FREQUENCY: 20,                 // Maximum ad frequency
  ACHIEVEMENT_NAME_MIN_LENGTH: 3,       // Minimum achievement name length
  ACHIEVEMENT_NAME_MAX_LENGTH: 50,      // Maximum achievement name length
  ACHIEVEMENT_DESC_MIN_LENGTH: 10,      // Minimum achievement description length
  ACHIEVEMENT_DESC_MAX_LENGTH: 200,     // Maximum achievement description length
  REQUIREMENT_MIN_VALUE: 1,             // Minimum requirement value
  REQUIREMENT_MAX_VALUE: 1000           // Maximum requirement value
} as const

// Custom error class for reward data operations
export class RewardDataError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'RewardDataError'
    this.code = code
  }
}

// Singleton class for managing all reward-related data operations
// Uses localStorage for client-side data persistence
class RewardDataManager {
  // Singleton instance
  private static instance: RewardDataManager

  // Get singleton instance of RewardDataManager
  static getInstance(): RewardDataManager {
    if (!RewardDataManager.instance) {
      RewardDataManager.instance = new RewardDataManager()
    }
    return RewardDataManager.instance
  }

  // Safe localStorage getItem with error handling
  // Returns null if operation fails
  private safeGetItem(key: string): string | null {
    try {
      // Attempt to retrieve item from localStorage
      return localStorage.getItem(key)
    } catch (error) {
      // Log error and return null if operation fails
      console.error(`Error reading from localStorage key ${key}:`, error)
      return null
    }
  }

  // Safe localStorage setItem with error handling
  // Returns boolean indicating success/failure
  private safeSetItem(key: string, value: string): boolean {
    try {
      // Attempt to save item to localStorage
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      // Log error and handle storage quota exceeded error
      console.error(`Error writing to localStorage key ${key}:`, error)
      if (error instanceof DOMException && error.code === 22) {
        throw new RewardDataError('Storage quota exceeded. Please clear some data.', 'QUOTA_EXCEEDED')
      }
      return false
    }
  }

  // ===================================================================
  // Reward Configuration CRUD Operations
  // ===================================================================
  
  // Retrieve reward configuration from localStorage
  // If no data exists, initializes with default configuration
  getRewardConfig(): RewardConfig {
    const data = this.safeGetItem(REWARD_STORAGE_KEYS.CONFIG)
    if (!data) return this.initializeWithDefaults()
    
    try {
      const config = JSON.parse(data)
      // Validate and migrate config to ensure compatibility
      return this.validateAndMigrateConfig(config)
    } catch (error) {
      console.error('Error parsing reward config data:', error)
      // Return default configuration if parsing fails
      return this.initializeWithDefaults()
    }
  }

  // Save updated reward configuration
  // Merges provided config with existing config and validates
  saveRewardConfig(config: Partial<Omit<RewardConfig, 'id' | 'createdAt'>>): RewardConfig {
    // Get current configuration
    const currentConfig = this.getRewardConfig()
    
    // Create updated configuration by merging current with provided updates
    const updatedConfig: RewardConfig = {
      ...currentConfig,           // Start with current config
      ...config,                  // Apply updates
      updatedAt: Date.now()       // Update timestamp
    }
    
    // Validate updated configuration
    this.validateRewardConfig(updatedConfig)
    
    // Save updated configuration to localStorage
    this.safeSetItem(REWARD_STORAGE_KEYS.CONFIG, JSON.stringify(updatedConfig))
    
    // Return the updated configuration
    return updatedConfig
  }

  // ===================================================================
  // Achievement CRUD Operations
  // ===================================================================
  
  // Retrieve all achievements from reward configuration
  getAchievements(): Achievement[] {
    const config = this.getRewardConfig()
    // Return achievements array or empty array if none exist
    return config.achievements || []
  }

  // Alias for getAchievements for compatibility
  getAllAchievements(): Achievement[] {
    return this.getAchievements()
  }

  // Save a new achievement to the achievements list
  // Validates achievement before saving and assigns ID/timestamps
  saveAchievement(achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>): Achievement {
    // Validate achievement data before saving
    this.validateAchievement(achievement)
    
    // Get current reward configuration
    const config = this.getRewardConfig()
    
    // Create timestamp for new achievement
    const now = Date.now()
    
    // Create new achievement object with ID and timestamps
    const newAchievement: Achievement = {
      ...achievement,             // Achievement data
      id: this.generateId('ach'), // Generate unique ID with 'ach' prefix
      createdAt: now,             // Set creation timestamp
      updatedAt: now              // Set update timestamp
    }
    
    // Add new achievement to achievements array
    config.achievements.push(newAchievement)
    
    // Save updated configuration
    this.saveRewardConfig({ achievements: config.achievements })
    
    // Return the newly created achievement
    return newAchievement
  }

  // Update an existing achievement by ID
  // Throws error if achievement not found
  updateAchievement(id: string, updates: Partial<Omit<Achievement, 'id' | 'createdAt'>>): Achievement {
    // Get current reward configuration
    const config = this.getRewardConfig()
    
    // Find index of achievement to update
    const index = config.achievements.findIndex(a => a.id === id)
    
    // Throw error if achievement not found
    if (index === -1) {
      throw new RewardDataError(`Achievement with id ${id} not found`, 'NOT_FOUND')
    }
    
    // Create updated achievement object
    const updatedAchievement = {
      ...config.achievements[index],  // Start with existing achievement data
      ...updates,                     // Apply updates
      updatedAt: Date.now()           // Update timestamp
    }
    
    // Validate updated achievement
    this.validateAchievement(updatedAchievement)
    
    // Replace old achievement with updated achievement
    config.achievements[index] = updatedAchievement
    
    // Save updated configuration
    this.saveRewardConfig({ achievements: config.achievements })
    
    // Return the updated achievement
    return updatedAchievement
  }

  // Delete an achievement by ID
  // Returns true if successful, throws error if achievement not found
  deleteAchievement(id: string): boolean {
    // Get current reward configuration
    const config = this.getRewardConfig()
    
    // Filter out achievement with matching ID
    const filteredAchievements = config.achievements.filter(a => a.id !== id)
    
    // Throw error if no achievement was removed (not found)
    if (filteredAchievements.length === config.achievements.length) {
      throw new RewardDataError(`Achievement with id ${id} not found`, 'NOT_FOUND')
    }
    
    // Save updated configuration with filtered achievements
    this.saveRewardConfig({ achievements: filteredAchievements })
    
    // Return success
    return true
  }

  // ===================================================================
  // Achievement Template Operations
  // ===================================================================
  
  // Create a new achievement from a predefined template
  // Returns the newly created achievement
  createAchievementFromTemplate(templateIndex: number): Achievement {
    // Validate template index
    if (templateIndex < 0 || templateIndex >= DEFAULT_ACHIEVEMENT_TEMPLATES.length) {
      throw new RewardDataError('Invalid template index', 'INVALID_TEMPLATE')
    }
    
    // Get template from default templates
    const template = DEFAULT_ACHIEVEMENT_TEMPLATES[templateIndex]
    
    // Save and return new achievement based on template
    return this.saveAchievement(template)
  }

  // ===================================================================
  // Preview Data Generation
  // ===================================================================
  
  // Generate preview data for different reward types
  // Used for admin interface previews
  generatePreviewData(type: RewardPreviewData['type'], customCoins?: number): RewardPreviewData {
    // Get current reward configuration
    const config = this.getRewardConfig()
    
    // Generate preview data based on type
    switch (type) {
      // Correct answer preview
      case 'correct':
        return {
          type: 'correct',
          coins: customCoins || config.coinValues.correct,  // Use custom coins or default
          message: config.popupSettings.customMessages.correct.replace('{coins}', (customCoins || config.coinValues.correct).toString()),
          funFact: config.popupSettings.showFunFact ? 'This is a sample fun fact for preview!' : undefined
        }
      
      // Incorrect answer preview
      case 'incorrect':
        return {
          type: 'incorrect',
          coins: customCoins || config.coinValues.incorrect,  // Use custom coins or default
          message: config.popupSettings.customMessages.incorrect.replace('{coins}', (customCoins || config.coinValues.incorrect).toString())
        }
      
      // Bonus reward preview
      case 'bonus':
        return {
          type: 'bonus',
          coins: customCoins || config.coinValues.bonus,  // Use custom coins or default
          message: config.popupSettings.customMessages.bonus.replace('{coins}', (customCoins || config.coinValues.bonus).toString()),
          funFact: config.popupSettings.showFunFact ? 'Bonus questions often contain interesting trivia!' : undefined
        }
      
      // Achievement unlock preview
      case 'achievement':
        // Get sample achievement template from config or defaults
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
      
      console.info('✅ Successfully restored reward data from backup')
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
