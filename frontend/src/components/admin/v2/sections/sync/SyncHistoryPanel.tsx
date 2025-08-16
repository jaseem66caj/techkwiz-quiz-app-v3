import { useState, useEffect } from 'react'
import { bidirectionalSync, type SyncHistory, type SyncOperation } from '@/utils/bidirectionalSync'

interface SyncHistoryPanelProps {
  onNavigateToSection?: (sectionId: string) => void
}

export default function SyncHistoryPanel({ onNavigateToSection }: SyncHistoryPanelProps) {
  const [syncHistory, setSyncHistory] = useState<SyncHistory>({ operations: [], rollbackPoints: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [showRollbackModal, setShowRollbackModal] = useState(false)
  const [selectedRollbackId, setSelectedRollbackId] = useState<string>('')
  const [isRollingBack, setIsRollingBack] = useState(false)

  // Load sync history
  const loadSyncHistory = () => {
    try {
      setIsLoading(true)
      const history = bidirectionalSync.getSyncHistory()
      setSyncHistory(history)
    } catch (error) {
      console.error('Error loading sync history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSyncHistory()
    
    // Refresh history every 10 seconds
    const interval = setInterval(loadSyncHistory, 10000)
    
    return () => clearInterval(interval)
  }, [])

  // Handle undo last sync
  const handleUndoLastSync = async () => {
    try {
      setIsRollingBack(true)
      const result = await bidirectionalSync.undoLastSync()
      
      if (result.success) {
        console.log('✅ Last sync undone:', result.message)
        loadSyncHistory()
      } else {
        console.error('❌ Undo failed:', result.message)
      }
    } catch (error) {
      console.error('❌ Undo error:', error)
    } finally {
      setIsRollingBack(false)
    }
  }

  // Handle rollback to specific point
  const handleRollbackToPoint = async () => {
    if (!selectedRollbackId) return

    try {
      setIsRollingBack(true)
      const result = await bidirectionalSync.rollbackToPoint(selectedRollbackId)
      
      if (result.success) {
        console.log('✅ Rollback completed:', result.message)
        loadSyncHistory()
        setShowRollbackModal(false)
        setSelectedRollbackId('')
      } else {
        console.error('❌ Rollback failed:', result.message)
      }
    } catch (error) {
      console.error('❌ Rollback error:', error)
    } finally {
      setIsRollingBack(false)
    }
  }

  // Get operation status color
  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'rolled-back': return 'text-gray-600 bg-gray-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Get operation type icon
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'pull': return '⬇️'
      case 'push': return '⬆️'
      case 'smart': return '🔄'
      case 'reset': return '🔄'
      default: return '📄'
    }
  }

  // Get risk level color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'safe': return 'text-green-600 bg-green-100'
      case 'caution': return 'text-yellow-600 bg-yellow-100'
      case 'destructive': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading sync history...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sync History & Rollback</h1>
          <p className="text-gray-600 mt-1">View sync operations and rollback to previous states</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleUndoLastSync}
            disabled={isRollingBack || syncHistory.operations.length === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            {isRollingBack ? 'Undoing...' : 'Undo Last Sync'}
          </button>
          <button
            onClick={() => setShowRollbackModal(true)}
            disabled={syncHistory.rollbackPoints.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Rollback to Point
          </button>
          <button
            onClick={loadSyncHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Recent Operations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sync Operations</h2>
        
        {syncHistory.operations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No sync operations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {syncHistory.operations
              .slice(-10) // Show last 10 operations
              .reverse() // Most recent first
              .map((operation, index) => (
                <div
                  key={operation.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getOperationIcon(operation.type)}</span>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {operation.type} Operation
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(operation.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(operation.riskLevel)}`}>
                        {operation.riskLevel}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getOperationStatusColor(operation.status)}`}>
                        {operation.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Changes:</span>
                      <span className="ml-1 font-medium">{operation.changes.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-1 font-medium">{operation.performanceMetrics.duration.toFixed(2)}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Size:</span>
                      <span className="ml-1 font-medium">{(operation.performanceMetrics.dataSize / 1024).toFixed(1)}KB</span>
                    </div>
                  </div>
                  
                  {operation.changes.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Changes:</span>
                      <span className="ml-1">
                        {operation.changes.map(c => `${c.category}.${c.field}`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Rollback Points */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Rollback Points</h2>
        
        {syncHistory.rollbackPoints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💾</div>
            <p>No rollback points available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {syncHistory.rollbackPoints
              .slice(-10) // Show last 10 rollback points
              .reverse() // Most recent first
              .map((rollbackPoint, index) => (
                <div
                  key={rollbackPoint.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {rollbackPoint.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(rollbackPoint.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedRollbackId(rollbackPoint.id)
                        setShowRollbackModal(true)
                      }}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Rollback
                    </button>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span>Quiz:</span>
                      <span className="ml-1 font-medium">
                        {rollbackPoint.configSnapshot.quiz.questions.length} questions
                      </span>
                    </div>
                    <div>
                      <span>Rewards:</span>
                      <span className="ml-1 font-medium">
                        {rollbackPoint.configSnapshot.rewards.achievements.length} achievements
                      </span>
                    </div>
                    <div>
                      <span>Settings:</span>
                      <span className="ml-1 font-medium">
                        {Object.keys(rollbackPoint.configSnapshot.systemSettings.configValues).length} configs
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Rollback</h3>
              <p className="text-gray-600 mt-1">
                This action will restore your configuration to a previous state
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="text-red-600 text-xl mr-3">⚠️</div>
                  <div>
                    <div className="font-medium text-red-800">Warning: Destructive Action</div>
                    <div className="text-red-600 text-sm mt-1">
                      This will overwrite your current configuration. Make sure you want to proceed.
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedRollbackId && (
                <div className="space-y-3">
                  {syncHistory.rollbackPoints
                    .filter(rp => rp.id === selectedRollbackId)
                    .map(rollbackPoint => (
                      <div key={rollbackPoint.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{rollbackPoint.description}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(rollbackPoint.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRollbackModal(false)
                  setSelectedRollbackId('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRollbackToPoint}
                disabled={isRollingBack}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isRollingBack ? 'Rolling Back...' : 'Confirm Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
