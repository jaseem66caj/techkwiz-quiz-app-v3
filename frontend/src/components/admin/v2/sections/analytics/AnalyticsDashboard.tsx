'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnalyticsData, TimeRange, DEFAULT_TIME_RANGES } from '@/types/admin'
import { analyticsDataManager } from '@/utils/analyticsDataManager'
import { QuizAnalytics } from './QuizAnalytics'
import { RewardAnalytics } from './RewardAnalytics'
import { UserActivityAnalytics } from './UserActivityAnalytics'
import { AnalyticsExport } from './AnalyticsExport'

type TabType = 'quiz' | 'rewards' | 'activity' | 'export'

export default function AnalyticsDashboard() {
  // State management
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('quiz')
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(DEFAULT_TIME_RANGES[1])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load initial data
  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeRange])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, selectedTimeRange])

  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = analyticsDataManager.getAnalyticsData(selectedTimeRange)
      setAnalyticsData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedTimeRange])

  const refreshData = useCallback(async () => {
    try {
      const data = analyticsDataManager.refreshData(selectedTimeRange)
      setAnalyticsData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics data')
    }
  }, [selectedTimeRange])

  const handleTimeRangeChange = useCallback((timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange)
  }, [])

  const handleAutoRefreshToggle = useCallback(() => {
    setAutoRefresh(prev => !prev)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Tab configuration
  const tabs = [
    {
      id: 'quiz' as TabType,
      name: 'Quiz Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Quiz performance and category analysis'
    },
    {
      id: 'rewards' as TabType,
      name: 'Reward Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      description: 'Coin distribution and achievement progress'
    },
    {
      id: 'activity' as TabType,
      name: 'User Activity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      description: 'User behavior and session tracking'
    },
    {
      id: 'export' as TabType,
      name: 'Export Data',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Export analytics data and reports'
    }
  ]

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12 space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">Loading analytics data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-8 lg:p-12 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          <p className="text-lg text-red-600">Failed to load analytics data</p>
          <button
            onClick={loadAnalyticsData}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            Track quiz performance, reward engagement, and user activity
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Time Range:</span>
            <select
              value={DEFAULT_TIME_RANGES.findIndex(range => range.label === selectedTimeRange.label)}
              onChange={(e) => handleTimeRangeChange(DEFAULT_TIME_RANGES[parseInt(e.target.value)])}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {DEFAULT_TIME_RANGES.map((range, index) => (
                <option key={index} value={index}>{range.label}</option>
              ))}
            </select>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Auto Refresh:</span>
            <button
              onClick={handleAutoRefreshToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}

          {/* Manual Refresh */}
          <button
            onClick={refreshData}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {tab.icon}
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'quiz' && (
            <QuizAnalytics
              data={analyticsData.quizMetrics}
              timeRange={selectedTimeRange}
            />
          )}
          
          {activeTab === 'rewards' && (
            <RewardAnalytics
              data={analyticsData.rewardMetrics}
              timeRange={selectedTimeRange}
            />
          )}
          
          {activeTab === 'activity' && (
            <UserActivityAnalytics
              data={analyticsData.userActivity}
              timeRange={selectedTimeRange}
            />
          )}
          
          {activeTab === 'export' && (
            <AnalyticsExport
              analyticsData={analyticsData}
              timeRange={selectedTimeRange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
