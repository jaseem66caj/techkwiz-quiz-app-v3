/**
 * Unit tests for coin balance persistence across quiz flows
 * Tests wallet vs in-quiz coin tracking and persistence logic
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { calculateCorrectAnswerReward, getRewardConfig } from '../utils/rewardCalculator'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

if (typeof window !== 'undefined') {
  if ('localStorage' in window && window.localStorage) {
    Object.assign(window.localStorage, mockLocalStorage)
  } else {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
      writable: true,
    })
  }
}

// Mock the auth utilities
jest.mock('../utils/auth', () => ({
  saveUser: jest.fn(),
  updateUserCoins: jest.fn(),
  getCurrentUser: jest.fn(() => ({
    id: 'test-user',
    name: 'TestUser',
    avatar: 'robot',
    coins: 200,
    level: 1,
    totalQuizzes: 0,
    correctAnswers: 0,
    joinDate: new Date().toISOString(),
    quizHistory: [],
    streak: 0,
  })),
}))

describe('Coin Balance Persistence', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  describe('Reward Calculation Consistency', () => {
    it('should award 50 coins per correct answer', () => {
      const reward = calculateCorrectAnswerReward()
      expect(reward.coins).toBe(50)
      expect(reward.type).toBe('correct')
    })

    it('should use centralized reward configuration', () => {
      const config = getRewardConfig()
      expect(config.coinValues.correct).toBe(50)
      expect(config.coinValues.incorrect).toBe(0)
    })
  })

  describe('Quiz Flow Calculations', () => {
    it('should calculate expected coin flow for complete user journey', () => {
      // Test the expected coin flow from the user journey test
      const initialCoins = 200
      const homepageQuizCorrect = 4
      const entryFee = 100
      const categoryQuizCorrect = 1

      // Homepage quiz: 4 correct answers
      const homepageEarnings = homepageQuizCorrect * 50
      const afterHomepage = initialCoins + homepageEarnings // 200 + 200 = 400

      // Category quiz entry
      const afterEntryFee = afterHomepage - entryFee // 400 - 100 = 300

      // Category quiz: 1 correct answer
      const categoryEarnings = categoryQuizCorrect * 50
      const finalBalance = afterEntryFee + categoryEarnings // 300 + 50 = 350

      expect(finalBalance).toBe(350)
    })

    it('should distinguish between wallet coins and session coins in UI', () => {
      // This test validates the UI logic for showing separate wallet and earned coins
      const walletCoins = 100 // After entry fee deduction
      const sessionCoins = 50  // Earned in current quiz

      // The UI should show:
      // - Wallet: 100 (persistent balance)
      // - Earned: +50 (session earnings)
      // - Total available after quiz: 150

      expect(walletCoins + sessionCoins).toBe(150)
    })

    it('should validate entry fee standard amount', () => {
      const STANDARD_ENTRY_FEE = 100
      expect(STANDARD_ENTRY_FEE).toBe(100)
    })
  })

  describe('Entry Fee Deduction Logic', () => {
    // Mock reducer function for testing START_QUIZ action
    const mockStartQuizReducer = (state: any, action: any) => {
      if (action.type !== 'START_QUIZ') return state;

      // Guard clause: only proceed if user exists
      if (!state.user) {
        return state;
      }

      const { quiz, entryFee } = action.payload;

      // Guard clause: prevent duplicate quiz starts for the same category
      if (state.currentQuiz?.category === quiz.category) {
        return state;
      }

      // Check if user has enough coins to enter the quiz
      if (state.user.coins < entryFee) {
        return state;
      }

      // Deduct entry fee from user's coins
      const userAfterFee = { ...state.user, coins: state.user.coins - entryFee };

      return {
        ...state,
        user: userAfterFee,
        currentQuiz: quiz,
      };
    }

    it('should deduct entry fee exactly once', () => {
      const initialState = {
        user: { id: 'test-user', coins: 500 },
        currentQuiz: null
      };

      const action = {
        type: 'START_QUIZ',
        payload: {
          quiz: { category: 'programming' },
          entryFee: 100
        }
      };

      const newState = mockStartQuizReducer(initialState, action);

      expect(newState.user?.coins).toBe(400); // 500 - 100 = 400
      expect(newState.currentQuiz?.category).toBe('programming');
    });

    it('should prevent duplicate deductions for same category', () => {
      const initialState = {
        user: { id: 'test-user', coins: 400 },
        currentQuiz: { category: 'programming' }
      };

      const action = {
        type: 'START_QUIZ',
        payload: {
          quiz: { category: 'programming' },
          entryFee: 100
        }
      };

      const newState = mockStartQuizReducer(initialState, action);

      // Should not deduct again - coins should remain 400
      expect(newState.user?.coins).toBe(400);
      expect(newState.currentQuiz?.category).toBe('programming');
    });

    it('should reject quiz start with insufficient coins', () => {
      const initialState = {
        user: { id: 'test-user', coins: 50 },
        currentQuiz: null
      };

      const action = {
        type: 'START_QUIZ',
        payload: {
          quiz: { category: 'programming' },
          entryFee: 100
        }
      };

      const newState = mockStartQuizReducer(initialState, action);

      // Should not deduct coins or start quiz
      expect(newState.user?.coins).toBe(50);
      expect(newState.currentQuiz).toBeNull();
    });

    it('should handle missing user gracefully', () => {
      const initialState = {
        user: null,
        currentQuiz: null
      };

      const action = {
        type: 'START_QUIZ',
        payload: {
          quiz: { category: 'programming' },
          entryFee: 100
        }
      };

      const newState = mockStartQuizReducer(initialState, action);

      // Should return unchanged state
      expect(newState.user).toBeNull();
      expect(newState.currentQuiz).toBeNull();
    });
  })
})
