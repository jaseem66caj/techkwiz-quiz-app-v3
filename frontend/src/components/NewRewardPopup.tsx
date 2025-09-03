'use client'

import { useEffect, useRef, useState } from 'react'
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
  adSlotCode?: string
  disableAnalytics?: boolean // NEW: preview mode can disable analytics
  disableScripts?: boolean // NEW: preview mode can disable ad script injection
}

interface RewardConfig {
  coin_reward: number
  is_active: boolean
  show_on_insufficient_coins: boolean
  show_during_quiz: boolean
  enable_analytics?: boolean
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
  adSlotCode,
  disableAnalytics = false,
  disableScripts = false,
}: NewRewardPopupProps) {
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [hasWatchedOnce, setHasWatchedOnce] = useState(false)
  const [config, setConfig] = useState<RewardConfig | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [adHtml, setAdHtml] = useState<string>('')
  const adContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch config and popup ad slot - now using default values instead of API calls
  useEffect(() => {
    // Removed backend API calls and using default config
    setConfig({ coin_reward: 100, is_active: true, show_on_insufficient_coins: true, show_during_quiz: true, enable_analytics: false })

    if (disableScripts) return

    // Use provided ad slot code if available
    if (adSlotCode && adSlotCode.trim()) {
      setAdHtml(adSlotCode)
    }
    // Removed API call to fetch ad slots
  }, [isOpen, categoryId, adSlotCode, disableScripts])

  // Prevent scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'visible'
    return () => { document.body.style.overflow = 'visible' }
  }, [isOpen])

  // Inject scripts on watch
  useEffect(() => {
    if (disableScripts) return
    if (!isWatchingAd || !adHtml || !adContainerRef.current) return
    const container = adContainerRef.current
    container.innerHTML = ''
    const wrapper = document.createElement('div')
    wrapper.innerHTML = adHtml
    Array.from(wrapper.childNodes).forEach(node => {
      if (node.nodeName.toLowerCase() !== 'script') container.appendChild(node.cloneNode(true))
    })
    const scripts = wrapper.querySelectorAll('script')
    scripts.forEach(oldScript => {
      const s = document.createElement('script')
      Array.from(oldScript.attributes).forEach(attr => s.setAttribute(attr.name, attr.value))
      s.text = oldScript.text || ''
      container.appendChild(s)
    })
  }, [isWatchingAd, adHtml, disableScripts])

  // Countdown
  useEffect(() => {
    let t: any
    if (isWatchingAd && countdown > 0) t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [isWatchingAd, countdown])

  const sendAnalytics = async (type: 'start' | 'complete') => {
    // Removed backend API call for analytics
    console.log(`Analytics event: ${type}`)
  }

  const handleClaimReward = async () => {
    setIsWatchingAd(true)
    setCountdown(5)
    await sendAnalytics('start')
    setTimeout(async () => {
      setIsWatchingAd(false)
      setHasWatchedOnce(true)
      onClaimReward()
      await sendAnalytics('complete')
      if (!canWatchAgain) onClose()
    }, 5000)
  }

  const handleWatchAgain = async () => {
    if (!onWatchAgain) return
    setIsWatchingAd(true)
    setCountdown(5)
    await sendAnalytics('start')
    setTimeout(async () => {
      setIsWatchingAd(false)
      onWatchAgain()
      await sendAnalytics('complete')
      onClose()
    }, 5000)
  }

  const handleClose = () => {
    onSkipReward()
    onClose()
  }

  if (config && !config.is_active) return null

  const effectiveRewardCoins = config?.coin_reward || rewardCoins

  // UI (Qureka-style)
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }} className="relative z-10 mx-4 w-full max-w-sm">
            <div className="relative rounded-[28px] border border-white/25 shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #0b1020 0%, #0a0d1a 100%)' }}>
              {!isWatchingAd ? (
                <div className="p-7 text-center">
                  <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }} className="mb-6">
                    <div className="mx-auto w-24 h-20">
                      <svg viewBox="0 0 120 100" className="w-full h-full">
                        <rect x="20" y="50" width="80" height="35" rx="8" fill="#D4910A" stroke="#B8800A" strokeWidth="2" />
                        <ellipse cx="60" cy="50" rx="40" ry="15" fill="#F4B942" stroke="#D4910A" strokeWidth="2" />
                        <rect x="57" y="53" width="6" height="10" rx="1" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="1" />
                        <circle cx="60" cy="56" r="2" fill="#A0A0A0" />
                        {/* Coins inside */}
                        <circle cx="50" cy="35" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1" style={{ display: isCorrect ? 'block' : 'none' }} />
                        <circle cx="60" cy="32" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1" style={{ display: isCorrect ? 'block' : 'none' }} />
                        <circle cx="70" cy="35" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1" style={{ display: isCorrect ? 'block' : 'none' }} />
                        <circle cx="55" cy="35" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1" style={{ display: isCorrect ? 'none' : 'block' }} />
                        <circle cx="65" cy="35" r="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1" style={{ display: isCorrect ? 'none' : 'block' }} />
                      </svg>
                    </div>
                  </motion.div>

                  <h2 className="text-3xl font-extrabold text-yellow-400 mb-1">{isCorrect ? 'Hurray!!' : 'Oops!!'}</h2>
                  <p className="text-base font-semibold text-yellow-300 mb-3">{isCorrect ? 'Correct answer' : 'Wrong answer'}</p>

                  {isCorrect ? (
                    <p className="text-white text-base mb-3">You won <span className="text-yellow-400 font-bold">{coinsEarned} coins</span></p>
                  ) : (
                    <p className="text-white text-base mb-3">You still have a chance to win coins.</p>
                  )}

                  <p className="text-white text-lg leading-relaxed">
                    <span className="block">Just watch an ad & earn</span>
                    <span className="text-yellow-400 font-bold text-[22px]">{effectiveRewardCoins} coins</span>
                  </p>

                  <div className="mt-6 space-y-4">
                    {!hasWatchedOnce ? (
                      <button onClick={handleClaimReward} className="w-full relative rounded-2xl py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(90deg, #6d28d9 0%, #5b21b6 100%)' }}>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <span className="text-lg">Claim</span>
                          <span className="text-sm px-3 py-1 rounded-md bg-purple-900/60">Ad</span>
                        </span>
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
                      </button>
                    ) : (
                      <>
                        {canWatchAgain && onWatchAgain && (
                          <button onClick={handleWatchAgain} className="w-full rounded-2xl py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] bg-green-600 hover:bg-green-700">
                            <span className="flex items-center justify-center gap-3">
                              <span className="text-lg">Watch Again</span>
                              <span className="text-sm px-3 py-1 rounded-md bg-green-800/70">+{effectiveRewardCoins}</span>
                            </span>
                          </button>
                        )}
                        <button onClick={() => onClose()} className="w-full rounded-2xl py-4 font-bold text-white bg-gray-600 hover:bg-gray-700">Continue</button>
                      </>
                    )}

                    <button onClick={handleClose} className="text-gray-400 hover:text-white underline text-sm">Close</button>
                  </div>
                </div>
              ) : (
                <div className="p-7 text-center">
                  <div className="mb-3">
                    <div className="bg-purple-500/20 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-400/30">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-bold text-purple-300">LIVE AD</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Watching Ad...</h3>
                  <p className="text-gray-300 mt-1 mb-4">Please wait while the ad loads</p>

                  <div className="relative">
                    <div ref={adContainerRef} className="h-48 rounded-xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-600/20 to-pink-600/20 overflow-hidden" />
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                      <div className="bg-black/60 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                          <span className="text-purple-300 font-medium">Loading...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-yellow-400 font-medium text-lg">{countdown > 0 ? `${countdown} seconds remaining...` : 'Almost done...'}</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}