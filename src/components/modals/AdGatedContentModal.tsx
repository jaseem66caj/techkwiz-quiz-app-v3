'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AdGatedContentModalProps {
  isOpen: boolean
  onClose: () => void
  onWatchAd: () => void
  onSkip: () => void
  contentType: 'bonus_questions' | 'extra_time' | 'hint' | 'double_coins'
  rewardAmount?: number
}

export function AdGatedContentModal({ 
  isOpen, 
  onClose, 
  onWatchAd, 
  onSkip,
  contentType,
  rewardAmount = 100
}: AdGatedContentModalProps) {
  const [adWatching, setAdWatching] = useState(false)
  const [adCountdown, setAdCountdown] = useState(15) // 15 second fake ad

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAdWatching(false)
      setAdCountdown(15)
    }
  }, [isOpen])

  // Handle ad countdown
  useEffect(() => {
    if (adWatching && adCountdown > 0) {
      const timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (adWatching && adCountdown === 0) {
      // Ad finished
      setTimeout(() => {
        setAdWatching(false)
        onWatchAd()
      }, 1000)
    }
  }, [adWatching, adCountdown, onWatchAd])

  const getContentInfo = () => {
    switch (contentType) {
      case 'bonus_questions':
        return {
          icon: '🎯',
          title: 'Unlock Bonus Questions!',
          description: 'Watch a quick ad to get 3 extra questions and boost your score!',
          reward: '3 Bonus Questions',
          color: 'from-blue-500 to-cyan-500'
        }
      case 'extra_time':
        return {
          icon: '⏰',
          title: 'Need More Time?',
          description: 'Watch an ad to get 30 extra seconds for this question!',
          reward: '30 Extra Seconds',
          color: 'from-orange-500 to-red-500'
        }
      case 'hint':
        return {
          icon: '💡',
          title: 'Get a Hint!',
          description: 'Watch an ad to reveal a helpful hint for this question!',
          reward: 'Question Hint',
          color: 'from-yellow-500 to-orange-500'
        }
      case 'double_coins':
        return {
          icon: '🪙',
          title: 'Double Your Coins!',
          description: `Watch an ad to double your earned coins (+${rewardAmount} coins)!`,
          reward: `+${rewardAmount} Coins`,
          color: 'from-green-500 to-emerald-500'
        }
      default:
        return {
          icon: '🎁',
          title: 'Unlock Reward!',
          description: 'Watch a short ad to unlock your reward!',
          reward: 'Special Reward',
          color: 'from-purple-500 to-pink-500'
        }
    }
  }

  if (!isOpen) return null

  const contentInfo = getContentInfo()

  // Ad watching state
  if (adWatching) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md mx-auto text-center border border-gray-700"
        >
          {/* Fake Ad Content */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-6 border border-gray-600">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-white font-bold text-lg mb-2">TechKwiz Premium</h3>
            <p className="text-gray-300 text-sm mb-4">
              Unlock unlimited quizzes and premium features!
            </p>
            <div className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Try Free for 7 Days!
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">Ad ends in</p>
            <div className="text-3xl font-bold text-white">{adCountdown}</div>
          </div>

          {/* Skip option after 5 seconds */}
          {adCountdown <= 10 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                setAdWatching(false)
                onWatchAd()
              }}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              Skip Ad
            </motion.button>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-gradient-to-br ${contentInfo.color} backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-white/20 text-center`}
      >
        {/* Icon */}
        <div className="text-6xl mb-4">{contentInfo.icon}</div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">
          {contentInfo.title}
        </h2>
        
        {/* Description */}
        <p className="text-white/90 mb-6 leading-relaxed">
          {contentInfo.description}
        </p>
        
        {/* Reward Highlight */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-6">
          <p className="text-white text-sm mb-1">You'll receive:</p>
          <p className="text-white font-bold text-lg">{contentInfo.reward}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAdWatching(true)}
            className="flex-1 bg-white text-gray-900 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
          >
            📺 Watch Ad (15s)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSkip}
            className="flex-1 bg-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/30 transition-colors border border-white/20"
          >
            Skip
          </motion.button>
        </div>
        
        {/* Fine Print */}
        <p className="text-white/60 text-xs mt-4">
          Support TechKwiz by watching ads • No personal data collected
        </p>
      </motion.div>
    </div>
  )
}