'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PopupInterstitialAd } from './AdBanner'

interface FortuneMessage {
  id: number
  message: string
  category: 'motivation' | 'success' | 'learning' | 'friendship' | 'happiness' | 'wisdom'
}

const fortuneMessages: FortuneMessage[] = [
  {
    id: 1,
    message: "A surprise call or message from an old friend will brighten your day! 🌟",
    category: 'friendship'
  },
  {
    id: 2,
    message: "Your coding skills will unlock new opportunities this week! 💻✨",
    category: 'success'
  },
  {
    id: 3,
    message: "A challenging quiz today will make you stronger tomorrow! 💪",
    category: 'learning'
  },
  {
    id: 4,
    message: "Success is not final, failure is not fatal: it is the courage to continue that counts! 🚀",
    category: 'motivation'
  },
  {
    id: 5,
    message: "Your curiosity will lead you to discover something amazing today! 🔍",
    category: 'learning'
  },
  {
    id: 6,
    message: "The best time to plant a tree was 20 years ago. The second best time is now! 🌱",
    category: 'wisdom'
  },
  {
    id: 7,
    message: "A small act of kindness will return to you tenfold! 💝",
    category: 'happiness'
  },
  {
    id: 8,
    message: "Your next quiz score will surprise you in the best way possible! 🎯",
    category: 'success'
  },
  {
    id: 9,
    message: "Today's learning will be tomorrow's wisdom! 📚✨",
    category: 'learning'
  },
  {
    id: 10,
    message: "A new connection will bring fresh perspectives to your life! 🤝",
    category: 'friendship'
  },
  {
    id: 11,
    message: "Your persistence in learning tech will pay off handsomely! 💎",
    category: 'motivation'
  },
  {
    id: 12,
    message: "Happiness is not by chance, but by choice - choose wisely today! 😊",
    category: 'happiness'
  },
  {
    id: 13,
    message: "The bug you've been struggling with will be solved today! 🐛➡️✅",
    category: 'success'
  },
  {
    id: 14,
    message: "Your enthusiasm for learning will inspire someone else today! 🎓",
    category: 'motivation'
  },
  {
    id: 15,
    message: "A moment of silence will bring you the clarity you seek! 🧘‍♂️",
    category: 'wisdom'
  },
  {
    id: 16,
    message: "Your positive energy will attract positive opportunities! ⚡",
    category: 'happiness'
  },
  {
    id: 17,
    message: "The skill you're developing now will become your superpower! 🦸‍♂️",
    category: 'learning'
  },
  {
    id: 18,
    message: "Someone thinks you're amazing - and they're absolutely right! 🌟",
    category: 'friendship'
  },
  {
    id: 19,
    message: "Your dedication to improvement will not go unnoticed! 👁️",
    category: 'success'
  },
  {
    id: 20,
    message: "Today you will learn something that changes your perspective forever! 🔄",
    category: 'wisdom'
  }
]

