'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { QuizQuestion } from '@/types/quiz'
import { quizDataManager } from '@/utils/quizDataManager'

function createFallbackQuestions(): QuizQuestion[] {
  return [
    {
      id: 'fallback-1',
      question: "Which social media platform is known for short-form videos?",
      options: ["Instagram", "TikTok", "Twitter", "Snapchat"],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: "TikTok was originally called Musical.ly!",
      category: 'social-media',
      subcategory: 'social-media',
    },
    {
      id: 'fallback-2',
      question: "What does 'AI' stand for?",
      options: [
        'Artificial Intelligence',
        'Automated Internet',
        'Advanced Interface',
        'Algorithmic Integration',
      ],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: "The term 'Artificial Intelligence' was first coined in 1956!",
      category: 'technology',
      subcategory: 'technology',
    },
    {
      id: 'fallback-3',
      question: 'Which company created the iPhone?',
      options: ['Google', 'Samsung', 'Apple', 'Microsoft'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'The first iPhone was released in 2007!',
      category: 'technology',
      subcategory: 'technology',
    },
    {
      id: 'fallback-4',
      question: "What does 'URL' stand for?",
      options: [
        'Universal Resource Locator',
        'Uniform Resource Locator',
        'Unified Resource Locator',
        'Unique Resource Locator',
      ],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'The first website was created in 1991 by Tim Berners-Lee!',
      category: 'technology',
      subcategory: 'technology',
    },
    {
      id: 'fallback-5',
      question: 'Which of these is NOT a programming language?',
      options: ['Python', 'Java', 'Cobra', 'Snake'],
      correct_answer: 3,
      difficulty: 'beginner',
      fun_fact: 'Python was named after the comedy group Monty Python!',
      category: 'technology',
      subcategory: 'technology',
    },
  ]
}

export function useHomepageQuizQuestions() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fallbackQuestions = useCallback(() => createFallbackQuestions(), [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      setQuestions(fallbackQuestions())
      setIsLoading(false)
      return
    }

    const loadQuestions = async () => {
      setIsLoading(true)

      try {
        const gameSyncData = localStorage.getItem('game_quiz_data')
        let loadedQuestions: QuizQuestion[] = []

        if (gameSyncData) {
          loadedQuestions = JSON.parse(gameSyncData)
        } else {
          try {
            loadedQuestions = quizDataManager.getQuestions() || []
          } catch (error) {
            console.error('Error loading admin questions:', error)
            loadedQuestions = []
          }
        }

        const homepageQuestions = loadedQuestions.filter(
          question => question.section === 'homepage'
        )
        const beginnerQuestions = loadedQuestions.filter(
          question => question.difficulty === 'beginner'
        )
        const selectedQuestions =
          homepageQuestions.length >= 5 ? homepageQuestions : beginnerQuestions

        if (selectedQuestions.length >= 5) {
          const normalized = selectedQuestions.slice(0, 5).map(question => ({
            id: question.id,
            question: question.question,
            options: question.options,
            correct_answer: question.correct_answer ?? 0,
            difficulty: question.difficulty,
            fun_fact: question.fun_fact || 'Thanks for playing!',
            category: question.category,
            subcategory: question.subcategory || question.category,
            question_type: question.question_type,
            emoji_clue: question.emoji_clue,
            visual_options: question.visual_options,
            personality_trait: question.personality_trait,
            prediction_year: question.prediction_year,
            section: question.section,
            tags: question.tags,
            type: question.type,
            createdAt: question.createdAt,
            updatedAt: question.updatedAt,
          }))

          setQuestions(normalized)
        } else {
          setQuestions(fallbackQuestions())
        }
      } catch (error) {
        console.error('❌ Error loading quiz questions:', error)
        setQuestions(fallbackQuestions())
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [fallbackQuestions])

  const quickStartQuiz = useMemo(() => {
    return questions.length > 0 ? questions : fallbackQuestions()
  }, [questions, fallbackQuestions])

  return {
    quickStartQuiz,
    isLoading,
  }
}
