'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface RewardCelebrationAnimationProps {
  isVisible: boolean
  rewardType: 'coins' | 'bonus' | 'streak' | 'perfect' | 'level_up'
  amount?: number
  onAnimationComplete?: () => void
}

export function RewardCelebrationAnimation({
  isVisible,
  rewardType,
  amount = 50,
  onAnimationComplete
}: RewardCelebrationAnimationProps) {
  const [showParticles, setShowParticles] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'entrance' | 'celebration' | 'exit'>('entrance')

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('entrance')
      
      // Start particle effects after entrance
      setTimeout(() => {
        setShowParticles(true)
        setAnimationPhase('celebration')
      }, 500)
      
      // Exit animation
      setTimeout(() => {
        setAnimationPhase('exit')
        setShowParticles(false)
      }, 2500)
      
      // Complete animation
      setTimeout(() => {
        onAnimationComplete?.()
      }, 3000)
    }
  }, [isVisible, onAnimationComplete])

  const getRewardConfig = () => {
    switch (rewardType) {
      case 'coins':
        return {
          icon: '🪙',
          title: 'Coins Earned!',
          color: 'from-yellow-400 to-orange-500',
          particles: '✨',
          sound: 'coin-collect',
          bgColor: 'from-yellow-500/20 to-orange-500/20'
        }
      case 'bonus':
        return {
          icon: '🎁',
          title: 'Bonus Reward!',
          color: 'from-purple-400 to-pink-500',
          particles: '🎉',
          sound: 'bonus-unlock',
          bgColor: 'from-purple-500/20 to-pink-500/20'
        }
      case 'streak':
        return {
          icon: '🔥',
          title: 'Streak Bonus!',
          color: 'from-orange-400 to-red-500',
          particles: '⚡',
          sound: 'streak-fire',
          bgColor: 'from-orange-500/20 to-red-500/20'
        }
      case 'perfect':
        return {
          icon: '⭐',
          title: 'Perfect Score!',
          color: 'from-green-400 to-emerald-500',
          particles: '🌟',
          sound: 'perfect-score',
          bgColor: 'from-green-500/20 to-emerald-500/20'
        }
      case 'level_up':
        return {
          icon: '🚀',
          title: 'Level Up!',
          color: 'from-blue-400 to-cyan-500',
          particles: '🎊',
          sound: 'level-up',
          bgColor: 'from-blue-500/20 to-cyan-500/20'
        }
      default:
        return {
          icon: '🎉',
          title: 'Reward!',
          color: 'from-purple-400 to-pink-500',
          particles: '✨',
          sound: 'generic-reward',
          bgColor: 'from-purple-500/20 to-pink-500/20'
        }
    }
  }

  // Generate floating particles
  const generateParticles = (count: number = 12) => {
    return Array.from({ length: count }, (_, i) => (
      <motion.div
        key={i}
        initial={{ 
          opacity: 0,
          scale: 0,
          x: 0,
          y: 0
        }}
        animate={showParticles ? {
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
        } : {}}
        transition={{
          duration: 2,
          delay: Math.random() * 0.5,
          ease: "easeOut"
        }}
        className="absolute text-2xl pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {config.particles}
      </motion.div>
    ))
  }

  // Generate coin burst effect
  const generateCoinBurst = () => {
    if (rewardType !== 'coins') return null
    
    return Array.from({ length: 8 }, (_, i) => (
      <motion.div
        key={`coin-${i}`}
        initial={{ 
          scale: 0,
          x: 0,
          y: 0,
          rotate: 0
        }}
        animate={showParticles ? {
          scale: [0, 1, 0.8],
          x: Math.cos((i * Math.PI * 2) / 8) * 100,
          y: Math.sin((i * Math.PI * 2) / 8) * 100,
          rotate: 360
        } : {}}
        transition={{
          duration: 1.5,
          delay: 0.2,
          ease: "easeOut"
        }}
        className="absolute text-xl pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        🪙
      </motion.div>
    ))
  }

  if (!isVisible) return null

  const config = getRewardConfig()

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animationPhase === 'celebration' ? 0.3 : 0 }}
        className={`absolute inset-0 bg-gradient-to-br ${config.bgColor} backdrop-blur-sm`}
      />

      {/* Main reward display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{
            scale: animationPhase === 'entrance' ? 1 : animationPhase === 'celebration' ? 1.05 : 0.8,
            opacity: animationPhase === 'exit' ? 0 : 1,
            y: animationPhase === 'entrance' ? 0 : animationPhase === 'celebration' ? -10 : 30
          }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className={`bg-gradient-to-br ${config.color} p-8 rounded-2xl shadow-2xl border border-white/20 text-center min-w-[300px] relative overflow-hidden`}
        >
          {/* Shimmering background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
          
          {/* Main icon with bounce */}
          <motion.div
            animate={{
              scale: animationPhase === 'celebration' ? [1, 1.2, 1] : 1
            }}
            transition={{
              duration: 0.6,
              repeat: animationPhase === 'celebration' ? Infinity : 0,
              repeatType: "reverse"
            }}
            className="text-6xl mb-4 relative z-10"
          >
            {config.icon}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2 relative z-10"
          >
            {config.title}
          </motion.h2>

          {/* Amount display */}
          {amount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-4xl font-bold text-white mb-4 relative z-10"
            >
              +{amount}
            </motion.div>
          )}

          {/* Motivational message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/90 text-lg relative z-10"
          >
            {rewardType === 'coins' && "Keep earning and climbing!"}
            {rewardType === 'bonus' && "You're on fire! 🔥"}
            {rewardType === 'streak' && "Unstoppable streak!"}
            {rewardType === 'perfect' && "Absolutely incredible!"}
            {rewardType === 'level_up' && "You're leveling up fast!"}
          </motion.p>

          {/* Particle effects container */}
          <div className="absolute inset-0 overflow-hidden">
            {generateParticles()}
            {generateCoinBurst()}
          </div>
        </motion.div>
      </div>

      {/* Screen-wide celebration effects */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Confetti shower */}
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={`confetti-${i}`}
              initial={{ 
                opacity: 0,
                y: -100,
                x: Math.random() * window.innerWidth,
                rotate: 0
              }}
              animate={{
                opacity: [0, 1, 0],
                y: window.innerHeight + 100,
                rotate: Math.random() * 720
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 1,
                ease: "linear"
              }}
              className="absolute text-lg"
            >
              🎊
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
