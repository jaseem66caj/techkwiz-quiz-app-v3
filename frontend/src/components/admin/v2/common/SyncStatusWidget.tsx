'use client'

import { useState, useEffect, useCallback } from 'react'
import { realTimeSyncService } from '@/utils/realTimeSync'

interface SyncStatus {
  lastSyncTime: number
  queueLength: number
  isProcessing: boolean
  gameLastSync: number
}

export default function SyncStatusWidget() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isManualSyncing, setIsManualSyncing] = useState(false)
  const [lastSyncMessage, setLastSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load sync status
  const loadSyncStatus = useCallback(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      const status = realTimeSyncService.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
  }, [])

  // Auto-refresh sync status
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    loadSyncStatus()
    const interval = setInterval(loadSyncStatus, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [loadSyncStatus])

  // Manual sync trigger
  const handleManualSync = useCallback(async () => {
    setIsManualSyncing(true)
    setLastSyncMessage(null)

    try {
      const result = await realTimeSyncService.triggerSync()
      setLastSyncMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      })
      loadSyncStatus()
    } catch (error) {
      setLastSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Sync failed'
      })
    } finally {
      setIsManualSyncing(false)
    }
  }, [loadSyncStatus])

  // Force sync all data
  const handleForceSyncAll = useCallback(async () => {
    const confirmed = window.confirm('This will force sync all data to the quiz game. Continue?')
    if (!confirmed) return

    setIsManualSyncing(true)
    setLastSyncMessage(null)

    try {
      await realTimeSyncService.forceSyncAll()
      setLastSyncMessage({
        type: 'success',
        text: 'All data synchronized successfully'
      })
      loadSyncStatus()
    } catch (error) {
      setLastSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Force sync failed'
      })
    } finally {
      setIsManualSyncing(false)
    }
  }, [loadSyncStatus])

  // Format time ago
  const formatTimeAgo = useCallback((timestamp: number) => {
    if (!timestamp) return 'Never'
    
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }, [])

  // Check if game is in sync
  const isGameInSync = useCallback(() => {
    if (!syncStatus) return false
    return realTimeSyncService.isGameInSync()
  }, [syncStatus])

  if (!syncStatus) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading sync status...</span>
        </div>
      </div>
    )
  }

  const gameInSync = isGameInSync()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Real-time Sync Status</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          gameInSync 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            gameInSync ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          {gameInSync ? 'In Sync' : 'Out of Sync'}
        </div>
      </div>

      {/* Sync Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatTimeAgo(syncStatus.lastSyncTime)}
          </div>
          <div className="text-sm text-gray-600">Last Admin Sync</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatTimeAgo(syncStatus.gameLastSync)}
          </div>
          <div className="text-sm text-gray-600">Game Last Sync</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {syncStatus.queueLength}
          </div>
          <div className="text-sm text-gray-600">Queue Length</div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold ${
            syncStatus.isProcessing ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {syncStatus.isProcessing ? 'Active' : 'Idle'}
          </div>
          <div className="text-sm text-gray-600">Sync Status</div>
        </div>
      </div>

      {/* Sync Message */}
      {lastSyncMessage && (
        <div className={`p-3 rounded-lg mb-4 ${
          lastSyncMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {lastSyncMessage.type === 'success' ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={`text-sm font-medium ${
              lastSyncMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {lastSyncMessage.text}
            </span>
          </div>
        </div>
      )}

      {/* Sync Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleManualSync}
          disabled={isManualSyncing || syncStatus.isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isManualSyncing ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync Now
            </>
          )}
        </button>

        <button
          onClick={handleForceSyncAll}
          disabled={isManualSyncing || syncStatus.isProcessing}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Force Sync All
        </button>
      </div>

      {/* Sync Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Sync automatically runs every second when changes are detected</p>
          <p>• "Sync Now" pushes current admin data to the quiz game</p>
          <p>• "Force Sync All" overwrites all game data with admin data</p>
          <p>• Game data is stored in localStorage for offline access</p>
        </div>
      </div>
    </div>
  )
}
