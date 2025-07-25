'use client'

import { motion } from 'framer-motion'

export function Features() {
  const features = [
    {
      icon: '🎯',
      text: 'Play Quizzes in 25+ categories like Programming, AI, Web Development, Mobile Development, Data Science & more!'
    },
    {
      icon: '🏆',
      text: 'Compete with thousands of other tech enthusiasts!'
    },
    {
      icon: '🪙',
      text: 'Win coins for every correct answer'
    },
    {
      icon: '👥',
      text: 'Trusted by millions of other quiz enthusiasts like YOU!'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-effect p-8 rounded-2xl max-w-2xl mx-auto"
    >
      <h3 className="text-2xl font-bold text-white text-center mb-6">
        Play Quiz and Win Coins!
      </h3>
      
      <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-green-500 mx-auto mb-8 rounded-full"></div>
      
      <div className="space-y-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            className="flex items-start space-x-4"
          >
            <div className="text-2xl flex-shrink-0 mt-1">
              {feature.icon}
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              {feature.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}