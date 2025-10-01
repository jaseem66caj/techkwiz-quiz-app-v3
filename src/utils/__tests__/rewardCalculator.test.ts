import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  getRewardConfig,
  calculateCorrectAnswerReward,
  calculateIncorrectAnswerReward,
  calculateBonusReward,
  calculateStreakBonus,
  calculateQuizReward,
  isAdRewardEnabled,
  getAdRewardAmount,
  isDailyBonusEnabled,
  getDailyBonusAmount,
  calculateCategoryMaxCoins,
  validateRewardConsistency,
} from '../rewardCalculator';
import { DEFAULT_REWARD_CONFIG } from '../../types/reward';

// Mock the rewardDataManager
jest.mock('../rewardDataManager', () => ({
  rewardDataManager: {
    getRewardConfig: jest.fn(),
  },
}));

// Mock the QUIZ_DATABASE
jest.mock('../../data/quizDatabase', () => ({
  QUIZ_DATABASE: {
    'test-category': [
      { id: 'q1', question: 'Test question 1' },
      { id: 'q2', question: 'Test question 2' },
      { id: 'q3', question: 'Test question 3' },
    ],
  },
}));

describe('rewardCalculator', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // By default, return the default config
    const { rewardDataManager } = require('../rewardDataManager');
    rewardDataManager.getRewardConfig.mockReturnValue(DEFAULT_REWARD_CONFIG);
  });

  describe('getRewardConfig', () => {
    it('should return the default config when no custom config is set', () => {
      const config = getRewardConfig();
      expect(config).toEqual(DEFAULT_REWARD_CONFIG);
    });

    it('should return the custom config when available', () => {
      const customConfig = {
        ...DEFAULT_REWARD_CONFIG,
        coinValues: {
          ...DEFAULT_REWARD_CONFIG.coinValues,
          correct: 100,
        },
      };

      const { rewardDataManager } = require('../rewardDataManager');
      rewardDataManager.getRewardConfig.mockReturnValue(customConfig);

      const config = getRewardConfig();
      expect(config).toEqual(customConfig);
    });

    it('should return the default config when getRewardConfig throws an error', () => {
      const { rewardDataManager } = require('../rewardDataManager');
      rewardDataManager.getRewardConfig.mockImplementation(() => {
        throw new Error('Failed to load config');
      });

      const config = getRewardConfig();
      expect(config).toEqual(DEFAULT_REWARD_CONFIG);
    });
  });

  describe('calculateCorrectAnswerReward', () => {
    it('should calculate correct answer reward correctly', () => {
      const result = calculateCorrectAnswerReward();
      expect(result.coins).toBe(50);
      expect(result.type).toBe('correct');
      expect(result.message).toContain('50');
    });
  });

  describe('calculateIncorrectAnswerReward', () => {
    it('should calculate incorrect answer reward correctly', () => {
      const result = calculateIncorrectAnswerReward();
      expect(result.coins).toBe(0);
      expect(result.type).toBe('incorrect');
      expect(result.message).toBe('Better luck next time!');
    });
  });

  describe('calculateBonusReward', () => {
    it('should calculate bonus reward correctly', () => {
      const result = calculateBonusReward();
      expect(result.coins).toBe(100); // 50 (correct) + 50 (bonus)
      expect(result.type).toBe('bonus');
      expect(result.message).toContain('100');
    });
  });

  describe('calculateStreakBonus', () => {
    it('should calculate streak bonus correctly', () => {
      const result = calculateStreakBonus(3);
      expect(result.coins).toBe(30); // 3 * 10
      expect(result.type).toBe('streakBonus');
      expect(result.message).toContain('30');
      expect(result.message).toContain('3-question');
    });
  });

  describe('calculateQuizReward', () => {
    it('should calculate quiz reward correctly', () => {
      const result = calculateQuizReward(5, 10, 2, 3);

      // 5 correct answers * 50 coins = 250
      // 2 bonus questions * 100 coins = 200
      // 3 streak length * 10 coins = 30
      // Total = 480

      expect(result.totalCoins).toBe(480);
      expect(result.breakdown.correctAnswers).toBe(250);
      expect(result.breakdown.bonusQuestions).toBe(200);
      expect(result.breakdown.streakBonus).toBe(30);
    });

    it('should handle quiz with no bonus questions or streak', () => {
      const result = calculateQuizReward(5, 10);

      // 5 correct answers * 50 coins = 250
      // No bonus questions = 0
      // No streak = 0
      // Total = 250

      expect(result.totalCoins).toBe(250);
      expect(result.breakdown.correctAnswers).toBe(250);
      expect(result.breakdown.bonusQuestions).toBe(0);
      expect(result.breakdown.streakBonus).toBe(0);
    });
  });

  describe('isAdRewardEnabled', () => {
    it('should return false when ad rewards are disabled', () => {
      const result = isAdRewardEnabled();
      expect(result).toBe(false);
    });

    it('should return true when ad rewards are enabled', () => {
      const { rewardDataManager } = require('../rewardDataManager');
      rewardDataManager.getRewardConfig.mockReturnValue({
        ...DEFAULT_REWARD_CONFIG,
        adSettings: {
          enabled: true,
          rewardCoins: 50,
        },
      });

      const result = isAdRewardEnabled();
      expect(result).toBe(true);
    });
  });

  describe('getAdRewardAmount', () => {
    it('should return the ad reward amount', () => {
      const { rewardDataManager } = require('../rewardDataManager');
      rewardDataManager.getRewardConfig.mockReturnValue({
        ...DEFAULT_REWARD_CONFIG,
        adSettings: {
          enabled: true,
          rewardCoins: 75,
        },
      });

      const result = getAdRewardAmount();
      expect(result).toBe(75);
    });
  });

  describe('isDailyBonusEnabled', () => {
    it('should return false when daily bonus is 0', () => {
      const result = isDailyBonusEnabled();
      expect(result).toBe(false);
    });

    it('should return true when daily bonus is greater than 0', () => {
      const { rewardDataManager } = require('../rewardDataManager');
      rewardDataManager.getRewardConfig.mockReturnValue({
        ...DEFAULT_REWARD_CONFIG,
        coinValues: {
          ...DEFAULT_REWARD_CONFIG.coinValues,
          dailyBonus: 100,
        },
      });

      const result = isDailyBonusEnabled();
      expect(result).toBe(true);
    });
  });

  describe('getDailyBonusAmount', () => {
    it('should return the daily bonus amount', () => {
      const { rewardDataManager } = require('../rewardDataManager');
      rewardDataManager.getRewardConfig.mockReturnValue({
        ...DEFAULT_REWARD_CONFIG,
        coinValues: {
          ...DEFAULT_REWARD_CONFIG.coinValues,
          dailyBonus: 150,
        },
      });

      const result = getDailyBonusAmount();
      expect(result).toBe(150);
    });
  });

  describe('calculateCategoryMaxCoins', () => {
    it('should calculate max coins from question count', () => {
      const result = calculateCategoryMaxCoins(5);
      expect(result).toBe(250); // 5 questions * 50 coins
    });

    it('should calculate max coins from category ID', () => {
      const result = calculateCategoryMaxCoins('test-category');
      expect(result).toBe(150); // 3 questions * 50 coins
    });

    it('should return 0 when category ID is not found', () => {
      const result = calculateCategoryMaxCoins('non-existent-category');
      expect(result).toBe(0); // Empty array * 50 coins
    });
  });

  describe('validateRewardConsistency', () => {
    it('should return the current config', () => {
      const config = validateRewardConsistency();
      expect(config).toEqual(DEFAULT_REWARD_CONFIG);
    });

    it('should warn when correct answer reward differs from default', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const { rewardDataManager } = require('../rewardDataManager');
      rewardDataManager.getRewardConfig.mockReturnValue({
        ...DEFAULT_REWARD_CONFIG,
        coinValues: {
          ...DEFAULT_REWARD_CONFIG.coinValues,
          correct: 100,
        },
      });

      validateRewardConsistency();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '⚠️ Correct answer reward differs from default configuration'
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
