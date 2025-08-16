'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileSettings as FileSettingsType, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from '@/types/admin'
import { fileDataManager } from '@/utils/fileDataManager'

export default function FileSettings() {
  const [settings, setSettings] = useState<FileSettingsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const fileSettings = fileDataManager.getFileSettings()
        setSettings(fileSettings)
      } catch (error) {
        console.error('Error loading file settings:', error)
        setSaveMessage({ type: 'error', text: 'Failed to load file settings' })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Save settings
  const saveSettings = useCallback(async (updatedSettings: Partial<FileSettingsType>) => {
    if (!settings) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const success = fileDataManager.saveFileSettings(updatedSettings)
      
      if (success) {
        const newSettings = fileDataManager.getFileSettings()
        setSettings(newSettings)
        setSaveMessage({ type: 'success', text: 'File settings saved successfully' })
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save file settings' })
      }
    } catch (error) {
      console.error('Error saving file settings:', error)
      setSaveMessage({ type: 'error', text: 'An error occurred while saving settings' })
    } finally {
      setIsSaving(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [settings])

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FileSettingsType, value: any) => {
    if (!settings) return

    const updatedSettings = { ...settings, [field]: value }
    setSettings(updatedSettings)
    saveSettings({ [field]: value })
  }, [settings, saveSettings])

  // Handle file type toggle
  const handleFileTypeToggle = useCallback((mimeType: string) => {
    if (!settings) return

    const updatedTypes = settings.allowedTypes.includes(mimeType)
      ? settings.allowedTypes.filter(type => type !== mimeType)
      : [...settings.allowedTypes, mimeType]

    handleInputChange('allowedTypes', updatedTypes)
  }, [settings, handleInputChange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading file settings...</span>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load file settings</div>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">File Settings</h2>
        <p className="text-gray-600">
          Configure file upload preferences, security settings, and optimization options.
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

      {/* Upload Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Preferences</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum File Size (MB)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={Math.round(settings.maxFileSize / (1024 * 1024))}
              onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value) * 1024 * 1024 || FILE_SIZE_LIMITS.maxFileSize)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum size per file (1-50 MB)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Upload Folder
            </label>
            <input
              type="text"
              value={settings.defaultFolder}
              onChange={(e) => handleInputChange('defaultFolder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="uploads"
            />
            <p className="text-xs text-gray-500 mt-1">Default folder for new uploads</p>
          </div>
        </div>
      </div>

      {/* File Type Restrictions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Allowed File Types</h3>
        
        <div className="space-y-6">
          {/* Images */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALLOWED_FILE_TYPES.images.map((mimeType) => (
                <label key={mimeType} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowedTypes.includes(mimeType)}
                    onChange={() => handleFileTypeToggle(mimeType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {mimeType.split('/')[1].toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Documents</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALLOWED_FILE_TYPES.documents.map((mimeType) => (
                <label key={mimeType} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowedTypes.includes(mimeType)}
                    onChange={() => handleFileTypeToggle(mimeType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {mimeType.includes('pdf') ? 'PDF' :
                     mimeType.includes('text') ? 'TXT' :
                     mimeType.includes('word') ? 'DOC' : 'DOCX'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Audio */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Audio</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALLOWED_FILE_TYPES.audio.map((mimeType) => (
                <label key={mimeType} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowedTypes.includes(mimeType)}
                    onChange={() => handleFileTypeToggle(mimeType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {mimeType.split('/')[1].toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Video */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Video</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALLOWED_FILE_TYPES.video.map((mimeType) => (
                <label key={mimeType} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowedTypes.includes(mimeType)}
                    onChange={() => handleFileTypeToggle(mimeType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {mimeType.split('/')[1].toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimization Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900">Auto-Optimize Images</h4>
              <p className="text-sm text-blue-700">
                Automatically compress and optimize images during upload
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoOptimize}
                onChange={(e) => handleInputChange('autoOptimize', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <h4 className="font-medium text-green-900">Generate Thumbnails</h4>
              <p className="text-sm text-green-700">
                Automatically create thumbnails for images and videos
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.generateThumbnails}
                onChange={(e) => handleInputChange('generateThumbnails', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {settings.autoOptimize && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compression Level
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={settings.compressionLevel}
                onChange={(e) => handleInputChange('compressionLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>High Compression (10%)</span>
                <span className="font-medium">{settings.compressionLevel}%</span>
                <span>Low Compression (100%)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lower values = smaller files but lower quality
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h4 className="font-medium text-yellow-900">File Type Validation</h4>
            </div>
            <p className="text-sm text-yellow-700">
              Files are validated by MIME type and extension. Only allowed file types can be uploaded.
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-green-900">Size Limits</h4>
            </div>
            <p className="text-sm text-green-700">
              File size limits are enforced to prevent storage abuse and ensure good performance.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h4 className="font-medium text-blue-900">Local Storage</h4>
            </div>
            <p className="text-sm text-blue-700">
              Files are stored securely in browser localStorage. For production, integrate with cloud storage.
            </p>
          </div>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Settings Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Max File Size</h4>
            <p className="text-lg font-bold text-blue-600">
              {fileDataManager.formatFileSize(settings.maxFileSize)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Allowed Types</h4>
            <p className="text-lg font-bold text-green-600">
              {settings.allowedTypes.length} types
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Auto-Optimize</h4>
            <p className="text-lg font-bold text-purple-600">
              {settings.autoOptimize ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Thumbnails</h4>
            <p className="text-lg font-bold text-orange-600">
              {settings.generateThumbnails ? 'Enabled' : 'Disabled'}
            </p>
          </div>
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
            <span className="text-gray-700">Saving file settings...</span>
          </div>
        </div>
      )}
    </div>
  )
}
