'use client'

import { useState, useCallback, useEffect } from 'react'
import SystemSettings from './SystemSettings'
import UserPreferences from './UserPreferences'
import SecuritySettings from './SecuritySettings'
import DataManagement from './DataManagement'
import GoogleAnalyticsSettings from './GoogleAnalyticsSettings'

type SettingsCategory = 'core' | 'integrations'
type CoreSettingsTab = 'system' | 'preferences' | 'security' | 'data'
type IntegrationsTab = 'analytics'

interface SettingsCategoryConfig {
  id: SettingsCategory
  name: string
  icon: string
  description: string
  tabs: SettingsTabConfig[]
}

interface SettingsTabConfig {
  id: string
  name: string
  icon: string
  description: string
  component: React.ComponentType
}

const SETTINGS_CATEGORIES: SettingsCategoryConfig[] = [
  {
    id: 'core',
    name: 'Core Settings',
    icon: '⚙️',
    description: 'Essential system configuration and preferences',
    tabs: [
      {
        id: 'system',
        name: 'System Configuration',
        icon: '🖥️',
        description: 'Application settings and system controls',
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
        name: 'Security & Access',
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
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations & Analytics',
    icon: '🔗',
    description: 'Third-party services and tracking configuration',
    tabs: [
      {
        id: 'analytics',
        name: 'Google Analytics',
        icon: '📊',
        description: 'Configure Google Analytics tracking for all pages',
        component: GoogleAnalyticsSettings
      }
    ]
  }
]

export default function EnhancedSettingsDashboard() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('core')
  const [activeTab, setActiveTab] = useState<string>('system')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Handle category switching
  const handleCategoryChange = useCallback((categoryId: SettingsCategory) => {
    setIsLoading(true)
    setActiveCategory(categoryId)
    
    // Set default tab for the category
    const category = SETTINGS_CATEGORIES.find(c => c.id === categoryId)
    if (category && category.tabs.length > 0) {
      setActiveTab(category.tabs[0].id)
    }
    
    // Simulate loading for smooth transition
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 300)
  }, [])

  // Handle tab switching within category
  const handleTabChange = useCallback((tabId: string) => {
    setIsLoading(true)
    setActiveTab(tabId)
    
    // Simulate loading for smooth transition
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 200)
  }, [])

  // Get current category and tab
  const currentCategory = SETTINGS_CATEGORIES.find(c => c.id === activeCategory)
  const currentTab = currentCategory?.tabs.find(t => t.id === activeTab)
  const ActiveComponent = currentTab?.component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings Dashboard</h1>
              <p className="text-gray-600 mt-1">Configure system settings, integrations, and preferences</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={() => setLastUpdated(new Date())}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Category Navigation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SETTINGS_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      activeCategory === category.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm ${
                      activeCategory === category.id ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        activeCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.tabs.length} setting{category.tabs.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  {activeCategory === category.id && (
                    <div className="text-blue-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        {currentCategory && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentCategory.name}</h2>
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {currentCategory.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            ActiveComponent && <ActiveComponent />
          )}
        </div>

        {/* Settings Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Settings Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Current Section</h4>
              <p className="text-blue-800">{currentTab?.name || 'None selected'}</p>
              <p className="text-sm text-blue-600 mt-1">{currentTab?.description}</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Data Storage</h4>
              <p className="text-blue-800">Local Browser Storage</p>
              <p className="text-sm text-blue-600 mt-1">Settings persist across sessions</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Security</h4>
              <p className="text-blue-800">Encrypted & Validated</p>
              <p className="text-sm text-blue-600 mt-1">All settings are validated and secure</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changes to settings are automatically saved and take effect immediately. 
              Use the backup feature in Data Management to create restore points before making major changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
