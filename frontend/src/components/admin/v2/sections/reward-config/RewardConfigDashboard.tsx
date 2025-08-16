'use client'

import { useState, useEffect, useCallback } from 'react'
import { RewardConfig } from '@/types/admin'
import { rewardDataManager } from '@/utils/rewardDataManager'
import { CoinValueEditor } from './CoinValueEditor'
import { AchievementManager } from './AchievementManager'
import { PopupPreview } from './PopupPreview'
import { AdSenseIntegration } from './AdSenseIntegration'
import { RewardSettings } from './RewardSettings'

type TabType = 'coins' | 'achievements' | 'popups' | 'adsense' | 'settings'

export default function RewardConfigDashboard() {
  // State management
  const [rewardConfig, setRewardConfig] = useState<RewardConfig | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('coins')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load initial data
  useEffect(() => {
    loadRewardConfig()
  }, [])

  const loadRewardConfig = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const config = rewardDataManager.getRewardConfig()
      setRewardConfig(config)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reward configuration')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save configuration
  const handleSaveConfig = useCallback(async (updates: Partial<RewardConfig>) => {
    if (!rewardConfig) return

    try {
      const updatedConfig = rewardDataManager.saveRewardConfig(updates)
      setRewardConfig(updatedConfig)
      setHasUnsavedChanges(false)
      
      // Show success feedback
      const event = new CustomEvent('reward-config-saved', { detail: updatedConfig })
      window.dispatchEvent(event)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reward configuration')
    }
  }, [rewardConfig])

  // Handle configuration changes
  const handleConfigChange = useCallback((updates: Partial<RewardConfig>) => {
    if (!rewardConfig) return

    setRewardConfig(prev => prev ? { ...prev, ...updates } : null)
    setHasUnsavedChanges(true)
  }, [rewardConfig])

  // Error handling
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Tab configuration
  const tabs = [
    {
      id: 'coins' as TabType,
      name: 'Coin Values',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      description: 'Configure coin rewards for different actions'
    },
    {
      id: 'achievements' as TabType,
      name: 'Achievements',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      description: 'Manage achievements and rewards'
    },
    {
      id: 'popups' as TabType,
      name: 'Popup Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2m-5 4v6m-3-3h6" />
        </svg>
      ),
      description: 'Configure popup animations and messages'
    },
    {
      id: 'adsense' as TabType,
      name: 'AdSense',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Configure AdSense integration'
    },
    {
      id: 'settings' as TabType,
      name: 'General Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'General reward system settings'
    }
  ]

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12 space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">Loading reward configuration...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!rewardConfig) {
    return (
      <div className="p-8 lg:p-12 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Reward Configuration</h1>
          <p className="text-lg text-red-600">Failed to load reward configuration</p>
          <button
            onClick={loadRewardConfig}
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
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Reward Configuration</h1>
          <p className="text-lg text-gray-600 mt-2">
            Configure coin values, achievements, and reward system settings
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-medium">
              Unsaved changes
            </span>
          )}
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">System Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              rewardConfig.isEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {rewardConfig.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
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
          {activeTab === 'coins' && (
            <CoinValueEditor
              config={rewardConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
          )}
          
          {activeTab === 'achievements' && (
            <AchievementManager
              config={rewardConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
          )}
          
          {activeTab === 'popups' && (
            <PopupPreview
              config={rewardConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
          )}
          
          {activeTab === 'adsense' && (
            <AdSenseIntegration
              config={rewardConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
          )}
          
          {activeTab === 'settings' && (
            <RewardSettings
              config={rewardConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
              onReload={loadRewardConfig}
            />
          )}
        </div>
      </div>
    </div>
  )
}
