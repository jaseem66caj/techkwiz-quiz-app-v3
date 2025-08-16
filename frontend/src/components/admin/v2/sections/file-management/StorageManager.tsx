'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fileDataManager } from '@/utils/fileDataManager'
import { FileItem, StorageQuota } from '@/types/admin'

export default function StorageManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [storageQuota, setStorageQuota] = useState<StorageQuota | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  // Load data
  const loadData = useCallback(() => {
    setIsLoading(true)
    try {
      const allFiles = fileDataManager.getAllFiles()
      const quota = fileDataManager.getStorageQuota()
      setFiles(allFiles)
      setStorageQuota(quota)
    } catch (error) {
      console.error('Error loading storage data:', error)
      setMessage({ type: 'error', text: 'Failed to load storage data' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Show message with auto-clear
  const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }, [])

  // Prepare chart data
  const pieChartData = useMemo(() => {
    if (!storageQuota) return []
    
    return [
      { name: 'Images', value: storageQuota.breakdown.images, color: '#3B82F6' },
      { name: 'Videos', value: storageQuota.breakdown.videos, color: '#10B981' },
      { name: 'Documents', value: storageQuota.breakdown.documents, color: '#F59E0B' },
      { name: 'Audio', value: storageQuota.breakdown.audio, color: '#EF4444' },
      { name: 'Other', value: storageQuota.breakdown.other, color: '#8B5CF6' }
    ].filter(item => item.value > 0)
  }, [storageQuota])

  // Prepare folder size data
  const folderSizeData = useMemo(() => {
    const folderSizes = new Map<string, number>()
    
    files.forEach(file => {
      if (file.type === 'file') {
        const folderPath = file.path.split('/').slice(0, -1).join('/') || 'Root'
        folderSizes.set(folderPath, (folderSizes.get(folderPath) || 0) + file.size)
      }
    })
    
    return Array.from(folderSizes.entries())
      .map(([path, size]) => ({ name: path, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10) // Top 10 folders
  }, [files])

  // Get largest files
  const largestFiles = useMemo(() => {
    return files
      .filter(file => file.type === 'file')
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
  }, [files])

  // Handle cleanup operations
  const handleCleanupLargeFiles = useCallback(() => {
    try {
      const largeFiles = fileDataManager.findLargeFiles(5 * 1024 * 1024) // 5MB threshold

      if (largeFiles.length === 0) {
        showMessage('info', 'No large files found (>5MB).')
        return
      }

      const totalSize = largeFiles.reduce((sum, file) => sum + file.size, 0)
      const confirmed = window.confirm(
        `Found ${largeFiles.length} large files using ${fileDataManager.formatFileSize(totalSize)}. Review them below and delete any you no longer need.`
      )

      if (confirmed) {
        showMessage('success', `Found ${largeFiles.length} large files. Review the list below.`)
        // The large files will be displayed in the UI automatically
      }
    } catch (error) {
      showMessage('error', 'Failed to analyze large files.')
    }
  }, [showMessage])

  const handleOptimizeImages = useCallback(async () => {
    try {
      const imageFiles = files.filter(file => file.mimeType.startsWith('image/'))
      if (imageFiles.length === 0) {
        showMessage('info', 'No images found to optimize.')
        return
      }

      const confirmed = window.confirm(
        `Found ${imageFiles.length} images. This will compress them to save space. Continue?`
      )

      if (!confirmed) return

      showMessage('info', 'Optimizing images... This may take a moment.')

      let optimizedCount = 0
      let totalSavings = 0

      for (const file of imageFiles) {
        try {
          // Re-upload with optimization enabled
          const blob = await fetch(file.url).then(r => r.blob())
          const newFile = new File([blob], file.name, { type: file.mimeType })

          const originalSize = file.size
          await fileDataManager.uploadFile(newFile, file.parentId, {
            autoOptimize: true,
            generateThumbnail: true
          })

          // Delete the original file
          fileDataManager.deleteFile(file.id)

          optimizedCount++
          totalSavings += originalSize * 0.3 // Estimate 30% savings
        } catch (error) {
          console.error(`Failed to optimize ${file.name}:`, error)
        }
      }

      loadData() // Refresh the data
      showMessage('success', `Optimized ${optimizedCount} images, saved approximately ${fileDataManager.formatFileSize(totalSavings)}.`)
    } catch (error) {
      showMessage('error', 'Failed to optimize images.')
    }
  }, [files, showMessage, loadData])

  const handleFindDuplicates = useCallback(() => {
    try {
      const duplicateGroups = fileDataManager.findDuplicateFiles()

      if (duplicateGroups.length === 0) {
        showMessage('info', 'No duplicate files found.')
        return
      }

      const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.duplicates.length, 0)
      const totalSavings = duplicateGroups.reduce((sum, group) =>
        sum + group.duplicates.reduce((groupSum, file) => groupSum + file.size, 0), 0
      )

      const confirmed = window.confirm(
        `Found ${totalDuplicates} duplicate files that could save ${fileDataManager.formatFileSize(totalSavings)}. Delete duplicates?`
      )

      if (confirmed) {
        let deletedCount = 0
        duplicateGroups.forEach(group => {
          group.duplicates.forEach(duplicate => {
            try {
              fileDataManager.deleteFile(duplicate.id)
              deletedCount++
            } catch (error) {
              console.error(`Failed to delete duplicate ${duplicate.name}:`, error)
            }
          })
        })

        loadData() // Refresh the data
        showMessage('success', `Deleted ${deletedCount} duplicate files, saved ${fileDataManager.formatFileSize(totalSavings)}.`)
      }
    } catch (error) {
      showMessage('error', 'Failed to find duplicates.')
    }
  }, [showMessage, loadData])

  const handleDeleteFile = useCallback((fileId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this file?')
    if (!confirmed) return
    
    try {
      fileDataManager.deleteFile(fileId)
      loadData()
      showMessage('success', 'File deleted successfully')
    } catch (error) {
      showMessage('error', 'Failed to delete file')
    }
  }, [loadData, showMessage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading storage data...</span>
        </div>
      </div>
    )
  }

  if (!storageQuota) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load storage data</div>
        <button
          onClick={loadData}
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Storage Manager</h2>
        <p className="text-gray-600">
          Monitor storage usage, manage quotas, and optimize your file storage.
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

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Storage</h3>
              <p className="text-sm text-gray-600">Used / Available</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {fileDataManager.formatFileSize(storageQuota.used)}
              </span>
              <span className="text-sm text-gray-500">
                / {fileDataManager.formatFileSize(storageQuota.total)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  storageQuota.percentage > 90 ? 'bg-red-500' :
                  storageQuota.percentage > 80 ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${Math.min(storageQuota.percentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{storageQuota.percentage}% used</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Files</h3>
              <p className="text-sm text-gray-600">All file types</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {files.filter(f => f.type === 'file').length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Folders</h3>
              <p className="text-sm text-gray-600">Directory count</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {files.filter(f => f.type === 'folder').length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Avg File Size</h3>
              <p className="text-sm text-gray-600">Per file average</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {files.filter(f => f.type === 'file').length > 0 
              ? fileDataManager.formatFileSize(storageQuota.used / files.filter(f => f.type === 'file').length)
              : '0 Bytes'
            }
          </div>
        </div>
      </div>

      {/* Storage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Storage by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage by File Type</h3>
          {pieChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [fileDataManager.formatFileSize(value), 'Size']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No files to display
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium text-gray-900 ml-auto">
                  {fileDataManager.formatFileSize(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Folder Sizes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Largest Folders</h3>
          {folderSizeData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={folderSizeData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => fileDataManager.formatFileSize(value)} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value: number) => [fileDataManager.formatFileSize(value), 'Size']} />
                  <Bar dataKey="size" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No folders to display
            </div>
          )}
        </div>
      </div>

      {/* Cleanup Tools */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Optimization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleCleanupLargeFiles}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🗂️</span>
              <span className="font-medium text-gray-900">Review Large Files</span>
            </div>
            <p className="text-sm text-gray-600">Find and remove large files taking up space</p>
          </button>

          <button
            onClick={handleOptimizeImages}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🖼️</span>
              <span className="font-medium text-gray-900">Optimize Images</span>
            </div>
            <p className="text-sm text-gray-600">Compress images to save storage space</p>
          </button>

          <button
            onClick={handleFindDuplicates}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔍</span>
              <span className="font-medium text-gray-900">Find Duplicates</span>
            </div>
            <p className="text-sm text-gray-600">Identify and remove duplicate files</p>
          </button>
        </div>

        {/* Largest Files */}
        {largestFiles.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Largest Files</h4>
            <div className="space-y-2">
              {largestFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{fileDataManager.getFileIcon(file.mimeType)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {fileDataManager.formatFileSize(file.size)}
                    </span>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
