'use client'

import { useState, useCallback } from 'react'
import { RewardConfig, DEFAULT_REWARD_CONFIG } from '@/types/admin'
import { REWARD_VALIDATION_RULES } from '@/utils/rewardDataManager'

interface CoinValueEditorProps {
  config: RewardConfig
  onConfigChange: (updates: Partial<RewardConfig>) => void
  onSave: (updates: Partial<RewardConfig>) => void
}

export function CoinValueEditor({ config, onConfigChange, onSave }: CoinValueEditorProps) {
  const [localValues, setLocalValues] = useState(config.coinValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Handle input changes with validation
  const handleValueChange = useCallback((field: keyof typeof localValues, value: number) => {
    const newValues = { ...localValues, [field]: value }
    setLocalValues(newValues)
    
    // Clear specific field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Update parent component
    onConfigChange({ coinValues: newValues })
  }, [localValues, errors, onConfigChange])

  // Validate all values
  const validateValues = useCallback(() => {
    const newErrors: Record<string, string> = {}
    
    if (localValues.correct < REWARD_VALIDATION_RULES.COIN_MIN_VALUE || 
        localValues.correct > REWARD_VALIDATION_RULES.COIN_MAX_VALUE) {
      newErrors.correct = `Must be between ${REWARD_VALIDATION_RULES.COIN_MIN_VALUE} and ${REWARD_VALIDATION_RULES.COIN_MAX_VALUE}`
    }
    
    if (localValues.incorrect < REWARD_VALIDATION_RULES.COIN_MIN_VALUE || 
        localValues.incorrect > REWARD_VALIDATION_RULES.COIN_MAX_VALUE) {
      newErrors.incorrect = `Must be between ${REWARD_VALIDATION_RULES.COIN_MIN_VALUE} and ${REWARD_VALIDATION_RULES.COIN_MAX_VALUE}`
    }
    
    if (localValues.bonus < REWARD_VALIDATION_RULES.COIN_MIN_VALUE || 
        localValues.bonus > REWARD_VALIDATION_RULES.COIN_MAX_VALUE) {
      newErrors.bonus = `Must be between ${REWARD_VALIDATION_RULES.COIN_MIN_VALUE} and ${REWARD_VALIDATION_RULES.COIN_MAX_VALUE}`
    }
    
    if (localValues.streakMultiplier < REWARD_VALIDATION_RULES.STREAK_MIN_MULTIPLIER || 
        localValues.streakMultiplier > REWARD_VALIDATION_RULES.STREAK_MAX_MULTIPLIER) {
      newErrors.streakMultiplier = `Must be between ${REWARD_VALIDATION_RULES.STREAK_MIN_MULTIPLIER} and ${REWARD_VALIDATION_RULES.STREAK_MAX_MULTIPLIER}`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [localValues])

  // Save changes
  const handleSave = useCallback(async () => {
    if (!validateValues()) return
    
    setIsSaving(true)
    try {
      await onSave({ coinValues: localValues })
    } finally {
      setIsSaving(false)
    }
  }, [localValues, validateValues, onSave])

  // Reset to defaults
  const handleResetToDefaults = useCallback(() => {
    if (confirm('Are you sure you want to reset all coin values to defaults? This action cannot be undone.')) {
      const defaultValues = DEFAULT_REWARD_CONFIG.coinValues
      setLocalValues(defaultValues)
      setErrors({})
      onConfigChange({ coinValues: defaultValues })
    }
  }, [onConfigChange])

  // Calculate example scenarios
  const getExampleScenarios = useCallback(() => {
    return [
      {
        scenario: 'Single correct answer',
        calculation: `${localValues.correct} coins`,
        coins: localValues.correct
      },
      {
        scenario: 'Incorrect answer',
        calculation: `${localValues.incorrect} coins`,
        coins: localValues.incorrect
      },
      {
        scenario: 'Bonus question',
        calculation: `${localValues.bonus} coins`,
        coins: localValues.bonus
      },
      {
        scenario: '3-question streak',
        calculation: `${localValues.correct} × 3 × ${localValues.streakMultiplier} = ${localValues.correct * 3 * localValues.streakMultiplier} coins`,
        coins: localValues.correct * 3 * localValues.streakMultiplier
      },
      {
        scenario: '5-question streak with bonus',
        calculation: `(${localValues.correct} × 4 + ${localValues.bonus}) × ${localValues.streakMultiplier} = ${(localValues.correct * 4 + localValues.bonus) * localValues.streakMultiplier} coins`,
        coins: (localValues.correct * 4 + localValues.bonus) * localValues.streakMultiplier
      }
    ]
  }, [localValues])

  const hasChanges = JSON.stringify(localValues) !== JSON.stringify(config.coinValues)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Coin Value Configuration</h3>
        <p className="text-gray-600">
          Set the coin rewards for different quiz actions. These values affect how many coins users earn.
        </p>
      </div>

      {/* Coin Value Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Correct Answer */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Correct Answer Reward
          </label>
          <div className="relative">
            <input
              type="number"
              value={localValues.correct}
              onChange={(e) => handleValueChange('correct', parseInt(e.target.value) || 0)}
              min={REWARD_VALIDATION_RULES.COIN_MIN_VALUE}
              max={REWARD_VALIDATION_RULES.COIN_MAX_VALUE}
              className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.correct ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">coins</span>
            </div>
          </div>
          {errors.correct && (
            <p className="text-sm text-red-600">{errors.correct}</p>
          )}
          <p className="text-xs text-gray-500">
            Default: {DEFAULT_REWARD_CONFIG.coinValues.correct} coins
          </p>
        </div>

        {/* Incorrect Answer */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Incorrect Answer Reward
          </label>
          <div className="relative">
            <input
              type="number"
              value={localValues.incorrect}
              onChange={(e) => handleValueChange('incorrect', parseInt(e.target.value) || 0)}
              min={REWARD_VALIDATION_RULES.COIN_MIN_VALUE}
              max={REWARD_VALIDATION_RULES.COIN_MAX_VALUE}
              className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.incorrect ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">coins</span>
            </div>
          </div>
          {errors.incorrect && (
            <p className="text-sm text-red-600">{errors.incorrect}</p>
          )}
          <p className="text-xs text-gray-500">
            Default: {DEFAULT_REWARD_CONFIG.coinValues.incorrect} coins
          </p>
        </div>

        {/* Bonus Question */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Bonus Question Reward
          </label>
          <div className="relative">
            <input
              type="number"
              value={localValues.bonus}
              onChange={(e) => handleValueChange('bonus', parseInt(e.target.value) || 0)}
              min={REWARD_VALIDATION_RULES.COIN_MIN_VALUE}
              max={REWARD_VALIDATION_RULES.COIN_MAX_VALUE}
              className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.bonus ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">coins</span>
            </div>
          </div>
          {errors.bonus && (
            <p className="text-sm text-red-600">{errors.bonus}</p>
          )}
          <p className="text-xs text-gray-500">
            Default: {DEFAULT_REWARD_CONFIG.coinValues.bonus} coins
          </p>
        </div>

        {/* Streak Multiplier */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Streak Multiplier
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={localValues.streakMultiplier}
              onChange={(e) => handleValueChange('streakMultiplier', parseFloat(e.target.value) || 0)}
              min={REWARD_VALIDATION_RULES.STREAK_MIN_MULTIPLIER}
              max={REWARD_VALIDATION_RULES.STREAK_MAX_MULTIPLIER}
              className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.streakMultiplier ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">×</span>
            </div>
          </div>
          {errors.streakMultiplier && (
            <p className="text-sm text-red-600">{errors.streakMultiplier}</p>
          )}
          <p className="text-xs text-gray-500">
            Default: {DEFAULT_REWARD_CONFIG.coinValues.streakMultiplier}× multiplier
          </p>
        </div>
      </div>

      {/* Example Scenarios */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Example Scenarios</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getExampleScenarios().map((scenario, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">{scenario.scenario}</h5>
              <p className="text-sm text-gray-600 mb-2">{scenario.calculation}</p>
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-600">{scenario.coins}</span>
                <span className="text-sm text-gray-500 ml-1">coins</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={handleResetToDefaults}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Reset to Defaults
        </button>
        
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
