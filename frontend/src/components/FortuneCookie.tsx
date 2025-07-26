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
            className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={closeFortune}
          >
            <motion.div
              initial={{ scale: 0.3, y: -100, opacity: 0, rotateX: -90 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.3, y: 100, opacity: 0, rotateX: 90 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                duration: 0.6
              }}
              className="relative bg-gradient-to-br from-yellow-100 via-orange-50 to-amber-100 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-gradient-to-r from-yellow-400 to-amber-500"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 25%, #fed7aa 50%, #fbbf24 100%)',
                boxShadow: '0 25px 50px -12px rgba(251, 191, 36, 0.4), 0 0 0 1px rgba(251, 191, 36, 0.1)',
                border: '3px solid',
                borderImage: 'linear-gradient(135deg, #f59e0b, #d97706, #92400e) 1'
              }}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10 rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-200 to-orange-200 animate-pulse"></div>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-8 h-8 bg-yellow-300 rounded-full opacity-20"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, 10, 0],
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>

              {/* Fortune Cookie Header */}
              <div className="text-center mb-6 relative z-10">
                <motion.div
                  className="text-7xl mb-3 drop-shadow-lg"
                  animate={{ 
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🥠
                </motion.div>
                <motion.h2 
                  className="text-3xl font-bold bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Your Fortune Awaits!
                </motion.h2>
                <motion.div 
                  className="w-24 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 rounded-full mx-auto"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                ></motion.div>
              </div>

              {/* Fortune Message */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-center mb-8 relative z-10"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-200">
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-4 min-h-[3rem]">
                    {currentFortune.message}
                  </p>
                  
                  {/* Category Badge */}
                  <motion.span 
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg ${
                      currentFortune.category === 'motivation' ? 'bg-gradient-to-r from-red-400 to-red-600 text-white' :
                      currentFortune.category === 'success' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                      currentFortune.category === 'learning' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                      currentFortune.category === 'friendship' ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white' :
                      currentFortune.category === 'happiness' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800' :
                      'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 500 }}
                  >
                    <span className="mr-2">
                      {currentFortune.category === 'motivation' ? '🚀' :
                       currentFortune.category === 'success' ? '🏆' :
                       currentFortune.category === 'learning' ? '📚' :
                       currentFortune.category === 'friendship' ? '🤗' :
                       currentFortune.category === 'happiness' ? '😊' : '🌟'}
                    </span>
                    {currentFortune.category}
                  </motion.span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.3 }}
                className="space-y-3 relative z-10"
              >
                <motion.button
                  onClick={closeFortune}
                  className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 hover:from-amber-500 hover:via-orange-500 hover:to-yellow-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-xl text-lg border-2 border-orange-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>✨</span>
                    <span>Amazing! Thanks</span>
                    <span>🙏</span>
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    closeFortune()
                    setTimeout(() => handleFortuneClick(), 100)
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg border border-purple-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>🔮</span>
                    <span>Get Another Fortune</span>
                  </span>
                </motion.button>
              </motion.div>

              {/* Floating Decorative Elements */}
              {[
                { emoji: '✨', position: 'top-6 left-6', delay: 0 },
                { emoji: '🌟', position: 'top-8 right-8', delay: 0.5 },
                { emoji: '💫', position: 'bottom-8 left-8', delay: 1 },
                { emoji: '⭐', position: 'bottom-6 right-6', delay: 1.5 }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`absolute ${item.position} text-2xl opacity-60`}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 180, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: item.delay,
                    ease: "easeInOut"
                  }}
                >
                  {item.emoji}
                </motion.div>
              ))}

              {/* Close X Button */}
              <motion.button
                onClick={closeFortune}
                className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}