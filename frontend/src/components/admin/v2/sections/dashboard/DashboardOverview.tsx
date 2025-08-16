'use client'

import { useState, useEffect, useCallback } from 'react'
import { quizDataManager } from '@/utils/quizDataManager'
import { rewardDataManager } from '@/utils/rewardDataManager'
import { analyticsDataManager } from '@/utils/analyticsDataManager'
import { realTimeSyncService } from '@/utils/realTimeSync'
import SyncStatusWidget from '../../common/SyncStatusWidget'

interface DashboardStats {
  totalQuestions: number
  totalCategories: number
  activeAchievements: number
  totalCoinsEarned: number
  questionsAnswered: number
  successRate: number
  averageSessionTime: string
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Load dashboard data
  const loadDashboardData = useCallback(() => {
    // Ensure we're on the client side to avoid SSR issues
    if (typeof window === 'undefined') {
      return
    }

    try {
      setIsLoading(true)

      // Get quiz data with error handling
      let questions = []
      let categories = []
      try {
        questions = quizDataManager.getQuestions() || []
        categories = quizDataManager.getCategories() || []
      } catch (error) {
        console.error('Error loading quiz data:', error)
      }

      // Get reward data with error handling
      let achievements = []
      let activeAchievements = []
      try {
        achievements = rewardDataManager.getAllAchievements() || []
        activeAchievements = achievements.filter(a => a && a.isActive)
      } catch (error) {
        console.error('Error loading reward data:', error)
      }

      // Get analytics data with error handling
      let analyticsData = { totalCoinsEarned: 0, questionsAnswered: 0, successRate: 0 }
      let activityData = { averageSessionTime: 0 }
      try {
        analyticsData = analyticsDataManager.getQuizMetrics() || analyticsData
        activityData = analyticsDataManager.getActivityData() || activityData
      } catch (error) {
        console.error('Error loading analytics data:', error)
      }
      
      // Calculate stats
      const dashboardStats: DashboardStats = {
        totalQuestions: questions.length,
        totalCategories: categories.length,
        activeAchievements: activeAchievements.length,
        totalCoinsEarned: analyticsData.totalCoinsEarned || 0,
        questionsAnswered: analyticsData.questionsAnswered || 0,
        successRate: analyticsData.successRate || 0,
        averageSessionTime: formatSessionTime(activityData.averageSessionTime || 0)
      }

      setStats(dashboardStats)

      // Get recent activity with error handling
      try {
        const activity = analyticsDataManager.getRecentActivity() || []
        setRecentActivity(activity.slice(0, 10)) // Last 10 activities
      } catch (error) {
        console.error('Error loading recent activity:', error)
        setRecentActivity([])
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Format session time
  const formatSessionTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  // Setup real-time sync listeners
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const handleSyncEvent = () => {
      loadDashboardData() // Refresh data when sync occurs
    }

    try {
      realTimeSyncService.addEventListener('quiz_updated', handleSyncEvent)
      realTimeSyncService.addEventListener('reward_updated', handleSyncEvent)
      realTimeSyncService.addEventListener('analytics_updated', handleSyncEvent)
    } catch (error) {
      console.error('Error setting up sync listeners:', error)
    }

    return () => {
      try {
        realTimeSyncService.removeEventListener('quiz_updated', handleSyncEvent)
        realTimeSyncService.removeEventListener('reward_updated', handleSyncEvent)
        realTimeSyncService.removeEventListener('analytics_updated', handleSyncEvent)
      } catch (error) {
        console.error('Error removing sync listeners:', error)
      }
    }
  }, [loadDashboardData])

  // Load data on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    loadDashboardData()
  }, [loadDashboardData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load dashboard data</div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome to TechKwiz Admin. Monitor your quiz performance, manage content, and track analytics.
        </p>
      </div>

      {/* Real-time Sync Status */}
      <SyncStatusWidget />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Questions</h3>
              <p className="text-sm text-gray-600">Quiz database</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Categories</h3>
              <p className="text-sm text-gray-600">Question topics</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalCategories}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Active Achievements</h3>
              <p className="text-sm text-gray-600">Reward system</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeAchievements}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Session Time</h3>
              <p className="text-sm text-gray-600">Average duration</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.averageSessionTime}</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quiz Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Questions Answered</span>
              <span className="font-semibold text-gray-900">{stats.questionsAnswered.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">{stats.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Coins Earned</span>
              <span className="font-semibold text-yellow-600">{stats.totalCoinsEarned.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as users interact with the quiz</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.hash = '#quiz-management'}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📝</span>
              <span className="font-medium text-gray-900">Add Questions</span>
            </div>
            <p className="text-sm text-gray-600">Create new quiz questions</p>
          </button>

          <button
            onClick={() => window.location.hash = '#reward-config'}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏆</span>
              <span className="font-medium text-gray-900">Manage Rewards</span>
            </div>
            <p className="text-sm text-gray-600">Configure achievements and coins</p>
          </button>

          <button
            onClick={() => window.location.hash = '#analytics'}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <span className="font-medium text-gray-900">View Analytics</span>
            </div>
            <p className="text-sm text-gray-600">Check performance metrics</p>
          </button>

          <button
            onClick={() => window.location.hash = '#file-management'}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📁</span>
              <span className="font-medium text-gray-900">Manage Files</span>
            </div>
            <p className="text-sm text-gray-600">Upload and organize files</p>
          </button>
        </div>
      </div>

      {/* Test Quiz Sync */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Quiz Sync</h3>
        <p className="text-gray-600 mb-4">
          Test the connection between admin dashboard and quiz game. This will help verify that questions are properly synced.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              // Open quiz game in new tab
              window.open('/', '_blank')
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎮</span>
              <span className="font-medium text-gray-900">Open Quiz Game</span>
            </div>
            <p className="text-sm text-gray-600">Test the quiz with current questions</p>
          </button>

          <button
            onClick={async () => {
              try {
                await realTimeSyncService.forceSyncAll()
                alert('✅ Sync completed! Questions have been updated in the quiz game.')
              } catch (error) {
                alert('❌ Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
              }
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔄</span>
              <span className="font-medium text-gray-900">Force Sync Now</span>
            </div>
            <p className="text-sm text-gray-600">Push all data to quiz game immediately</p>
          </button>
        </div>
      </div>
    </div>
  )
}
