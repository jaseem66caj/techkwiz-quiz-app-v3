'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExitConfirmationModal } from '../../components/ExitConfirmationModal'
import { useExitPrevention } from '../../hooks/useExitPrevention'

export default function TestExitPreventionPage() {
  const router = useRouter()
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  // Exit prevention hook
  const { disablePrevention } = useExitPrevention({
    isActive,
    onExitAttempt: () => {
      addDebugInfo('🚨 EXIT ATTEMPT DETECTED! Showing modal...')
      setShowExitConfirmation(true)
    },
    customMessage: "Are you sure you want to leave? This is a test page!"
  })

  useEffect(() => {
    addDebugInfo(`🔧 Exit prevention initialized, isActive: ${isActive}`)
  }, [isActive])

  const handleExitConfirm = () => {
    addDebugInfo('✅ User confirmed exit')
    setShowExitConfirmation(false)
    disablePrevention()
    router.push('/start')
  }

  const handleExitCancel = () => {
    addDebugInfo('❌ User cancelled exit')
    setShowExitConfirmation(false)
  }

  const togglePrevention = () => {
    setIsActive(!isActive)
    addDebugInfo(`🔄 Exit prevention toggled to: ${!isActive}`)
  }

  const testManualTrigger = () => {
    addDebugInfo('🧪 Manual trigger test')
    setShowExitConfirmation(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Exit Prevention System Test</h1>
        
        {/* Status Panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Current Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-300 text-sm">Exit Prevention</p>
              <p className={`text-lg font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                {isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}
              </p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-300 text-sm">Modal State</p>
              <p className={`text-lg font-bold ${showExitConfirmation ? 'text-yellow-400' : 'text-blue-400'}`}>
                {showExitConfirmation ? '⚠️ SHOWING' : '✅ HIDDEN'}
              </p>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Test Controls</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={togglePrevention}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              {isActive ? 'Disable Prevention' : 'Enable Prevention'}
            </button>
            <button
              onClick={testManualTrigger}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Test Modal (Manual)
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Test Back Button
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Test Instructions</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong>1. Back Button Test:</strong> Click browser back button or use "Test Back Button"</p>
            <p><strong>2. Keyboard Test:</strong> Try Ctrl+W, Alt+F4, or Cmd+W (Mac)</p>
            <p><strong>3. Tab Close:</strong> Try to close the browser tab</p>
            <p><strong>4. Navigation:</strong> Try to navigate to a different URL</p>
            <p><strong>5. Manual Test:</strong> Use "Test Modal" button to verify modal works</p>
          </div>
        </div>

        {/* Debug Log */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Debug Log</h2>
          <div className="bg-gray-900/50 p-4 rounded-lg h-64 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-400">No debug information yet...</p>
            ) : (
              debugInfo.map((info, index) => (
                <p key={index} className="text-gray-300 text-sm font-mono mb-1">
                  {info}
                </p>
              ))
            )}
          </div>
          <button
            onClick={() => setDebugInfo([])}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            Clear Log
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={showExitConfirmation}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
        currentProgress={{
          questionNumber: 3,
          totalQuestions: 5,
          coinsAtRisk: 150
        }}
      />
    </div>
  )
}