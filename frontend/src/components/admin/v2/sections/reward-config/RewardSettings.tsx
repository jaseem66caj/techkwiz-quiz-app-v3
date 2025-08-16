'use client'

import { useState, useCallback } from 'react'
import { RewardConfig } from '@/types/admin'
import { rewardDataManager } from '@/utils/rewardDataManager'

interface RewardSettingsProps {
  config: RewardConfig
  onConfigChange: (updates: Partial<RewardConfig>) => void
  onSave: (updates: Partial<RewardConfig>) => void
  onReload: () => void
}

export function RewardSettings({ config, onConfigChange, onSave, onReload }: RewardSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)

  // Toggle reward system
  const handleToggleSystem = useCallback(async () => {
    const newState = !config.isEnabled
    const message = newState 
      ? 'Are you sure you want to enable the reward system? Users will start earning coins and achievements.'
      : 'Are you sure you want to disable the reward system? This will stop all coin rewards and achievements.'
    
    if (confirm(message)) {
      try {
        setIsLoading(true)
        const updates = { isEnabled: newState }
        onConfigChange(updates)
        await onSave(updates)
      } finally {
        setIsLoading(false)
      }
    }
  }, [config.isEnabled, onConfigChange, onSave])

  // Reset to defaults
  const handleResetToDefaults = useCallback(async () => {
    if (confirm('Are you sure you want to reset all reward settings to defaults? This action cannot be undone and will overwrite all current configurations.')) {
      try {
        setIsLoading(true)
        const defaultConfig = rewardDataManager.resetToDefaults()
        onReload()
      } catch (error) {
        console.error('Error resetting to defaults:', error)
        alert('Failed to reset to defaults. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }, [onReload])

  // Create backup
  const handleCreateBackup = useCallback(() => {
    try {
      const backup = rewardDataManager.createBackup()
      const blob = new Blob([backup], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `reward-config-backup-${new Date().toISOString().split('T')[0]}.json`
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      setShowBackupModal(false)
    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Failed to create backup. Please try again.')
    }
  }, [])

  // Export configuration
  const handleExportConfig = useCallback(() => {
    try {
      const configData = rewardDataManager.exportConfig()
      const blob = new Blob([configData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `reward-configuration-${new Date().toISOString().split('T')[0]}.json`
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting configuration:', error)
      alert('Failed to export configuration. Please try again.')
    }
  }, [])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">General Settings</h3>
        <p className="text-gray-600">
          Manage general reward system settings, backups, and system configuration.
        </p>
      </div>

      {/* System Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Reward System Status</h4>
            <p className="text-sm text-gray-600 mt-1">
              {config.isEnabled 
                ? 'The reward system is currently active. Users can earn coins and unlock achievements.'
                : 'The reward system is currently disabled. No rewards will be given to users.'
              }
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleSystem}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
              config.isEnabled ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className={`${config.isEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {config.isEnabled ? 'Active' : 'Disabled'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Created:</span>
            <p className="text-gray-600">{formatDate(config.createdAt)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Updated:</span>
            <p className="text-gray-600">{formatDate(config.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{config.coinValues.correct}</div>
            <div className="text-sm text-gray-600">Correct Answer Coins</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{config.achievements.length}</div>
            <div className="text-sm text-gray-600">Total Achievements</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{config.popupSettings.duration}s</div>
            <div className="text-sm text-gray-600">Popup Duration</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {config.adSenseConfig.enabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600">AdSense Integration</div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup & Restore */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Backup & Restore</h5>
            <p className="text-sm text-gray-600">
              Create backups of your reward configuration or restore from a previous backup.
            </p>
            
            <div className="space-y-2">
              <button
                onClick={() => setShowBackupModal(true)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Backup
              </button>
              
              <button
                onClick={() => setShowRestoreModal(true)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Restore from Backup
              </button>
            </div>
          </div>

          {/* Import & Export */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Import & Export</h5>
            <p className="text-sm text-gray-600">
              Export your current configuration or import settings from another environment.
            </p>
            
            <div className="space-y-2">
              <button
                onClick={handleExportConfig}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Export Configuration
              </button>
              
              <label className="w-full block">
                <input
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        setIsLoading(true)
                        const content = await file.text()
                        rewardDataManager.importConfig(content)
                        onReload()
                        alert('Configuration imported successfully!')
                      } catch (error) {
                        console.error('Error importing configuration:', error)
                        alert('Failed to import configuration. Please check the file format.')
                      } finally {
                        setIsLoading(false)
                        e.target.value = '' // Reset file input
                      }
                    }
                  }}
                  className="hidden"
                />
                <span className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer inline-block text-center">
                  Import Configuration
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h4>
        <p className="text-sm text-red-800 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        
        <button
          onClick={handleResetToDefaults}
          disabled={isLoading}
          className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          {isLoading ? 'Resetting...' : 'Reset to Defaults'}
        </button>
      </div>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Backup</h3>
            <p className="text-gray-600 mb-6">
              This will create a complete backup of your reward configuration including all settings, achievements, and preferences.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBackupModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBackup}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Restore from Backup</h3>
            <p className="text-gray-600 mb-6">
              Upload a backup file to restore your reward configuration. This will overwrite all current settings.
            </p>
            
            <div className="mb-6">
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        setIsLoading(true)
                        const content = await file.text()
                        rewardDataManager.restoreFromBackup(content)
                        onReload()
                        setShowRestoreModal(false)
                        alert('Backup restored successfully!')
                      } catch (error) {
                        console.error('Error restoring backup:', error)
                        alert('Failed to restore backup. Please check the file format.')
                      } finally {
                        setIsLoading(false)
                        e.target.value = '' // Reset file input
                      }
                    }
                  }}
                  className="hidden"
                />
                <span className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer inline-block text-center text-gray-600">
                  Click to select backup file
                </span>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
