'use client'

import { useState, useCallback } from 'react'
import { AnalyticsData, TimeRange, ExportOptions, DEFAULT_TIME_RANGES } from '@/types/admin'
import { analyticsDataManager } from '@/utils/analyticsDataManager'

interface AnalyticsExportProps {
  analyticsData: AnalyticsData
  timeRange: TimeRange
}

export function AnalyticsExport({ analyticsData, timeRange }: AnalyticsExportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: timeRange,
    includeCharts: false,
    sections: ['quiz', 'rewards', 'activity']
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string
    timestamp: Date
    format: string
    sections: string[]
    size: string
  }>>([])

  // Handle export option changes
  const handleFormatChange = useCallback((format: 'csv' | 'json' | 'pdf') => {
    setExportOptions(prev => ({ ...prev, format }))
  }, [])

  const handleDateRangeChange = useCallback((dateRange: TimeRange) => {
    setExportOptions(prev => ({ ...prev, dateRange }))
  }, [])

  const handleSectionToggle = useCallback((section: string) => {
    setExportOptions(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }))
  }, [])

  const handleChartsToggle = useCallback(() => {
    setExportOptions(prev => ({ ...prev, includeCharts: !prev.includeCharts }))
  }, [])

  // Export data
  const handleExport = useCallback(async () => {
    if (exportOptions.sections.length === 0) {
      alert('Please select at least one section to export.')
      return
    }

    setIsExporting(true)
    try {
      const exportData = analyticsDataManager.exportData(exportOptions)
      
      // Create and download file
      const blob = new Blob([exportData], { 
        type: exportOptions.format === 'json' ? 'application/json' : 'text/csv' 
      })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      // Add to export history
      const newExport = {
        id: `export_${Date.now()}`,
        timestamp: new Date(),
        format: exportOptions.format.toUpperCase(),
        sections: [...exportOptions.sections],
        size: `${Math.round(blob.size / 1024)}KB`
      }
      setExportHistory(prev => [newExport, ...prev.slice(0, 4)]) // Keep last 5 exports
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [exportOptions])

  // Generate preview
  const generatePreview = useCallback(() => {
    const sections = exportOptions.sections
    let preview = ''
    
    if (sections.includes('quiz')) {
      preview += `Quiz Analytics Summary:\n`
      preview += `- Total Questions: ${analyticsData.quizMetrics.totalQuestions}\n`
      preview += `- Success Rate: ${Math.round(analyticsData.quizMetrics.successRate)}%\n`
      preview += `- Questions Answered: ${analyticsData.quizMetrics.questionsAnswered}\n\n`
    }
    
    if (sections.includes('rewards')) {
      preview += `Reward Analytics Summary:\n`
      preview += `- Total Coins Earned: ${analyticsData.rewardMetrics.totalCoinsEarned.toLocaleString()}\n`
      preview += `- Achievements Unlocked: ${analyticsData.rewardMetrics.achievementsUnlocked}\n`
      preview += `- Active Users: ${analyticsData.rewardMetrics.activeUsers}\n\n`
    }
    
    if (sections.includes('activity')) {
      preview += `User Activity Summary:\n`
      preview += `- Total Sessions: ${analyticsData.userActivity.totalSessions.toLocaleString()}\n`
      preview += `- Average Session Duration: ${Math.round(analyticsData.userActivity.averageSessionDuration)} minutes\n`
      preview += `- Return Rate: ${Math.round(analyticsData.userActivity.returnRate)}%\n\n`
    }
    
    return preview || 'No sections selected for export.'
  }, [analyticsData, exportOptions.sections])

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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Export Analytics Data</h3>
        <p className="text-gray-600">
          Export analytics data in various formats for external analysis and reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Configuration */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Export Configuration</h4>
            
            {/* Format Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {(['csv', 'json', 'pdf'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => handleFormatChange(format)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      exportOptions.format === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{format.toUpperCase()}</div>
                      <div className="text-xs text-gray-500">
                        {format === 'csv' && 'Spreadsheet'}
                        {format === 'json' && 'Data Format'}
                        {format === 'pdf' && 'Report (Soon)'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <select
                value={DEFAULT_TIME_RANGES.findIndex(range => range.label === exportOptions.dateRange.label)}
                onChange={(e) => handleDateRangeChange(DEFAULT_TIME_RANGES[parseInt(e.target.value)])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DEFAULT_TIME_RANGES.map((range, index) => (
                  <option key={index} value={index}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Section Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Sections to Include</label>
              <div className="space-y-2">
                {[
                  { id: 'quiz', name: 'Quiz Analytics', description: 'Performance metrics and category analysis' },
                  { id: 'rewards', name: 'Reward Analytics', description: 'Coin distribution and achievements' },
                  { id: 'activity', name: 'User Activity', description: 'Session tracking and behavior patterns' }
                ].map((section) => (
                  <div key={section.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={section.id}
                      checked={exportOptions.sections.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label htmlFor={section.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                        {section.name}
                      </label>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Additional Options</label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={exportOptions.includeCharts}
                  onChange={handleChartsToggle}
                  disabled={exportOptions.format !== 'pdf'}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="includeCharts" className="text-sm text-gray-900 cursor-pointer">
                  Include Charts (PDF only)
                </label>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting || exportOptions.sections.length === 0}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview and History */}
        <div className="space-y-6">
          {/* Export Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Export Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {generatePreview()}
              </pre>
            </div>
          </div>

          {/* Export History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h4>
            {exportHistory.length > 0 ? (
              <div className="space-y-3">
                {exportHistory.map((exportItem) => (
                  <div key={exportItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          exportItem.format === 'CSV' ? 'bg-green-100 text-green-800' :
                          exportItem.format === 'JSON' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {exportItem.format}
                        </span>
                        <span className="text-sm text-gray-600">{exportItem.size}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {exportItem.sections.join(', ')} • {formatTimestamp(exportItem.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs text-green-600 font-medium">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">No exports yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your export history will appear here after you create your first export.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Export Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-blue-800 mb-2">CSV Format</h5>
            <ul className="space-y-1 text-blue-700">
              <li>• Compatible with Excel and Google Sheets</li>
              <li>• Includes all numerical data and metrics</li>
              <li>• Separate sections for each analytics category</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2">JSON Format</h5>
            <ul className="space-y-1 text-blue-700">
              <li>• Machine-readable structured data</li>
              <li>• Includes all metadata and timestamps</li>
              <li>• Perfect for API integration and analysis</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> PDF export with charts is coming soon. Currently, you can export raw data in CSV or JSON formats.
          </p>
        </div>
      </div>
    </div>
  )
}
