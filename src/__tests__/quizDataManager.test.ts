import { describe, expect, it, beforeEach } from '@jest/globals'
import { quizDataManager } from '@/utils/quizDataManager'
import { QUIZ_STORAGE_KEYS } from '@/types/quiz'

const manager = quizDataManager as unknown as {
  questionCache?: Map<string, unknown>
}

describe('quizDataManager unified questions', () => {
  beforeEach(() => {
    localStorage.clear()
    manager.questionCache?.clear?.()
  })

  it('returns admin homepage questions when available', async () => {
    const adminQuestions = Array.from({ length: 5 }).map((_, index) => ({
      id: `admin-${index}`,
      question: `Question ${index}`,
      options: ['A', 'B', 'C', 'D'],
      correct_answer: 0,
      difficulty: 'beginner' as const,
      fun_fact: 'Fun fact',
      category: 'homepage',
      subcategory: 'general',
      section: 'homepage' as const,
    }))

    localStorage.setItem(QUIZ_STORAGE_KEYS.QUESTIONS, JSON.stringify(adminQuestions))

    const questions = await quizDataManager.getUnifiedQuestions('homepage', 5, 'homepage')

    expect(questions.length).toBeGreaterThanOrEqual(3)
    expect(questions[0].id).toBe('admin-0')
  })

  it('falls back to sample questions when admin data is missing', async () => {
    const questions = await quizDataManager.getUnifiedQuestions('unknown-category', 5, 'homepage')

    expect(questions.length).toBeGreaterThanOrEqual(3)
    const uniqueIds = new Set(questions.map(question => question.id))
    expect(uniqueIds.size).toBeGreaterThan(1)
  })
})
