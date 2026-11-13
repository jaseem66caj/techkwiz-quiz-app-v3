'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { QuizQuestion } from '@/types/quiz'
import { QUIZ_DATABASE } from '@/data/quizDatabase'
import { autoMigrateQuestion } from '@/utils/quizDataMigration'
import { quizDataManager } from '@/utils/quizDataManager'

type CategoryState = {
  user: { coins: number } | null
  currentQuiz: { category: string } | null
}

// Keep useful SSR content while the shuffled round loads after hydration.
function getStaticQuestions(categoryId: string): QuizQuestion[] {
  return (QUIZ_DATABASE[categoryId] || []).slice(0, 5).map(autoMigrateQuestion)
}

/** Load a free public round; enable answers only after its question set settles. */
export function useCategoryQuizLoader(
  categoryId: string,
  state: CategoryState,
  dispatch: Dispatch<{ type: string; payload?: unknown }>
) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => getStaticQuestions(categoryId))
  const [error, setError] = useState('')
  const [canPlay, setCanPlay] = useState(false)
  const interactionFrozenRef = useRef(false)
  const markInteractionStarted = useCallback(() => {
    interactionFrozenRef.current = true
  }, [])
  const hasUser = Boolean(state.user)

  useEffect(() => {
    if (!hasUser) return
    let cancelled = false
    setCanPlay(false)
    setError('')
    dispatch({ type: 'START_QUIZ', payload: { quiz: { category: categoryId } } })

    const initialize = async () => {
      try {
        const loaded = await quizDataManager.getUnifiedQuestions(categoryId, 5, 'category')
        if (cancelled || interactionFrozenRef.current) return
        if (loaded.length) setQuestions(loaded)
        setCanPlay(true)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load quiz')
      }
    }
    void initialize()
    return () => { cancelled = true }
  }, [categoryId, hasUser, dispatch])

  return { questions, error, canPlay, markInteractionStarted }
}
