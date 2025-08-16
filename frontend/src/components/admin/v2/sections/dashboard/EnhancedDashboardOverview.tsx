'use client'

import { useState, useEffect, useCallback } from 'react'
import { quizDataManager } from '@/utils/quizDataManager'
import { rewardDataManager } from '@/utils/rewardDataManager'
import { analyticsDataManager } from '@/utils/analyticsDataManager'
import { settingsDataManager } from '@/utils/settingsDataManager'
import { realTimeSyncService } from '@/utils/realTimeSync'
import { comprehensiveDataSync, type SyncedDashboardData } from '@/utils/comprehensiveDataSync'
import { mockFrontendData } from '@/utils/mockFrontendData'
import SyncStatusWidget from '../../common/SyncStatusWidget'

interface DashboardStats {
  totalQuestions: number
  totalCategories: number
  activeAchievements: number
  totalCoinsEarned: number
  questionsAnswered: number
  successRate: number
  averageSessionTime: string
  googleAnalyticsEnabled: boolean
  totalFiles: number
  settingsConfigured: number
}

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: string
  count?: number
  action: () => void
  color: string
  enabled?: boolean
}

interface EnhancedDashboardOverviewProps {
  onNavigateToSection?: (sectionId: string) => void
}

export default function EnhancedDashboardOverview({ onNavigateToSection }: EnhancedDashboardOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [syncedData, setSyncedData] = useState<SyncedDashboardData | null>(null)
  const [syncStatus, setSyncStatus] = useState({
    isInProgress: false,
    lastSyncTime: 0,
    syncErrors: [] as string[],
    dataIntegrity: true
  })

  // Load dashboard data using comprehensive sync service
  const loadDashboardData = useCallback(async () => {
    if (typeof window === 'undefined') return

    const startTime = performance.now()
    console.log('📊 Enhanced dashboard data loading started')

    try {
      setIsLoading(true)

      // Update sync status
      const currentSyncStatus = comprehensiveDataSync.getSyncStatus()
      setSyncStatus(currentSyncStatus)

      // Get synced data from comprehensive sync service
      const data = await comprehensiveDataSync.syncFromFrontend()
      setSyncedData(data)

      // Convert synced data to dashboard stats format
      const questions = quizDataManager.getQuestions() || []
      const categories = quizDataManager.getCategories() || []
      const achievements = rewardDataManager.getAchievements() || []
      const activeAchievements = achievements.filter(a => a.isActive)
      const systemSettings = settingsDataManager.getSystemSettings()

      const dashboardStats: DashboardStats = {
        totalQuestions: questions.length,
        totalCategories: categories.length,
        activeAchievements: activeAchievements.length,
        totalCoinsEarned: data.quizMetrics.totalCoinsEarned,
        questionsAnswered: data.quizMetrics.questionsAnswered,
        successRate: data.quizMetrics.successRate,
        averageSessionTime: formatSessionTime(data.quizMetrics.averageSessionTime),
        googleAnalyticsEnabled: systemSettings.googleAnalytics?.enabled || false,
        totalFiles: 3,
        settingsConfigured: 6
      }

      setStats(dashboardStats)
      setRecentActivity(data.userActivity.recentActivity)
      setIsLoading(false)

      const loadTime = performance.now() - startTime
      console.log(`📊 Enhanced dashboard data loaded in: ${loadTime.toFixed(2)}ms`)
      console.log('📊 Synced data:', data)

    } catch (error) {
      console.error('Error loading enhanced dashboard data:', error)
      setIsLoading(false)

      // Fallback to basic data
      const questions = quizDataManager.getQuestions() || []
      const categories = quizDataManager.getCategories() || []
      const achievements = rewardDataManager.getAchievements() || []

      setStats({
        totalQuestions: questions.length,
        totalCategories: categories.length,
        activeAchievements: achievements.filter(a => a.isActive).length,
        totalCoinsEarned: 0,
        questionsAnswered: 0,
        successRate: 0,
        averageSessionTime: '0s',
        googleAnalyticsEnabled: false,
        totalFiles: 3,
        settingsConfigured: 6
      })
    }
  }, [])

  useEffect(() => {
    // Initialize mock data if not present
    const mockDataExists = localStorage.getItem('mock_data_generated')
    if (!mockDataExists) {
      console.log('🎭 No mock data found, generating...')
      initializeMockData()
    } else {
      loadDashboardData()
    }

    // Set up comprehensive sync listener
    const handleSyncUpdate = (data: SyncedDashboardData) => {
      console.log('🔄 Received sync update:', data)
      setSyncedData(data)

      // Update dashboard stats with synced data
      if (data.quizMetrics) {
        const questions = quizDataManager.getQuestions() || []
        const categories = quizDataManager.getCategories() || []
        const achievements = rewardDataManager.getAchievements() || []
        const systemSettings = settingsDataManager.getSystemSettings()

        const updatedStats: DashboardStats = {
          totalQuestions: questions.length,
          totalCategories: categories.length,
          activeAchievements: achievements.filter(a => a.isActive).length,
          totalCoinsEarned: data.quizMetrics.totalCoinsEarned,
          questionsAnswered: data.quizMetrics.questionsAnswered,
          successRate: data.quizMetrics.successRate,
          averageSessionTime: formatSessionTime(data.quizMetrics.averageSessionTime),
          googleAnalyticsEnabled: systemSettings.googleAnalytics?.enabled || false,
          totalFiles: 3,
          settingsConfigured: 6
        }

        setStats(updatedStats)
        setRecentActivity(data.userActivity.recentActivity)
      }
    }

    // Add comprehensive sync listener
    comprehensiveDataSync.addSyncListener(handleSyncUpdate)

    // Set up real-time sync listeners for fallback
    const handleSyncEvent = () => {
      loadDashboardData()
    }

    realTimeSyncService.addEventListener('quiz_updated', handleSyncEvent)
    realTimeSyncService.addEventListener('reward_updated', handleSyncEvent)
    realTimeSyncService.addEventListener('analytics_updated', handleSyncEvent)
    realTimeSyncService.addEventListener('settings_updated', handleSyncEvent)

    // Start periodic mock data updates for testing
    const mockUpdateInterval = mockFrontendData.startPeriodicUpdates(30000) // Every 30 seconds

    return () => {
      comprehensiveDataSync.removeSyncListener(handleSyncUpdate)
      realTimeSyncService.removeEventListener('quiz_updated', handleSyncEvent)
      realTimeSyncService.removeEventListener('reward_updated', handleSyncEvent)
      realTimeSyncService.removeEventListener('analytics_updated', handleSyncEvent)
      realTimeSyncService.removeEventListener('settings_updated', handleSyncEvent)
      clearInterval(mockUpdateInterval)
    }
  }, [loadDashboardData])

  const formatSessionTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  const navigateToSection = (sectionId: string) => {
    if (onNavigateToSection) {
      onNavigateToSection(sectionId)
    } else {
      console.log(`Navigate to ${sectionId}`)
    }
  }

  // Handle manual sync
  const handleManualSync = async () => {
    try {
      console.log('🔄 Manual sync triggered')
      setSyncStatus(prev => ({ ...prev, isInProgress: true }))

      const result = await comprehensiveDataSync.triggerManualSync()

      if (result.success && result.data) {
        setSyncedData(result.data)
        // Update dashboard stats with new data
        await loadDashboardData()
        console.log('🔄 Manual sync completed successfully')
      } else {
        console.error('🔄 Manual sync failed:', result.message)
      }
    } catch (error) {
      console.error('🔄 Manual sync error:', error)
    } finally {
      setSyncStatus(prev => ({ ...prev, isInProgress: false }))
    }
  }

  // Handle force sync all
  const handleForceSyncAll = async () => {
    try {
      console.log('🔄 Force sync all triggered')
      setSyncStatus(prev => ({ ...prev, isInProgress: true }))

      const result = await comprehensiveDataSync.forceSyncAll()

      if (result.success && result.data) {
        setSyncedData(result.data)
        // Update dashboard stats with new data
        await loadDashboardData()
        console.log('🔄 Force sync all completed successfully')
      } else {
        console.error('🔄 Force sync all failed:', result.message)
      }
    } catch (error) {
      console.error('🔄 Force sync all error:', error)
    } finally {
      setSyncStatus(prev => ({ ...prev, isInProgress: false }))
    }
  }

  // Initialize mock data for testing
  const initializeMockData = () => {
    console.log('🎭 Initializing mock frontend data...')
    mockFrontendData.populateMockData()
    // Trigger sync after mock data is populated
    setTimeout(() => {
      loadDashboardData()
    }, 1000)
  }

  if (isLoading || !stats) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const featureCards: FeatureCard[] = [
    {
      id: 'quiz-management',
      title: 'Quiz Management',
      description: 'Manage questions and categories',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      status: `${stats.totalQuestions} questions`,
      count: stats.totalQuestions,
      action: () => navigateToSection('quiz-management'),
      color: 'blue'
    },
    {
      id: 'reward-config',
      title: 'Reward System',
      description: 'Configure achievements and coins',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      status: `${stats.activeAchievements} achievements`,
      count: stats.activeAchievements,
      action: () => navigateToSection('reward-config'),
      color: 'purple'
    },
    {
      id: 'google-analytics',
      title: 'Google Analytics',
      description: 'Track website performance',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      status: stats.googleAnalyticsEnabled ? 'Enabled' : 'Disabled',
      enabled: stats.googleAnalyticsEnabled,
      action: () => navigateToSection('enhanced-settings'),
      color: stats.googleAnalyticsEnabled ? 'green' : 'gray'
    },
    {
      id: 'file-management',
      title: 'File Management',
      description: 'Organize media and documents',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      status: `${stats.totalFiles} files`,
      count: stats.totalFiles,
      action: () => navigateToSection('file-management'),
      color: 'orange'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">Welcome to TechKwiz Admin. Monitor your quiz performance and manage content.</p>
            </div>
            {/* Enhanced Sync Status Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Real-time Sync Status</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  syncStatus.isInProgress
                    ? 'bg-yellow-100 text-yellow-800'
                    : syncStatus.dataIntegrity
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {syncStatus.isInProgress ? 'Syncing...' : syncStatus.dataIntegrity ? 'In Sync' : 'Sync Error'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Last Sync</div>
                  <div className="font-medium">
                    {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Frontend Data</div>
                  <div className="font-medium">
                    {syncedData ? `${syncedData.quizMetrics.questionsAnswered} questions` : 'No data'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={syncStatus.isInProgress}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className={`w-4 h-4 ${syncStatus.isInProgress ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Now
                </button>
                <button
                  onClick={handleForceSyncAll}
                  disabled={syncStatus.isInProgress}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className={`w-4 h-4 ${syncStatus.isInProgress ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Force Sync All
                </button>
              </div>

              {syncStatus.syncErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800">
                    <div className="font-medium">Sync Errors:</div>
                    <ul className="mt-1 list-disc list-inside">
                      {syncStatus.syncErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>• Sync automatically runs every 5 seconds when frontend data changes</p>
                <p>• "Sync Now" pulls latest data from the quiz game</p>
                <p>• "Force Sync All" clears cache and performs fresh sync</p>
                <p>• Mock data updates every 30 seconds for testing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalQuestions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Coins</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalCoinsEarned}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageSessionTime}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Synced Frontend Data Section */}
        {syncedData && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Frontend Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quiz Metrics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quiz Performance</h3>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Questions Answered</span>
                    <span className="font-semibold">{syncedData.quizMetrics.questionsAnswered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold">{syncedData.quizMetrics.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Session Time</span>
                    <span className="font-semibold">{formatSessionTime(syncedData.quizMetrics.averageSessionTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Coins Earned</span>
                    <span className="font-semibold text-yellow-600">{syncedData.quizMetrics.totalCoinsEarned}</span>
                  </div>
                </div>
              </div>

              {/* User Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Sessions</span>
                    <span className="font-semibold">{syncedData.userActivity.activeSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Users</span>
                    <span className="font-semibold">{syncedData.userActivity.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Recent Activities</span>
                    <span className="font-semibold">{syncedData.userActivity.recentActivity.length}</span>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Page Views</span>
                    <span className="font-semibold">{syncedData.analytics.pageViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Engagement</span>
                    <span className="font-semibold">{syncedData.analytics.engagement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-semibold">{syncedData.analytics.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Integrity</span>
                    <span className={`font-semibold ${syncedData.systemStatus.dataIntegrity ? 'text-green-600' : 'text-red-600'}`}>
                      {syncedData.systemStatus.dataIntegrity ? 'Good' : 'Issues'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Cards Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card) => (
              <div
                key={card.id}
                onClick={card.action}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${card.color}-100 rounded-lg text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  {card.enabled !== undefined && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      card.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {card.enabled ? 'Active' : 'Inactive'}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{card.status}</span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigateToSection('quiz-management')}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Add New Question</h3>
                    <p className="text-sm text-gray-600">Create quiz questions</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('reward-config')}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manage Rewards</h3>
                    <p className="text-sm text-gray-600">Configure achievements</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('enhanced-settings')}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Analytics Settings</h3>
                    <p className="text-sm text-gray-600">Configure Google Analytics</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('file-management')}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg text-orange-600 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload Files</h3>
                    <p className="text-sm text-gray-600">Manage media assets</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'quiz' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'reward' ? 'bg-purple-100 text-purple-600' :
                        activity.type === 'achievement' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 text-sm">No recent activity</p>
                  <p className="text-gray-400 text-xs mt-1">Activity will appear here as users interact with the quiz</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">System Health</p>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Active Sessions</p>
                <p className="text-sm text-gray-600">1 admin session</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Storage Usage</p>
                <p className="text-sm text-gray-600">~2.5MB used</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
