'use client'

import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { QuizQuestion } from '@/types/quiz'
import { QUIZ_DATABASE, QUIZ_CATEGORIES } from '@/data/quizDatabase'
import { autoMigrateQuestion } from '@/utils/quizDataMigration'
import { quizDataManager } from '@/utils/quizDataManager'
import { calculateQuizReward } from '@/utils/rewardCalculator'

interface CategoryQuizLoaderResult {
  questions: QuizQuestion[]
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

const STANDARD_ENTRY_FEE = 100

// Synchronous first-paint source: the static question bank, migrated to the
// unified shape. No localStorage/async round-trip needed, so this can run
// during the initial render (and on the server) to avoid a loading spinner.
function getStaticQuestions(categoryId: string): QuizQuestion[] {
  const staticQuestions = QUIZ_DATABASE[categoryId] || []

  const migrated: QuizQuestion[] = []
  for (const question of staticQuestions.slice(0, 5)) {
    try {
      migrated.push(autoMigrateQuestion(question))
    } catch (error) {
      console.warn(`Failed to migrate static question ${question.id}:`, error)
    }
  }
  return migrated
}

/**
 * Load and validate a category quiz with entry-fee checks and unified question shaping.
 * - Renders the static question bank synchronously on first paint (no spinner).
 * - Ensures the user has sufficient coins, exposing `insufficientCoins` when not.
 * - Computes earning potential for UX when blocked by balance.
 * - Dispatches START_QUIZ exactly once per category to prevent double deductions.
 */
export function useCategoryQuizLoader(
  categoryId: string,
  state: CategoryState,
  dispatch: Dispatch<{ type: string; payload?: unknown }>
): CategoryQuizLoaderResult {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => getStaticQuestions(categoryId))
  const [error, setError] = useState('')
  const [insufficientCoins, setInsufficientCoins] = useState(false)
  const [earningPotential, setEarningPotential] = useState(0)

  // Tracks which category has already run the entry-fee check / START_QUIZ
  // dispatch, independent of `questions.length` (which is non-zero from the
  // first render now that static questions are preloaded).
  const initializedCategoryRef = useRef<string | null>(null)

  useEffect(() => {
    if (!categoryId) {
      return
    }

    // User hydrates asynchronously (see Providers) — keep showing the static
    // questions already rendered until it's available, then run the real
    // entry-fee check once per category.
    if (!state.user) {
      return
    }

    if (initializedCategoryRef.current === categoryId) {
      return
    }

    if (state.currentQuiz?.category === categoryId) {
      initializedCategoryRef.current = categoryId
      return
    }

    if (state.user.coins < STANDARD_ENTRY_FEE) {
      try {
        const potential = calculateQuizReward(5, 5).totalCoins
        setEarningPotential(potential)
      } catch {
        setEarningPotential(0)
      }

      setInsufficientCoins(true)
      initializedCategoryRef.current = categoryId
      return
    }

    const initialize = async () => {
      setError('')
      setInsufficientCoins(false)

      try {
        const categoryInfo = QUIZ_CATEGORIES[categoryId]
        const entryFee = categoryInfo ? categoryInfo.entry_fee : STANDARD_ENTRY_FEE

        // Guard against potential null user across async boundaries
        const user = state.user
        if (!user) {
          setInsufficientCoins(true)
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
          return
        }

        dispatch({ type: 'START_QUIZ', payload: { quiz: { category: categoryId }, entryFee } })

        const unifiedQuestions = await quizDataManager.getUnifiedQuestions(categoryId, 5, 'category')
        // Same 5-question shape as the static preload, so this swap does not
        // shift layout — only upgrade if we actually got something back.
        if (unifiedQuestions.length > 0) {
          setQuestions(unifiedQuestions)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
      } finally {
        initializedCategoryRef.current = categoryId
      }
    }

    initialize()
  }, [categoryId, state.user, state.currentQuiz, dispatch])

  return {
    questions,
    error,
    insufficientCoins,
    earningPotential,
  }
}
