'use client'

import { useCallback, useState } from 'react'
import type { QuizQuestion } from '@/types/quiz'
import { useApp } from '@/app/providers'
import { getUnlockedAchievements } from '@/utils/achievements'
import { calculateCorrectAnswerReward, calculateQuizReward } from '@/utils/rewardCalculator'

interface UseHomepageQuizProgressionResult {
  currentQuestion: number
  selectedAnswer: number | null
  score: number
  showResult: boolean
  quizCompleted: boolean
  setShowResult: (value: boolean) => void
  setQuizCompleted: (value: boolean) => void
  setSelectedAnswer: (value: number | null) => void
  handleAnswerSelect: (answerIndex: number) => void
}

export function useHomepageQuizProgression(questions: QuizQuestion[]): UseHomepageQuizProgressionResult {
  const { state, dispatch, ensureUser } = useApp()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const handleAnswerSelect = useCallback(
    (answerIndex: number) => {
      if (selectedAnswer !== null || !questions.length) {
        return
      }

      ensureUser()
      setSelectedAnswer(answerIndex)

      const question = questions[currentQuestion]
      if (!question) {
        setSelectedAnswer(null)
        return
      }

      const isCorrect = answerIndex === question.correct_answer
      const rewardResult = isCorrect ? calculateCorrectAnswerReward() : { coins: 0 }
      const finalScore = isCorrect ? score + 1 : score

      setTimeout(() => {
        if (isCorrect) {
          setScore(finalScore)
          dispatch({ type: 'UPDATE_COINS', payload: rewardResult.coins })
          console.info(`✅ Correct answer! Earned ${rewardResult.coins} coins`)
        } else {
          setScore(score)
          console.info('❌ Wrong answer, no coins earned')
        }

        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1)
          setSelectedAnswer(null)
          return
        }

        setQuizCompleted(true)
        setShowResult(true)

        const quickQuizLength = questions.length
        const quizRewardResult = calculateQuizReward(finalScore, quickQuizLength)
        const totalCoinsEarned = quizRewardResult.totalCoins

        const currentUser = state.user || {
          id: `guest_${Date.now()}`,
          name: 'Guest',
          avatar: 'robot',
          coins: 0,
          level: 1,
          totalQuizzes: 0,
          correctAnswers: 0,
          joinDate: new Date().toISOString(),
          quizHistory: [],
          streak: 0,
        }

        const updatedUser = {
          ...currentUser,
          totalQuizzes: currentUser.totalQuizzes + 1,
          correctAnswers: currentUser.correctAnswers + finalScore,
          streak: isCorrect ? currentUser.streak + 1 : 0,
          coins: currentUser.coins + totalCoinsEarned,
        }

        const unlocked = getUnlockedAchievements(currentUser)
        const newlyUnlocked = getUnlockedAchievements(updatedUser).filter(
          achievement => !unlocked.some(existing => existing.id === achievement.id)
        )

        if (newlyUnlocked.length > 0) {
          dispatch({ type: 'NEW_ACHIEVEMENT', payload: newlyUnlocked[0] })
        }

        dispatch({
          type: 'END_QUIZ',
          payload: {
            correctAnswers: finalScore,
            totalQuestions: quickQuizLength,
          },
        })
      }, 1000)
    },
    [selectedAnswer, questions, currentQuestion, score, dispatch, state.user, ensureUser]
  )

  return {
    currentQuestion,
    selectedAnswer,
    score,
    showResult,
    quizCompleted,
    setShowResult,
    setQuizCompleted,
    setSelectedAnswer,
    handleAnswerSelect,
  }
}
