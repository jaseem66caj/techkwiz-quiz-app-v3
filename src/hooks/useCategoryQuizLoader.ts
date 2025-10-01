'use client'

import { useEffect, useState } from 'react'
import type { Dispatch } from 'react'
import type { QuizQuestion } from '@/types/quiz'
import { quizDataManager } from '@/utils/quizDataManager'
import { calculateQuizReward } from '@/utils/rewardCalculator'

interface CategoryQuizLoaderResult {
  questions: QuizQuestion[]
  loading: boolean
  error: string
  insufficientCoins: boolean
  earningPotential: number
}

type CategoryState = {
  user: {
    coins: number
  } | null
  currentQuiz: {
    category: string
  } | null
}

/**
 * Load and validate a category quiz with entry-fee checks and unified question shaping.
 * - Ensures the user has sufficient coins, exposing `insufficientCoins` when not.
 * - Computes earning potential for UX when blocked by balance.
 * - Dispatches START_QUIZ exactly once per category to prevent double deductions.
 */
export function useCategoryQuizLoader(
  categoryId: string,
  state: CategoryState,
  dispatch: Dispatch<{ type: string; payload?: unknown }>
): CategoryQuizLoaderResult {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [insufficientCoins, setInsufficientCoins] = useState(false)
  const [earningPotential, setEarningPotential] = useState(0)

  useEffect(() => {
    if (!categoryId) {
      return
    }

    if (!state.user) {
      setLoading(false)
      return
    }

    if (questions.length > 0 || state.currentQuiz?.category === categoryId) {
      return
    }

    const STANDARD_ENTRY_FEE = 100

    if (state.user.coins < STANDARD_ENTRY_FEE) {
      try {
        const potential = calculateQuizReward(5, 5).totalCoins
        setEarningPotential(potential)
      } catch {
        setEarningPotential(0)
      }

      setInsufficientCoins(true)
      setLoading(false)
      return
    }

    const initialize = async () => {
      setLoading(true)
      setError('')
      setInsufficientCoins(false)

      try {
        const { QUIZ_CATEGORIES } = await import('@/data/quizDatabase')
        const categoryInfo = QUIZ_CATEGORIES[categoryId]
        const entryFee = categoryInfo ? categoryInfo.entry_fee : STANDARD_ENTRY_FEE

        // Guard against potential null user across async boundaries
        const user = state.user
        if (!user) {
          setInsufficientCoins(true)
          setLoading(false)
          return
        }

        if (user.coins < entryFee) {
          try {
            const potential = calculateQuizReward(5, 5).totalCoins
            setEarningPotential(potential)
          } catch {
            setEarningPotential(0)
          }

          setInsufficientCoins(true)
          setLoading(false)
          return
        }

        dispatch({ type: 'START_QUIZ', payload: { quiz: { category: categoryId }, entryFee } })

        const unifiedQuestions = await quizDataManager.getUnifiedQuestions(categoryId, 5, 'category')
        setQuestions(unifiedQuestions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [categoryId, questions.length, state.user, state.currentQuiz, dispatch])

  return {
    questions,
    loading,
    error,
    insufficientCoins,
    earningPotential,
  }
}
