'use client'

import { useState, useCallback, useEffect } from 'react'
import FileUploader from './FileUploader'
import FileExplorer from './FileExplorer'
import MediaGallery from './MediaGallery'
import StorageManager from './StorageManager'
import FileSettings from './FileSettings'
import AdsTxtEditor from './AdsTxtEditor'
import RobotsTxtEditor from './RobotsTxtEditor'
import LlmsTxtEditor from './LlmsTxtEditor'

type FileManagementTab = 'uploader' | 'explorer' | 'gallery' | 'storage' | 'settings' | 'ads-txt' | 'robots-txt' | 'llms-txt'

interface FileManagementTabConfig {
  id: FileManagementTab
  name: string
  icon: string
  description: string
  component: React.ComponentType
}

const FILE_MANAGEMENT_TABS: FileManagementTabConfig[] = [
  {
    id: 'uploader',
    name: 'File Upload',
    icon: '📤',
    description: 'Upload and manage new files',
    component: FileUploader
  },
  {
    id: 'explorer',
    name: 'File Explorer',
    icon: '📁',
    description: 'Browse and organize files',
    component: FileExplorer
  },
  {
    id: 'gallery',
    name: 'Media Gallery',
    icon: '🖼️',
    description: 'View images and media',
    component: MediaGallery
  },
  {
    id: 'storage',
    name: 'Storage Manager',
    icon: '💾',
    description: 'Manage storage and quotas',
    component: StorageManager
  },
  {
    id: 'settings',
    name: 'File Settings',
    icon: '⚙️',
    description: 'Configure file preferences',
    component: FileSettings
  },
  {
    id: 'ads-txt',
    name: 'ads.txt Editor',
    icon: '💰',
    description: 'Edit advertising configuration',
    component: AdsTxtEditor
  },
  {
    id: 'robots-txt',
    name: 'robots.txt Editor',
    icon: '🤖',
    description: 'Edit search engine crawler rules',
    component: RobotsTxtEditor
  },
  {
    id: 'llms-txt',
    name: 'llms.txt Editor',
    icon: '🧠',
    description: 'Edit AI crawler instructions',
    component: LlmsTxtEditor
  }
]

export default function FileManagementDashboard() {
  const [activeTab, setActiveTab] = useState<FileManagementTab>('uploader')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Handle tab switching
  const handleTabChange = useCallback((tabId: FileManagementTab) => {
    setIsLoading(true)
    setActiveTab(tabId)
    
    // Simulate loading for smooth transition
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 150)
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
    setLastUpdated(new Date())
  }, [])

  // Get current tab configuration
  const currentTab = FILE_MANAGEMENT_TABS.find(tab => tab.id === activeTab) || FILE_MANAGEMENT_TABS[0]
  const CurrentComponent = currentTab.component

  // Format last updated time
  const formatLastUpdated = useCallback(() => {
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }, [lastUpdated])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">File Management</h1>
          <p className="text-lg text-gray-600">
            Upload, organize, and manage your media files and documents
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {formatLastUpdated()}
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="File Management Tabs">
          {FILE_MANAGEMENT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="text-lg">{tab.icon}</span>
              <div className="text-left">
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs text-gray-400 hidden lg:block">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading {currentTab.name}...</span>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <CurrentComponent key={refreshTrigger} />
          </div>
        )}
      </div>

      {/* File Management Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">File Management Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Current Tab</h4>
            <p className="text-blue-700">{currentTab.name}</p>
            <p className="text-blue-600 text-xs mt-1">{currentTab.description}</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Storage</h4>
            <p className="text-blue-700">Local Browser Storage</p>
            <p className="text-blue-600 text-xs mt-1">Files stored securely in browser</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">File Limits</h4>
            <p className="text-blue-700">10MB per file, 100MB total</p>
            <p className="text-blue-600 text-xs mt-1">Supports images, documents, audio, video</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Files are stored locally in your browser. For production use, 
            integrate with cloud storage services like AWS S3, Google Cloud Storage, or Azure Blob Storage.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => handleTabChange('uploader')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📤</span>
            <span className="font-medium text-gray-900">Upload Files</span>
          </div>
          <p className="text-sm text-gray-600">Drag and drop or browse files</p>
        </button>

        <button
          onClick={() => handleTabChange('explorer')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📁</span>
            <span className="font-medium text-gray-900">Browse Files</span>
          </div>
          <p className="text-sm text-gray-600">Organize and manage files</p>
        </button>

        <button
          onClick={() => handleTabChange('gallery')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🖼️</span>
            <span className="font-medium text-gray-900">Media Gallery</span>
          </div>
          <p className="text-sm text-gray-600">View images and videos</p>
        </button>

        <button
          onClick={() => handleTabChange('storage')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💾</span>
            <span className="font-medium text-gray-900">Storage</span>
          </div>
          <p className="text-sm text-gray-600">Monitor usage and quotas</p>
        </button>

        <button
          onClick={() => handleTabChange('settings')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚙️</span>
            <span className="font-medium text-gray-900">Settings</span>
          </div>
          <p className="text-sm text-gray-600">Configure file preferences</p>
        </button>
      </div>
    </div>
  )
}
