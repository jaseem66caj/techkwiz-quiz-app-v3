'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimeUpModalProps {
  isOpen: boolean
  question: {
    id: string
    question: string
    options: string[]
    correct_answer: number
    fun_fact?: string
  }
  onClose: () => void
  autoCloseDelay?: number
}

export function TimeUpModal({
  isOpen,
  question,
  onClose,
  autoCloseDelay = 3000
}: TimeUpModalProps) {
  const [countdown, setCountdown] = useState(Math.ceil(autoCloseDelay / 1000))

  useEffect(() => {
    if (isOpen) {
      setCountdown(Math.ceil(autoCloseDelay / 1000))
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Auto close after delay
      const closeTimer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => {
        clearInterval(countdownInterval)
        clearTimeout(closeTimer)
      }
    }
  }, [isOpen, autoCloseDelay, onClose])

  if (!isOpen) return null

  const correctOption = question.options[question.correct_answer]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 50 }}
        className="bg-slate-800/95 backdrop-blur-md rounded-xl p-8 border border-slate-700/50 max-w-md mx-4 text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Time's Up Header */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="mb-6"
        >
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-3xl font-bold text-red-400 mb-2">Time's Up!</h2>
          <p className="text-slate-300 text-sm">
            Don't worry, let's see the correct answer
          </p>
        </motion.div>

        {/* Question Reminder */}
        <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <h3 className="text-white font-medium mb-3 text-left">
            {question.question}
          </h3>
          
          {/* Show all options with correct one highlighted */}
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-left border transition-all ${
                  index === question.correct_answer
                    ? 'bg-green-500/20 border-green-400 text-green-100'
                    : 'bg-slate-600/20 border-slate-600/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option}</span>
                  {index === question.correct_answer && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg"
                    >
                      ✅
                    </motion.span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Correct Answer Highlight */}
        <div className="mb-6 p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-green-400 font-semibold">Correct Answer</span>
          </div>
          <div className="text-white font-medium">
            {correctOption}
          </div>
        </div>

        {/* Fun Fact (if available) */}
        {question.fun_fact && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-xl">💡</span>
              <span className="text-blue-400 font-semibold">Fun Fact</span>
            </div>
            <div className="text-slate-300 text-sm">
              {question.fun_fact}
            </div>
          </div>
        )}

        {/* No Coins Earned Message */}
        <div className="mb-6 p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">🪙</span>
            <span className="text-orange-400 text-sm">
              No coins earned - answer faster next time!
            </span>
          </div>
        </div>

        {/* Auto Close Countdown */}
        <div className="mb-4">
          <div className="text-slate-400 text-sm mb-2">
            Moving to next question in:
          </div>
          <motion.div
            key={countdown}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-purple-400"
          >
            {countdown}
          </motion.div>
        </div>

        {/* Manual Close Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Continue Now
        </motion.button>
      </motion.div>
    </motion.div>
  )
}