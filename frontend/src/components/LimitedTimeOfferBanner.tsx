'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LimitedTimeOfferBannerProps {
  offer: {
    id: string
    title: string
    description: string
    discount: number
    originalPrice: number
    finalPrice: number
    endTime: number // Unix timestamp
    icon: string
    urgent?: boolean
  }
  onClaim: (offerId: string) => void
  onDismiss: (offerId: string) => void
  position?: 'top' | 'bottom' | 'floating'
}

export function LimitedTimeOfferBanner({ 
  offer, 
  onClaim, 
  onDismiss,
  position = 'floating'
}: LimitedTimeOfferBannerProps) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('low')

  // Calculate time remaining
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, offer.endTime - now)
      setTimeLeft(remaining)
      
      // Set urgency level based on time remaining
      if (remaining <= 300000) { // 5 minutes
        setUrgencyLevel('high')
      } else if (remaining <= 1800000) { // 30 minutes
        setUrgencyLevel('medium')
      } else {
        setUrgencyLevel('low')
      }
      
      // Auto-dismiss when expired
      if (remaining <= 0) {
        setIsVisible(false)
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [offer.endTime])

  const formatTimeLeft = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'high':
        return {
          gradient: 'from-red-600 to-orange-600',
          border: 'border-red-400/50',
          pulse: true,
          message: '🚨 FINAL HOURS!'
        }
      case 'medium':
        return {
          gradient: 'from-orange-600 to-yellow-600',
          border: 'border-orange-400/50',
          pulse: false,
          message: '⏰ Limited Time!'
        }
      case 'low':
        return {
          gradient: 'from-purple-600 to-blue-600',
          border: 'border-purple-400/50',
          pulse: false,
          message: '🎯 Special Offer!'
        }
    }
  }

  const handleClaim = () => {
    onClaim(offer.id)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    onDismiss(offer.id)
    setIsVisible(false)
  }

  if (!isVisible || timeLeft <= 0) return null

  const urgencyStyles = getUrgencyStyles()
  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    floating: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <AnimatePresence>
      <div className={`fixed ${positionClasses[position]} z-50 ${position !== 'floating' ? 'w-full' : ''}`}>
        <motion.div
          initial={{ 
            opacity: 0, 
            y: position === 'top' ? -100 : position === 'bottom' ? 100 : 0,
            scale: position === 'floating' ? 0.8 : 1
          }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            y: position === 'top' ? -100 : position === 'bottom' ? 100 : 0,
            scale: position === 'floating' ? 0.8 : 1
          }}
          className={`
            bg-gradient-to-r ${urgencyStyles.gradient} backdrop-blur-md
            ${position === 'floating' ? 'rounded-2xl max-w-md mx-4' : 'w-full'}
            border ${urgencyStyles.border} shadow-lg relative overflow-hidden
            ${urgencyStyles.pulse ? 'animate-pulse' : ''}
          `}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 animate-slide"></div>
          
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/70 hover:text-white text-xl z-20"
          >
            ×
          </button>

          <div className="p-4 relative z-10">
            {/* Urgency Badge */}
            <div className="flex items-center justify-between mb-3">
              <motion.div
                animate={urgencyLevel === 'high' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30"
              >
                <span className="text-white text-xs font-bold">
                  {urgencyStyles.message}
                </span>
              </motion.div>
              
              {/* Timer */}
              <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="text-white text-sm font-mono">
                  {formatTimeLeft(timeLeft)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Offer Icon */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-4xl"
              >
                {offer.icon}
              </motion.div>

              {/* Offer Details */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg leading-tight mb-1">
                  {offer.title}
                </h3>
                <p className="text-white/90 text-sm mb-2">
                  {offer.description}
                </p>
                
                {/* Pricing */}
                <div className="flex items-center space-x-2">
                  <span className="text-white/60 line-through text-sm">
                    {offer.originalPrice} coins
                  </span>
                  <span className="text-yellow-300 font-bold text-lg">
                    {offer.finalPrice} coins
                  </span>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    -{offer.discount}%
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaim}
                className="bg-white text-gray-900 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors shadow-lg min-w-[100px]"
              >
                Claim Now!
              </motion.button>
            </div>

            {/* Progress bar showing urgency */}
            <div className="mt-3 w-full bg-white/20 rounded-full h-1">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${Math.max(10, (timeLeft / (24 * 60 * 60 * 1000)) * 100)}%` }}
                className={`h-1 rounded-full transition-all duration-1000 ${
                  urgencyLevel === 'high' ? 'bg-red-300' :
                  urgencyLevel === 'medium' ? 'bg-yellow-300' :
                  'bg-white'
                }`}
              />
            </div>

            {/* Social proof */}
            <div className="mt-2 text-center">
              <p className="text-white/80 text-xs">
                🔥 {Math.floor(Math.random() * 500) + 100} people claimed this offer today!
              </p>
            </div>
          </div>

          {/* Floating particles for high urgency */}
          {urgencyLevel === 'high' && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.5, 1, 0.5],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: i * 0.4
                  }}
                  className="absolute text-yellow-300 text-xs"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: '20%'
                  }}
                >
                  ⚡
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// CSS for slide animation (add to globals.css)
const slideKeyframes = `
@keyframes slide {
  0% { transform: translateX(-100%) skewX(12deg); }
  100% { transform: translateX(200%) skewX(12deg); }
}
`