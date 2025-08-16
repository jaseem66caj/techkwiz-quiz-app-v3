'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { fileDataManager } from '@/utils/fileDataManager'
import { FileItem } from '@/types/admin'

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'size' | 'date' | 'type'
type SortOrder = 'asc' | 'desc'

export default function FileExplorer() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load files
  const loadFiles = useCallback(() => {
    setIsLoading(true)
    try {
      const allFiles = fileDataManager.getAllFiles()
      setFiles(allFiles)
    } catch (error) {
      console.error('Error loading files:', error)
      setMessage({ type: 'error', text: 'Failed to load files' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // Show message with auto-clear
  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }, [])

  // Get current folder files
  const currentFolderFiles = useMemo(() => {
    return fileDataManager.getFilesByFolder(currentFolder)
  }, [files, currentFolder])

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = currentFolderFiles

    // Apply search filter
    if (searchQuery) {
      filtered = fileDataManager.searchFiles(searchQuery, { 
        type: filterType !== 'all' ? filterType : undefined 
      }).filter(file => file.parentId === currentFolder)
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(file => {
        if (filterType === 'folders') return file.type === 'folder'
        if (filterType === 'images') return file.mimeType.startsWith('image/')
        if (filterType === 'documents') return file.mimeType.includes('pdf') || file.mimeType.includes('text') || file.mimeType.includes('document')
        if (filterType === 'audio') return file.mimeType.startsWith('audio/')
        if (filterType === 'video') return file.mimeType.startsWith('video/')
        return true
      })
    }

    // Sort files
    filtered.sort((a, b) => {
      let comparison = 0
      
      // Folders first
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'date':
          comparison = a.modifiedAt - b.modifiedAt
          break
        case 'type':
          comparison = a.mimeType.localeCompare(b.mimeType)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [currentFolderFiles, searchQuery, filterType, sortBy, sortOrder, currentFolder])

  // Get breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!currentFolder) return [{ id: null, name: 'Root' }]
    
    const path = [{ id: null, name: 'Root' }]
    let folder = files.find(f => f.id === currentFolder)
    
    while (folder) {
      path.unshift({ id: folder.id, name: folder.name })
      folder = folder.parentId ? files.find(f => f.id === folder.parentId) : null
    }
    
    return path
  }, [currentFolder, files])

  // Handle file selection
  const handleFileSelect = useCallback((fileId: string, isCtrlClick: boolean = false) => {
    setSelectedFiles(prev => {
      const newSelection = new Set(prev)
      
      if (isCtrlClick) {
        if (newSelection.has(fileId)) {
          newSelection.delete(fileId)
        } else {
          newSelection.add(fileId)
        }
      } else {
        newSelection.clear()
        newSelection.add(fileId)
      }
      
      return newSelection
    })
  }, [])

  // Handle folder navigation
  const handleFolderOpen = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId)
    setSelectedFiles(new Set())
  }, [])

  // Handle file deletion
  const handleDeleteFiles = useCallback(() => {
    if (selectedFiles.size === 0) return
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)
    if (!confirmed) return
    
    try {
      selectedFiles.forEach(fileId => {
        fileDataManager.deleteFile(fileId)
      })
      
      loadFiles()
      setSelectedFiles(new Set())
      showMessage('success', `Deleted ${selectedFiles.size} file(s)`)
    } catch (error) {
      showMessage('error', 'Failed to delete files')
    }
  }, [selectedFiles, loadFiles, showMessage])

  // Handle create folder
  const handleCreateFolder = useCallback(() => {
    const name = window.prompt('Enter folder name:')
    if (!name || !name.trim()) return
    
    try {
      fileDataManager.createFolder(name.trim(), currentFolder)
      loadFiles()
      showMessage('success', `Created folder "${name.trim()}"`)
    } catch (error) {
      showMessage('error', 'Failed to create folder')
    }
  }, [currentFolder, loadFiles, showMessage])

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }, [sortBy])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading files...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">File Explorer</h2>
        <p className="text-gray-600">
          Browse, organize, and manage your files and folders.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbPath.map((item, index) => (
          <div key={item.id || 'root'} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <button
              onClick={() => handleFolderOpen(item.id)}
              className={`px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                item.id === currentFolder ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              {item.name}
            </button>
          </div>
        ))}
      </nav>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Files</option>
            <option value="folders">Folders</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateFolder}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Folder
            </button>

            {selectedFiles.size > 0 && (
              <button
                onClick={handleDeleteFiles}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete ({selectedFiles.size})
              </button>
            )}
          </div>

          {/* View Mode */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {viewMode === 'list' && (
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div className="col-span-1"></div>
            <div className="col-span-5">
              <button
                onClick={() => handleSortChange('name')}
                className="flex items-center gap-1 hover:text-gray-900 transition-colors"
              >
                Name
                {sortBy === 'name' && (
                  <svg className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSortChange('size')}
                className="flex items-center gap-1 hover:text-gray-900 transition-colors"
              >
                Size
                {sortBy === 'size' && (
                  <svg className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSortChange('type')}
                className="flex items-center gap-1 hover:text-gray-900 transition-colors"
              >
                Type
                {sortBy === 'type' && (
                  <svg className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSortChange('date')}
                className="flex items-center gap-1 hover:text-gray-900 transition-colors"
              >
                Modified
                {sortBy === 'date' && (
                  <svg className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {filteredAndSortedFiles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'This folder is empty. Upload some files to get started.'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                onClick={(e) => {
                  if (file.type === 'folder') {
                    handleFolderOpen(file.id)
                  } else {
                    handleFileSelect(file.id, e.ctrlKey || e.metaKey)
                  }
                }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedFiles.has(file.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="mb-2">
                    {file.thumbnail ? (
                      <img 
                        src={file.thumbnail} 
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded mx-auto"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mx-auto">
                        <span className="text-2xl">{fileDataManager.getFileIcon(file.mimeType)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.type === 'folder' ? 'Folder' : fileDataManager.formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                onClick={(e) => {
                  if (file.type === 'folder') {
                    handleFolderOpen(file.id)
                  } else {
                    handleFileSelect(file.id, e.ctrlKey || e.metaKey)
                  }
                }}
                className={`grid grid-cols-12 gap-4 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  {file.thumbnail ? (
                    <img 
                      src={file.thumbnail} 
                      alt={file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-lg">{fileDataManager.getFileIcon(file.mimeType)}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-600">
                    {file.type === 'folder' ? '-' : fileDataManager.formatFileSize(file.size)}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-600">
                    {file.type === 'folder' ? 'Folder' : file.mimeType.split('/')[0]}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-600">
                    {new Date(file.modifiedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
