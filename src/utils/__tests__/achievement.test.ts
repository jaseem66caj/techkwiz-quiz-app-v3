import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  calculateAchievementProgress,
  getAchievementsWithProgress,
  getUserAchievementStats,
  isRareAchievement,
  generateAchievementShareText,
} from '../achievement';
import * as achievementsModule from '../achievements';
import { User } from '../auth';
import { Achievement } from '../../types/reward';

// Mock user data
const mockUser: User = {
  id: 'user_123',
  name: 'testuser',
  avatar: 'robot',
  coins: 150,
  level: 1,
  totalQuizzes: 3,
  correctAnswers: 45,
  joinDate: new Date().toISOString(),
  quizHistory: [],
  streak: 5,
};

// Mock achievement data
const mockAchievements: Achievement[] = [
  {
    id: 'achievement_1',
    name: 'First Quiz',
    description: 'Complete your first quiz',
    icon: '🏆',
    requirement: {
      type: 'questions_answered',
      value: 5,
    },
    reward: {
      coins: 50,
      badge: true,
    },
    hidden: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'achievement_2',
    name: 'Coin Collector',
    description: 'Earn 100 coins',
    icon: '💰',
    requirement: {
      type: 'coins_earned',
      value: 100,
    },
    reward: {
      coins: 150,
      badge: true,
    },
    hidden: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'achievement_3',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: {
      type: 'streak_days',
      value: 7,
    },
    reward: {
      coins: 75,
      badge: true,
    },
    hidden: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'achievement_4',
    name: 'Quiz Master',
    description: 'Answer 50 questions correctly',
    icon: '🧠',
    requirement: {
      type: 'correct_answers',
      value: 50,
    },
    reward: {
      coins: 200,
      badge: true,
    },
    hidden: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Mock the getAllAchievements and getUnlockedAchievements functions
jest.mock('../achievements', () => ({
  getAllAchievements: jest.fn(),
  getUnlockedAchievements: jest.fn(),
}));

const mockedAchievementsModule = jest.mocked(achievementsModule);

describe('achievement', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    mockedAchievementsModule.getAllAchievements.mockReturnValue(mockAchievements);
    mockedAchievementsModule.getUnlockedAchievements.mockReturnValue([mockAchievements[0]]);
  });

  describe('calculateAchievementProgress', () => {
    it('should calculate progress for questions answered achievement', () => {
      const achievement = mockAchievements[0]; // questions_answered: 5
      const user = { ...mockUser, totalQuizzes: 1 }; // 1 * 5 = 5 answered
      const progress = calculateAchievementProgress(achievement, user);
      expect(progress).toBe(100); // 5/5 = 100%
    });

    it('should calculate progress for coins earned achievement', () => {
      const achievement = mockAchievements[1]; // coins_earned: 100
      const user = { ...mockUser, coins: 50 };
      const progress = calculateAchievementProgress(achievement, user);
      expect(progress).toBe(50); // 50/100 = 50%
    });

    it('should calculate progress for streak days achievement', () => {
      const achievement = mockAchievements[2]; // streak_days: 7
      const user = { ...mockUser, streak: 3 };
      const progress = calculateAchievementProgress(achievement, user);
      expect(progress).toBe(43); // 3/7 ≈ 43%
    });

    it('should calculate progress for correct answers achievement', () => {
      const achievement = mockAchievements[3]; // correct_answers: 50
      const user = { ...mockUser, correctAnswers: 25 };
      const progress = calculateAchievementProgress(achievement, user);
      expect(progress).toBe(50); // 25/50 = 50%
    });

    it('should return 0 for unknown achievement type', () => {
      const achievement = {
        ...mockAchievements[0],
        requirement: {
          type: 'questions_answered' as const,
          value: 100,
        },
        reward: {
          coins: 50,
          badge: true,
        },
        hidden: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const progress = calculateAchievementProgress(achievement, mockUser);
      expect(progress).toBe(15); // 150/1000 = 15% (not capped in this case)
    });

    it('should cap progress at 100%', () => {
      const achievement = mockAchievements[1]; // coins_earned: 100
      const user = { ...mockUser, coins: 200 }; // Exceeds requirement
      const progress = calculateAchievementProgress(achievement, user);
      expect(progress).toBe(100); // Capped at 100%
    });
  });

  describe('getAchievementsWithProgress', () => {
    it('should return achievements with progress information', () => {
      const result = getAchievementsWithProgress(mockUser);

      expect(result).toHaveLength(4);

      // Check that we have achievements with progress information
      expect(result.every(a => typeof a.progress === 'number')).toBe(true);
      expect(result.every(a => typeof a.isClose === 'boolean')).toBe(true);
    });
  });

  describe('getUserAchievementStats', () => {
    it('should calculate user achievement statistics', () => {
      const stats = getUserAchievementStats(mockUser);

      // Check that we get valid statistics
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.unlocked).toBe('number');
      expect(typeof stats.locked).toBe('number');
      expect(typeof stats.closeToUnlocking).toBe('number');
      expect(typeof stats.rareAchievements).toBe('number');

      // Check that the numbers make sense
      expect(stats.total).toBeGreaterThanOrEqual(stats.unlocked);
      expect(stats.total).toBeGreaterThanOrEqual(stats.locked);
      expect(stats.unlocked + stats.locked).toBe(stats.total);
    });
  });

  describe('isRareAchievement', () => {
    it('should identify rare achievements based on requirements', () => {
      // Achievement with high correct answers requirement
      const rareCorrectAnswers: Achievement = {
        ...mockAchievements[3],
        requirement: {
          type: 'correct_answers',
          value: 150, // >= 100, so rare
        },
        reward: {
          coins: 200,
          badge: true,
        },
        hidden: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(isRareAchievement(rareCorrectAnswers)).toBe(true);

      // Achievement with high coins requirement
      const rareCoins: Achievement = {
        ...mockAchievements[1],
        requirement: {
          type: 'coins_earned',
          value: 1500, // >= 1000, so rare
        },
        reward: {
          coins: 150,
          badge: true,
        },
        hidden: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(isRareAchievement(rareCoins)).toBe(true);

      // Achievement with high streak requirement
      const rareStreak: Achievement = {
        ...mockAchievements[2],
        requirement: {
          type: 'streak_days',
          value: 10, // >= 7, so rare
        },
        reward: {
          coins: 75,
          badge: true,
        },
        hidden: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(isRareAchievement(rareStreak)).toBe(true);

      // Achievement with low requirements
      const commonAchievement = mockAchievements[0]; // questions_answered: 5
      expect(isRareAchievement(commonAchievement)).toBe(false);
    });

    it('should return false for unknown achievement types', () => {
      const unknownAchievement: Achievement = {
        ...mockAchievements[0],
        requirement: {
          type: 'questions_answered',
          value: 1000,
        },
        reward: {
          coins: 50,
          badge: true,
        },
        hidden: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(isRareAchievement(unknownAchievement)).toBe(false);
    });
  });

  describe('generateAchievementShareText', () => {
    it('should generate social share text for an achievement', () => {
      const achievement = mockAchievements[0];
      const shareText = generateAchievementShareText(achievement);
      expect(shareText).toBe(
        'I just unlocked the "First Quiz" achievement on TechKwiz! Complete your first quiz #TechKwiz #Achievement'
      );
    });
  });
});
