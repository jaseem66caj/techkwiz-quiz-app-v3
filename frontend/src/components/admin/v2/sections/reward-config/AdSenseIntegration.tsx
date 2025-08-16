'use client'

import { useState, useCallback } from 'react'
import { RewardConfig } from '@/types/admin'
import { REWARD_VALIDATION_RULES } from '@/utils/rewardDataManager'

interface AdSenseIntegrationProps {
  config: RewardConfig
  onConfigChange: (updates: Partial<RewardConfig>) => void
  onSave: (updates: Partial<RewardConfig>) => void
}

export function AdSenseIntegration({ config, onConfigChange, onSave }: AdSenseIntegrationProps) {
  const [localConfig, setLocalConfig] = useState(config.adSenseConfig)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Handle configuration changes
  const handleConfigChange = useCallback((field: keyof typeof localConfig, value: any) => {
    const newConfig = { ...localConfig, [field]: value }
    setLocalConfig(newConfig)
    
    // Clear specific field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    onConfigChange({ adSenseConfig: newConfig })
  }, [localConfig, errors, onConfigChange])

  // Validate configuration
  const validateConfig = useCallback(() => {
    const newErrors: Record<string, string> = {}
    
    if (localConfig.enabled) {
      if (!localConfig.adUnitId.trim()) {
        newErrors.adUnitId = 'Ad Unit ID is required when AdSense is enabled'
      } else if (!/^ca-pub-\d+$/.test(localConfig.adUnitId.trim())) {
        newErrors.adUnitId = 'Ad Unit ID must be in format: ca-pub-1234567890123456'
      }
      
      if (!localConfig.adSlotId.trim()) {
        newErrors.adSlotId = 'Ad Slot ID is required when AdSense is enabled'
      } else if (!/^\d+$/.test(localConfig.adSlotId.trim())) {
        newErrors.adSlotId = 'Ad Slot ID must contain only numbers'
      }
    }
    
    if (localConfig.frequency < REWARD_VALIDATION_RULES.AD_MIN_FREQUENCY || 
        localConfig.frequency > REWARD_VALIDATION_RULES.AD_MAX_FREQUENCY) {
      newErrors.frequency = `Frequency must be between ${REWARD_VALIDATION_RULES.AD_MIN_FREQUENCY} and ${REWARD_VALIDATION_RULES.AD_MAX_FREQUENCY}`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [localConfig])

  // Save changes
  const handleSave = useCallback(async () => {
    if (!validateConfig()) return
    
    setIsSaving(true)
    try {
      await onSave({ adSenseConfig: localConfig })
    } finally {
      setIsSaving(false)
    }
  }, [localConfig, validateConfig, onSave])

  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config.adSenseConfig)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">AdSense Integration</h3>
        <p className="text-gray-600">
          Configure Google AdSense integration to monetize your quiz application.
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Enable AdSense</h4>
            <p className="text-sm text-gray-600 mt-1">
              Turn on AdSense integration to display ads in your quiz application
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleConfigChange('enabled', !localConfig.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localConfig.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localConfig.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      {localConfig.enabled && (
        <div className="space-y-6">
          {/* Ad Unit Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            <h4 className="text-lg font-semibold text-gray-900">Ad Unit Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ad Unit ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ad Unit ID *
                </label>
                <input
                  type="text"
                  value={localConfig.adUnitId}
                  onChange={(e) => handleConfigChange('adUnitId', e.target.value)}
                  placeholder="ca-pub-1234567890123456"
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.adUnitId ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.adUnitId && (
                  <p className="text-sm text-red-600">{errors.adUnitId}</p>
                )}
                <p className="text-xs text-gray-500">
                  Your Google AdSense publisher ID (found in your AdSense account)
                </p>
              </div>

              {/* Ad Slot ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ad Slot ID *
                </label>
                <input
                  type="text"
                  value={localConfig.adSlotId}
                  onChange={(e) => handleConfigChange('adSlotId', e.target.value)}
                  placeholder="1234567890"
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.adSlotId ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.adSlotId && (
                  <p className="text-sm text-red-600">{errors.adSlotId}</p>
                )}
                <p className="text-xs text-gray-500">
                  The specific ad slot ID for your ad unit
                </p>
              </div>
            </div>
          </div>

          {/* Ad Placement Settings */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            <h4 className="text-lg font-semibold text-gray-900">Ad Placement Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Placement Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ad Placement
                </label>
                <select
                  value={localConfig.placement}
                  onChange={(e) => handleConfigChange('placement', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="popup">Reward Popup</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="banner">Banner</option>
                </select>
                <p className="text-xs text-gray-500">
                  Where ads will be displayed in your application
                </p>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ad Frequency (every {localConfig.frequency} questions)
                </label>
                <input
                  type="range"
                  min={REWARD_VALIDATION_RULES.AD_MIN_FREQUENCY}
                  max={REWARD_VALIDATION_RULES.AD_MAX_FREQUENCY}
                  value={localConfig.frequency}
                  onChange={(e) => handleConfigChange('frequency', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Every question</span>
                  <span>Every 20 questions</span>
                </div>
                {errors.frequency && (
                  <p className="text-sm text-red-600">{errors.frequency}</p>
                )}
              </div>
            </div>
          </div>

          {/* Test Mode */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Test Mode</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Enable test mode to use test ads during development (recommended for staging environments)
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleConfigChange('testMode', !localConfig.testMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localConfig.testMode ? 'bg-yellow-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.testMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {localConfig.testMode && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-800">
                    Test mode is enabled. Test ads will be shown instead of real ads.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ad Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Ad Preview</h4>
        
        {localConfig.enabled ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Preview of how ads will appear in your application:
            </p>
            
            {/* Popup Placement Preview */}
            {localConfig.placement === 'popup' && (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <div className="bg-white rounded-lg p-4 shadow-lg max-w-sm mx-auto">
                  <h5 className="font-semibold text-gray-900 mb-2">Reward Popup</h5>
                  <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded p-4 mb-3">
                    <p className="text-xs text-gray-600">AdSense Ad</p>
                    <p className="text-xs text-gray-500">300x250</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Great job! You earned 14 coins!</p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm">
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Sidebar Placement Preview */}
            {localConfig.placement === 'sidebar' && (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-4">
                  <div className="flex-1 bg-white rounded p-4">
                    <p className="text-sm text-gray-600">Quiz Content Area</p>
                  </div>
                  <div className="w-32 bg-gray-200 border-2 border-dashed border-gray-400 rounded p-2 text-center">
                    <p className="text-xs text-gray-600">AdSense</p>
                    <p className="text-xs text-gray-500">160x600</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Banner Placement Preview */}
            {localConfig.placement === 'banner' && (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="space-y-4">
                  <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded p-4 text-center">
                    <p className="text-xs text-gray-600">AdSense Banner Ad</p>
                    <p className="text-xs text-gray-500">728x90</p>
                  </div>
                  <div className="bg-white rounded p-4">
                    <p className="text-sm text-gray-600">Quiz Content Area</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Ads will appear every {localConfig.frequency} question{localConfig.frequency !== 1 ? 's' : ''} 
              {localConfig.testMode ? ' (test ads in development)' : ''}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">AdSense Disabled</h3>
            <p className="mt-2 text-sm text-gray-500">
              Enable AdSense integration above to see ad previews.
            </p>
          </div>
        )}
      </div>

      {/* Compliance Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Important Compliance Information</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Ensure your application complies with Google AdSense policies</p>
          <p>• Users must be able to distinguish ads from content</p>
          <p>• Do not encourage clicks on ads or use misleading placement</p>
          <p>• Test thoroughly in test mode before enabling live ads</p>
          <p>• Monitor your AdSense account for policy violations</p>
        </div>
        <div className="mt-4">
          <a
            href="https://support.google.com/adsense/answer/48182"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Read AdSense Program Policies →
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {localConfig.enabled ? 'AdSense integration is enabled' : 'AdSense integration is disabled'}
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 font-medium">
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={isSaving || Object.keys(errors).length > 0 || !hasChanges}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
