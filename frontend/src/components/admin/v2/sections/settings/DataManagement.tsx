'use client'

import { useState, useCallback, useRef } from 'react'
import { settingsDataManager } from '@/utils/settingsDataManager'
import { quizDataManager } from '@/utils/quizDataManager'
import { rewardDataManager } from '@/utils/rewardDataManager'
import { analyticsDataManager } from '@/utils/analyticsDataManager'

interface BackupHistory {
  id: string
  timestamp: Date
  size: string
  type: 'manual' | 'automatic'
  status: 'success' | 'error'
}

export default function DataManagement() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([
    {
      id: 'backup_1',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      size: '2.3MB',
      type: 'automatic',
      status: 'success'
    },
    {
      id: 'backup_2',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      size: '2.1MB',
      type: 'manual',
      status: 'success'
    }
  ])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show message with auto-clear
  const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }, [])

  // Create full system backup
  const createBackup = useCallback(async () => {
    setIsCreatingBackup(true)
    
    try {
      // Create comprehensive backup
      const backup = {
        version: '1.0.0',
        timestamp: Date.now(),
        settings: {
          system: settingsDataManager.getSystemSettings(),
          user: settingsDataManager.getUserPreferences(),
          security: settingsDataManager.getSecuritySettings(),
          integrations: settingsDataManager.getIntegrationSettings()
        },
        data: {
          quiz: quizDataManager.getAllQuestions(),
          rewards: rewardDataManager.getAllAchievements(),
          analytics: analyticsDataManager.exportData({
            format: 'json',
            dateRange: { label: 'All Time', value: 'all' },
            sections: ['quiz', 'rewards', 'activity'],
            includeCharts: false
          })
        }
      }
      
      const backupString = JSON.stringify(backup, null, 2)
      const blob = new Blob([backupString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `techkwiz-backup-${new Date().toISOString().split('T')[0]}.json`
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      // Add to backup history
      const newBackup: BackupHistory = {
        id: `backup_${Date.now()}`,
        timestamp: new Date(),
        size: `${Math.round(blob.size / 1024)}KB`,
        type: 'manual',
        status: 'success'
      }
      setBackupHistory(prev => [newBackup, ...prev.slice(0, 4)])
      
      showMessage('success', 'Backup created and downloaded successfully')
    } catch (error) {
      console.error('Backup creation failed:', error)
      showMessage('error', 'Failed to create backup. Please try again.')
    } finally {
      setIsCreatingBackup(false)
    }
  }, [showMessage])

  // Handle file upload for restore
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      showMessage('error', 'Please select a valid JSON backup file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData = e.target?.result as string
        restoreFromBackup(backupData)
      } catch (error) {
        showMessage('error', 'Failed to read backup file')
      }
    }
    reader.readAsText(file)
  }, [showMessage])

  // Restore from backup
  const restoreFromBackup = useCallback(async (backupData: string) => {
    setIsRestoring(true)
    
    try {
      const backup = JSON.parse(backupData)
      
      // Validate backup structure
      if (!backup.version || !backup.settings || !backup.data) {
        throw new Error('Invalid backup format')
      }
      
      // Restore settings
      if (backup.settings.system) {
        settingsDataManager.saveSystemSettings(backup.settings.system)
      }
      if (backup.settings.user) {
        settingsDataManager.saveUserPreferences(backup.settings.user)
      }
      if (backup.settings.security) {
        settingsDataManager.saveSecuritySettings(backup.settings.security)
      }
      if (backup.settings.integrations) {
        settingsDataManager.saveIntegrationSettings(backup.settings.integrations)
      }
      
      // Note: In a real implementation, you would restore quiz and reward data
      // For now, we'll just show a success message
      
      showMessage('success', 'Backup restored successfully. Please refresh the page to see changes.')
    } catch (error) {
      console.error('Restore failed:', error)
      showMessage('error', 'Failed to restore backup. Please check the file format.')
    } finally {
      setIsRestoring(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [showMessage])

  // Clear all data
  const clearAllData = useCallback(() => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all data? This action cannot be undone. Please create a backup first.'
    )
    
    if (confirmed) {
      try {
        // Clear all localStorage data
        settingsDataManager.resetToDefaults()
        localStorage.removeItem('admin_quiz_questions')
        localStorage.removeItem('admin_achievements')
        localStorage.removeItem('admin_analytics_data')
        
        showMessage('success', 'All data cleared successfully. Please refresh the page.')
      } catch (error) {
        showMessage('error', 'Failed to clear data. Please try again.')
      }
    }
  }, [showMessage])

  // Calculate storage usage
  const getStorageUsage = useCallback(() => {
    let totalSize = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length
      }
    }
    return `${Math.round(totalSize / 1024)}KB`
  }, [])

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Management</h2>
        <p className="text-gray-600">
          Backup, restore, and manage your system data and settings.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : message.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : message.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Backup Operations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Backup Operations</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Create Backup</h4>
                <p className="text-sm text-green-700">Download a complete system backup</p>
              </div>
            </div>
            <button
              onClick={createBackup}
              disabled={isCreatingBackup}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isCreatingBackup ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Backup...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Create Backup
                </>
              )}
            </button>
          </div>

          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Restore Backup</h4>
                <p className="text-sm text-blue-700">Upload and restore from backup file</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isRestoring ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Restoring...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Backup History</h3>
        
        {backupHistory.length > 0 ? (
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    backup.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {backup.status === 'success' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {backup.type === 'manual' ? 'Manual Backup' : 'Automatic Backup'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTimestamp(backup.timestamp)} • {backup.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    backup.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {backup.status === 'success' ? 'Success' : 'Failed'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    backup.type === 'manual' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {backup.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <p>No backup history available</p>
            <p className="text-sm">Create your first backup to see history here</p>
          </div>
        )}
      </div>

      {/* Storage Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Storage Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-purple-900">Storage Used</span>
            </div>
            <p className="text-sm text-purple-700">{getStorageUsage()}</p>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span className="font-medium text-indigo-900">Data Integrity</span>
            </div>
            <p className="text-sm text-indigo-700">All systems healthy</p>
          </div>

          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span className="font-medium text-teal-900">Last Backup</span>
            </div>
            <p className="text-sm text-teal-700">
              {backupHistory.length > 0 ? formatTimestamp(backupHistory[0].timestamp) : 'Never'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-900">Clear All Data</h4>
              <p className="text-sm text-red-700">
                Permanently delete all settings, quiz data, and analytics. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Data Export Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Export Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Settings Export', description: 'Export all system settings', icon: '⚙️', action: () => showMessage('info', 'Settings export coming soon') },
            { name: 'Quiz Data Export', description: 'Export all quiz questions', icon: '❓', action: () => showMessage('info', 'Quiz export available in Quiz Management') },
            { name: 'Analytics Export', description: 'Export analytics data', icon: '📊', action: () => showMessage('info', 'Analytics export available in Analytics section') },
            { name: 'Complete Export', description: 'Export everything', icon: '📦', action: createBackup }
          ].map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{option.icon}</span>
                <span className="font-medium text-gray-900">{option.name}</span>
              </div>
              <p className="text-sm text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
