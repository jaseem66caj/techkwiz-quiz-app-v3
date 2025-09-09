import { DEFAULT_REWARD_CONFIG } from '../types/reward'
import { rewardDataManager } from './rewardDataManager'

/**
 * Centralized reward calculation utility
 * Ensures all coin calculations use the standardized configuration
 * and prevents hardcoded values throughout the application
 */

export interface RewardCalculationResult {
  coins: number
  type: 'correct' | 'incorrect' | 'bonus' | 'dailyBonus' | 'streakBonus'
  message: string
}

/**
 * Get the current reward configuration
 * Falls back to DEFAULT_REWARD_CONFIG if no custom config is set
 */
export function getRewardConfig() {
  try {
    const config = rewardDataManager.getRewardConfig()
    return config || DEFAULT_REWARD_CONFIG
  } catch (error) {
    console.warn('Failed to load reward config, using defaults:', error)
    return DEFAULT_REWARD_CONFIG
  }
}

/**
 * Calculate coins for a correct answer
 */
export function calculateCorrectAnswerReward(): RewardCalculationResult {
  const config = getRewardConfig()
  return {
    coins: config.coinValues.correct,
    type: 'correct',
    message: config.popupSettings.customMessages.correct.replace('{coins}', config.coinValues.correct.toString())
  }
}

/**
 * Calculate coins for an incorrect answer
 */
export function calculateIncorrectAnswerReward(): RewardCalculationResult {
  const config = getRewardConfig()
  return {
    coins: config.coinValues.incorrect,
    type: 'incorrect',
    message: config.popupSettings.customMessages.incorrect.replace('{coins}', config.coinValues.incorrect.toString())
  }
}

/**
 * Calculate coins for a bonus question
 * Bonus questions award base correct coins + bonus coins
 */
export function calculateBonusReward(): RewardCalculationResult {
  const config = getRewardConfig()
  const totalCoins = config.coinValues.correct + config.coinValues.bonus
  return {
    coins: totalCoins,
    type: 'bonus',
    message: config.popupSettings.customMessages.bonus.replace('{coins}', totalCoins.toString())
  }
}

/**
 * Calculate coins for a streak bonus
 */
export function calculateStreakBonus(streakLength: number): RewardCalculationResult {
  const config = getRewardConfig()
  const bonusCoins = config.coinValues.streakBonus * streakLength
  return {
    coins: bonusCoins,
    type: 'streakBonus',
    message: `Streak bonus! You earned ${bonusCoins} extra coins for your ${streakLength}-question streak!`
  }
}

/**
 * Calculate total coins earned for a quiz completion
 * @param correctAnswers Number of correct answers
 * @param totalQuestions Total number of questions
 * @param bonusQuestions Number of bonus questions answered correctly
 * @param streakLength Longest streak achieved
 */
export function calculateQuizReward(
  correctAnswers: number,
  totalQuestions: number,
  bonusQuestions: number = 0,
  streakLength: number = 0
): {
  totalCoins: number
  breakdown: {
    correctAnswers: number
    bonusQuestions: number
    streakBonus: number
  }
} {
  const config = getRewardConfig()
  
  const correctCoins = correctAnswers * config.coinValues.correct
  const bonusCoins = bonusQuestions * (config.coinValues.correct + config.coinValues.bonus)
  const streakCoins = streakLength > 1 ? config.coinValues.streakBonus * streakLength : 0
  
  return {
    totalCoins: correctCoins + bonusCoins + streakCoins,
    breakdown: {
      correctAnswers: correctCoins,
      bonusQuestions: bonusCoins,
      streakBonus: streakCoins
    }
  }
}

/**
 * Check if ad rewards are enabled
 */
export function isAdRewardEnabled(): boolean {
  const config = getRewardConfig()
  return config.adSettings.enabled
}

/**
 * Get ad reward amount
 */
export function getAdRewardAmount(): number {
  const config = getRewardConfig()
  return config.adSettings.rewardCoins
}

/**
 * Check if daily bonus is enabled
 */
export function isDailyBonusEnabled(): boolean {
  const config = getRewardConfig()
  return config.coinValues.dailyBonus > 0
}

/**
 * Get daily bonus amount
 */
export function getDailyBonusAmount(): number {
  const config = getRewardConfig()
  return config.coinValues.dailyBonus
}

/**
 * Get actual question count for a category from QUIZ_DATABASE
 * @param categoryId - The category identifier to look up
 * @returns Number of questions in the category, defaults to 5 if not found
 */
function getQuestionCountForCategory(categoryId: string): number {
  try {
    // Import QUIZ_DATABASE dynamically to avoid circular dependencies
    const { QUIZ_DATABASE } = require('../data/quizDatabase')
    const questions = QUIZ_DATABASE[categoryId] || []
    return questions.length
  } catch (error) {
    console.warn(`Failed to load question count for category ${categoryId}, using fallback:`, error)
    return 5 // Fallback to prevent UI breakage
  }
}

/**
 * Calculate maximum possible coins for a category
 * @param input - Either question count (number) or category ID (string) for dynamic lookup
 * @returns Maximum coins based on question count × 50 coins per correct answer
 */
export function calculateCategoryMaxCoins(input: number | string): number {
  const config = getRewardConfig()

  if (typeof input === 'number') {
    // Legacy support: direct question count
    return input * config.coinValues.correct
  } else {
    // Dynamic support: category ID lookup
    const questionCount = getQuestionCountForCategory(input)
    return questionCount * config.coinValues.correct
  }
}

/**
 * Validate that no hardcoded coin values are being used
 * This function can be used in development to ensure consistency
 */
export function validateRewardConsistency() {
  const config = getRewardConfig()
  
  // Log current configuration for debugging
  console.log('🎯 Current Reward Configuration:', {
    correct: config.coinValues.correct,
    incorrect: config.coinValues.incorrect,
    bonus: config.coinValues.bonus,
    dailyBonus: config.coinValues.dailyBonus,
    streakBonus: config.coinValues.streakBonus,
    adEnabled: config.adSettings.enabled,
    adReward: config.adSettings.rewardCoins
  })
  
  // Warn if any unexpected values are found
  if (config.coinValues.correct !== DEFAULT_REWARD_CONFIG.coinValues.correct) {
    console.warn('⚠️ Correct answer reward differs from default configuration')
  }
  
  return config
}
