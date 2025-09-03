'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  enable_analytics?: boolean
}

export function EnhancedRewardPopup({
  isOpen,
  onClose,
  isCorrect,
  coinsEarned,
  onAdCompleted,
  autoClose = false,
  showMandatoryAd = false,
  adSlotCode = ''
}: EnhancedRewardPopupProps) {
  const [showingAd, setShowingAd] = useState(false)
  const [adCountdown, setAdCountdown] = useState(5)
  const [showClaim, setShowClaim] = useState(false)
  const [animateCoin, setAnimateCoin] = useState(false)
  const [config, setConfig] = useState<RewardConfig | null>(null)
  const [sparkles, setSparkles] = useState<Array<{ id: number, x: number, y: number }>>([])
  const adContainerRef = useRef<HTMLDivElement | null>(null)

  // Load config - now using default values instead of API call
  useEffect(() => {
    // Removed backend API call and using default config
    setConfig({ coin_reward: 100, is_active: true, show_during_quiz: true, trigger_after_questions: 1, enable_analytics: false })
  }, [])

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
    if (!showingAd || !adSlotCode || !adContainerRef.current) return
    const container = adContainerRef.current
    container.innerHTML = ''
    const wrap = document.createElement('div')
    wrap.innerHTML = adSlotCode
    Array.from(wrap.childNodes).forEach(node => { if (node.nodeName.toLowerCase() !== 'script') container.appendChild(node.cloneNode(true)) })
    wrap.querySelectorAll('script').forEach(old => { const s = document.createElement('script'); Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value)); s.text = old.text || ''; container.appendChild(s) })
  }, [showingAd, adSlotCode])

  const sendAnalytics = async (type: 'start' | 'complete') => {
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
    const adCoins = config?.coin_reward || 100
    setShowingAd(false)
    onAdCompleted(adCoins)
    await sendAnalytics('complete')
    setTimeout(() => onClose(), 1200)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map(s => (
            <motion.div key={s.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1, 0.5, 1, 0], opacity: [0, 1, 0.8, 0.5, 0], rotate: [0, 180, 360] }} transition={{ duration: 2, delay: s.id * 0.1, repeat: Infinity, repeatDelay: 3 }} className="absolute w-4 h-4 text-yellow-400" style={{ left: s.x, top: s.y }}>✨</motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.92, y: 60 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -60 }} transition={{ type: 'spring', damping: 20, stiffness: 280, duration: 0.45 }} className="relative z-10 mx-4 w-full max-w-sm">
          {!showingAd ? (
            <div className="relative rounded-[28px] border border-orange-400/30 p-8 text-center overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(145deg, #111827 0%, #0f172a 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-pink-500/20 opacity-20 blur-xl" />
              <div className="relative z-10">
                <div className="text-4xl mb-2">{isCorrect ? '🎉' : '💡'}</div>
                <h2 className={`text-2xl font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-yellow-400'}`}>{isCorrect ? 'Hurray!!' : 'Oops!!'}</h2>
                <p className={`text-base ${isCorrect ? 'text-green-300' : 'text-yellow-300'}`}>{isCorrect ? 'Correct answer' : 'Wrong answer'}</p>

                <div className="mt-4 inline-block rounded-2xl px-5 py-2 border border-orange-400/30 bg-orange-500/10">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <span className="text-xl font-bold text-orange-400">{isCorrect ? coinsEarned : 0}</span>
                    <span className="text-orange-300">coins earned</span>
                  </div>
                </div>

                {showClaim && (
                  <div className="mt-6 space-y-3">
                    <button onClick={startAdExperience} className="w-full relative rounded-2xl py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(90deg, #6d28d9 0%, #5b21b6 100%)' }}>
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>Claim</span>
                        <span className="text-xs px-2 py-1 rounded-md bg-black/20">Ad</span>
                      </span>
                      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
                    </button>
                    <button onClick={() => onClose()} className="w-full rounded-2xl py-3 font-bold text-white bg-gray-600 hover:bg-gray-700">Continue</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative rounded-[28px] border border-purple-400/30 p-8 text-center overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(145deg, #111827 0%, #0f172a 100%)' }}>
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-purple-400/30 bg-purple-500/20"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span className="text-sm font-bold text-purple-300">LIVE AD</span></div>
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