'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDailyBonusAmount } from '../../utils/rewardCalculator'

interface DailyBonusModalProps {
  isOpen: boolean
  onClose: () => void
  onClaimBonus: (bonusAmount: number) => void
  dayStreak: number
}

interface DailyBonus {
  day: number
  reward: number
  type: 'coins' | 'multiplier' | 'premium'
  icon: string
  claimed: boolean
}

export function DailyBonusModal({ isOpen, onClose, onClaimBonus, dayStreak }: DailyBonusModalProps) {
  const [selectedDay, setSelectedDay] = useState(dayStreak)
  const [claimingBonus, setClaimingBonus] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Define 7-day bonus cycle using centralized configuration
  const baseDailyBonus = getDailyBonusAmount()
  const dailyBonuses: DailyBonus[] = [
    { day: 1, reward: baseDailyBonus, type: 'coins', icon: '🪙', claimed: dayStreak > 0 },
    { day: 2, reward: baseDailyBonus, type: 'coins', icon: '💰', claimed: dayStreak > 1 },
    { day: 3, reward: baseDailyBonus, type: 'coins', icon: '💎', claimed: dayStreak > 2 },
    { day: 4, reward: baseDailyBonus > 0 ? 2 : 0, type: 'multiplier', icon: '⚡', claimed: dayStreak > 3 },
    { day: 5, reward: baseDailyBonus, type: 'coins', icon: '🏆', claimed: dayStreak > 4 },
    { day: 6, reward: baseDailyBonus, type: 'coins', icon: '👑', claimed: dayStreak > 5 },
    { day: 7, reward: baseDailyBonus, type: 'premium', icon: '🎁', claimed: dayStreak > 6 }
  ]

  const handleClaimBonus = async () => {
    const todayBonus = dailyBonuses[dayStreak] || dailyBonuses[0]
    
    setClaimingBonus(true)
    
    // Simulate bonus claiming with celebration
    setTimeout(() => {
      setShowCelebration(true)
      onClaimBonus(todayBonus.reward)
      
      setTimeout(() => {
        setClaimingBonus(false)
        setShowCelebration(false)
        onClose()
      }, 3000)
    }, 1000)
  }

  const getTodayBonus = () => {
    return dailyBonuses[dayStreak] || dailyBonuses[0]
  }

  const getStreakMessage = () => {
    if (dayStreak === 0) {
      return "Welcome back! Start your daily bonus streak!"
    } else if (dayStreak < 3) {
      return `Day ${dayStreak + 1} bonus ready! Keep the streak alive!`
    } else if (dayStreak < 6) {
      return `Amazing! Day ${dayStreak + 1} - You're on fire! 🔥`
    } else {
      return `Incredible! Day 7 MEGA BONUS awaits! 🚀`
    }
  }

  if (!isOpen) return null

  const todayBonus = getTodayBonus()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-md mx-auto border border-purple-400/30 text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-12"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
          >
            ×
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 relative z-10"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              🎁 Daily Bonus!
            </h1>
            <p className="text-purple-200">
              {getStreakMessage()}
            </p>
          </motion.div>

          {/* 7-Day Calendar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-7 gap-2 mb-6 relative z-10"
          >
            {dailyBonuses.map((bonus, index) => (
              <div
                key={bonus.day}
                className={`
                  relative p-3 rounded-lg border-2 transition-all duration-300
                  ${index === dayStreak 
                    ? 'border-yellow-400 bg-yellow-400/20 scale-105' 
                    : bonus.claimed 
                      ? 'border-green-400/50 bg-green-400/10' 
                      : 'border-purple-400/30 bg-purple-400/10'
                  }
                `}
              >
                <div className="text-xl mb-1">{bonus.icon}</div>
                <div className="text-xs text-white font-medium">Day {bonus.day}</div>
                <div className="text-xs text-purple-200">
                  {bonus.type === 'multiplier' ? `${bonus.reward}x` : `${bonus.reward}`}
                </div>
                {bonus.claimed && (
                  <div className="absolute -top-1 -right-1 text-green-400 text-lg">
                    ✓
                  </div>
                )}
                {index === dayStreak && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 text-yellow-400 text-lg"
                  >
                    ⭐
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Today's Bonus Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-400/30 mb-6 relative z-10"
          >
            <div className="text-4xl mb-3">{todayBonus.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Today's Reward
            </h3>
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {todayBonus.type === 'multiplier' ? `${todayBonus.reward}x Multiplier` : `+${todayBonus.reward} Coins`}
            </div>
            <p className="text-yellow-200 text-sm">
              {todayBonus.type === 'premium' ? 'Premium features unlocked!' : 
               todayBonus.type === 'multiplier' ? 'Next quiz rewards doubled!' : 
               'Added to your coin balance!'}
            </p>
          </motion.div>

          {/* Claim Button or Celebration */}
          {showCelebration ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Bonus Claimed!</h2>
              <p className="text-purple-200">Come back tomorrow for more rewards!</p>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimBonus}
              disabled={claimingBonus}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 relative z-10
                ${claimingBonus 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg'
                }
              `}
            >
              {claimingBonus ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Claiming Bonus...
                </div>
              ) : (
                `🎁 Claim ${todayBonus.type === 'multiplier' ? `${todayBonus.reward}x Multiplier` : `${todayBonus.reward} Coins`}`
              )}
            </motion.button>
          )}

          {/* Streak Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-center relative z-10"
          >
            <p className="text-purple-200 text-sm">
              🔥 Current Streak: <span className="font-bold text-white">{dayStreak + 1} days</span>
            </p>
            <p className="text-purple-300 text-xs mt-1">
              Complete a quiz daily to maintain your streak!
            </p>
          </motion.div>

          {/* Celebration particles */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0,
                    y: 50,
                    x: Math.random() * 100 - 50,
                    scale: 0
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: -100,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className={`absolute top-1/2 left-1/2 text-lg ${
                    ['🎉', '✨', '🎊', '⭐', '🏆'][Math.floor(Math.random() * 5)]
                  }`}
                  style={{
                    left: `${50 + (Math.random() - 0.5) * 60}%`,
                    top: `${50 + (Math.random() - 0.5) * 60}%`
                  }}
                >
                  {['🎉', '✨', '🎊', '⭐', '🏆'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}