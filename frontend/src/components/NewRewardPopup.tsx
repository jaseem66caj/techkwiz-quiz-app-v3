'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiRequestJson, getBackendUrl } from '../utils/api'

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
  adSlotCode?: string // optional pre-fetched ad code
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
  categoryId,
  adSlotCode
}: NewRewardPopupProps) {
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [hasWatchedOnce, setHasWatchedOnce] = useState(false)
  const [config, setConfig] = useState<RewardConfig | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [adHtml, setAdHtml] = useState<string>('')
  const adContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch reward configuration and popup interstitial ad code
  useEffect(() => {
    const fetchConfigAndAd = async () => {
      try {
        const endpoint = categoryId 
          ? `/api/quiz/rewarded-config/${categoryId}` 
          : '/api/quiz/rewarded-config'
        const configData = await apiRequestJson<RewardConfig>(endpoint)
        setConfig(configData)
        console.log('✅ NewRewardPopup: Config fetched successfully:', configData)
      } catch (error) {
        console.error('❌ NewRewardPopup: Failed to fetch reward config:', error)
        setConfig({ coin_reward: 100, is_active: true, show_on_insufficient_coins: true, show_during_quiz: true })
      }

      // Prefer ad code passed via props, else fetch popup interstitial placement
      if (adSlotCode && adSlotCode.trim() !== '') {
        setAdHtml(adSlotCode)
        return
      }

      try {
        const adSlots = await apiRequestJson<any[]>(`/api/quiz/ad-slots/popup`)
        const active = adSlots?.find(s => s?.is_active && (s?.ad_code || '').trim() !== '') || adSlots?.[0]
        if (active?.ad_code) {
          setAdHtml(active.ad_code)
          console.log('✅ NewRewardPopup: Loaded popup interstitial ad slot')
        } else {
          console.log('ℹ️ NewRewardPopup: No active popup interstitial ad code found')
        }
      } catch (e) {
        console.log('⚠️ NewRewardPopup: Could not fetch popup ad slot, proceeding with simulation')
      }
    }

    if (isOpen) {
      console.log('🔧 NewRewardPopup: Popup opened, fetching config + ad...')
      fetchConfigAndAd()
    }
  }, [isOpen, categoryId, adSlotCode])

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'visible'
    }
    return () => { document.body.style.overflow = 'visible' }
  }, [isOpen])

  // Execute any script tags inside adHtml when we enter watching state
  useEffect(() => {
    if (!isWatchingAd || !adHtml || !adContainerRef.current) return

    // Clear previous children
    const container = adContainerRef.current
    container.innerHTML = ''

    // Create a temp wrapper to parse HTML
    const wrapper = document.createElement('div')
    wrapper.innerHTML = adHtml

    // Move non-script nodes
    Array.from(wrapper.childNodes).forEach(node => {
      if (node.nodeName.toLowerCase() !== 'script') {
        container.appendChild(node.cloneNode(true))
      }
    })

    // Execute scripts by creating new script elements
    const scriptTags = wrapper.querySelectorAll('script')
    scriptTags.forEach(oldScript => {
      const s = document.createElement('script')
      // copy attributes
      Array.from(oldScript.attributes).forEach(attr => s.setAttribute(attr.name, attr.value))
      s.text = oldScript.text || ''
      container.appendChild(s)
    })
    console.log('📣 NewRewardPopup: Ad scripts injected')
  }, [isWatchingAd, adHtml])

  // Countdown timer for ad watching
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isWatchingAd && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [isWatchingAd, countdown])

  const handleClaimReward = async () => {
    try {
      await fetch('/api/quiz/ad-analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'start', placement: 'popup', source: 'homepage' })
      })
    } catch (e) { /* ignore */ }

    setIsWatchingAd(true)
    setCountdown(5)

    // Simulate watching ad for 5 seconds
    setTimeout(() => {
      setIsWatchingAd(false)
      setHasWatchedOnce(true)
      onClaimReward()
      try {
        await fetch('/api/quiz/ad-analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'complete', placement: 'popup', source: 'homepage' })
        })
      } catch (e) { /* ignore */ }
      if (!canWatchAgain) onClose()
    }, 5000)
  }

  const handleWatchAgain = async () => {
    if (!onWatchAgain) return
    setIsWatchingAd(true)
    setCountdown(5)
    setTimeout(async () => {
      setIsWatchingAd(false)
      onWatchAgain()
      try {
        await fetch('/api/quiz/ad-analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'complete', placement: 'popup', source: 'homepage' })
        })
      } catch (e) {}
      onClose()
    }, 5000)
  }

  const handleClose = () => {
    onSkipReward()
    onClose()
  }

  // Don't show popup if config says it's not active
  if (config && !config.is_active) {
    console.log('🚫 NewRewardPopup: Popup blocked - config.is_active is false')
    return null
  }

  const effectiveRewardCoins = config?.coin_reward || rewardCoins

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Full screen overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          {/* Popup Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 mx-4 w-full max-w-sm"
          >
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border-2 border-white/30 p-6 text-center shadow-2xl overflow-hidden">
              {!isWatchingAd ? (
                <>
                  {/* Treasure Chest */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
                    className="mb-6"
                  >
                    <div className="relative mx-auto w-24 h-20">
                      <svg viewBox="0 0 120 100" className="w-full h-full">
                        <rect x="20" y="50" width="80" height="35" rx="6" fill="#D4910A" stroke="#B8800A" strokeWidth="2"/>
                        <ellipse cx="60" cy="50" rx="40" ry="15" fill="#F4B942" stroke="#D4910A" strokeWidth="2"/>
                        <rect x="57" y="53" width="6" height="10" rx="1" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="1"/>
                        <circle cx="60" cy="56" r="2" fill="#A0A0A0"/>
                        {isCorrect ? (
                          <>
                            <circle cx="50" cy="35" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="60" cy="32" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="70" cy="35" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="55" cy="40" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="65" cy="40" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                          </>
                        ) : (
                          <>
                            <circle cx="55" cy="35" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                            <circle cx="65" cy="35" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                          </>
                        )}
                        <motion.g
                          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
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

                  {/* Messages */}
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
                      <p className="text-white text-base mb-3">You still have a chance to win coins.</p>
                    )}
                    <p className="text-white text-lg leading-relaxed">
                      <span className="block">Just watch an ad & earn</span>
                      <span className="text-yellow-400 font-bold text-xl">{effectiveRewardCoins} coins</span>
                    </p>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    {!hasWatchedOnce ? (
                      <button
                        onClick={handleClaimReward}
                        className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-3">
                          <span className="text-lg">Claim</span>
                          <span className="bg-purple-900/50 px-3 py-1 rounded-md text-sm font-medium">Ad</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-300/20 to-purple-400/0 animate-pulse"></div>
                      </button>
                    ) : (
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

                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white transition-colors text-base underline mt-4"
                    >
                      Close  
                    </button>
                  </motion.div>
                </>
              ) : (
                // Ad Watching State with real ad code injection support
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
                  <div className="mb-4">
                    <div className="bg-purple-500/20 backdrop-blur-sm rounded-2xl px-4 py-2 inline-block border border-purple-400/30 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-purple-300">LIVE AD</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Watching Ad...</h3>
                    <p className="text-gray-300 mt-1">Please wait while the ad loads</p>
                  </div>

                  {/* Ad container - scripts will be executed */}
                  <div className="relative mb-4">
                    <div ref={adContainerRef} className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border-2 border-purple-400/30 h-48 flex items-center justify-center overflow-hidden" />
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                          <span className="text-purple-300 font-medium">Loading...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Countdown */}
                  <p className="text-yellow-400 text-lg font-medium">{countdown > 0 ? `${countdown} seconds remaining...` : 'Almost done...'}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}