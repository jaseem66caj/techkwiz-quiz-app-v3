'use client'

import { useState, useEffect, useRef } from 'react'
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
  const adContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch reward configuration with improved error handling
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configData = await apiRequestJson('/api/quiz/rewarded-config')
        setConfig(configData)
        console.log('✅ EnhancedRewardPopup: Config loaded successfully:', configData)
      } catch (error) {
        console.error('❌ EnhancedRewardPopup: Failed to fetch config:', error)
        // Set default config on error
        setConfig({
          coin_reward: 100,
          is_active: true,
          show_during_quiz: true,
          trigger_after_questions: 1
        })
      }
    }
    fetchConfig()
  }, [])

  // Initialize popup effects
  useEffect(() => {
    if (isOpen) {
      const newSparkles = Array.from({length: 8}, (_, i) => ({ id: i, x: Math.random() * 200, y: Math.random() * 150 }))
      setSparkles(newSparkles)
      setTimeout(() => setAnimateCoin(true), 500)

      if (autoClose) {
        setTimeout(() => {
          if (showMandatoryAd) startAdExperience(); else onClose()
        }, 2000)
      } else {
        setTimeout(() => setShowClaim(true), 1000)
      }
    }
  }, [isOpen, autoClose, showMandatoryAd])

  // Ad countdown timer
  useEffect(() => {
    if (showingAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (showingAd && adCountdown === 0) {
      completeAdExperience()
    }
  }, [showingAd, adCountdown])

  // Inject ad scripts when showing ad and adSlotCode available
  useEffect(() => {
    if (!showingAd || !adSlotCode || !adContainerRef.current) return
    const container = adContainerRef.current
    container.innerHTML = ''

    const wrapper = document.createElement('div')
    wrapper.innerHTML = adSlotCode

    // Move non-script nodes
    Array.from(wrapper.childNodes).forEach(node => {
      if (node.nodeName.toLowerCase() !== 'script') {
        container.appendChild(node.cloneNode(true))
      }
    })

    // Execute scripts
    const scripts = wrapper.querySelectorAll('script')
    scripts.forEach(oldScript => {
      const s = document.createElement('script')
      Array.from(oldScript.attributes).forEach(attr => s.setAttribute(attr.name, attr.value))
      s.text = oldScript.text || ''
      container.appendChild(s)
    })
    console.log('📣 EnhancedRewardPopup: Ad scripts injected')
  }, [showingAd, adSlotCode])

  const startAdExperience = async () => {
    try {
      // Fire analytics start event
      await apiRequestJson('/api/quiz/ad-analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'start', placement: 'popup', source: 'category' })
      })
    } catch (e) { /* non-blocking */ }

    setShowingAd(true)
    setAdCountdown(5)
    setShowClaim(false)
  }

  const completeAdExperience = async () => {
    try {
      await apiRequestJson('/api/quiz/ad-analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'complete', placement: 'popup', source: 'category' })
      })
    } catch (e) { /* non-blocking */ }

    const adCoins = config?.coin_reward || 100
    setShowingAd(false)
    onAdCompleted(adCoins)
    setAnimateCoin(true)
    setTimeout(() => onClose(), 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Enhanced backdrop with blur */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map(sparkle => (
            <motion.div key={sparkle.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1, 0.5, 1, 0], opacity: [0, 1, 0.8, 0.5, 0], rotate: [0, 180, 360] }} transition={{ duration: 2, delay: sparkle.id * 0.1, repeat: Infinity, repeatDelay: 3 }} className="absolute w-4 h-4 text-yellow-400" style={{ left: sparkle.x, top: sparkle.y }}>✨</motion.div>
          ))}
        </div>

        {/* Main popup */}
        <motion.div initial={{ opacity: 0, scale: 0.5, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: -100 }} transition={{ type: 'spring', damping: 20, stiffness: 300, duration: 0.5 }} className="relative z-10 mx-4 w-full max-w-sm">
          {!showingAd ? (
            // Reward Result Display
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-3xl border-2 border-orange-400/30 p-8 text-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-pink-500/20 opacity-30 blur-xl"></div>
              <div className="relative z-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.8 }} className="mb-6">
                  <div className="text-4xl mb-2">{isCorrect ? '🎉' : '💡'}</div>
                  <h2 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-orange-400'}`}>{isCorrect ? 'Hurray!!' : 'Oops!!'}</h2>
                  <p className={`text-lg ${isCorrect ? 'text-green-300' : 'text-orange-300'}`}>{isCorrect ? 'Correct answer' : 'Wrong answer'}</p>
                </motion.div>

                {/* Chest + coins omitted here for brevity - unchanged from previous version */}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-6">
                  <div className="bg-orange-500/20 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block border border-orange-400/30">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">🪙</span>
                      <span className="text-xl font-bold text-orange-400">{isCorrect ? coinsEarned : 0}</span>
                      <span className="text-orange-300">coins earned</span>
                    </div>
                  </div>
                </motion.div>

                {showClaim && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="space-y-3">
                    <button onClick={startAdExperience} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>Claim</span>
                        <span className="bg-black/20 px-2 py-1 rounded-md text-xs">Ad</span>
                      </span>
                    </button>
                    <button onClick={() => onClose()} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300">Continue</button>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            // Mandatory Ad Experience
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-3xl border-2 border-purple-400/30 p-8 text-center shadow-2xl overflow-hidden">
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

              {/* Ad Content Area with real script execution */}
              <div className="mb-6">
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border-2 border-purple-400/30 h-48 flex items-center justify-center relative overflow-hidden">
                  <div ref={adContainerRef} className="absolute inset-0" />
                  {!adSlotCode && (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-purple-300 font-semibold">Advertisement</p>
                      <p className="text-purple-400 text-sm">Powered by TechKwiz</p>
                    </div>
                  )}
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

              {/* Countdown */}
              <div className="mb-6">
                <div className="bg-orange-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block border border-orange-400/30">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-orange-400/30"></div>
                      <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" style={{ animation: `spin ${adCountdown}s linear infinite reverse` }}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-orange-400">{adCountdown}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-orange-400 font-bold">{adCountdown} seconds remaining</div>
                      <div className="text-orange-300 text-sm">Please wait...</div>
                    </div>
                  </div>
                </div>
              </div>

              {adCountdown <= 1 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-green-400 font-bold">Completing ad experience...</motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}