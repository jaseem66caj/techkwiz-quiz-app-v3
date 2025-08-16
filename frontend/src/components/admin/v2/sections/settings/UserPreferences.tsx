'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserPreferences as UserPreferencesType, AVAILABLE_LANGUAGES, AVAILABLE_TIMEZONES } from '@/types/admin'
import { settingsDataManager } from '@/utils/settingsDataManager'

export default function UserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferencesType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load preferences on component mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const userPreferences = settingsDataManager.getUserPreferences()
        setPreferences(userPreferences)
      } catch (error) {
        console.error('Error loading user preferences:', error)
        setSaveMessage({ type: 'error', text: 'Failed to load user preferences' })
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Save preferences
  const savePreferences = useCallback(async (updatedPreferences: Partial<UserPreferencesType>) => {
    if (!preferences) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const success = settingsDataManager.saveUserPreferences(updatedPreferences)
      
      if (success) {
        const newPreferences = settingsDataManager.getUserPreferences()
        setPreferences(newPreferences)
        setSaveMessage({ type: 'success', text: 'User preferences saved successfully' })
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save user preferences' })
      }
    } catch (error) {
      console.error('Error saving user preferences:', error)
      setSaveMessage({ type: 'error', text: 'An error occurred while saving preferences' })
    } finally {
      setIsSaving(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [preferences])

  // Handle input changes
  const handleInputChange = useCallback((field: keyof UserPreferencesType, value: any) => {
    if (!preferences) return

    const updatedPreferences = { ...preferences, [field]: value }
    setPreferences(updatedPreferences)
    savePreferences({ [field]: value })
  }, [preferences, savePreferences])

  // Handle nested object changes
  const handleNestedChange = useCallback((parent: 'notifications' | 'accessibility', field: string, value: any) => {
    if (!preferences) return

    const updatedPreferences = {
      ...preferences,
      [parent]: {
        ...preferences[parent],
        [field]: value
      }
    }
    setPreferences(updatedPreferences)
    savePreferences({ [parent]: updatedPreferences[parent] })
  }, [preferences, savePreferences])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading user preferences...</span>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load user preferences</div>
        <button
          onClick={() => window.location.reload()}
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">User Preferences</h2>
        <p className="text-gray-600">
          Customize your personal settings, theme, language, and notification preferences.
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {saveMessage.text}
          </div>
        </div>
      )}

      {/* Theme Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Theme Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Theme Preference
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'light', name: 'Light', icon: '☀️', description: 'Clean and bright interface' },
              { value: 'dark', name: 'Dark', icon: '🌙', description: 'Easy on the eyes' },
              { value: 'auto', name: 'Auto', icon: '🔄', description: 'Follow system preference' }
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleInputChange('theme', theme.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  preferences.theme === theme.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{theme.icon}</span>
                  <span className="font-medium">{theme.name}</span>
                </div>
                <p className="text-sm text-gray-600">{theme.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Localization Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Localization</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {AVAILABLE_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => handleInputChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              <option value="DD MMM YYYY">DD MMM YYYY (Verbose)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Format
            </label>
            <select
              value={preferences.timeFormat}
              onChange={(e) => handleInputChange('timeFormat', e.target.value as '12h' | '24h')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Layout</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Layout Density
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'compact', name: 'Compact', description: 'More content, less spacing' },
              { value: 'comfortable', name: 'Comfortable', description: 'Balanced spacing (recommended)' },
              { value: 'spacious', name: 'Spacious', description: 'More spacing, easier reading' }
            ].map((layout) => (
              <button
                key={layout.value}
                onClick={() => handleInputChange('dashboardLayout', layout.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  preferences.dashboardLayout === layout.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium mb-1">{layout.name}</div>
                <p className="text-sm text-gray-600">{layout.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', name: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'pushNotifications', name: 'Push Notifications', description: 'Browser push notifications' },
            { key: 'systemAlerts', name: 'System Alerts', description: 'Important system messages' },
            { key: 'maintenanceAlerts', name: 'Maintenance Alerts', description: 'Scheduled maintenance notifications' },
            { key: 'securityAlerts', name: 'Security Alerts', description: 'Security-related notifications' }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{notification.name}</h4>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications[notification.key as keyof typeof preferences.notifications] as boolean}
                  onChange={(e) => handleNestedChange('notifications', notification.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Frequency
            </label>
            <select
              value={preferences.notifications.digestFrequency}
              onChange={(e) => handleNestedChange('notifications', 'digestFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="immediate">Immediate - As they happen</option>
              <option value="hourly">Hourly - Digest every hour</option>
              <option value="daily">Daily - Daily digest</option>
              <option value="weekly">Weekly - Weekly summary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accessibility Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Accessibility Options</h3>
        
        <div className="space-y-4">
          {[
            { key: 'highContrast', name: 'High Contrast', description: 'Increase color contrast for better visibility' },
            { key: 'largeText', name: 'Large Text', description: 'Increase text size throughout the interface' },
            { key: 'reducedMotion', name: 'Reduced Motion', description: 'Minimize animations and transitions' },
            { key: 'screenReader', name: 'Screen Reader Support', description: 'Enhanced support for screen readers' },
            { key: 'keyboardNavigation', name: 'Keyboard Navigation', description: 'Enhanced keyboard navigation support' }
          ].map((accessibility) => (
            <div key={accessibility.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{accessibility.name}</h4>
                <p className="text-sm text-gray-600">{accessibility.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.accessibility[accessibility.key as keyof typeof preferences.accessibility]}
                  onChange={(e) => handleNestedChange('accessibility', accessibility.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">Saving preferences...</span>
          </div>
        </div>
      )}
    </div>
  )
}
