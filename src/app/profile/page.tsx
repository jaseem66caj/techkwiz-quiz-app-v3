'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../providers'
import { UnifiedNavigation } from '../../components/navigation'
import { AdBanner } from '../../components/ads'
import { AvatarSelector } from '../../components/user/AvatarSelector'
import { getAvatarEmojiById } from '../../utils/avatar'

import { seoConfig } from '../../utils/seo'
import { getAllAchievements, getUnlockedAchievements } from '../../utils/achievements'
import { saveUser } from '../../utils/auth'

export default function ProfilePage() {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('stats')
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)

  useEffect(() => {
    // Only create guest user if auth initialization is complete and no user exists
    if (!state.loading && !state.user) {
      const guestUser = {
        id: `guest_${Date.now()}`,
        name: 'Guest',
        avatar: 'robot',
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
  }, [state.loading, state.user, dispatch])

  // Show loading state while auth is initializing
  if (state.loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <UnifiedNavigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  const user = state.user

  // Handle avatar selection
  const handleAvatarSelect = (avatarId: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarId }
      saveUser(updatedUser)
      dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser })
    }
    setShowAvatarSelector(false)
  }

  // Calculate user stats
  const totalQuizzes = user?.totalQuizzes || 0
  const correctAnswers = user?.correctAnswers || 0
  const successRate = totalQuizzes > 0 ? Math.round((correctAnswers / (totalQuizzes * 5)) * 100) : 0 // Assuming 5 questions per quiz on average
  const level = user?.level || 1

  // Get achievements
  const allAchievements = getAllAchievements();
  const unlockedAchievements = user ? getUnlockedAchievements(user) : [];

  const achievements = allAchievements.map(achievement => ({
    ...achievement,
    unlocked: unlockedAchievements.some(unlocked => unlocked.id === achievement.id)
  }));

  const recentActivity = user?.quizHistory?.slice(-5) || []

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {showAvatarSelector && (
        <AvatarSelector 
          selectedAvatar={user?.avatar || 'robot'}
          onAvatarSelect={handleAvatarSelect}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
      
      <UnifiedNavigation />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-effect p-6 md:p-8 rounded-2xl mb-6"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-500 rounded-full flex items-center justify-center text-3xl md:text-4xl text-white font-bold">
                {getAvatarEmojiById(user?.avatar || 'robot')}
              </div>
              <button 
                onClick={() => setShowAvatarSelector(true)}
                className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2 shadow-lg hover:bg-orange-600 transition-colors"
                aria-label="Change avatar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {user?.name || 'Guest'}
              </h1>
              <p className="text-blue-200 mb-4">
                Member since {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Today'}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">Level {level}</div>
                  <div className="text-xs text-blue-200">Tech Enthusiast</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-400">{user?.coins || 0}</div>
                  <div className="text-xs text-blue-200">Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{successRate}%</div>
                  <div className="text-xs text-blue-200">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AdSense Banner */}
        <AdBanner 
          adSlot="profile_banner"
          adFormat="leaderboard"
          className="mb-6"
        />

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'stats', name: 'Statistics', icon: '📊' },
            { id: 'achievements', name: 'Achievements', icon: '🏆' },
            { id: 'history', name: 'Recent Activity', icon: '📈' }
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
              <span className="hidden md:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-effect p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-white mb-1">{totalQuizzes}</div>
                  <div className="text-blue-200 text-sm">Quizzes Completed</div>
                </div>
                <div className="glass-effect p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{correctAnswers}</div>
                  <div className="text-blue-200 text-sm">Correct Answers</div>
                </div>
                <div className="glass-effect p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">{user?.coins || 0}</div>
                  <div className="text-blue-200 text-sm">Total Coins</div>
                </div>
                <div className="glass-effect p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{level}</div>
                  <div className="text-blue-200 text-sm">Current Level</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="glass-effect p-4 rounded-xl">
                <h3 className="text-white font-semibold mb-3">Level Progress</h3>
                <div className="bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((totalQuizzes % 5) / 5) * 100}%` }}
                  />
                </div>
                <p className="text-blue-200 text-sm mt-2">
                  {5 - (totalQuizzes % 5)} more quizzes to reach Level {level + 1}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">🏆 Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`glass-effect p-4 rounded-xl flex items-center space-x-4 ${
                      achievement.unlocked ? 'border border-yellow-400/30' : 'opacity-50'
                    }`}
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{achievement.name}</h4>
                      <p className="text-blue-200 text-sm">{achievement.description}</p>
                      <div className={`text-xs mt-1 ${achievement.unlocked ? 'text-green-400' : 'text-gray-400'}`}>
                        {achievement.unlocked ? '✅ Unlocked' : '🔒 Locked'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">📈 Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.reverse().map((activity, index) => (
                    <div key={index} className="glass-effect p-4 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{activity.category} Quiz</h4>
                          <p className="text-blue-200 text-sm">
                            Score: {activity.correctAnswers}/{activity.totalQuestions} • 
                            Difficulty: {activity.difficulty} • 
                            Coins: +{activity.coinsEarned}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg ${activity.correctAnswers / activity.totalQuestions >= 0.8 ? 'text-green-400' : 'text-orange-400'}`}>
                            {Math.round((activity.correctAnswers / activity.totalQuestions) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-effect p-8 rounded-xl text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-blue-200">No quiz history yet.</p>
                  <button
                    onClick={() => {
                      try {
                        router.push('/start');
                      } catch (error) {
                        console.error('Error navigating to start from profile:', error);
                        // Report to Sentry
                        import('@sentry/nextjs').then(Sentry => {
                          Sentry.captureException(error, {
                            tags: { component: 'ProfilePage', action: 'navigateToStart' }
                          });
                        });
                        // Fallback navigation
                        window.location.href = '/start';
                      }
                    }}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Take Your First Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Bottom Ad */}
        <AdBanner 
          adSlot="profile_bottom"
          adFormat="rectangle"
          className="mt-8"
        />
      </main>
    </div>
  )
}