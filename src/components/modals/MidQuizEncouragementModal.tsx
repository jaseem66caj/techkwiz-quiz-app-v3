'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MidQuizEncouragementModalProps {
  isOpen: boolean
  onClose: () => void
  currentQuestion: number
  totalQuestions: number
  currentScore: number
  streakCount?: number
}

export function MidQuizEncouragementModal({ 
  isOpen, 
  onClose, 
  currentQuestion, 
  totalQuestions, 
  currentScore,
  streakCount = 0
}: MidQuizEncouragementModalProps) {
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null)

  // Auto-close after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      setAutoCloseTimer(timer)
      
      return () => {
        if (timer) clearTimeout(timer)
      }
    }
  }, [isOpen, onClose])

  // Get encouragement message based on progress and performance
  const getEncouragementMessage = () => {
    const progress = currentQuestion / totalQuestions
    const accuracy = currentScore / currentQuestion
    
    if (streakCount >= 3) {
      return {
        icon: '🔥',
        title: 'You\'re on fire!',
        message: `${streakCount} correct in a row! Keep this streak going!`,
        color: 'from-orange-500 to-red-500'
      }
    } else if (progress >= 0.7) {
      return {
        icon: '⭐',
        title: 'Almost there!',
        message: 'You\'ve got this! Just a few more questions to go!',
        color: 'from-yellow-500 to-orange-500'
      }
    } else if (accuracy >= 0.8) {
      return {
        icon: '🎯',
        title: 'Perfect accuracy!',
        message: 'Your knowledge is impressive! Keep it up!',
        color: 'from-green-500 to-emerald-500'
      }
    } else if (progress >= 0.4) {
      return {
        icon: '💪',
        title: 'You\'re doing great!',
        message: 'Halfway through and going strong! Don\'t give up!',
        color: 'from-blue-500 to-purple-500'
      }
    } else {
      return {
        icon: '🚀',
        title: 'Great start!',
        message: 'You\'re building momentum! Each question counts!',
        color: 'from-purple-500 to-pink-500'
      }
    }
  }

  // Get additional motivational tips
  const getMotivationalTip = () => {
    const tips = [
      "💡 Take your time - there's no rush!",
      "🧠 Trust your first instinct!",
      "✨ Every question is a learning opportunity!",
      "🎯 Stay focused - you've got this!",
      "💝 Believe in yourself!",
      "🌟 You're smarter than you think!",
      "🔮 Success is just around the corner!",
      "💪 Challenge yourself and grow!"
    ]
    
    return tips[Math.floor(Math.random() * tips.length)]
  }

  if (!isOpen) return null

  const encouragement = getEncouragementMessage()
  const tip = getMotivationalTip()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`bg-gradient-to-br ${encouragement.color} backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-white/20 text-center relative`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl font-bold"
          >
            ×
          </button>

          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {encouragement.icon}
          </motion.div>
          
          {/* Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-3"
          >
            {encouragement.title}
          </motion.h2>
          
          {/* Main Message */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 mb-4 text-lg"
          >
            {encouragement.message}
          </motion.p>
          
          {/* Progress Info */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4"
          >
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Progress: {currentQuestion}/{totalQuestions}</span>
              <span>Score: {currentScore}/{currentQuestion}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </motion.div>
          
          {/* Motivational Tip */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/70 text-sm italic"
          >
            {tip}
          </motion.p>
          
          {/* Auto-close indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex space-x-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    delay: dot * 0.2 
                  }}
                  className="w-1.5 h-1.5 bg-white/50 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}