'use client'

import { useState, useEffect, useCallback } from 'react'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalCorrect: number
  totalAnswered: number
  lastCorrectTime?: number
}

export function useStreakTracking() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0
  })

  const [shouldShowEncouragement, setShouldShowEncouragement] = useState(false)
  const [encouragementTrigger, setEncouragementTrigger] = useState<'streak' | 'accuracy' | 'progress' | null>(null)

  // Load streak data from localStorage on mount
  useEffect(() => {
    const savedStreak = localStorage.getItem('techkwiz_streak_data')
    if (savedStreak) {
      try {
        setStreakData(JSON.parse(savedStreak))
      } catch (error) {
        console.error('Error loading streak data:', error)
      }
    }
  }, [])

  // Save streak data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('techkwiz_streak_data', JSON.stringify(streakData))
  }, [streakData])

  // Record a correct answer
  const recordCorrectAnswer = useCallback(() => {
    setStreakData(prev => {
      const newStreak = prev.currentStreak + 1
      const newTotalCorrect = prev.totalCorrect + 1
      const newTotalAnswered = prev.totalAnswered + 1
      
      const updatedData = {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        totalCorrect: newTotalCorrect,
        totalAnswered: newTotalAnswered,
        lastCorrectTime: Date.now()
      }
      
      // Trigger encouragement for streaks
      if (newStreak >= 3 && newStreak % 2 === 1) { // Every odd number after 3
        setShouldShowEncouragement(true)
        setEncouragementTrigger('streak')
      }
      
      return updatedData
    })
  }, [])

  // Record an incorrect answer
  const recordIncorrectAnswer = useCallback(() => {
    setStreakData(prev => ({
      ...prev,
      currentStreak: 0, // Reset streak
      totalAnswered: prev.totalAnswered + 1
    }))
  }, [])

  // Check if encouragement should be shown based on various triggers
  const checkEncouragementTriggers = useCallback((questionNumber: number, totalQuestions: number) => {
    const progress = questionNumber / totalQuestions
    const accuracy = streakData.totalAnswered > 0 ? streakData.totalCorrect / streakData.totalAnswered : 0
    
    // Mid-quiz encouragement triggers
    if (questionNumber === Math.ceil(totalQuestions * 0.5)) { // Halfway point
      setShouldShowEncouragement(true)
      setEncouragementTrigger('progress')
    } else if (accuracy >= 0.8 && questionNumber >= 3) { // High accuracy
      setShouldShowEncouragement(true)
      setEncouragementTrigger('accuracy')
    }
  }, [streakData])

  // Reset streak (for new quiz sessions)
  const resetStreak = useCallback(() => {
    setStreakData(prev => ({
      ...prev,
      currentStreak: 0
    }))
  }, [])

  // Clear encouragement state
  const clearEncouragement = useCallback(() => {
    setShouldShowEncouragement(false)
    setEncouragementTrigger(null)
  }, [])

  // Get achievement info based on current stats
  const getAchievementInfo = useCallback(() => {
    const achievements = []
    
    if (streakData.currentStreak >= 5) {
      achievements.push({
        id: 'hot_streak',
        title: 'Hot Streak! 🔥',
        description: `${streakData.currentStreak} correct answers in a row!`
      })
    }
    
    if (streakData.longestStreak >= 10) {
      achievements.push({
        id: 'streak_master',
        title: 'Streak Master! 👑',
        description: `Longest streak: ${streakData.longestStreak}`
      })
    }
    
    if (streakData.totalCorrect >= 100) {
      achievements.push({
        id: 'century_club',
        title: 'Century Club! 💯',
        description: `${streakData.totalCorrect} correct answers total!`
      })
    }
    
    const accuracy = streakData.totalAnswered > 0 ? (streakData.totalCorrect / streakData.totalAnswered) * 100 : 0
    if (accuracy >= 90 && streakData.totalAnswered >= 20) {
      achievements.push({
        id: 'accuracy_ace',
        title: 'Accuracy Ace! 🎯',
        description: `${Math.round(accuracy)}% accuracy rate!`
      })
    }
    
    return achievements
  }, [streakData])

  return {
    streakData,
    recordCorrectAnswer,
    recordIncorrectAnswer,
    resetStreak,
    shouldShowEncouragement,
    encouragementTrigger,
    clearEncouragement,
    checkEncouragementTriggers,
    getAchievementInfo
  }
}