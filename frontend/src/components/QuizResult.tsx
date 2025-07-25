'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface QuizResultProps {
  score: number
  totalQuestions: number
  category: string
  onPlayAgain: () => void
  onBackToCategories: () => void
}

export function QuizResult({
  score,
  totalQuestions,
  category,
  onPlayAgain,
  onBackToCategories
}: QuizResultProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const percentage = Math.round((score / totalQuestions) * 100)
  const coinsEarned = score * 200

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const getPerformanceMessage = () => {
    if (percentage >= 80) return { message: "Excellent! 🌟", color: "text-green-400" }
    if (percentage >= 60) return { message: "Good job! 👍", color: "text-yellow-400" }
    if (percentage >= 40) return { message: "Not bad! 📈", color: "text-blue-400" }
    return { message: "Keep practicing! 💪", color: "text-red-400" }
  }

  const performance = getPerformanceMessage()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-effect p-8 rounded-2xl text-center max-w-md mx-auto relative overflow-hidden"
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ 
                y: -50, 
                x: Math.random() * 400 - 200,
                opacity: 1 
              }}
              animate={{ 
                y: 400,
                x: Math.random() * 400 - 200,
                opacity: 0,
                rotate: 360
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 2
              }}
            >
              {['🎉', '🎊', '⭐', '🏆', '🎈'][Math.floor(Math.random() * 5)]}
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
          {percentage >= 80 ? '🏆' : percentage >= 60 ? '🥈' : percentage >= 40 ? '🥉' : '📚'}
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Quiz Complete!
        </h2>
        
        <p className="text-blue-200 text-lg mb-4">
          {category} Quiz Results
        </p>
      </motion.div>

      {/* Score Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-4 mb-6"
      >
        <div className="glass-effect p-4 rounded-xl">
          <div className="text-4xl font-bold text-white mb-2">
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
          <div className="text-3xl font-bold text-yellow-400 mb-2 flex items-center justify-center coin-animation">
            <span className="mr-2">🪙</span>
            {coinsEarned}
          </div>
          <div className="text-blue-200 text-sm">
            Coins Earned
          </div>
        </div>

        <div className={`text-lg font-semibold ${performance.color} mb-4`}>
          {performance.message}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-3"
      >
        <button
          onClick={onPlayAgain}
          className="w-full button-primary py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
        >
          <span>🔄</span>
          <span>Play Again</span>
        </button>
        
        <button
          onClick={onBackToCategories}
          className="w-full button-secondary py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
        >
          <span>📚</span>
          <span>Back to Categories</span>
        </button>
      </motion.div>

      {/* Share Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-4 pt-4 border-t border-white/10"
      >
        <button
          onClick={() => {
            const text = `I just scored ${score}/${totalQuestions} (${percentage}%) in ${category} quiz on TechKwiz! 🎯`
            if (navigator.share) {
              navigator.share({ text })
            } else {
              navigator.clipboard.writeText(text)
              alert('Result copied to clipboard!')
            }
          }}
          className="text-blue-300 hover:text-blue-100 transition-colors text-sm flex items-center space-x-1 mx-auto"
        >
          <span>📤</span>
          <span>Share Result</span>
        </button>
      </motion.div>
    </motion.div>
  )
}