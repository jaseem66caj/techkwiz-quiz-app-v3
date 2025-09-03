'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StreakMultiplierDisplayProps {
  currentStreak: number
  multiplier: number
  isActive: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  onMultiplierExpired?: () => void
}

export function StreakMultiplierDisplay({ 
  currentStreak, 
  multiplier, 
  isActive,
  position = 'top-right',
  onMultiplierExpired
}: StreakMultiplierDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds
  const [showBoostEffect, setShowBoostEffect] = useState(false)

  // Countdown timer for multiplier expiration
  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onMultiplierExpired?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, onMultiplierExpired])

  // Show boost effect when multiplier is activated
  useEffect(() => {
    if (isActive && multiplier > 1) {
      setShowBoostEffect(true)
      const timer = setTimeout(() => setShowBoostEffect(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isActive, multiplier])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const getStreakTier = () => {
    if (currentStreak >= 10) return { tier: 'legendary', color: 'from-yellow-400 to-orange-500', icon: '👑' }
    if (currentStreak >= 7) return { tier: 'master', color: 'from-purple-400 to-pink-500', icon: '🏆' }
    if (currentStreak >= 5) return { tier: 'expert', color: 'from-blue-400 to-cyan-500', icon: '⭐' }
    if (currentStreak >= 3) return { tier: 'pro', color: 'from-green-400 to-emerald-500', icon: '🔥' }
    return { tier: 'beginner', color: 'from-gray-400 to-gray-500', icon: '🌟' }
  }

  if (!isActive || multiplier <= 1) return null

  const streakTier = getStreakTier()

  return (
    <AnimatePresence>
      <div className={`fixed ${getPositionClasses()} z-40`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className={`bg-gradient-to-r ${streakTier.color} backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg min-w-[200px] relative overflow-hidden`}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          
          {/* Boost effect overlay */}
          {showBoostEffect && (
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: [0, 0.7, 0], scale: [2, 1.5, 2] }}
              transition={{ duration: 2 }}
              className="absolute inset-0 bg-white/20 rounded-xl"
            />
          )}

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <motion.span 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-xl"
                >
                  {streakTier.icon}
                </motion.span>
                <span className="text-white font-bold text-sm uppercase">
                  {streakTier.tier} Streak
                </span>
              </div>
              <div className="text-white/80 text-xs">
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Multiplier Display */}
            <div className="text-center mb-3">
              <motion.div
                animate={showBoostEffect ? { scale: [1, 1.2, 1] } : {}}
                className="text-3xl font-bold text-white mb-1"
              >
                {multiplier}x
              </motion.div>
              <div className="text-white/90 text-xs">
                Coin Multiplier Active
              </div>
            </div>

            {/* Streak Count */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-white/80 text-xs">Streak:</span>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(currentStreak, 10) }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                ))}
                {currentStreak > 10 && (
                  <span className="text-white text-xs font-bold">
                    +{currentStreak - 10}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${(timeRemaining / 300) * 100}%` }}
                className="bg-white h-1.5 rounded-full transition-all duration-1000"
              />
            </div>

            {/* Motivational Message */}
            <div className="text-center">
              <motion.p 
                key={Math.floor(timeRemaining / 60)} // Change message every minute
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/90 text-xs"
              >
                {timeRemaining > 240 ? "🚀 Boost is strong!" :
                 timeRemaining > 120 ? "⚡ Keep the momentum!" :
                 timeRemaining > 60 ? "🔥 Almost expired!" :
                 "⏰ Last chance!"}
              </motion.p>
            </div>

            {/* Particle effects for high streaks */}
            {currentStreak >= 5 && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 3 }, (_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5],
                      scale: [0.8, 1, 0.8]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      delay: i * 0.7
                    }}
                    className="absolute text-xs"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: '10%'
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Achievement notification for streak milestones */}
        {showBoostEffect && currentStreak % 5 === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap"
          >
            🎉 Streak Milestone: {currentStreak}!
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}