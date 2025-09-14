'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { QuizResultShare } from '../../components/ui'
import { QuizResultBannerAd, ResponsiveAd } from '../../components/ads'

interface QuizResultsDisplayProps {
  score: number
  totalQuestions: number
  category: string
  difficulty?: string
  coinsEarned?: number
  onPlayAgain: () => void
  onBackToCategories: () => void
  // Optional slot to render custom content below results but above action buttons (e.g., standardized timer)
  timerSlot?: React.ReactNode
}

export function QuizResultsDisplay({
  score,
  totalQuestions,
  category,
  difficulty = 'beginner',
  coinsEarned = 0,
  onPlayAgain,
  onBackToCategories,
  timerSlot
}: QuizResultsDisplayProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const percentage = Math.round((score / totalQuestions) * 100)

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

      {/* Score Display - Simplified to remove streak information */}
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

        {/* Removed Best Streak display */}
      </motion.div>

      {/* Action Buttons - Changed "Play Again" to "Try Other Quizzes" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 mt-8"
      >
        <button
          onClick={onBackToCategories}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Back to Categories
        </button>
        <button
          onClick={onBackToCategories} // Changed to go back to categories instead of playing again
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Try Other Quizzes
        </button>
      </motion.div>

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