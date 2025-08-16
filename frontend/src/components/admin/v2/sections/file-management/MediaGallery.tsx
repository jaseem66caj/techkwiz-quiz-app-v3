'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { fileDataManager } from '@/utils/fileDataManager'
import { FileItem } from '@/types/admin'

export default function MediaGallery() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load files
  const loadFiles = useCallback(() => {
    setIsLoading(true)
    try {
      const allFiles = fileDataManager.getAllFiles()
      setFiles(allFiles)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // Filter media files
  const mediaFiles = useMemo(() => {
    let filtered = files.filter(file => 
      file.type === 'file' && (
        file.mimeType.startsWith('image/') || 
        file.mimeType.startsWith('video/')
      )
    )

    // Apply type filter
    if (filterType === 'images') {
      filtered = filtered.filter(file => file.mimeType.startsWith('image/'))
    } else if (filterType === 'videos') {
      filtered = filtered.filter(file => file.mimeType.startsWith('video/'))
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (file.metadata.description && file.metadata.description.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => b.uploadedAt - a.uploadedAt)
  }, [files, filterType, searchQuery])

  // Handle file selection
  const handleFileSelect = useCallback((file: FileItem) => {
    setSelectedFile(file)
    if (file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')) {
      setIsLightboxOpen(true)
    }
  }, [])

  // Handle lightbox navigation
  const handlePrevious = useCallback(() => {
    if (!selectedFile) return
    const currentIndex = mediaFiles.findIndex(f => f.id === selectedFile.id)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : mediaFiles.length - 1
    setSelectedFile(mediaFiles[prevIndex])
  }, [selectedFile, mediaFiles])

  const handleNext = useCallback(() => {
    if (!selectedFile) return
    const currentIndex = mediaFiles.findIndex(f => f.id === selectedFile.id)
    const nextIndex = currentIndex < mediaFiles.length - 1 ? currentIndex + 1 : 0
    setSelectedFile(mediaFiles[nextIndex])
  }, [selectedFile, mediaFiles])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return
      
      switch (e.key) {
        case 'Escape':
          setIsLightboxOpen(false)
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, handlePrevious, handleNext])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading media gallery...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Media Gallery</h2>
        <p className="text-gray-600">
          View and manage your images and videos in a beautiful gallery interface.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'images' | 'videos')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Media</option>
            <option value="images">Images Only</option>
            <option value="videos">Videos Only</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {mediaFiles.length} media file{mediaFiles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Gallery Grid */}
      {mediaFiles.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
          <p className="text-gray-500">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload some images or videos to see them here.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileSelect(file)}
              className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
            >
              {file.mimeType.startsWith('image/') ? (
                <img
                  src={file.thumbnail || file.url}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : file.mimeType.startsWith('video/') ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">{fileDataManager.getFileIcon(file.mimeType)}</span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-end">
                <div className="w-full p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs opacity-90">
                    {fileDataManager.formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* File type indicator */}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  file.mimeType.startsWith('image/') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {file.mimeType.startsWith('image/') ? 'IMG' : 'VID'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Buttons */}
            {mediaFiles.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Media Content */}
            <div className="max-w-full max-h-full flex items-center justify-center">
              {selectedFile.mimeType.startsWith('image/') ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedFile.mimeType.startsWith('video/') ? (
                <video
                  src={selectedFile.url}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                />
              ) : null}
            </div>

            {/* File Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">{selectedFile.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Size:</span>
                  <span className="ml-2">{fileDataManager.formatFileSize(selectedFile.size)}</span>
                </div>
                <div>
                  <span className="text-gray-300">Type:</span>
                  <span className="ml-2">{selectedFile.mimeType}</span>
                </div>
                <div>
                  <span className="text-gray-300">Uploaded:</span>
                  <span className="ml-2">{new Date(selectedFile.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-300">Modified:</span>
                  <span className="ml-2">{new Date(selectedFile.modifiedAt).toLocaleDateString()}</span>
                </div>
              </div>
              {selectedFile.metadata.description && (
                <p className="mt-2 text-sm text-gray-300">{selectedFile.metadata.description}</p>
              )}
              {selectedFile.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedFile.tags.map((tag, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Counter */}
            {mediaFiles.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {mediaFiles.findIndex(f => f.id === selectedFile.id) + 1} of {mediaFiles.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
