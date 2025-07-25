'use client'

import { motion } from 'framer-motion'
import { useApp } from '../providers'
import { Navigation } from '../../components/Navigation'
import { AdBanner } from '../../components/AdBanner'

export default function ProfilePage() {
  const { state } = useApp()

  const stats = [
    { label: 'Total Coins', value: state.user.coins, icon: '🪙', color: 'text-yellow-400' },
    { label: 'Quizzes Played', value: state.user.totalQuizzes, icon: '📚', color: 'text-blue-400' },
    { label: 'Correct Answers', value: state.user.correctAnswers, icon: '✅', color: 'text-green-400' },
    { label: 'Success Rate', value: `${state.user.totalQuizzes > 0 ? Math.round((state.user.correctAnswers / (state.user.totalQuizzes * 5)) * 100) : 0}%`, icon: '📈', color: 'text-purple-400' },
  ]

  const achievements = [
    { name: 'First Quiz', description: 'Complete your first quiz', icon: '🎯', unlocked: state.user.totalQuizzes >= 1 },
    { name: 'Coin Collector', description: 'Earn 1000 coins', icon: '💰', unlocked: state.user.coins >= 1000 },
    { name: 'Quiz Master', description: 'Complete 10 quizzes', icon: '🏆', unlocked: state.user.totalQuizzes >= 10 },
    { name: 'Perfect Score', description: 'Get 100% in any quiz', icon: '⭐', unlocked: false },
  ]

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
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {state.user.name}
          </h1>
          <p className="text-blue-200 text-lg">
            Level {state.user.level} Tech Enthusiast
          </p>
        </motion.div>

        {/* AdSense Banner */}
        <AdBanner 
          adSlot="5555555555"
          adFormat="leaderboard"
          className="mb-8"
        />

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="glass-effect p-6 rounded-xl text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-blue-200 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-effect p-6 rounded-xl mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">🏅</span>
            Achievements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'bg-green-500/20 border-green-400 text-green-100'
                    : 'bg-gray-500/20 border-gray-600 text-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-sm opacity-80">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <div className="ml-auto text-green-400">✓</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-effect p-6 rounded-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">📊</span>
            Recent Activity
          </h2>
          
          {state.quizHistory.length > 0 ? (
            <div className="space-y-4">
              {state.quizHistory.slice(-5).reverse().map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📚</div>
                    <div>
                      <h3 className="text-white font-semibold capitalize">{quiz.category}</h3>
                      <p className="text-blue-200 text-sm">
                        {quiz.correctAnswers}/{quiz.totalQuestions} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-semibold">
                      +{quiz.correctAnswers * 200} coins
                    </div>
                    <div className="text-blue-200 text-sm">
                      {Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-blue-200">No quiz history yet</p>
              <p className="text-blue-300 text-sm">Start playing to see your progress!</p>
            </div>
          )}
        </motion.div>

        {/* Bottom Ad */}
        <AdBanner 
          adSlot="6666666666"
          adFormat="rectangle"
          className="mt-8"
        />
      </main>
    </div>
  )
}