export function FortuneCookie({ className }: { className?: string }) {
  const [isShowingAd, setIsShowingAd] = useState(false)
  const [currentFortune, setCurrentFortune] = useState<FortuneMessage | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  const getRandomFortune = (): FortuneMessage => {
    const randomIndex = Math.floor(Math.random() * fortuneMessages.length)
    return fortuneMessages[randomIndex]
  }

  const handleFortuneClick = () => {
    if (isAnimating) return
    
    setClickCount(prev => prev + 1)
    setIsAnimating(true)
    
    // Show interstitial ad first
    setIsShowingAd(true)
    
    // After ad duration, show fortune
    setTimeout(() => {
      setIsShowingAd(false)
      const newFortune = getRandomFortune()
      setCurrentFortune(newFortune)
      
      // Auto-hide fortune after 6 seconds
      setTimeout(() => {
        setCurrentFortune(null)
        setIsAnimating(false)
      }, 6000)
    }, 3000) // Show ad for 3 seconds
  }

  const closeFortune = () => {
    setCurrentFortune(null)
    setIsAnimating(false)
  }

  return (
    <>
      {/* Fortune Cookie Button */}
      <motion.div
        className={`fixed right-4 bottom-4 z-50 ${className}`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 1
        }}
      >
        <motion.button
          onClick={handleFortuneClick}
          disabled={isAnimating}
          className={`relative group transition-all duration-300 ${
            isAnimating ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-110'
          }`}
          whileHover={{ scale: isAnimating ? 1 : 1.1, rotate: 5 }}
          whileTap={{ scale: isAnimating ? 1 : 0.95 }}
          animate={{
            y: [0, -8, 0],
            rotate: isAnimating ? [0, 360] : [0, -2, 2, 0]
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: isAnimating ? {
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            } : {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {/* 3D Fortune Cookie Design inspired by Qureka */}
          <div className="relative w-16 h-16">
            {/* Cookie Shadow */}
            <div className="absolute top-2 left-2 w-full h-full bg-black opacity-20 rounded-full blur-sm"></div>
            
            {/* Cookie Base */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 rounded-full shadow-2xl border-2 border-yellow-400"></div>
            
            {/* Cookie Highlight */}
            <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-white to-yellow-100 rounded-full opacity-60"></div>
            
            {/* Cookie Crack/Opening */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1 w-4 h-0.5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full opacity-60"></div>
            
            {/* Fortune Paper Peek */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 bg-white rounded-sm opacity-90"></div>
            
            {/* Cookie Emoji Overlay */}
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              🥠
            </div>
          </div>
          
          {/* Magical Sparkles */}
          <motion.div
            className="absolute -top-2 -right-2 text-yellow-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ✨
          </motion.div>
          
          <motion.div
            className="absolute -bottom-2 -left-2 text-amber-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            💫
          </motion.div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full opacity-20 blur-lg scale-125 group-hover:scale-150 transition-transform duration-300"></div>
          
          {/* Interactive Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105 shadow-lg whitespace-nowrap">
            <div className="flex items-center space-x-1">
              <span>🔮</span>
              <span>Get Fortune!</span>
              <span className="text-yellow-300">({clickCount})</span>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></div>
          </div>
        </motion.button>
      </motion.div>

      {/* Interstitial Ad Modal */}
      <AnimatePresence>
        {isShowingAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative"
            >
              <PopupInterstitialAd className="mb-4" />
              
              {/* Loading indicator */}
              <div className="text-center">
                <motion.div
                  className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-white mt-2 text-sm">Preparing your fortune...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fortune Message Modal */}
      <AnimatePresence>
        {currentFortune && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4"
            onClick={closeFortune}
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-200 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-yellow-400"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fortune Cookie Header */}
              <div className="text-center mb-6">
                <motion.div
                  className="text-6xl mb-2"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🥠
                </motion.div>
                <h2 className="text-2xl font-bold text-orange-800 mb-2">Fortune Cookie</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto"></div>
              </div>

              {/* Fortune Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <p className="text-gray-800 text-lg leading-relaxed font-medium mb-4">
                  {currentFortune.message}
                </p>
                
                {/* Category Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                  currentFortune.category === 'motivation' ? 'bg-red-100 text-red-800' :
                  currentFortune.category === 'success' ? 'bg-green-100 text-green-800' :
                  currentFortune.category === 'learning' ? 'bg-blue-100 text-blue-800' :
                  currentFortune.category === 'friendship' ? 'bg-purple-100 text-purple-800' :
                  currentFortune.category === 'happiness' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentFortune.category}
                </span>
              </motion.div>

              {/* Close Button */}
              <motion.button
                onClick={closeFortune}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Thank You! 🙏
              </motion.button>

              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 text-yellow-400 opacity-60">✨</div>
              <div className="absolute top-6 right-6 text-orange-400 opacity-60">⭐</div>
              <div className="absolute bottom-4 left-6 text-yellow-500 opacity-60">💫</div>
              <div className="absolute bottom-6 right-4 text-orange-500 opacity-60">🌟</div>

              {/* X Close Button */}
              <button
                onClick={closeFortune}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}