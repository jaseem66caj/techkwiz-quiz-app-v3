'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EnhancedCoinDisplayProps {
  coins: number
  multiplier?: number
  showAnimation?: boolean
  compact?: boolean
  onClick?: () => void
}

interface CoinAnimation {
  id: string
  amount: number
  x: number
  y: number
  timestamp: number
}

export function EnhancedCoinDisplay({ 
  coins, 
  multiplier = 1, 
  showAnimation = true,
  compact = false,
  onClick 
}: EnhancedCoinDisplayProps) {
  const [previousCoins, setPreviousCoins] = useState(coins)
  const [coinAnimations, setCoinAnimations] = useState<CoinAnimation[]>([])
  const [showMultiplier, setShowMultiplier] = useState(false)

  // Detect coin changes and trigger animations
  useEffect(() => {
    if (showAnimation && coins !== previousCoins) {
      const difference = coins - previousCoins
      
      if (difference > 0) {
        // Add coin gain animation
        const newAnimation: CoinAnimation = {
          id: `coin-${Date.now()}`,
          amount: difference,
          x: Math.random() * 100 - 50, // Random position offset
          y: Math.random() * 20 - 10,
          timestamp: Date.now()
        }
        
        setCoinAnimations(prev => [...prev, newAnimation])
        
        // Remove animation after 3 seconds
        setTimeout(() => {
          setCoinAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id))
        }, 3000)
      }
      
      setPreviousCoins(coins)
    }
  }, [coins, previousCoins, showAnimation])

  // Show multiplier indicator when active
  useEffect(() => {
    if (multiplier > 1) {
      setShowMultiplier(true)
      const timer = setTimeout(() => setShowMultiplier(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [multiplier])

  const formatCoins = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  const getCoinTier = (amount: number) => {
    if (amount >= 10000) return { tier: 'legendary', color: 'text-yellow-400', glow: 'shadow-yellow-400/50' }
    if (amount >= 5000) return { tier: 'epic', color: 'text-purple-400', glow: 'shadow-purple-400/50' }
    if (amount >= 1000) return { tier: 'rare', color: 'text-blue-400', glow: 'shadow-blue-400/50' }
    if (amount >= 500) return { tier: 'uncommon', color: 'text-green-400', glow: 'shadow-green-400/50' }
    return { tier: 'common', color: 'text-gray-300', glow: 'shadow-gray-400/50' }
  }

  const coinTier = getCoinTier(coins)

  if (compact) {
    return (
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={onClick}
          className={`
            flex items-center space-x-1 px-2 py-1 rounded-lg cursor-pointer
            bg-gray-800/50 backdrop-blur-sm border border-gray-700/50
            ${onClick ? 'hover:bg-gray-700/50' : ''}
          `}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-lg"
          >
            🪙
          </motion.span>
          <span className={`font-bold text-sm ${coinTier.color}`}>
            {formatCoins(coins)}
          </span>
          
          {multiplier > 1 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-orange-400 text-xs font-bold"
            >
              ×{multiplier}
            </motion.span>
          )}
        </motion.div>

        {/* Compact animations */}
        <AnimatePresence>
          {coinAnimations.map((animation) => (
            <motion.div
              key={animation.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -30, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
              style={{
                x: animation.x,
                y: animation.y
              }}
            >
              <span className="text-green-400 font-bold text-sm">
                +{animation.amount}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer
          bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-md
          border border-gray-700/50 shadow-lg ${coinTier.glow}
          ${onClick ? 'hover:from-gray-700/70 hover:to-gray-800/70' : ''}
        `}
      >
        {/* Coin Icon with Tier Effects */}
        <div className="relative">
          <motion.span
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: coinTier.tier === 'legendary' ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 3, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            className="text-3xl relative z-10"
          >
            🪙
          </motion.span>
          
          {/* Tier glow effect */}
          {coinTier.tier !== 'common' && (
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute inset-0 rounded-full blur-sm ${coinTier.color} opacity-50`}
            />
          )}
        </div>

        {/* Coin Amount */}
        <div className="flex flex-col">
          <motion.span
            key={coins} // Re-animate when coins change
            initial={{ scale: 1.2, color: '#10B981' }}
            animate={{ scale: 1, color: coinTier.color }}
            transition={{ duration: 0.3 }}
            className={`font-bold text-2xl ${coinTier.color}`}
          >
            {formatCoins(coins)}
          </motion.span>
          <span className="text-gray-400 text-xs uppercase tracking-wide">
            {coinTier.tier} coins
          </span>
        </div>

        {/* Multiplier Indicator */}
        <AnimatePresence>
          {showMultiplier && multiplier > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              className="flex items-center space-x-1 bg-orange-500/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-orange-400/30"
            >
              <span className="text-orange-400 text-xs">⚡</span>
              <span className="text-orange-400 font-bold text-sm">
                {multiplier}x
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Animations */}
      <AnimatePresence>
        {coinAnimations.map((animation) => (
          <motion.div
            key={animation.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ 
              opacity: 0, 
              y: -50, 
              scale: 1.2,
              x: animation.x
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-20"
            style={{
              x: animation.x,
              y: animation.y
            }}
          >
            <div className="flex items-center space-x-1 bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-green-400/30">
              <span className="text-yellow-400 text-sm">🪙</span>
              <span className="text-green-400 font-bold text-lg">
                +{animation.amount}
              </span>
              {multiplier > 1 && (
                <span className="text-orange-400 text-sm font-bold">
                  (×{multiplier})
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Milestone Celebrations */}
      {coins > 0 && coins % 1000 === 0 && showAnimation && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
            🎉 Milestone: {formatCoins(coins)}!
          </div>
        </motion.div>
      )}

      {/* Background particles for legendary tier */}
      {coinTier.tier === 'legendary' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                delay: i * 1
              }}
              className="absolute text-yellow-400 text-xs"
              style={{
                left: `${20 + i * 30}%`,
                top: '10%'
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}