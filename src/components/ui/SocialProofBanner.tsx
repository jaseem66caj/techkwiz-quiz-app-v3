'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SocialProofBannerProps {
  position?: 'top' | 'bottom'
  variant?: 'compact' | 'detailed'
  showLive?: boolean
}

export function SocialProofBanner({ 
  position = 'top',
  variant = 'compact',
  showLive = true 
}: SocialProofBannerProps) {
  const [userCount, setUserCount] = useState(847362)
  const [recentActivity, setRecentActivity] = useState<string[]>([])
  const [liveCount, setLiveCount] = useState(1247)

  // Simulate live user count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3))
      setLiveCount(prev => prev + Math.floor(Math.random() * 5) - 2)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Simulate recent activity updates
  useEffect(() => {
    const activities = [
      "Sarah just earned 150 coins! 🪙",
      "Mike completed Programming quiz! 🎯", 
      "Alex is on a 5-question streak! 🔥",
      "Jordan joined from New York! 🌟",
      "Emma earned a perfect score! ⭐",
      "Chris unlocked a new achievement! 🏆",
      "Zoe just started their first quiz! 🚀",
      "Tyler earned 200 bonus coins! 💰"
    ]

    const updateActivity = () => {
      const newActivity = activities[Math.floor(Math.random() * activities.length)]
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 2)])
    }

    // Initial activity
    updateActivity()
    
    const interval = setInterval(updateActivity, 6000)
    return () => clearInterval(interval)
  }, [])

  const formatUserCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M+`
    } else if (count >= 1000) {
      return `${Math.floor(count / 1000)}K+`
    }
    return count.toString()
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${position === 'top' ? 'fixed top-0' : 'fixed bottom-0'} left-0 right-0 z-40`}
      >
        <div className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 backdrop-blur-md border-b border-green-400/30 px-4 py-2">
          <div className="flex items-center justify-center space-x-6 text-white">
            {/* Total Users */}
            <div className="flex items-center space-x-2">
              <span className="text-green-200">👥</span>
              <span className="text-sm font-medium">
                Join <span className="font-bold text-green-100">{formatUserCount(userCount)}</span> players!
              </span>
            </div>
            
            {/* Live Count */}
            {showLive && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-green-200 text-sm">Live:</span>
                </div>
                <span className="font-bold text-green-100 text-sm">{liveCount}</span>
              </div>
            )}
            
            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <motion.div
                key={recentActivity[0]}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="hidden sm:block"
              >
                <span className="text-green-100 text-sm">{recentActivity[0]}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Detailed variant for homepage
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-br from-green-800/50 to-emerald-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-400/20"
    >
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-white mb-2">
          🚀 Join the TechKwiz Community!
        </h3>
        <p className="text-green-200">
          Be part of the fastest-growing quiz platform for Gen Z
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/20 rounded-lg p-3 text-center border border-green-400/20">
          <div className="text-2xl font-bold text-white">{formatUserCount(userCount)}</div>
          <div className="text-green-200 text-xs">Total Players</div>
        </div>
        <div className="bg-blue-500/20 rounded-lg p-3 text-center border border-blue-400/20">
          <div className="text-2xl font-bold text-white">{liveCount}</div>
          <div className="text-blue-200 text-xs flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse mr-1"></div>
            Online Now
          </div>
        </div>
        <div className="bg-purple-500/20 rounded-lg p-3 text-center border border-purple-400/20">
          <div className="text-2xl font-bold text-white">2.5M+</div>
          <div className="text-purple-200 text-xs">Quizzes Played</div>
        </div>
        <div className="bg-orange-500/20 rounded-lg p-3 text-center border border-orange-400/20">
          <div className="text-2xl font-bold text-white">98%</div>
          <div className="text-orange-200 text-xs">Love Rate</div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
          Live Activity
        </h4>
        <div className="space-y-2 max-h-24 overflow-hidden">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={`${activity}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-gray-300 text-sm flex items-center"
            >
              <div className="w-1 h-1 bg-green-400 rounded-full mr-2"></div>
              {activity}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex justify-center items-center mt-4 space-x-4 text-sm text-green-200">
        <span>🔒 Secure & Safe</span>
        <span>•</span>
        <span>⚡ Fast & Fun</span>
        <span>•</span>
        <span>🎯 100% Free</span>
      </div>
    </motion.div>
  )
}