'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../app/providers'
import { getAdRewardAmount, getRewardConfig } from '../utils/rewardCalculator'

interface UnifiedRewardPopupProps {
  isOpen: boolean
  onClose: () => void
  isCorrect: boolean
  coinsEarned: number
  onAdCompleted: (coinsFromAd: number) => void
  autoClose?: boolean
  showMandatoryAd?: boolean
  adSlotCode?: string
  canWatchAgain?: boolean
  onWatchAgain?: () => void
  rewardCoins?: number
  categoryId?: string
  disableAnalytics?: boolean
  disableScripts?: boolean
}

export function UnifiedRewardPopup({
  isOpen,
  onClose,
  isCorrect,
  coinsEarned,
  onAdCompleted,
  autoClose = false,
  showMandatoryAd = false,
  adSlotCode = '',
  canWatchAgain = false,
  onWatchAgain,
  rewardCoins,
  categoryId,
  disableAnalytics = false,
  disableScripts = false,
}: UnifiedRewardPopupProps) {
  const { state } = useApp()
  const [showingAd, setShowingAd] = useState(false)
  const [adCountdown, setAdCountdown] = useState(5)
  const [showClaim, setShowClaim] = useState(false)
  const [animateCoin, setAnimateCoin] = useState(false)
  const [sparkles, setSparkles] = useState<Array<{ id: number, x: number, y: number }>>([])
  const [hasWatchedOnce, setHasWatchedOnce] = useState(false)
  const adContainerRef = useRef<HTMLDivElement | null>(null)
  const config = getRewardConfig()
  
  // Use rewardCoins prop if provided, otherwise use ad reward amount from config
  const effectiveRewardCoins = rewardCoins !== undefined ? rewardCoins : getAdRewardAmount()

  // Init effects
  useEffect(() => {
    if (isOpen) {
      const s = Array.from({ length: 8 }, (_, i) => ({ id: i, x: Math.random() * 200, y: Math.random() * 150 }))
      setSparkles(s)
      setTimeout(() => setAnimateCoin(true), 500)

      if (autoClose) {
        setTimeout(() => { showMandatoryAd ? startAdExperience() : onClose() }, 1800)
      } else {
        setTimeout(() => setShowClaim(true), 900)
      }
    }
  }, [isOpen, autoClose, showMandatoryAd, onClose])

  // Ad countdown
  useEffect(() => {
    if (showingAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(v => v - 1), 1000)
      return () => clearTimeout(timer)
    } else if (showingAd && adCountdown === 0) {
      completeAdExperience()
    }
  }, [showingAd, adCountdown])

  // Inject ad scripts when showing
  useEffect(() => {
    if (!showingAd || !adSlotCode || !adContainerRef.current || disableScripts) return
    const container = adContainerRef.current
    container.innerHTML = ''
    const wrap = document.createElement('div')
    wrap.innerHTML = adSlotCode
    Array.from(wrap.childNodes).forEach(node => { if (node.nodeName.toLowerCase() !== 'script') container.appendChild(node.cloneNode(true)) })
    wrap.querySelectorAll('script').forEach(old => { const s = document.createElement('script'); Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value)); s.text = old.text || ''; container.appendChild(s) })
  }, [showingAd, adSlotCode, disableScripts])

  const sendAnalytics = async (type: 'start' | 'complete') => {
    if (disableAnalytics) return
    // Removed backend API call for analytics
    console.log(`Analytics event: ${type}`)
  }

  const startAdExperience = async () => {
    setShowingAd(true)
    setAdCountdown(5)
    setShowClaim(false)
    await sendAnalytics('start')
  }

  const completeAdExperience = async () => {
    // Ad rewards are disabled per governance rules
    const adCoins = config.adSettings.enabled ? effectiveRewardCoins : 0
    setShowingAd(false)
    setHasWatchedOnce(true)
    onAdCompleted(adCoins)
    await sendAnalytics('complete')
    if (!canWatchAgain) {
      setTimeout(() => onClose(), 1200)
    }
  }

  const handleWatchAgain = async () => {
    if (!onWatchAgain) return
    setShowingAd(true)
    setAdCountdown(5)
    setShowClaim(false)
    await sendAnalytics('start')
    setTimeout(async () => {
      setShowingAd(false)
      onWatchAgain()
      await sendAnalytics('complete')
      onClose()
    }, 5000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        />

        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map(s => (
            <motion.div 
              key={s.id} 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ 
                scale: [0, 1, 0.5, 1, 0], 
                opacity: [0, 1, 0.8, 0.5, 0], 
                rotate: [0, 180, 360] 
              }} 
              transition={{ 
                duration: 2, 
                delay: s.id * 0.1, 
                repeat: Infinity, 
                repeatDelay: 3 
              }} 
              className="absolute w-4 h-4 text-yellow-400" 
              style={{ left: s.x, top: s.y }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 60 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: -60 }} 
          transition={{ type: 'spring', damping: 20, stiffness: 280, duration: 0.45 }} 
          className="relative z-10 mx-4 w-full max-w-sm"
        >
          {!showingAd ? (
            <div className="relative rounded-[28px] border border-orange-400/30 p-8 text-center overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(145deg, #111827 0%, #0f172a 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-pink-500/20 opacity-20 blur-xl" />
              <div className="relative z-10">
                {/* User info display */}
                {state.user && state.user.name !== 'Guest' && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center bg-gray-800/50 rounded-full px-4 py-2 border border-gray-700">
                      <span className="text-2xl mr-2">{state.user.avatar}</span>
                      <span className="text-white font-medium">{state.user.name}</span>
                    </div>
                  </div>
                )}
                
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

                <h2 className={`text-2xl font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isCorrect ? 'Hurray!!' : 'Oops!!'}
                </h2>
                <p className={`text-base ${isCorrect ? 'text-green-300' : 'text-yellow-300'}`}>
                  {isCorrect ? 'Correct answer' : 'Wrong answer'}
                </p>

                <div className="mt-4 inline-block rounded-2xl px-5 py-2 border border-orange-400/30 bg-orange-500/10">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <span className="text-xl font-bold text-orange-400">{isCorrect ? coinsEarned : 0}</span>
                    <span className="text-orange-300">coins earned</span>
                  </div>
                </div>

                {showClaim && (
                  <div className="mt-6 space-y-3">
                    {/* Ad rewards are disabled per governance rules, but we still show the option for UI consistency */}
                    {config.adSettings.enabled ? (
                      <>
                        <button 
                          onClick={startAdExperience} 
                          className="w-full relative rounded-2xl py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02]" 
                          style={{ background: 'linear-gradient(90deg, #6d28d9 0%, #5b21b6 100%)' }}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <span>Claim</span>
                            <span className="text-xs px-2 py-1 rounded-md bg-black/20">Ad</span>
                          </span>
                          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
                        </button>
                        <button 
                          onClick={() => onClose()} 
                          className="w-full rounded-2xl py-3 font-bold text-white bg-gray-600 hover:bg-gray-700"
                        >
                          Continue
                        </button>
                      </>
                    ) : (
                      <>
                        {!hasWatchedOnce ? (
                          <button 
                            onClick={startAdExperience} 
                            className="w-full relative rounded-2xl py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02]" 
                            style={{ background: 'linear-gradient(90deg, #6d28d9 0%, #5b21b6 100%)' }}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <span>Claim</span>
                              <span className="text-xs px-2 py-1 rounded-md bg-black/20">Ad</span>
                            </span>
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
                          </button>
                        ) : canWatchAgain ? (
                          <button
                            onClick={handleWatchAgain}
                            className="w-full rounded-2xl py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] bg-green-600 hover:bg-green-700"
                          >
                            <span className="flex items-center justify-center gap-3">
                              <span>Watch Again</span>
                              <span className="text-sm px-3 py-1 rounded-md bg-green-800/70">+{effectiveRewardCoins}</span>
                            </span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => onClose()} 
                            className="w-full rounded-2xl py-3 font-bold text-white bg-gray-600 hover:bg-gray-700"
                          >
                            Continue
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative rounded-[28px] border border-purple-400/30 p-8 text-center overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(145deg, #111827 0%, #0f172a 100%)' }}>
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-purple-400/30 bg-purple-500/20">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-purple-300">LIVE AD</span>
                </div>
              </div>

              <div className="mb-4 h-48 relative rounded-xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-600/20 to-pink-600/20 overflow-hidden">
                <div ref={adContainerRef} className="absolute inset-0" />
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="bg-black/60 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400" />
                      <span className="text-purple-300 font-medium">Loading...</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-1 text-yellow-400 font-bold">{adCountdown} seconds remaining</div>
              <div className="text-yellow-300 text-sm">Please wait…</div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}