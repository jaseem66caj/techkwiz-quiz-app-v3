import { useState, useEffect, useCallback } from 'react'
import { bidirectionalSync, type SyncPreview, type ChangeItem, type ConflictResolution } from '@/utils/bidirectionalSync'
import QuestionDiffView from './QuestionDiffView'

interface SyncManagementDashboardProps {
  onNavigateToSection?: (sectionId: string) => void
}

export default function SyncManagementDashboard({ onNavigateToSection }: SyncManagementDashboardProps) {
  const [syncPreview, setSyncPreview] = useState<SyncPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOperation, setSelectedOperation] = useState<'pull' | 'push' | 'smart' | 'reset'>('smart')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  // Load sync preview
  const loadSyncPreview = useCallback(async () => {
    try {
      setIsLoading(true)
      const preview = await bidirectionalSync.generateSyncPreview(selectedOperation)
      setSyncPreview(preview)
    } catch (error) {
      console.error('Error loading sync preview:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedOperation])

  // Setup real-time updates
  useEffect(() => {
    loadSyncPreview()

    const handleSyncUpdate = (preview: SyncPreview) => {
      setSyncPreview(preview)
    }

    bidirectionalSync.addSyncListener(handleSyncUpdate)

    return () => {
      bidirectionalSync.removeSyncListener(handleSyncUpdate)
    }
  }, [loadSyncPreview])

  // Handle operation change
  const handleOperationChange = (operation: 'pull' | 'push' | 'smart' | 'reset') => {
    setSelectedOperation(operation)
  }

  // Execute sync operation
  const executeSyncOperation = async () => {
    if (!syncPreview) return

    try {
      setIsExecuting(true)
      const result = await bidirectionalSync.executeSyncOperation(syncPreview)
      
      if (result.success) {
        console.log('✅ Sync operation completed:', result.message)
        await loadSyncPreview() // Refresh preview
      } else {
        console.error('❌ Sync operation failed:', result.message)
      }
    } catch (error) {
      console.error('❌ Sync execution error:', error)
    } finally {
      setIsExecuting(false)
      setShowPreviewModal(false)
    }
  }

  // Get freshness indicator color
  const getFreshnessColor = (freshness: 'fresh' | 'stale' | 'outdated') => {
    switch (freshness) {
      case 'fresh': return 'text-green-600 bg-green-100'
      case 'stale': return 'text-yellow-600 bg-yellow-100'
      case 'outdated': return 'text-red-600 bg-red-100'
    }
  }

  // Get risk level color
  const getRiskColor = (risk: 'safe' | 'caution' | 'destructive') => {
    switch (risk) {
      case 'safe': return 'text-green-600 bg-green-100'
      case 'caution': return 'text-yellow-600 bg-yellow-100'
      case 'destructive': return 'text-red-600 bg-red-100'
    }
  }

  // Get change action color
  const getChangeActionColor = (action: 'add' | 'modify' | 'delete') => {
    switch (action) {
      case 'add': return 'text-green-600 bg-green-50 border-green-200'
      case 'modify': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'delete': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading sync preview...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sync Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Bidirectional data synchronization with preview and rollback</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={loadSyncPreview}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Operation Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sync Operation</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'pull', label: 'Pull from Frontend', desc: 'Import frontend changes to admin', icon: '⬇️' },
            { id: 'push', label: 'Push to Frontend', desc: 'Export admin changes to frontend', icon: '⬆️' },
            { id: 'smart', label: 'Smart Sync', desc: 'Auto-resolve non-conflicting changes', icon: '🔄' },
            { id: 'reset', label: 'Reset Frontend', desc: 'Overwrite frontend with admin data', icon: '🔄' }
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => handleOperationChange(op.id as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOperation === op.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{op.icon}</div>
              <div className="font-medium text-gray-900">{op.label}</div>
              <div className="text-sm text-gray-600 mt-1">{op.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Data Freshness Indicators */}
      {syncPreview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Admin Data</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getFreshnessColor(syncPreview.dataFreshness.admin)}`}>
                {syncPreview.dataFreshness.admin}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Quiz Questions</span>
                <span className="font-medium">7 questions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reward Rules</span>
                <span className="font-medium">0 achievements</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Settings</span>
                <span className="font-medium">6 configured</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Modified</span>
                <span className="font-medium text-sm">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Frontend Data</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getFreshnessColor(syncPreview.dataFreshness.frontend)}`}>
                {syncPreview.dataFreshness.frontend}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Quiz Questions</span>
                <span className="font-medium">
                  {syncPreview.frontendData?.quiz?.questions?.length || 0} questions
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categories</span>
                <span className="font-medium">
                  {syncPreview.frontendData?.quiz?.categories?.length || 0} categories
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Achievements</span>
                <span className="font-medium">
                  {syncPreview.frontendData?.rewards?.achievements?.length || 0} achievements
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Sync</span>
                <span className="font-medium text-sm">
                  {syncPreview.frontendData?.quiz?.lastModified ?
                    new Date(syncPreview.frontendData.quiz.lastModified).toLocaleString() :
                    'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Summary */}
      {syncPreview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Sync Preview</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(syncPreview.operation.riskLevel)}`}>
              {syncPreview.operation.riskLevel} operation
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{syncPreview.summary.totalChanges}</div>
              <div className="text-sm text-gray-600">Total Changes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncPreview.summary.safeChanges}</div>
              <div className="text-sm text-gray-600">Safe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{syncPreview.summary.cautionChanges}</div>
              <div className="text-sm text-gray-600">Caution</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{syncPreview.summary.destructiveChanges}</div>
              <div className="text-sm text-gray-600">Destructive</div>
            </div>
          </div>

          {/* Changes List */}
          {syncPreview.operation.changes.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Detected Changes:</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {syncPreview.operation.changes.map((change, index) => (
                  <div key={index}>
                    {change.category === 'quiz' && change.field === 'questions' && change.details?.questions ? (
                      // Use detailed question diff view for quiz questions
                      <QuestionDiffView change={change} />
                    ) : (
                      // Use simple view for other changes
                      <div className={`p-3 rounded-lg border ${getChangeActionColor(change.action)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{change.action}</span>
                            <span className="text-gray-600">{change.category}.{change.field}</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(change.riskLevel)}`}>
                            {change.riskLevel}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{change.impact}</div>

                        {/* Show additional details for non-question changes */}
                        {change.details && (
                          <div className="mt-2 text-xs text-gray-500">
                            {change.details.added && (
                              <div>Added: {JSON.stringify(change.details.added).slice(0, 100)}...</div>
                            )}
                            {change.details.removed && (
                              <div>Removed: {JSON.stringify(change.details.removed).slice(0, 100)}...</div>
                            )}
                            {change.details.settingsChanged && (
                              <div>Settings changed: {Object.keys(change.details.settingsChanged).join(', ')}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {syncPreview.conflicts.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Conflicts Detected</h4>
              <div className="space-y-2">
                {syncPreview.conflicts.map((conflict, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    <span className="font-medium">{conflict.field}</span>: 
                    Admin vs Frontend conflict (resolution: {conflict.resolution})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowPreviewModal(true)}
              disabled={isExecuting || syncPreview.summary.totalChanges === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExecuting ? 'Executing...' : `Execute ${selectedOperation} Operation`}
            </button>
            <button
              onClick={loadSyncPreview}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refresh Preview
            </button>
          </div>
        </div>
      )}

      {/* No Changes */}
      {syncPreview && syncPreview.summary.totalChanges === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-2xl mb-2">✅</div>
          <h3 className="text-lg font-medium text-green-800">All Data in Sync</h3>
          <p className="text-green-600 mt-1">No changes detected between admin and frontend data</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && syncPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Sync Operation</h3>
              <p className="text-gray-600 mt-1">
                Review the changes before executing the {selectedOperation} operation
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Operation Type</span>
                  <span className="capitalize">{selectedOperation}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Risk Level</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(syncPreview.operation.riskLevel)}`}>
                    {syncPreview.operation.riskLevel}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Changes</span>
                  <span>{syncPreview.summary.totalChanges}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Estimated Duration</span>
                  <span>{syncPreview.summary.estimatedDuration}ms</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeSyncOperation}
                disabled={isExecuting}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  syncPreview.operation.riskLevel === 'destructive'
                    ? 'bg-red-600 hover:bg-red-700'
                    : syncPreview.operation.riskLevel === 'caution'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {isExecuting ? 'Executing...' : 'Confirm & Execute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
