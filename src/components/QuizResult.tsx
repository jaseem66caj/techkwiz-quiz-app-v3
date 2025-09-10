'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { QuizResultShare } from './SocialShare'
import { QuizResultBannerAd, ResponsiveAd } from './AdBanner'

interface QuizResultProps {
  score: number
  totalQuestions: number
  category: string
  difficulty?: string
  coinsEarned?: number
  maxStreak?: number
  onPlayAgain: () => void
  onBackToCategories: () => void
  // Optional slot to render custom content below results but above action buttons (e.g., standardized timer)
  timerSlot?: React.ReactNode
}

export function QuizResult({
  score,
  totalQuestions,
  category,
  difficulty = 'beginner',
  coinsEarned = 0,
  maxStreak = 0,
  onPlayAgain,
  onBackToCategories,
  timerSlot
}: QuizResultProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const percentage = Math.round((score / totalQuestions) * 100)

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Perfect! 🌟", color: "text-yellow-400" }
    if (percentage >= 80) return { message: "Excellent! 🏆", color: "text-green-400" }
    if (percentage >= 70) return { message: "Great job! 👍", color: "text-blue-400" }
    if (percentage >= 60) return { message: "Good work! 📈", color: "text-purple-400" }
    if (percentage >= 40) return { message: "Not bad! 💪", color: "text-orange-400" }
    return { message: "Keep practicing! 📚", color: "text-red-400" }
  }

  const performance = getPerformanceMessage()

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'advanced': return { icon: '🔴', name: 'Advanced', color: 'text-red-400' }
      case 'intermediate': return { icon: '🟡', name: 'Intermediate', color: 'text-yellow-400' }
      default: return { icon: '🟢', name: 'Beginner', color: 'text-green-400' }
    }
  }

  const difficultyBadge = getDifficultyBadge()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-effect p-8 rounded-2xl text-center max-w-lg mx-auto relative overflow-hidden"
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ 
                y: -50, 
                x: Math.random() * 500 - 250,
                opacity: 1 
              }}
              animate={{ 
                y: 500,
                x: Math.random() * 500 - 250,
                opacity: 0,
                rotate: 360
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 2
              }}
            >
              {['🎉', '🎊', '⭐', '🏆', '🎈', '🌟', '💫', '✨'][Math.floor(Math.random() * 8)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Result Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="text-6xl mb-4">
          {percentage >= 90 ? '🏆' : percentage >= 80 ? '🥇' : percentage >= 70 ? '🥈' : percentage >= 60 ? '🥉' : '📚'}
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Quiz Complete!
        </h2>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <p className="text-blue-200 text-lg">
            {category} Quiz
          </p>
          <span className={`text-sm ${difficultyBadge.color} flex items-center space-x-1`}>
            <span>{difficultyBadge.icon}</span>
            <span>{difficultyBadge.name}</span>
          </span>
        </div>
      </motion.div>

      {/* Score Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <div className="glass-effect p-4 rounded-xl">
          <div className="text-3xl font-bold text-white mb-2">
            {score}/{totalQuestions}
          </div>
          <div className="text-blue-200 text-sm">
            Correct Answers
          </div>
        </div>

        <div className="glass-effect p-4 rounded-xl">
          <div className="text-3xl font-bold text-white mb-2">
            {percentage}%
          </div>
          <div className="text-blue-200 text-sm">
            Success Rate
          </div>
        </div>

        <div className="glass-effect p-4 rounded-xl">
          <div className="text-3xl font-bold text-yellow-400 mb-2 flex items-center justify-center">
            <span className="mr-2">🪙</span>
            {coinsEarned}
          </div>
          <div className="text-blue-200 text-sm">
            Coins Earned
          </div>
        </div>

        <div className="glass-effect p-4 rounded-xl">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {maxStreak}
          </div>
          <div className="text-blue-200 text-sm">
            Best Streak
          </div>
        </div>
      </motion.div>

      {/* Performance Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className={`text-lg font-semibold ${performance.color} mb-6`}
      >
        {performance.message}
      </motion.div>

      {/* Achievements */}
      {(percentage >= 80 || maxStreak >= 5 || coinsEarned >= 1000) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-effect p-4 rounded-xl mb-6"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
            <span className="mr-2">🏅</span>
            Achievements Unlocked!
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {percentage >= 80 && (
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">
                🌟 High Score
              </span>
            )}
            {maxStreak >= 5 && (
              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs">
                🔥 Streak Master
              </span>
            )}
            {coinsEarned >= 1000 && (
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                💰 Big Earner
              </span>
            )}
            {percentage === 100 && (
              <span className="bg-gold-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs">
                🏆 Perfect Score
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Advertisement Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="my-6"
      >
        <QuizResultBannerAd className="mb-4" />
      </motion.div>

      {/* Social Sharing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mb-6"
      >
        <QuizResultShare
          score={score}
          totalQuestions={totalQuestions}
          category={category}
          className="mb-4"
        />
      </motion.div>

      {/* Standardized Timer Slot (optional) */}
      {timerSlot}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="flex justify-center"
      >
        <button
          onClick={onBackToCategories}
          className="w-full button-secondary py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
        >
          <span>📚</span>
          <span>Back to Categories</span>
        </button>
      </motion.div>

      {/* Bottom Ad */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="mt-6 pt-4 border-t border-white/10"
      >
        <ResponsiveAd adSlot="quiz-result-bottom" className="mb-4" />
      </motion.div>
    </motion.div>
  )
}