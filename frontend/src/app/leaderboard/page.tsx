'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../providers'
import { Navigation } from '../../components/Navigation'
import { AdBanner } from '../../components/AdBanner'
import { AuthModal } from '../../components/AuthModal'

export default function LeaderboardPage() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('all-time')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLogin = (user: any) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    setShowAuthModal(false)
  }

  // Mock leaderboard data
  const leaderboards = {
    'all-time': [
      { rank: 1, name: 'TechGuru2024', coins: 15420, quizzes: 68, successRate: 94, avatar: '🧠' },
      { rank: 2, name: 'CodeMaster', coins: 14890, quizzes: 65, successRate: 92, avatar: '👨‍💻' },
      { rank: 3, name: 'AIEnthusiast', coins: 13750, quizzes: 58, successRate: 89, avatar: '🤖' },
      { rank: 4, name: 'WebWizard', coins: 12630, quizzes: 55, successRate: 87, avatar: '🌐' },
      { rank: 5, name: 'DataScientist', coins: 11920, quizzes: 52, successRate: 85, avatar: '📊' },
      { rank: 6, name: 'MobileDev', coins: 10850, quizzes: 48, successRate: 83, avatar: '📱' },
      { rank: 7, name: 'CloudExpert', coins: 9730, quizzes: 45, successRate: 81, avatar: '☁️' },
      { rank: 8, name: 'SecurityPro', coins: 8920, quizzes: 42, successRate: 79, avatar: '🔒' },
      { rank: 9, name: 'BlockchainDev', coins: 8150, quizzes: 38, successRate: 77, avatar: '⛓️' },
      { rank: 10, name: 'FullStackDev', coins: 7680, quizzes: 35, successRate: 75, avatar: '🚀' },
    ],
    'monthly': [
      { rank: 1, name: 'QuizNinja', coins: 3420, quizzes: 15, successRate: 96, avatar: '🥷' },
      { rank: 2, name: 'TechSavvy', coins: 3190, quizzes: 14, successRate: 94, avatar: '🎯' },
      { rank: 3, name: 'CodeChamp', coins: 2980, quizzes: 13, successRate: 92, avatar: '🏆' },
      { rank: 4, name: 'DevPro', coins: 2750, quizzes: 12, successRate: 90, avatar: '💼' },
      { rank: 5, name: 'TechWiz', coins: 2520, quizzes: 11, successRate: 88, avatar: '🧙‍♂️' },
    ],
    'weekly': [
      { rank: 1, name: 'QuickLearner', coins: 890, quizzes: 4, successRate: 98, avatar: '⚡' },
      { rank: 2, name: 'FastCoder', coins: 720, quizzes: 3, successRate: 95, avatar: '💨' },
      { rank: 3, name: 'SpeedyDev', coins: 650, quizzes: 3, successRate: 93, avatar: '🏃‍♂️' },
    ]
  }

  // Show loading state
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

  // Not authenticated - show login prompt
  if (!state.isAuthenticated || !state.user) {
    return (
      <>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <Navigation />
          
          <main className="flex-1 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-effect p-8 rounded-2xl text-center max-w-md"
            >
              <div className="text-6xl mb-6">🏆</div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Leaderboard Access
              </h1>
              <p className="text-blue-200 mb-6">
                Please login to view the leaderboard and compete with other tech enthusiasts.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Login to View Leaderboard
              </button>
            </motion.div>
          </main>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleLogin}
        />
      </>
    )
  }

  const currentLeaderboard = leaderboards[activeTab as keyof typeof leaderboards]

  // Find user's rank (mock)
  const userRank = activeTab === 'all-time' ? 156 : activeTab === 'monthly' ? 23 : 8

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        {/* Header */}
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

        {/* AdSense Banner */}
        <AdBanner 
          adSlot="leaderboard_banner"
          adFormat="leaderboard"
          className="mb-6"
        />

        {/* Your Rank */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-effect p-4 rounded-xl mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-xl text-white font-bold">
                {state.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-white font-semibold">Your Rank</h3>
                <p className="text-blue-200 text-sm">{state.user.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">#{userRank}</div>
              <div className="text-blue-200 text-sm">{state.user.coins} coins</div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
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

        {/* Leaderboard */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          {currentLeaderboard.map((player, index) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`glass-effect p-4 rounded-xl ${
                player.rank <= 3 ? 'border border-yellow-400/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Left - Rank and User */}
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    player.rank === 1 ? 'bg-yellow-500 text-black' :
                    player.rank === 2 ? 'bg-gray-400 text-black' :
                    player.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {player.rank <= 3 ? (
                      player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'
                    ) : (
                      player.avatar
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">{player.name}</h3>
                      {player.rank <= 3 && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                          Top {player.rank}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-200 text-sm">
                      {player.quizzes} quizzes • {player.successRate}% success
                    </p>
                  </div>
                </div>

                {/* Right - Stats */}
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-400 flex items-center">
                    🪙 {player.coins.toLocaleString()}
                  </div>
                  <div className="text-blue-200 text-sm">
                    Rank #{player.rank}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Info */}
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

        {/* Bottom Ad */}
        <AdBanner 
          adSlot="leaderboard_bottom"
          adFormat="rectangle"
          className="mt-8"
        />
      </main>
    </div>
  )
}