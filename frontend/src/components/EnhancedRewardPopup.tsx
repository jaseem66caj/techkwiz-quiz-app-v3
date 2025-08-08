'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiRequestJson } from '../utils/api'

interface EnhancedRewardPopupProps {
  isOpen: boolean
  onClose: () => void
  isCorrect: boolean
  coinsEarned: number
  onAdCompleted: (coinsFromAd: number) => void
  autoClose?: boolean
  showMandatoryAd?: boolean
  adSlotCode?: string
}

interface RewardConfig {
  coin_reward: number
  is_active: boolean
  show_during_quiz: boolean
  trigger_after_questions: number
}

export function EnhancedRewardPopup({ 
  isOpen, 
  onClose, 
  isCorrect, 
  coinsEarned,
  onAdCompleted,
  autoClose = false,
  showMandatoryAd = false,
  adSlotCode = ""
}: EnhancedRewardPopupProps) {
  const [showingAd, setShowingAd] = useState(false)
  const [adCountdown, setAdCountdown] = useState(5)
  const [showClaim, setShowClaim] = useState(false)
  const [animateCoin, setAnimateCoin] = useState(false)
  const [config, setConfig] = useState<RewardConfig | null>(null)
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([])

  // Fetch reward configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
        const response = await fetch(`${backendUrl}/api/quiz/rewarded-config`)
        if (response.ok) {
          const configData = await response.json()
          setConfig(configData)
        }
      } catch (error) {
        console.error('Failed to fetch reward config:', error)
      }
    }
    fetchConfig()
  }, [])

  // Initialize popup effects
  useEffect(() => {
    if (isOpen) {
      // Generate sparkle positions
      const newSparkles = Array.from({length: 8}, (_, i) => ({
        id: i,
        x: Math.random() * 200,
        y: Math.random() * 150
      }))
      setSparkles(newSparkles)
      
      // Trigger coin animation
      setTimeout(() => setAnimateCoin(true), 500)
      
      // Auto-advance for sequential quiz flow
      if (autoClose) {
        setTimeout(() => {
          if (showMandatoryAd) {
            startAdExperience()
          } else {
            onClose()
          }
        }, 2000)
      } else {
        // Show claim button after initial animation
        setTimeout(() => setShowClaim(true), 1000)
      }
    }
  }, [isOpen, autoClose, showMandatoryAd])

  // Ad countdown timer
  useEffect(() => {
    if (showingAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (showingAd && adCountdown === 0) {
      completeAdExperience()
    }
  }, [showingAd, adCountdown])

  const startAdExperience = () => {
    setShowingAd(true)
    setAdCountdown(5)
    setShowClaim(false)
  }

  const completeAdExperience = () => {
    const adCoins = config?.coin_reward || 100
    setShowingAd(false)
    onAdCompleted(adCoins)
    
    // Show final reward animation
    setAnimateCoin(true)
    setTimeout(() => onClose(), 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Enhanced backdrop with blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />
        
        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map(sparkle => (
            <motion.div
              key={sparkle.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0.5, 1, 0],
                opacity: [0, 1, 0.8, 0.5, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2, 
                delay: sparkle.id * 0.1,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="absolute w-4 h-4 text-yellow-400"
              style={{ left: sparkle.x, top: sparkle.y }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        {/* Main popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -100 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300,
            duration: 0.5
          }}
          className="relative z-10 mx-4 w-full max-w-sm"
        >
          {!showingAd ? (
            // Reward Result Display
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-3xl border-2 border-orange-400/30 p-8 text-center shadow-2xl overflow-hidden">
              
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-pink-500/20 opacity-30 blur-xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                
                {/* Result Message */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.8 }}
                  className="mb-6"
                >
                  <div className="text-4xl mb-2">
                    {isCorrect ? '🎉' : '💡'}
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${
                    isCorrect ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {isCorrect ? 'Hurray!!' : 'Oops!!'}
                  </h2>
                  <p className={`text-lg ${
                    isCorrect ? 'text-green-300' : 'text-orange-300'
                  }`}>
                    {isCorrect ? 'Correct answer' : 'Wrong answer'}
                  </p>
                </motion.div>

                {/* Treasure Chest with Enhanced Animation */}
                <motion.div
                  initial={{ scale: 0, rotateY: -90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                  className="mb-6"
                >
                  <div className="relative mx-auto w-32 h-24">
                    <svg viewBox="0 0 160 120" className="w-full h-full">
                      {/* Chest Base */}
                      <rect x="30" y="60" width="100" height="45" rx="8" fill="#D4910A" stroke="#B8800A" strokeWidth="2"/>
                      
                      {/* Chest Lid */}
                      <ellipse cx="80" cy="60" rx="50" ry="18" fill="#F4B942" stroke="#D4910A" strokeWidth="2"/>
                      
                      {/* Enhanced Coins Display */}
                      {isCorrect ? (
                        // Correct: Multiple animated gold coins
                        <>
                          <motion.circle 
                            cx="65" cy="40" r="6" fill="#FFD700" stroke="#DAA520" strokeWidth="2"
                            animate={{ y: animateCoin ? [0, -10, 0] : 0 }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.circle 
                            cx="80" cy="35" r="6" fill="#FFD700" stroke="#DAA520" strokeWidth="2"
                            animate={{ y: animateCoin ? [0, -15, 0] : 0 }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.circle 
                            cx="95" cy="40" r="6" fill="#FFD700" stroke="#DAA520" strokeWidth="2"
                            animate={{ y: animateCoin ? [0, -8, 0] : 0 }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                          <motion.circle 
                            cx="72" cy="48" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="2"
                            animate={{ y: animateCoin ? [0, -12, 0] : 0 }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                          />
                          <motion.circle 
                            cx="88" cy="48" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="2"
                            animate={{ y: animateCoin ? [0, -9, 0] : 0 }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.8 }}
                          />
                        </>
                      ) : (
                        // Wrong: Fewer coins but still rewarding
                        <>
                          <motion.circle 
                            cx="72" cy="42" r="5" fill="#FFD700" stroke="#DAA520" strokeWidth="2"
                            animate={{ y: animateCoin ? [0, -8, 0] : 0 }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.circle 
                            cx="88" cy="42" r="5" fill="#FFD700" stroke="#DAA520" strokeWidth="2"
                            animate={{ y: animateCoin ? [0, -10, 0] : 0 }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                          />
                        </>
                      )}
                      
                      {/* Chest Lock */}
                      <rect x="77" y="65" width="6" height="12" rx="1" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="1"/>
                      <circle cx="80" cy="69" r="2" fill="#A0A0A0"/>
                    </svg>
                  </div>
                </motion.div>

                {/* Coins Earned Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6"
                >
                  <div className="bg-orange-500/20 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block border border-orange-400/30">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">🪙</span>
                      <span className="text-xl font-bold text-orange-400">
                        {isCorrect ? coinsEarned : 0}
                      </span>
                      <span className="text-orange-300">coins earned</span>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                {showClaim && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    {/* Mandatory Ad Button */}
                    <button
                      onClick={startAdExperience}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30 border border-purple-500/50"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm bg-white/20 px-2 py-1 rounded">Ad</span>
                        <span>Watch & Earn +{config?.coin_reward || 100} Coins</span>
                      </div>
                    </button>

                    {/* Skip Button (less prominent) */}
                    <button
                      onClick={onClose}
                      className="w-full bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      Skip for now
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            // Mandatory Ad Experience
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-3xl border-2 border-purple-400/30 p-8 text-center shadow-2xl overflow-hidden">
              
              {/* Ad countdown header */}
              <div className="mb-6">
                <div className="bg-purple-500/20 backdrop-blur-sm rounded-2xl px-4 py-2 inline-block border border-purple-400/30 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-purple-300">LIVE AD</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Watch to Continue</h3>
                <p className="text-purple-300">Earn {config?.coin_reward || 100} coins after watching</p>
              </div>

              {/* Ad Content Area - Ready for real ads */}
              <div className="mb-6">
                <div 
                  className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border-2 border-purple-400/30 h-48 flex items-center justify-center relative overflow-hidden"
                  dangerouslySetInnerHTML={adSlotCode ? { __html: adSlotCode } : undefined}
                >
                  {!adSlotCode && (
                    // Fallback placeholder
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-purple-300 font-semibold">Advertisement</p>
                      <p className="text-purple-400 text-sm">Powered by TechKwiz</p>
                    </div>
                  )}
                  
                  {/* Loading overlay during ad */}
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                        <span className="text-purple-300 font-medium">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="mb-6">
                <div className="bg-orange-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block border border-orange-400/30">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-orange-400/30"></div>
                      <div 
                        className="absolute inset-0 w-12 h-12 rounded-full border-4 border-orange-400 border-t-transparent animate-spin"
                        style={{ 
                          animation: `spin ${adCountdown}s linear infinite reverse`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-orange-400">{adCountdown}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-orange-400 font-bold">
                        {adCountdown} seconds remaining
                      </div>
                      <div className="text-orange-300 text-sm">
                        Please wait...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ad completion message */}
              {adCountdown <= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-green-400 font-bold"
                >
                  Completing ad experience...
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}