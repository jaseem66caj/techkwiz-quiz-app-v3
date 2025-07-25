'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '../../components/Navigation'
import { AdBanner } from '../../components/AdBanner'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('all-time')

  // Mock leaderboard data
  const leaderboardData = {
    'all-time': [
      { rank: 1, name: 'CodeMaster', coins: 25000, quizzes: 120, avatar: '👑' },
      { rank: 2, name: 'TechNinja', coins: 22000, quizzes: 110, avatar: '🥷' },
      { rank: 3, name: 'AIExpert', coins: 18000, quizzes: 95, avatar: '🤖' },
      { rank: 4, name: 'WebWizard', coins: 15000, quizzes: 85, avatar: '🧙‍♂️' },
      { rank: 5, name: 'DataScientist', coins: 12000, quizzes: 75, avatar: '📊' },
      { rank: 6, name: 'MobileGuru', coins: 10000, quizzes: 65, avatar: '📱' },
      { rank: 7, name: 'CloudChamp', coins: 8000, quizzes: 55, avatar: '☁️' },
      { rank: 8, name: 'SecurityPro', coins: 6000, quizzes: 45, avatar: '🔒' },
      { rank: 9, name: 'BlockchainBoss', coins: 4000, quizzes: 35, avatar: '⛓️' },
      { rank: 10, name: 'DevOpsHero', coins: 2000, quizzes: 25, avatar: '⚙️' },
    ],
    'weekly': [
      { rank: 1, name: 'WeeklyWinner', coins: 5000, quizzes: 25, avatar: '🏆' },
      { rank: 2, name: 'FastLearner', coins: 4500, quizzes: 22, avatar: '⚡' },
      { rank: 3, name: 'QuizMachine', coins: 4000, quizzes: 20, avatar: '🎯' },
      { rank: 4, name: 'TechStudent', coins: 3500, quizzes: 18, avatar: '📚' },
      { rank: 5, name: 'CodingNewbie', coins: 3000, quizzes: 15, avatar: '💻' },
    ],
    'monthly': [
      { rank: 1, name: 'MonthlyMaster', coins: 15000, quizzes: 75, avatar: '🌟' },
      { rank: 2, name: 'ConsistentLearner', coins: 12000, quizzes: 60, avatar: '📈' },
      { rank: 3, name: 'TechEnthusiast', coins: 10000, quizzes: 50, avatar: '🎉' },
      { rank: 4, name: 'SkillBuilder', coins: 8000, quizzes: 40, avatar: '🏗️' },
      { rank: 5, name: 'KnowledgeSeeker', coins: 6000, quizzes: 30, avatar: '🔍' },
    ]
  }

  const tabs = [
    { id: 'all-time', name: 'All Time', icon: '🏆' },
    { id: 'monthly', name: 'Monthly', icon: '📅' },
    { id: 'weekly', name: 'Weekly', icon: '🗓️' },
  ]

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400'
      case 2: return 'text-gray-300'
      case 3: return 'text-amber-600'
      default: return 'text-blue-200'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-blue-200 text-lg">
            See how you stack up against other tech enthusiasts
          </p>
        </motion.div>

        {/* AdSense Banner */}
        <AdBanner 
          adSlot="7777777777"
          adFormat="leaderboard"
          className="mb-8"
        />

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-effect p-1 rounded-xl">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-black'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-effect rounded-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="grid grid-cols-12 gap-4 mb-4 text-blue-200 font-semibold text-sm">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-3">Coins</div>
              <div className="col-span-3">Quizzes</div>
            </div>
            
            <div className="space-y-3">
              {leaderboardData[activeTab as keyof typeof leaderboardData].map((player, index) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-4 p-4 rounded-lg transition-all hover:bg-white/5 ${
                    player.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : 'bg-white/5'
                  }`}
                >
                  <div className="col-span-1">
                    <div className={`text-2xl font-bold ${getRankColor(player.rank)}`}>
                      {getRankIcon(player.rank)}
                    </div>
                  </div>
                  
                  <div className="col-span-5 flex items-center space-x-3">
                    <div className="text-2xl">{player.avatar}</div>
                    <div>
                      <div className="text-white font-semibold">{player.name}</div>
                      <div className="text-blue-200 text-sm">Tech Enthusiast</div>
                    </div>
                  </div>
                  
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">🪙</span>
                      <span className="text-white font-semibold">{player.coins.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-400">📚</span>
                      <span className="text-white font-semibold">{player.quizzes}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Your Rank */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-effect p-6 rounded-xl mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Your Ranking
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">#247</div>
              <div className="text-blue-200 text-sm">Current Rank</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">↑15</div>
              <div className="text-blue-200 text-sm">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">523</div>
              <div className="text-blue-200 text-sm">Points to Next</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Ad */}
        <AdBanner 
          adSlot="8888888888"
          adFormat="rectangle"
          className="mt-8"
        />
      </main>
    </div>
  )
}