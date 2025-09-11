// ===================================================================
// TechKwiz Unified Reward Popup Component
// ===================================================================
// This component displays rewards and achievements to users after completing
// quiz questions. It provides visual feedback for correct/incorrect answers,
// shows coin earnings, and can display achievement notifications.

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../app/providers'
import { getAvatarEmojiById } from '../../utils/avatar'

// Main UnifiedRewardPopup component
export function UnifiedRewardPopup({ 
  isOpen, 
  onClose, 
  isCorrect, 
  coinsEarned,
  onAdCompleted
}: { 
  isOpen: boolean
  onClose: () => void
  isCorrect: boolean
  coinsEarned: number
  onAdCompleted?: (coins: number) => void
}) {
  const { state } = useApp()
  const [showingAd, setShowingAd] = useState(false)
  const [adCompleted, setAdCompleted] = useState(false)

  // Handle escape key press to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Handle ad completion
  const handleAdCompleted = () => {
    setAdCompleted(true)
    setShowingAd(false)
    if (onAdCompleted) {
      onAdCompleted(100) // Reward 100 coins for watching ad
    }
  }

  // Show ad after 2 seconds if user got question wrong
  useEffect(() => {
    if (isOpen && !isCorrect && !showingAd && !adCompleted) {
      const timer = setTimeout(() => {
        setShowingAd(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, isCorrect, showingAd, adCompleted])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Animated Treasure Chest Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 60 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: -60 }} 
            transition={{ type: 'spring', damping: 20, stiffness: 280, duration: 0.45 }} 
            className="relative z-10 mx-4 w-full max-w-sm"
          >
            <div className="relative rounded-[28px] border border-orange-400/30 p-8 text-center overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(145deg, #111827 0%, #0f172a 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-pink-500/20 opacity-20 blur-xl" />
              <div className="relative z-10">
                {/* User info display */}
                {state.user && state.user.name !== 'Guest' && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center bg-gray-800/50 rounded-full px-4 py-2 border border-gray-700">
                      <span className="text-2xl mr-2">{getAvatarEmojiById(state.user.avatar)}</span>
                      <span className="text-white font-medium">{state.user.name}</span>
                    </div>
                  </div>
                )}
                
                {/* Animated Treasure Chest Visualization */}
                <div className="relative mx-auto mb-6 w-24 h-24">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="relative"
                  >
                    {/* Chest Base */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg shadow-lg" />
                    
                    {/* Chest Lid */}
                    <motion.div
                      animate={{ rotateX: isCorrect ? [0, -30, 0] : 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute -top-3 left-0 right-0 h-8 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-t-lg origin-bottom"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Lock */}
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full" />
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-yellow-800 rounded-b-sm" />
                    </motion.div>
                    
                    {/* Chest Glow Effect */}
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-yellow-400 rounded-lg blur-md opacity-30"
                    />
                  </motion.div>
                  
                  {/* Floating Coins Animation */}
                  {isCorrect && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 0, x: 0, opacity: 1 }}
                          animate={{ 
                            y: -50 - (i * 20),
                            x: (i - 1) * 30,
                            opacity: 0,
                            rotate: 360
                          }}
                          transition={{ 
                            duration: 1.5,
                            delay: i * 0.2,
                            ease: "easeOut"
                          }}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl"
                        >
                          🪙
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>

                {/* Reward Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {isCorrect ? '🎉 Correct!' : '🤔 Keep Trying!'}
                  </h3>
                  <p className="text-blue-200 mb-4">
                    {isCorrect 
                      ? `You earned ${coinsEarned} coins!` 
                      : 'You\'ll get it next time!'}
                  </p>
                  
                  {/* Coin Display */}
                  {isCorrect && (
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center bg-orange-500/20 rounded-full px-4 py-2 border border-orange-400/30">
                        <span className="text-2xl mr-2">🪙</span>
                        <span className="text-orange-300 font-medium">+{coinsEarned}</span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}