'use client'

import { useState, useEffect, useCallback } from 'react'
import { settingsDataManager } from '@/utils/settingsDataManager'

interface GoogleAnalyticsConfig {
  enabled: boolean
  trackingId: string
  measurementId: string
  customCode: string
  trackPageViews: boolean
  trackEvents: boolean
  anonymizeIp: boolean
  updatedAt: number
}

export default function GoogleAnalyticsSettings() {
  const [config, setConfig] = useState<GoogleAnalyticsConfig>({
    enabled: false,
    trackingId: '',
    measurementId: '',
    customCode: '',
    trackPageViews: true,
    trackEvents: true,
    anonymizeIp: true,
    updatedAt: Date.now()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Load Google Analytics settings
  const loadSettings = useCallback(() => {
    try {
      setIsLoading(true)
      const settings = settingsDataManager.getSystemSettings()
      const gaConfig = settings.googleAnalytics || config
      setConfig(gaConfig)
    } catch (error) {
      console.error('Error loading Google Analytics settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [config])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Save settings
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)
      setSaveStatus('idle')

      const updatedConfig = {
        ...config,
        updatedAt: Date.now()
      }

      const success = settingsDataManager.saveSystemSettings({
        googleAnalytics: updatedConfig
      })

      if (success) {
        setConfig(updatedConfig)
        setSaveStatus('success')
        console.log('✅ Google Analytics settings saved successfully')
      } else {
        setSaveStatus('error')
        console.error('❌ Failed to save Google Analytics settings')
      }
    } catch (error) {
      setSaveStatus('error')
      console.error('❌ Error saving Google Analytics settings:', error)
    } finally {
      setIsSaving(false)
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [config])

  // Handle input changes
  const handleChange = useCallback((field: keyof GoogleAnalyticsConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              📊 Google Analytics Settings
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Configure Google Analytics tracking for all pages on your website
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {saveStatus === 'success' && (
              <span className="text-green-600 text-sm font-medium">✅ Saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 text-sm font-medium">❌ Error</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
          <div>
            <h4 className="font-medium text-gray-900">Enable Google Analytics</h4>
            <p className="text-sm text-gray-600">Turn on Google Analytics tracking for your website</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Configuration Form */}
      {config.enabled && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Analytics Configuration</h4>
          
          <div className="space-y-6">
            {/* Tracking ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Analytics Tracking ID (GA4)
              </label>
              <input
                type="text"
                value={config.trackingId}
                onChange={(e) => handleChange('trackingId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Google Analytics 4 property ID (starts with G-)
              </p>
            </div>

            {/* Measurement ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement ID (Optional)
              </label>
              <input
                type="text"
                value={config.measurementId}
                onChange={(e) => handleChange('measurementId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Additional measurement ID if using multiple properties
              </p>
            </div>

            {/* Custom Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Analytics Code (Optional)
              </label>
              <textarea
                value={config.customCode}
                onChange={(e) => handleChange('customCode', e.target.value)}
                placeholder="// Custom Google Analytics code or additional tracking scripts"
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Additional JavaScript code to include with Google Analytics
              </p>
            </div>

            {/* Tracking Options */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Tracking Options</h5>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.trackPageViews}
                    onChange={(e) => handleChange('trackPageViews', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track page views</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.trackEvents}
                    onChange={(e) => handleChange('trackEvents', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track custom events</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.anonymizeIp}
                    onChange={(e) => handleChange('anonymizeIp', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Anonymize IP addresses (GDPR compliance)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">📋 Setup Instructions</h5>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Create a Google Analytics 4 property in your Google Analytics account</li>
          <li>Copy your Tracking ID (starts with G-) from the property settings</li>
          <li>Paste the Tracking ID above and enable Google Analytics</li>
          <li>Save settings - the tracking code will be automatically added to all pages</li>
          <li>Verify tracking is working in your Google Analytics dashboard</li>
        </ol>
      </div>
    </div>
  )
}
