'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NewRewardPopupProps {
  isOpen: boolean
  onClose: () => void
  coinsEarned: number
  onClaimReward: () => void
  onSkipReward: () => void
  canWatchAgain?: boolean
  onWatchAgain?: () => void
  isCorrect?: boolean
  rewardCoins?: number
  categoryId?: string
}

interface RewardConfig {
  coin_reward: number
  is_active: boolean
  show_on_insufficient_coins: boolean
  show_during_quiz: boolean
}

export function NewRewardPopup({ 
  isOpen, 
  onClose, 
  coinsEarned, 
  onClaimReward, 
  onSkipReward,
  canWatchAgain = false,
  onWatchAgain,
  isCorrect = true,
  rewardCoins = 100,
  categoryId
}: NewRewardPopupProps) {
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [hasWatchedOnce, setHasWatchedOnce] = useState(false)
  const [config, setConfig] = useState<RewardConfig | null>(null)
  const [countdown, setCountdown] = useState(5)

  // Fetch reward configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'
        const endpoint = categoryId 
          ? `/api/quiz/rewarded-config/${categoryId}` 
          : '/api/quiz/rewarded-config'
        
        const response = await fetch(`${backendUrl}${endpoint}`)
        if (response.ok) {
          const configData = await response.json()
          setConfig(configData)
        }
      } catch (error) {
        console.error('Failed to fetch reward config:', error)
        // Use default values
        setConfig({
          coin_reward: 100,
          is_active: true,
          show_on_insufficient_coins: true,
          show_during_quiz: true
        })
      }
    }

    if (isOpen) {
      fetchConfig()
    }
  }, [isOpen, categoryId])

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'visible'
    }
    
    return () => {
      document.body.style.overflow = 'visible'
    }
  }, [isOpen])

  // Countdown timer for ad watching
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isWatchingAd && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [isWatchingAd, countdown])

  const handleClaimReward = () => {
    setIsWatchingAd(true)
    setCountdown(5)
    
    // Simulate watching ad for 5 seconds
    setTimeout(() => {
      setIsWatchingAd(false)
      setHasWatchedOnce(true)
      onClaimReward()
      
      // Don't close immediately if user can watch again
      if (!canWatchAgain) {
        onClose()
      }
    }, 5000)
  }

  const handleWatchAgain = () => {
    if (onWatchAgain) {
      setIsWatchingAd(true)
      setCountdown(5)
      
      setTimeout(() => {
        setIsWatchingAd(false)
        onWatchAgain()
        onClose()
      }, 5000)
    }
  }

  const handleClose = () => {
    onSkipReward()
    onClose()
  }

  // Don't show popup if config says it's not active
  if (!config?.is_active) {
    return null
  }

  const effectiveRewardCoins = config?.coin_reward || rewardCoins

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Full screen overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          
          {/* Popup Container - positioned to cover quiz area completely */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 mx-4 w-full max-w-sm"
          >
            {/* Main Popup Box */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border-2 border-white/30 p-6 text-center shadow-2xl overflow-hidden">
              {!isWatchingAd ? (
                <>
                  {/* Treasure Chest */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                    className="mb-6"
                  >
                    <div className="relative mx-auto w-24 h-20">
                      <svg viewBox="0 0 120 100" className="w-full h-full">
                        {/* Chest Base */}
                        <rect x="20" y="50" width="80" height="35" rx="6" fill="#D4910A" stroke="#B8800A" strokeWidth="2"/>
                        
                        {/* Chest Lid */}
                        <ellipse cx="60" cy="50" rx="40" ry="15" fill="#F4B942" stroke="#D4910A" strokeWidth="2"/>
                        
                        {/* Chest Lock */}
                        <rect x="57" y="53" width="6" height="10" rx="1" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="1"/>
                        <circle cx="60" cy="56" r="2" fill="#A0A0A0"/>
                        
                        {/* Coins inside chest - show different amounts for correct vs wrong */}
                        {isCorrect ? (
                          // Correct answer - multiple gold coins
                          <>
                            <circle cx="50" cy="35" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="60" cy="32" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="70" cy="35" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="55" cy="40" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="65" cy="40" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                          </>
                        ) : (
                          // Wrong answer - fewer coins but still some opportunity
                          <>
                            <circle cx="55" cy="35" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="65" cy="35" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                          </>
                        )}
                        
                        {/* Sparkles around chest */}
                        <motion.g
                          animate={{ 
                            opacity: [0.4, 1, 0.4],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <polygon points="30,25 33,32 26,32" fill="#FFD700"/>
                          <polygon points="90,25 93,32 86,32" fill="#FFD700"/>
                          <polygon points="60,20 63,27 56,27" fill="#FFD700"/>
                          <polygon points="40,15 42,20 37,20" fill="#FFD700"/>
                          <polygon points="80,15 82,20 77,20" fill="#FFD700"/>
                        </motion.g>
                      </svg>
                    </div>
                  </motion.div>

                  {/* Success/Failure Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                  >
                    <h2 className="text-3xl font-bold text-yellow-400 mb-3">
                      {isCorrect ? 'Hurray!!' : 'Oops!!'}
                    </h2>
                    <p className="text-lg font-medium text-yellow-300 mb-4">
                      {isCorrect ? 'Correct answer' : 'Wrong answer'}
                    </p>
                    
                    {isCorrect ? (
                      <p className="text-white text-base mb-3">
                        You won <span className="text-yellow-400 font-bold">{coinsEarned} coins</span>
                      </p>
                    ) : (
                      <p className="text-white text-base mb-3">
                        You still have a chance to win coins.
                      </p>
                    )}
                    
                    <p className="text-white text-lg leading-relaxed">
                      <span className="block">Just watch an ad & earn</span>
                      <span className="text-yellow-400 font-bold text-xl">{effectiveRewardCoins} coins</span>
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    {/* Show different buttons based on state */}
                    {!hasWatchedOnce ? (
                      <button
                        onClick={handleClaimReward}
                        className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-3">
                          <span className="text-lg">Claim</span>
                          <span className="bg-purple-900/50 px-3 py-1 rounded-md text-sm font-medium">Ad</span>
                        </span>
                        
                        {/* Button glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-300/20 to-purple-400/0 animate-pulse"></div>
                      </button>
                    ) : (
                      /* After first ad - show Watch Again or Continue */
                      <>
                        {canWatchAgain && onWatchAgain && (
                          <button
                            onClick={handleWatchAgain}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <span className="flex items-center justify-center space-x-3">
                              <span className="text-lg">Watch Again</span>
                              <span className="bg-green-800/70 px-3 py-1 rounded-md text-sm font-medium">+{effectiveRewardCoins}</span>
                            </span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => onClose()}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300"
                        >
                          <span className="text-lg">Continue</span>
                        </button>
                      </>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white transition-colors text-base underline mt-4"
                    >
                      Close  
                    </button>
                  </motion.div>
                </>
              ) : (
                /* Ad Watching State */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8"
                >
                  <div className="text-5xl mb-4">📺</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Watching Ad...
                  </h3>
                  <p className="text-gray-300 mb-6 text-base">
                    Please wait while the ad loads
                  </p>
                  
                  {/* Loading Animation */}
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-500 border-t-transparent"></div>
                  </div>
                  
                  {/* Countdown */}
                  <p className="text-yellow-400 text-lg font-medium">
                    {countdown > 0 ? `${countdown} seconds remaining...` : 'Almost done...'}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}