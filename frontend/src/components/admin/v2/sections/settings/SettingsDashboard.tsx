'use client'

import { useState, useCallback, useEffect } from 'react'
import SystemSettings from './SystemSettings'
import UserPreferences from './UserPreferences'
import SecuritySettings from './SecuritySettings'
import DataManagement from './DataManagement'
import IntegrationSettings from './IntegrationSettings'
import GoogleAnalyticsSettings from './GoogleAnalyticsSettings'

type SettingsTab = 'system' | 'preferences' | 'security' | 'data' | 'integrations' | 'analytics'

interface SettingsTabConfig {
  id: SettingsTab
  name: string
  icon: string
  description: string
  component: React.ComponentType
}

const SETTINGS_TABS: SettingsTabConfig[] = [
  {
    id: 'system',
    name: 'System Settings',
    icon: '⚙️',
    description: 'Application configuration and system controls',
    component: SystemSettings
  },
  {
    id: 'preferences',
    name: 'User Preferences',
    icon: '👤',
    description: 'Personal settings and customization',
    component: UserPreferences
  },
  {
    id: 'security',
    name: 'Security Settings',
    icon: '🔒',
    description: 'Authentication and security configuration',
    component: SecuritySettings
  },
  {
    id: 'data',
    name: 'Data Management',
    icon: '💾',
    description: 'Backup, restore, and data operations',
    component: DataManagement
  },
  {
    id: 'integrations',
    name: 'Integration Settings',
    icon: '🔗',
    description: 'Third-party services and API configuration',
    component: IntegrationSettings
  },
  {
    id: 'analytics',
    name: 'Google Analytics',
    icon: '📊',
    description: 'Configure Google Analytics tracking for all pages',
    component: GoogleAnalyticsSettings
  }
]

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('system')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Handle tab switching
  const handleTabChange = useCallback((tabId: SettingsTab) => {
    setIsLoading(true)
    setActiveTab(tabId)
    
    // Simulate loading for smooth transition
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 150)
  }, [])

  // Get current tab configuration
  const currentTab = SETTINGS_TABS.find(tab => tab.id === activeTab) || SETTINGS_TABS[0]
  const CurrentComponent = currentTab.component

  // Format last updated time
  const formatLastUpdated = useCallback(() => {
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }, [lastUpdated])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Settings Dashboard</h1>
          <p className="text-lg text-gray-600">
            Configure system settings, user preferences, and integrations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {formatLastUpdated()}
          </div>
          <button
            onClick={() => setLastUpdated(new Date())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Settings Tabs">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="text-lg">{tab.icon}</span>
              <div className="text-left">
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs text-gray-400 hidden lg:block">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading {currentTab.name}...</span>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <CurrentComponent />
          </div>
        )}
      </div>

      {/* Settings Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Settings Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Current Tab</h4>
            <p className="text-blue-700">{currentTab.name}</p>
            <p className="text-blue-600 text-xs mt-1">{currentTab.description}</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Data Storage</h4>
            <p className="text-blue-700">Local Browser Storage</p>
            <p className="text-blue-600 text-xs mt-1">Settings persist across sessions</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Security</h4>
            <p className="text-blue-700">Encrypted & Validated</p>
            <p className="text-blue-600 text-xs mt-1">All settings are validated and secure</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Changes to settings are automatically saved and take effect immediately. 
            Use the backup feature in Data Management to create restore points before making major changes.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => handleTabChange('system')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚙️</span>
            <span className="font-medium text-gray-900">System Config</span>
          </div>
          <p className="text-sm text-gray-600">Application settings and maintenance mode</p>
        </button>

        <button
          onClick={() => handleTabChange('preferences')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👤</span>
            <span className="font-medium text-gray-900">Preferences</span>
          </div>
          <p className="text-sm text-gray-600">Theme, language, and personal settings</p>
        </button>

        <button
          onClick={() => handleTabChange('security')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔒</span>
            <span className="font-medium text-gray-900">Security</span>
          </div>
          <p className="text-sm text-gray-600">Password policies and authentication</p>
        </button>

        <button
          onClick={() => handleTabChange('data')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💾</span>
            <span className="font-medium text-gray-900">Data Backup</span>
          </div>
          <p className="text-sm text-gray-600">Backup and restore system data</p>
        </button>
      </div>
    </div>
  )
}
