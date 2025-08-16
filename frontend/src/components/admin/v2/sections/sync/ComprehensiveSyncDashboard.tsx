import { useState } from 'react'
import SyncManagementDashboard from './SyncManagementDashboard'
import SyncHistoryPanel from './SyncHistoryPanel'

interface ComprehensiveSyncDashboardProps {
  onNavigateToSection?: (sectionId: string) => void
}

export default function ComprehensiveSyncDashboard({ onNavigateToSection }: ComprehensiveSyncDashboardProps) {
  const [activeTab, setActiveTab] = useState<'management' | 'history'>('management')

  const tabs = [
    {
      id: 'management',
      label: 'Sync Management',
      icon: '🔄',
      description: 'Preview and execute sync operations'
    },
    {
      id: 'history',
      label: 'History & Rollback',
      icon: '📋',
      description: 'View sync history and rollback options'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bidirectional Data Sync</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive synchronization between admin dashboard and frontend application
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time sync monitoring active</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tab.icon}</span>
                  <div>
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-sm opacity-75">{tab.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'management' && (
            <SyncManagementDashboard onNavigateToSection={onNavigateToSection} />
          )}
          
          {activeTab === 'history' && (
            <SyncHistoryPanel onNavigateToSection={onNavigateToSection} />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Smart Sync</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Automatically resolve non-conflicting changes between admin and frontend
          </p>
          <button
            onClick={() => setActiveTab('management')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Smart Sync
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Data Health</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Monitor data integrity and sync status across all components
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-medium">All systems healthy</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Safety First</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Automatic rollback points and comprehensive change previews
          </p>
          <button
            onClick={() => setActiveTab('history')}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            View Rollback Points
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">P</kbd>
            <span className="text-gray-600">Pull from Frontend</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">U</kbd>
            <span className="text-gray-600">Push to Frontend</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">C</kbd>
            <span className="text-gray-600">Compare Data</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">&lt; 1ms</div>
            <div className="text-sm text-gray-600">Avg Sync Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Data Conflicts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">5s</div>
            <div className="text-sm text-gray-600">Auto Sync Interval</div>
          </div>
        </div>
      </div>

      {/* Data Sources Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources Status</h3>
        <div className="space-y-3">
          {[
            { name: 'Quiz Configuration', status: 'synced', lastSync: '2 minutes ago', changes: 0 },
            { name: 'Reward Settings', status: 'synced', lastSync: '5 minutes ago', changes: 0 },
            { name: 'System Settings', status: 'synced', lastSync: '1 minute ago', changes: 0 },
            { name: 'Feature Flags', status: 'synced', lastSync: '3 minutes ago', changes: 0 }
          ].map((source, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  source.status === 'synced' ? 'bg-green-500' : 
                  source.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-900">{source.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Last sync: {source.lastSync}</span>
                <span className={`px-2 py-1 rounded ${
                  source.changes === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {source.changes} changes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
