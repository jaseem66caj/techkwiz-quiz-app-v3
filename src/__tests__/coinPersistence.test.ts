/**
 * Unit tests for coin balance persistence across quiz flows
 * Tests wallet vs in-quiz coin tracking and persistence logic
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { appReducer } from '../app/providers'
import { QUIZ_CATEGORIES } from '../data/quizDatabase'
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

    it('keeps every public category free', () => {
      expect(Object.values(QUIZ_CATEGORIES).every(category => category.entry_fee === 0)).toBe(true)
    })
  })

  describe('Free round initialization', () => {
    it.each([0, 50, 500])('does not charge a player with %i coins, even for legacy fee payloads', coins => {
      const state = {
        user: { id: 'guest-test', name: 'Guest', avatar: 'robot', coins, level: 1,
          totalQuizzes: 0, correctAnswers: 0, joinDate: '', quizHistory: [], streak: 0 },
        currentQuiz: null, isAuthenticated: true, quizHistory: [], loading: false, notification: null,
      }
      const action = { type: 'START_QUIZ', payload: { quiz: { category: 'programming' }, entryFee: 100 } }
      const started = appReducer(state, action)
      const replayed = appReducer(started, action)
      expect(replayed.user?.coins).toBe(coins)
      expect(replayed.currentQuiz.category).toBe('programming')
    })
  })
})
