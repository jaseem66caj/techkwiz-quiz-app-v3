'use client'

import { useState, useCallback } from 'react'
import { RewardConfig, RewardPreviewData } from '@/types/admin'
import { rewardDataManager, REWARD_VALIDATION_RULES } from '@/utils/rewardDataManager'

interface PopupPreviewProps {
  config: RewardConfig
  onConfigChange: (updates: Partial<RewardConfig>) => void
  onSave: (updates: Partial<RewardConfig>) => void
}

export function PopupPreview({ config, onConfigChange, onSave }: PopupPreviewProps) {
  const [localSettings, setLocalSettings] = useState(config.popupSettings)
  const [previewType, setPreviewType] = useState<RewardPreviewData['type']>('correct')
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Handle settings changes
  const handleSettingChange = useCallback((field: keyof typeof localSettings, value: any) => {
    const newSettings = { ...localSettings, [field]: value }
    setLocalSettings(newSettings)
    onConfigChange({ popupSettings: newSettings })
  }, [localSettings, onConfigChange])

  // Handle custom message changes
  const handleMessageChange = useCallback((messageType: keyof typeof localSettings.customMessages, value: string) => {
    const newMessages = { ...localSettings.customMessages, [messageType]: value }
    const newSettings = { ...localSettings, customMessages: newMessages }
    setLocalSettings(newSettings)
    onConfigChange({ popupSettings: newSettings })
  }, [localSettings, onConfigChange])

  // Save changes
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave({ popupSettings: localSettings })
    } finally {
      setIsSaving(false)
    }
  }, [localSettings, onSave])

  // Generate preview data
  const getPreviewData = useCallback(() => {
    return rewardDataManager.generatePreviewData(previewType)
  }, [previewType])

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(config.popupSettings)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Popup Settings & Preview</h3>
        <p className="text-gray-600">
          Configure how reward popups appear to users and preview the animations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Popup Configuration</h4>
          
          {/* Animation Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Animation Type
            </label>
            <select
              value={localSettings.animationType}
              onChange={(e) => handleSettingChange('animationType', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="treasure_chest">Treasure Chest</option>
              <option value="coin_burst">Coin Burst</option>
              <option value="achievement_badge">Achievement Badge</option>
            </select>
            <p className="text-xs text-gray-500">
              Choose the animation style for reward popups
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Duration ({localSettings.duration} seconds)
            </label>
            <input
              type="range"
              min={REWARD_VALIDATION_RULES.POPUP_MIN_DURATION}
              max={REWARD_VALIDATION_RULES.POPUP_MAX_DURATION}
              step="0.5"
              value={localSettings.duration}
              onChange={(e) => handleSettingChange('duration', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{REWARD_VALIDATION_RULES.POPUP_MIN_DURATION}s</span>
              <span>{REWARD_VALIDATION_RULES.POPUP_MAX_DURATION}s</span>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Show Fun Facts</label>
                <p className="text-xs text-gray-500">Display fun facts in correct answer popups</p>
              </div>
              <button
                type="button"
                onClick={() => handleSettingChange('showFunFact', !localSettings.showFunFact)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.showFunFact ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.showFunFact ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Close</label>
                <p className="text-xs text-gray-500">Automatically close popups after duration</p>
              </div>
              <button
                type="button"
                onClick={() => handleSettingChange('autoClose', !localSettings.autoClose)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.autoClose ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.autoClose ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">AdSense Integration</label>
                <p className="text-xs text-gray-500">Show ads in reward popups</p>
              </div>
              <button
                type="button"
                onClick={() => handleSettingChange('adSenseEnabled', !localSettings.adSenseEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.adSenseEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.adSenseEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Custom Messages */}
          <div className="space-y-4">
            <h5 className="text-md font-semibold text-gray-900">Custom Messages</h5>
            <p className="text-sm text-gray-600">
              Use {'{coins}'} to display the coin amount and {'{achievement}'} for achievement names.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer Message
                </label>
                <input
                  type="text"
                  value={localSettings.customMessages.correct}
                  onChange={(e) => handleMessageChange('correct', e.target.value)}
                  placeholder="Great job! You earned {coins} coins!"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incorrect Answer Message
                </label>
                <input
                  type="text"
                  value={localSettings.customMessages.incorrect}
                  onChange={(e) => handleMessageChange('incorrect', e.target.value)}
                  placeholder="Keep trying! You earned {coins} coins for the attempt."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus Question Message
                </label>
                <input
                  type="text"
                  value={localSettings.customMessages.bonus}
                  onChange={(e) => handleMessageChange('bonus', e.target.value)}
                  placeholder="Bonus question! You earned {coins} coins!"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achievement Message
                </label>
                <input
                  type="text"
                  value={localSettings.customMessages.achievement}
                  onChange={(e) => handleMessageChange('achievement', e.target.value)}
                  placeholder="Achievement unlocked: {achievement}!"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Live Preview</h4>
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Test Preview
            </button>
          </div>

          {/* Preview Type Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Preview Scenario
            </label>
            <select
              value={previewType}
              onChange={(e) => setPreviewType(e.target.value as RewardPreviewData['type'])}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="correct">Correct Answer</option>
              <option value="incorrect">Incorrect Answer</option>
              <option value="bonus">Bonus Question</option>
              <option value="achievement">Achievement Unlock</option>
            </select>
          </div>

          {/* Static Preview */}
          <div className="bg-gray-900 rounded-xl p-8 text-center relative overflow-hidden min-h-64">
            <div className="relative z-10">
              <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm mx-auto">
                <div className="text-center">
                  {/* Animation Icon */}
                  <div className="text-6xl mb-4">
                    {localSettings.animationType === 'treasure_chest' && '🏆'}
                    {localSettings.animationType === 'coin_burst' && '💰'}
                    {localSettings.animationType === 'achievement_badge' && '🎖️'}
                  </div>
                  
                  {/* Message */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {(() => {
                      const previewData = getPreviewData()
                      return previewData.message
                    })()}
                  </h3>
                  
                  {/* Coin Display */}
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-2xl">🪙</span>
                    <span className="text-2xl font-bold text-yellow-600">
                      +{getPreviewData().coins}
                    </span>
                  </div>
                  
                  {/* Fun Fact */}
                  {localSettings.showFunFact && getPreviewData().funFact && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        💡 {getPreviewData().funFact}
                      </p>
                    </div>
                  )}
                  
                  {/* AdSense Placeholder */}
                  {localSettings.adSenseEnabled && (
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                      <p className="text-xs text-gray-500">AdSense Ad Placeholder</p>
                      <p className="text-xs text-gray-400">300x250</p>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium">
                    {localSettings.autoClose ? 'Continue' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Background Animation Hint */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse"></div>
          </div>

          {/* Preview Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Preview Settings</h5>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Animation:</span>
                <span className="capitalize">{localSettings.animationType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{localSettings.duration}s</span>
              </div>
              <div className="flex justify-between">
                <span>Auto Close:</span>
                <span>{localSettings.autoClose ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Fun Facts:</span>
                <span>{localSettings.showFunFact ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span>AdSense:</span>
                <span>{localSettings.adSenseEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Changes are automatically applied to the preview above
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 font-medium">
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
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

      {/* Full Screen Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Full size preview popup */}
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md mx-auto animate-bounce">
              <div className="text-center">
                <div className="text-8xl mb-6">
                  {localSettings.animationType === 'treasure_chest' && '🏆'}
                  {localSettings.animationType === 'coin_burst' && '💰'}
                  {localSettings.animationType === 'achievement_badge' && '🎖️'}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {getPreviewData().message}
                </h3>
                
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <span className="text-4xl">🪙</span>
                  <span className="text-4xl font-bold text-yellow-600">
                    +{getPreviewData().coins}
                  </span>
                </div>
                
                {localSettings.showFunFact && getPreviewData().funFact && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800">
                      💡 {getPreviewData().funFact}
                    </p>
                  </div>
                )}
                
                <button 
                  onClick={() => setShowPreview(false)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium text-lg"
                >
                  {localSettings.autoClose ? 'Continue' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
