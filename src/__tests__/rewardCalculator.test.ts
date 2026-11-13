import { describe, expect, it } from '@jest/globals'
import { calculateQuizReward, calculateCategoryMaxCoins } from '@/utils/rewardCalculator'
import { DEFAULT_REWARD_CONFIG } from '@/types/reward'
import { QUIZ_DATABASE } from '@/data/quizDatabase'
import { QUESTIONS_PER_ROUND } from '@/config/quiz'

describe('reward calculator utilities', () => {
  it('computes total coins with bonus and streak breakdown', () => {
    const result = calculateQuizReward(3, 5, 1, 2)

    expect(result.totalCoins).toBe(270)
    expect(result.breakdown.correctAnswers).toBe(150)
    expect(result.breakdown.bonusQuestions).toBe(100)
    expect(result.breakdown.streakBonus).toBe(20)
  })

  it('calculates maximum coins for a category based on question count', () => {
    const programmingQuestions = Math.min(QUIZ_DATABASE.programming.length, QUESTIONS_PER_ROUND)
    const expected = programmingQuestions * DEFAULT_REWARD_CONFIG.coinValues.correct

    expect(calculateCategoryMaxCoins('programming')).toBe(expected)
  })
})
