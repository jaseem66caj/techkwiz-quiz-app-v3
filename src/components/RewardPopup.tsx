'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RewardPopupProps {
  isOpen: boolean
  onClose: () => void
  coinsEarned: number
  onClaimReward: () => void
  onSkipReward: () => void
  canWatchAgain?: boolean
  onWatchAgain?: () => void
  isCorrect?: boolean
  rewardCoins?: number
}

export function RewardPopup({ 
  isOpen, 
  onClose, 
  coinsEarned, 
  onClaimReward, 
  onSkipReward,
  canWatchAgain = false,
  onWatchAgain,
  isCorrect = true,
  rewardCoins = 100
}: RewardPopupProps) {
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [hasWatchedOnce, setHasWatchedOnce] = useState(false)

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClaimReward = () => {
    setIsWatchingAd(true)
    
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
      
      // Simulate watching another ad
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Transparent overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"></div>
          
          {/* Popup positioned over quiz answer buttons */}
          <div className="absolute inset-0 flex items-start justify-center pt-20 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: -20 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ duration: 0.4, type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-3xl p-6 max-w-sm w-full text-center border-2 border-white/20 shadow-2xl overflow-hidden pointer-events-auto"
            >
              {!isWatchingAd ? (
                <>
                  {/* Treasure Chest Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                    className="mb-4"
                  >
                    <div className="relative mx-auto w-20 h-16">
                      <div className="absolute inset-0">
                        <svg viewBox="0 0 100 80" className="w-full h-full">
                          {/* Chest Base */}
                          <rect x="15" y="40" width="70" height="30" rx="4" fill="#D4910A" stroke="#B8800A" strokeWidth="2"/>
                          
                          {/* Chest Lid */}
                          <ellipse cx="50" cy="40" rx="35" ry="12" fill="#F4B942" stroke="#D4910A" strokeWidth="2"/>
                          
                          {/* Lock */}
                          <rect x="47" y="43" width="6" height="8" rx="1" fill="#C0C0C0"/>
                          <circle cx="50" cy="45" r="2" fill="#A0A0A0"/>
                          
                          {/* Coins inside (only show for correct answers) */}
                          {isCorrect && (
                            <>
                              <circle cx="40" cy="30" r="3" fill="#FFD700"/>
                              <circle cx="50" cy="27" r="3" fill="#FFD700"/>
                              <circle cx="60" cy="30" r="3" fill="#FFD700"/>
                            </>
                          )}
                          
                          {/* Sparkles */}
                          <motion.g
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <polygon points="25,20 27,25 22,25" fill={isCorrect ? "#FFD700" : "#FFA500"}/>
                            <polygon points="75,20 77,25 72,25" fill={isCorrect ? "#FFD700" : "#FFA500"}/>
                            <polygon points="50,15 52,20 47,20" fill={isCorrect ? "#FFD700" : "#FFA500"}/>
                          </motion.g>
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Success/Failure Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-4"
                  >
                    <h2 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-yellow-400' : 'text-yellow-400'}`}>
                      {isCorrect ? 'Hurray!!' : 'Oops!!'}
                    </h2>
                    <p className={`text-base mb-3 ${isCorrect ? 'text-yellow-300' : 'text-gray-300'}`}>
                      {isCorrect ? 'Correct answer' : 'Wrong answer'}
                    </p>
                    
                    {isCorrect ? (
                      <p className="text-white text-base mb-2">
                        You won <span className="text-yellow-400 font-bold">{coinsEarned} coins</span>
                      </p>
                    ) : (
                      <p className="text-white text-base mb-2">
                        You still have a chance to win coins.
                      </p>
                    )}
                    
                    <p className="text-white text-sm leading-relaxed">
                      Just watch an ad & earn <span className="text-yellow-400 font-bold">{rewardCoins} coins</span>
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    {/* Show different buttons based on state */}
                    {!hasWatchedOnce ? (
                      /* First time - show Claim Ad button */
                      <button
                        onClick={handleClaimReward}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <span>Claim</span>
                          <span className="bg-black/20 px-2 py-1 rounded-md text-xs">Ad</span>
                        </span>
                        
                        {/* Button shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: [-100, 300] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            repeatDelay: 3,
                            ease: "easeInOut"
                          }}
                        />
                      </button>
                    ) : (
                      /* After first ad - show Watch Again or Close */
                      <>
                        {canWatchAgain && onWatchAgain && (
                          <button
                            onClick={handleWatchAgain}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <span className="flex items-center justify-center space-x-2">
                              <span>Watch Again</span>
                              <span className="bg-green-800 px-2 py-1 rounded-md text-xs">+{rewardCoins}</span>
                            </span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => onClose()}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300"
                        >
                          Continue
                        </button>
                      </>
                    )}

                    {/* Close Button - always available */}
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white transition-colors text-sm underline"
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
                  className="py-6"
                >
                  <div className="text-3xl mb-3">📺</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Watching Ad...
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    Please wait while the ad loads
                  </p>
                  
                  {/* Loading Animation */}
                  <div className="flex justify-center mb-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  </div>
                  
                  {/* Countdown */}
                  <p className="text-yellow-400 text-xs">
                    Ad will finish in a few seconds...
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}