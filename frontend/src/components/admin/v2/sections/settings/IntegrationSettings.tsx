'use client'

import { useState, useEffect, useCallback } from 'react'
import { IntegrationSettings as IntegrationSettingsType } from '@/types/admin'
import { settingsDataManager } from '@/utils/settingsDataManager'
import { integrationService } from '@/utils/integrationService'

export default function IntegrationSettings() {
  const [settings, setSettings] = useState<IntegrationSettingsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeSection, setActiveSection] = useState<'api' | 'services' | 'webhooks' | 'social' | 'analytics' | 'notifications'>('api')
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; responseTime?: number }>>({})
  const [isTesting, setIsTesting] = useState<Record<string, boolean>>({})

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const integrationSettings = settingsDataManager.getIntegrationSettings()
        setSettings(integrationSettings)
      } catch (error) {
        console.error('Error loading integration settings:', error)
        setSaveMessage({ type: 'error', text: 'Failed to load integration settings' })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Test connection methods
  const testApiConnection = useCallback(async () => {
    setIsTesting(prev => ({ ...prev, api: true }))

    try {
      integrationService.refreshSettings()
      const result = await integrationService.testApiConnection()
      setTestResults(prev => ({ ...prev, api: result }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        api: {
          success: false,
          message: error instanceof Error ? error.message : 'Test failed'
        }
      }))
    } finally {
      setIsTesting(prev => ({ ...prev, api: false }))
    }
  }, [])

  const testWebhook = useCallback(async (url: string) => {
    setIsTesting(prev => ({ ...prev, webhook: true }))

    try {
      const result = await integrationService.testWebhook(url)
      setTestResults(prev => ({ ...prev, webhook: result }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        webhook: {
          success: false,
          message: error instanceof Error ? error.message : 'Webhook test failed'
        }
      }))
    } finally {
      setIsTesting(prev => ({ ...prev, webhook: false }))
    }
  }, [])

  const initializeAdSense = useCallback(async () => {
    setIsTesting(prev => ({ ...prev, adsense: true }))

    try {
      integrationService.refreshSettings()
      const result = await integrationService.initializeAdSense()
      setTestResults(prev => ({ ...prev, adsense: result }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        adsense: {
          success: false,
          message: error instanceof Error ? error.message : 'AdSense initialization failed'
        }
      }))
    } finally {
      setIsTesting(prev => ({ ...prev, adsense: false }))
    }
  }, [])

  // Save settings
  const saveSettings = useCallback(async (updatedSettings: Partial<IntegrationSettingsType>) => {
    if (!settings) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const success = settingsDataManager.saveIntegrationSettings(updatedSettings)

      if (success) {
        const newSettings = settingsDataManager.getIntegrationSettings()
        setSettings(newSettings)
        integrationService.refreshSettings() // Refresh integration service settings
        setSaveMessage({ type: 'success', text: 'Integration settings saved successfully' })
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save integration settings' })
      }
    } catch (error) {
      console.error('Error saving integration settings:', error)
      setSaveMessage({ type: 'error', text: 'An error occurred while saving settings' })
    } finally {
      setIsSaving(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [settings])

  // Handle nested object changes
  const handleNestedChange = useCallback((parent: keyof IntegrationSettingsType, subParent: string, field: string, value: any) => {
    if (!settings) return

    const updatedSettings = {
      ...settings,
      [parent]: {
        ...settings[parent],
        [subParent]: {
          ...(settings[parent] as any)[subParent],
          [field]: value
        }
      }
    }
    setSettings(updatedSettings)
    saveSettings({ [parent]: updatedSettings[parent] })
  }, [settings, saveSettings])

  // Handle simple nested changes
  const handleSimpleNestedChange = useCallback((parent: keyof IntegrationSettingsType, field: string, value: any) => {
    if (!settings) return

    const updatedSettings = {
      ...settings,
      [parent]: {
        ...settings[parent],
        [field]: value
      }
    }
    setSettings(updatedSettings)
    saveSettings({ [parent]: updatedSettings[parent] })
  }, [settings, saveSettings])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading integration settings...</span>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load integration settings</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const sections = [
    { id: 'api', name: 'API Configuration', icon: '🔧' },
    { id: 'services', name: 'Third-party Services', icon: '🌐' },
    { id: 'webhooks', name: 'Webhooks', icon: '🔗' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'notifications', name: 'Notifications', icon: '📧' }
  ] as const

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Integration Settings</h2>
        <p className="text-gray-600">
          Configure third-party services, APIs, and external integrations.
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

      {/* Section Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-3 rounded-lg text-center transition-all ${
                activeSection === section.id
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl mb-1">{section.icon}</div>
              <div className="text-sm font-medium">{section.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      {activeSection === 'api' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">API Configuration</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL
              </label>
              <input
                type="url"
                value={settings.apiConfiguration.baseUrl}
                onChange={(e) => handleSimpleNestedChange('apiConfiguration', 'baseUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://api.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.apiConfiguration.apiKey}
                onChange={(e) => handleSimpleNestedChange('apiConfiguration', 'apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter API key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limit (requests/hour)
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                value={settings.apiConfiguration.rateLimit}
                onChange={(e) => handleSimpleNestedChange('apiConfiguration', 'rateLimit', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (milliseconds)
              </label>
              <input
                type="number"
                min="1000"
                max="30000"
                value={settings.apiConfiguration.timeout}
                onChange={(e) => handleSimpleNestedChange('apiConfiguration', 'timeout', parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retry Attempts
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={settings.apiConfiguration.retryAttempts}
                onChange={(e) => handleSimpleNestedChange('apiConfiguration', 'retryAttempts', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.apiConfiguration.enableCaching}
                  onChange={(e) => handleSimpleNestedChange('apiConfiguration', 'enableCaching', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Enable Caching</span>
              </label>
            </div>
          </div>

          {/* Test Connection */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Connection Test</h4>
              <button
                onClick={testApiConnection}
                disabled={isTesting.api || !settings.apiConfiguration.baseUrl || !settings.apiConfiguration.apiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isTesting.api ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Test Connection
                  </>
                )}
              </button>
            </div>

            {testResults.api && (
              <div className={`p-4 rounded-lg ${
                testResults.api.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {testResults.api.success ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`text-sm font-medium ${
                    testResults.api.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResults.api.message}
                  </span>
                  {testResults.api.responseTime && (
                    <span className="text-xs text-gray-600 ml-auto">
                      {testResults.api.responseTime}ms
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Third-party Services */}
      {activeSection === 'services' && (
        <div className="space-y-6">
          {/* Google Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Google Analytics</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.thirdPartyServices.googleAnalytics.enabled}
                  onChange={(e) => handleNestedChange('thirdPartyServices', 'googleAnalytics', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {settings.thirdPartyServices.googleAnalytics.enabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    value={settings.thirdPartyServices.googleAnalytics.trackingId}
                    onChange={(e) => handleNestedChange('thirdPartyServices', 'googleAnalytics', 'trackingId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="GA-XXXXXXXXX-X"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.thirdPartyServices.googleAnalytics.anonymizeIp}
                      onChange={(e) => handleNestedChange('thirdPartyServices', 'googleAnalytics', 'anonymizeIp', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Anonymize IP</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* AdSense */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Google AdSense</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.thirdPartyServices.adSense.enabled}
                  onChange={(e) => handleNestedChange('thirdPartyServices', 'adSense', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {settings.thirdPartyServices.adSense.enabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publisher ID
                  </label>
                  <input
                    type="text"
                    value={settings.thirdPartyServices.adSense.publisherId}
                    onChange={(e) => handleNestedChange('thirdPartyServices', 'adSense', 'publisherId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="pub-XXXXXXXXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Slot ID
                  </label>
                  <input
                    type="text"
                    value={settings.thirdPartyServices.adSense.adSlotId}
                    onChange={(e) => handleNestedChange('thirdPartyServices', 'adSense', 'adSlotId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="XXXXXXXXXX"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Email Service */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Email Service</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.thirdPartyServices.emailService.enabled}
                  onChange={(e) => handleNestedChange('thirdPartyServices', 'emailService', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {settings.thirdPartyServices.emailService.enabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider
                  </label>
                  <select
                    value={settings.thirdPartyServices.emailService.provider}
                    onChange={(e) => handleNestedChange('thirdPartyServices', 'emailService', 'provider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={settings.thirdPartyServices.emailService.apiKey}
                    onChange={(e) => handleNestedChange('thirdPartyServices', 'emailService', 'apiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter API key"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={settings.thirdPartyServices.emailService.fromEmail}
                    onChange={(e) => handleNestedChange('thirdPartyServices', 'emailService', 'fromEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="noreply@example.com"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other sections would be implemented similarly */}
      {activeSection === 'webhooks' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Webhook Configuration</h3>
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p>Webhook configuration coming soon</p>
            <p className="text-sm">Configure webhook endpoints for external integrations</p>
          </div>
        </div>
      )}

      {activeSection === 'social' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Media Integration</h3>
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <p>Social media integration coming soon</p>
            <p className="text-sm">Connect Twitter, Facebook, and LinkedIn accounts</p>
          </div>
        </div>
      )}

      {activeSection === 'analytics' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics Integration</h3>
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Advanced analytics integration coming soon</p>
            <p className="text-sm">Configure custom analytics and heatmap services</p>
          </div>
        </div>
      )}

      {activeSection === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Services</h3>
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2zM4 7h8V5H4v2z" />
            </svg>
            <p>Notification services coming soon</p>
            <p className="text-sm">Configure email, SMS, and push notification services</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">Saving integration settings...</span>
          </div>
        </div>
      )}
    </div>
  )
}
