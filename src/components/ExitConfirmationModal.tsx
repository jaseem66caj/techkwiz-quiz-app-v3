'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ExitConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  currentProgress?: {
    questionNumber: number
    totalQuestions: number
    coinsAtRisk: number
  }
}

export function ExitConfirmationModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  currentProgress 
}: ExitConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" data-testid="exit-confirmation-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.9, y: isOpen ? 0 : 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-gradient-to-br from-red-900/95 to-orange-900/95 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-red-400/30 text-center"
      >
        {/* Warning Icon */}
        <div className="text-6xl mb-4">⚠️</div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Do you want to exit the quiz?
        </h2>
        
        {/* Progress warning */}
        {currentProgress && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/30 mb-6">
            <p className="text-red-100 text-sm mb-2">
              <strong>You're doing great!</strong>
            </p>
            <div className="space-y-1 text-sm text-red-200">
              <div>📊 Progress: {currentProgress.questionNumber}/{currentProgress.totalQuestions}</div>
              <div>🪙 Potential coins at risk: {currentProgress.coinsAtRisk}</div>
            </div>
          </div>
        )}
        
        {/* Message */}
        <p className="text-red-100 mb-8 leading-relaxed">
          {currentProgress 
            ? "You've made good progress! Are you sure you want to leave and lose your current streak?"
            : "Your progress will be lost if you exit now. Are you sure?"}
        </p>
        
        {/* Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Continue Playing
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Yes, Exit
          </motion.button>
        </div>
        
        {/* Encouragement */}
        <p className="text-orange-200 text-xs mt-4 opacity-75">
          💡 Tip: Complete quizzes to maximize your coin earnings!
        </p>
      </motion.div>
    </div>
  )
}