'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RewardPopupProps {
  isOpen: boolean
  onClose: () => void
  coinsEarned: number
  onClaimReward: () => void
  onSkipReward: () => void
  canWatchAgain?: boolean
  onWatchAgain?: () => void
}

export function RewardPopup({ 
  isOpen, 
  onClose, 
  coinsEarned, 
  onClaimReward, 
  onSkipReward,
  canWatchAgain = false,
  onWatchAgain
}: RewardPopupProps) {
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [hasWatchedOnce, setHasWatchedOnce] = useState(false)

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

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-sm w-full text-center border border-white/10 shadow-2xl"
        >
          {!isWatchingAd ? (
            <>
              {/* Treasure Chest Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                className="mb-6"
              >
                <div className="relative mx-auto w-24 h-20">
                  {/* Treasure Chest */}
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 100 80" className="w-full h-full">
                      {/* Chest Base */}
                      <rect x="10" y="35" width="80" height="35" rx="5" fill="#D4910A" stroke="#B8800A" strokeWidth="2"/>
                      
                      {/* Chest Lid */}
                      <ellipse cx="50" cy="35" rx="40" ry="15" fill="#F4B942" stroke="#D4910A" strokeWidth="2"/>
                      
                      {/* Lock */}
                      <rect x="47" y="40" width="6" height="8" rx="1" fill="#FFD700"/>
                      <circle cx="50" cy="42" r="2" fill="#FFA500"/>
                      
                      {/* Coins inside */}
                      <circle cx="40" cy="25" r="4" fill="#FFD700"/>
                      <circle cx="50" cy="22" r="4" fill="#FFD700"/>
                      <circle cx="60" cy="25" r="4" fill="#FFD700"/>
                      
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
                        <polygon points="30,15 32,20 27,20" fill="#FFD700"/>
                        <polygon points="70,15 72,20 67,20" fill="#FFD700"/>
                        <polygon points="50,10 52,15 47,15" fill="#FFD700"/>
                      </motion.g>
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  Hurray!!
                </h2>
                <p className="text-yellow-300 text-lg mb-4">
                  Correct answer
                </p>
              </motion.div>

              {/* Coins Won */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <p className="text-white text-xl mb-3">
                  You won <span className="text-yellow-400 font-bold">{coinsEarned} coins</span>
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  You have a chance to double your coins by watching an ad.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                {/* Claim Button */}
                <button
                  onClick={handleClaimReward}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Claim</span>
                    <span className="bg-purple-800 px-2 py-1 rounded-md text-xs">Ad</span>
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

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors underline"
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
              <div className="text-4xl mb-4">📺</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Watching Ad...
              </h3>
              <p className="text-gray-300 mb-6">
                Please wait while the ad loads
              </p>
              
              {/* Loading Animation */}
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
              
              {/* Countdown */}
              <p className="text-yellow-400 text-sm">
                Ad will finish in a few seconds...
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}