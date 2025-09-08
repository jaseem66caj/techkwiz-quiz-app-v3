// ===================================================================
// TechKwiz Reward Popup Component
// ===================================================================
// This component renders an engaging reward popup that appears after users answer
// quiz questions. It provides an opportunity for users to earn additional coins
// by watching advertisements. The popup features animated treasure chest graphics,
// smooth transitions, and interactive elements to enhance user engagement.

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Interface defining the props for the Reward Popup component
interface RewardPopupProps {
  // Flag indicating whether the popup should be visible
  isOpen: boolean
  // Callback function to close the popup
  onClose: () => void
  // Number of coins earned from answering the question
  coinsEarned: number
  // Callback function when user claims the reward by watching an ad
  onClaimReward: () => void
  // Callback function when user skips the reward
  onSkipReward: () => void
  // Flag indicating if user can watch another ad (default: false)
  canWatchAgain?: boolean
  // Callback function when user chooses to watch another ad
  onWatchAgain?: () => void
  // Flag indicating if the answer was correct (default: true)
  isCorrect?: boolean
  // Number of coins available as reward for watching ad (default: 100)
  rewardCoins?: number
}

// Reward Popup component that displays after quiz answers with ad reward opportunities
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
  // State to track if user is currently watching an ad
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  // State to track if user has watched an ad at least once
  const [hasWatchedOnce, setHasWatchedOnce] = useState(false)

  // Effect to prevent body scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle user clicking the "Claim Reward" button
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

  // Handle user clicking the "Watch Again" button
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

  // Handle closing the popup (user skips reward)
  const handleClose = () => {
    onSkipReward()
    onClose()
  }

  // ===================================================================
  // Main Component Render
  // ===================================================================
  // Renders the complete reward popup with animations and interactive elements
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Transparent overlay to dim background */}
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
              {/* Main content when not watching an ad */}
              {!isWatchingAd ? (
                <>
                  {/* Animated Treasure Chest Visualization */}
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
                          
                          {/* Animated Sparkles for visual effect */}
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

                  {/* Result Message Section */}
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
                    
                    {/* Display coins earned or encouragement message */}
                    {isCorrect ? (
                      <p className="text-white text-base mb-2">
                        You won <span className="text-yellow-400 font-bold">{coinsEarned} coins</span>
                      </p>
                    ) : (
                      <p className="text-white text-base mb-2">
                        You still have a chance to win coins.
                      </p>
                    )}
                    
                    {/* Ad reward opportunity message */}
                    <p className="text-white text-sm leading-relaxed">
                      Just watch an ad & earn <span className="text-yellow-400 font-bold">{rewardCoins} coins</span>
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    {/* Show different buttons based on user's ad watching history */}
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
                        
                        {/* Animated button shine effect for visual appeal */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: [-100, 300] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        />
                      </button>
                    ) : canWatchAgain ? (
                      /* User has watched once and can watch again - show Watch Again button */
                      <button
                        onClick={handleWatchAgain}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Watch Again
                      </button>
                    ) : (
                      /* User has watched once but can't watch again - show Continue button */
                      <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Continue
                      </button>
                    )}
                    
                    {/* Skip button - always available */}
                    <button
                      onClick={handleClose}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300"
                    >
                      Skip
                    </button>
                  </motion.div>
                </>
              ) : (
                /* Ad watching state - show countdown timer */
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">Watching Ad</h3>
                  <p className="text-gray-300 mb-4">Your reward is on the way!</p>
                  <p className="text-sm text-gray-400">5 seconds remaining...</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}