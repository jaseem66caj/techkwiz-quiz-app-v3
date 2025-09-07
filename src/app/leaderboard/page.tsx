'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../providers'
import { Navigation } from '../../components/Navigation'
import { AdBanner } from '../../components/AdBanner'

import { seoConfig } from '../../utils/seo'
import { getAllUsers, User } from '../../utils/auth'

export default function LeaderboardPage() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('all-time')
  const [leaderboardData, setLeaderboardData] = useState<User[]>([])

  useEffect(() => {
    // Only create guest user if auth initialization is complete and no user exists
    if (!state.loading && !state.user) {
      const guestUser = {
        id: `guest_${Date.now()}`,
        name: 'Guest',
        email: 'guest@techkwiz.com',
        coins: 0,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser });
    }

    // Load leaderboard data regardless of user state
    const users = getAllUsers()
    const sortedUsers = users.sort((a, b) => b.coins - a.coins)
    setLeaderboardData(sortedUsers)
  }, [state.loading, state.user, dispatch])

  // Show loading state while auth is initializing
  if (state.loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading leaderboard...</p>
          </div>
        </main>
      </div>
    )
  }

  const userRank = leaderboardData.findIndex(user => user.id === state.user?.id) + 1

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-blue-200 text-lg">
            Compete with the best tech minds
          </p>
        </motion.div>

        <AdBanner 
          adSlot="leaderboard_banner"
          adFormat="leaderboard"
          className="mb-6"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-effect p-4 rounded-xl mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-xl text-white font-bold">
                {state.user?.name?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div>
                <h3 className="text-white font-semibold">Your Rank</h3>
                <p className="text-blue-200 text-sm">{state.user?.name || 'Guest'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">#{userRank > 0 ? userRank : 'N/A'}</div>
              <div className="text-blue-200 text-sm">{state.user?.coins || 0} coins</div>
            </div>
          </div>
        </motion.div>

        <div className="flex space-x-2 mb-6">
          {[
            { id: 'all-time', name: 'All Time', icon: '🏆' },
            { id: 'monthly', name: 'Monthly', icon: '📅' },
            { id: 'weekly', name: 'Weekly', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          {leaderboardData.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`glass-effect p-4 rounded-xl ${
                index <= 2 ? 'border border-yellow-400/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {index <= 2 ? (
                      index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                    ) : (
                      player.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">{player.name}</h3>
                      {index <= 2 && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                          Top {index + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-200 text-sm">
                      {player.totalQuizzes} quizzes • {player.correctAnswers > 0 ? Math.round((player.correctAnswers / (player.totalQuizzes * 5)) * 100) : 0}% success
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-400 flex items-center">
                    🪙 {player.coins.toLocaleString()}
                  </div>
                  <div className="text-blue-200 text-sm">
                    Rank #{index + 1}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 glass-effect p-6 rounded-xl text-center"
        >
          <h3 className="text-white font-semibold mb-3">🎯 How Rankings Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-yellow-400 font-semibold">Coins Earned</div>
              <div className="text-blue-200">Primary ranking factor</div>
            </div>
            <div>
              <div className="text-green-400 font-semibold">Success Rate</div>
              <div className="text-blue-200">Quality of performance</div>
            </div>
            <div>
              <div className="text-purple-400 font-semibold">Quizzes Played</div>
              <div className="text-blue-200">Activity level</div>
            </div>
          </div>
        </motion.div>

        <AdBanner 
          adSlot="leaderboard_bottom"
          adFormat="rectangle"
          className="mt-8"
        />
      </main>
    </div>
  )
}
