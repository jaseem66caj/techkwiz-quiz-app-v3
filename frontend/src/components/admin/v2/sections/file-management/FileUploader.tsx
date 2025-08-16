'use client'

import { useState, useCallback, useRef } from 'react'
import { fileDataManager } from '@/utils/fileDataManager'
import { UploadProgress, FileItem } from '@/types/admin'

export default function FileUploader() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show message with auto-clear
  const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    processFiles(fileArray)
  }, [])

  // Process selected files
  const processFiles = useCallback(async (files: File[]) => {
    // Create upload progress entries
    const progressEntries: UploadProgress[] = files.map(file => ({
      fileId: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }))

    setUploadQueue(progressEntries)

    // Process files one by one
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const progressEntry = progressEntries[i]

      try {
        // Update progress to processing
        setUploadQueue(prev => prev.map(p => 
          p.fileId === progressEntry.fileId 
            ? { ...p, status: 'processing', progress: 50 }
            : p
        ))

        // Upload file
        const uploadedFile = await fileDataManager.uploadFile(file)
        
        // Update progress to complete
        setUploadQueue(prev => prev.map(p => 
          p.fileId === progressEntry.fileId 
            ? { ...p, status: 'complete', progress: 100 }
            : p
        ))

        // Add to uploaded files
        setUploadedFiles(prev => [...prev, uploadedFile])

      } catch (error) {
        console.error('Upload failed:', error)
        
        // Update progress to error
        setUploadQueue(prev => prev.map(p => 
          p.fileId === progressEntry.fileId 
            ? { ...p, status: 'error', progress: 0, error: error instanceof Error ? error.message : 'Upload failed' }
            : p
        ))
      }
    }

    // Show completion message
    const successCount = progressEntries.filter(p => 
      uploadQueue.find(q => q.fileId === p.fileId)?.status === 'complete'
    ).length
    
    if (successCount > 0) {
      showMessage('success', `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`)
    }

    // Clear queue after 3 seconds
    setTimeout(() => {
      setUploadQueue([])
    }, 3000)
  }, [uploadQueue, showMessage])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [handleFileSelect])

  // File input handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input value to allow re-uploading same file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  // Clear uploaded files
  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([])
  }, [])

  // Get storage info
  const storageQuota = fileDataManager.getStorageQuota()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">File Upload</h2>
        <p className="text-gray-600">
          Upload files by dragging and dropping or clicking to browse. Supports images, documents, audio, and video files.
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

      {/* Storage Quota Warning */}
      {storageQuota.percentage > 80 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">Storage Warning</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Storage is {storageQuota.percentage}% full ({fileDataManager.formatFileSize(storageQuota.used)} of {fileDataManager.formatFileSize(storageQuota.total)}). 
            Consider cleaning up files to free space.
          </p>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*,application/pdf,text/plain,audio/*,video/*,.doc,.docx"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? 'Drop files here' : 'Upload files'}
            </h3>
            <p className="text-gray-600">
              Drag and drop files here, or <span className="text-blue-600 font-medium">click to browse</span>
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Supported formats: Images (JPG, PNG, GIF, WebP), Documents (PDF, TXT, DOC), Audio (MP3, WAV), Video (MP4, WebM)</p>
            <p>Maximum file size: 10MB per file</p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
          <div className="space-y-3">
            {uploadQueue.map((upload) => (
              <div key={upload.fileId} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{upload.fileName}</span>
                    <span className="text-sm text-gray-500">{upload.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        upload.status === 'error' ? 'bg-red-500' :
                        upload.status === 'complete' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${upload.progress}%` }}
                    ></div>
                  </div>
                  {upload.error && (
                    <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {upload.status === 'complete' ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : upload.status === 'error' ? (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="animate-spin w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recently Uploaded</h3>
            <button
              onClick={clearUploadedFiles}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {file.thumbnail ? (
                    <img 
                      src={file.thumbnail} 
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-lg">{fileDataManager.getFileIcon(file.mimeType)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{fileDataManager.formatFileSize(file.size)}</p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Usage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Used Storage</span>
            <span className="text-sm font-medium text-gray-900">
              {fileDataManager.formatFileSize(storageQuota.used)} of {fileDataManager.formatFileSize(storageQuota.total)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                storageQuota.percentage > 90 ? 'bg-red-500' :
                storageQuota.percentage > 80 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(storageQuota.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>{storageQuota.percentage}% used</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
