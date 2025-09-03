import { 
  FileItem, 
  FileSettings, 
  StorageQuota, 
  StorageBreakdown, 
  UploadProgress,
  FILE_STORAGE_KEYS,
  DEFAULT_FILE_SETTINGS,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  FILE_ICONS
} from '@/types/file'

class FileDataManager {
  private static instance: FileDataManager
  private readonly FILE_VERSION = '1.0.0'

  static getInstance(): FileDataManager {
    if (!FileDataManager.instance) {
      FileDataManager.instance = new FileDataManager()
    }
    return FileDataManager.instance
  }

  // File Management
  getAllFiles(): FileItem[] {
    try {
      const stored = localStorage.getItem(FILE_STORAGE_KEYS.FILES)
      if (stored) {
        const files = JSON.parse(stored)
        return Array.isArray(files) ? files.map(file => this.validateFileItem(file)) : []
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
    return this.createDefaultFiles()
  }

  getFileById(id: string): FileItem | null {
    const files = this.getAllFiles()
    return files.find(file => file.id === id) || null
  }

  getFilesByFolder(folderId: string | null): FileItem[] {
    const files = this.getAllFiles()
    return files.filter(file => file.parentId === folderId)
  }

  searchFiles(query: string, filters?: { type?: string; tags?: string[] }): FileItem[] {
    const files = this.getAllFiles()
    const searchTerm = query.toLowerCase()
    
    return files.filter(file => {
      // Text search
      const matchesSearch = !query || 
        file.name.toLowerCase().includes(searchTerm) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        (file.metadata.description && file.metadata.description.toLowerCase().includes(searchTerm))
      
      // Type filter
      const matchesType = !filters?.type || 
        (filters.type === 'images' && file.mimeType.startsWith('image/')) ||
        (filters.type === 'documents' && (file.mimeType.includes('pdf') || file.mimeType.includes('text') || file.mimeType.includes('document'))) ||
        (filters.type === 'audio' && file.mimeType.startsWith('audio/')) ||
        (filters.type === 'video' && file.mimeType.startsWith('video/')) ||
        (filters.type === 'folders' && file.type === 'folder')
      
      // Tag filter
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => file.tags.includes(tag))
      
      return matchesSearch && matchesType && matchesTags
    })
  }

  uploadFile(file: File, parentId: string | null = null, options: {
    autoOptimize?: boolean,
    generateThumbnail?: boolean,
    onProgress?: (progress: number) => void
  } = {}): Promise<FileItem> {
    return new Promise((resolve, reject) => {
      try {
        // Validate file
        const validation = this.validateFileUpload(file)
        if (!validation.valid) {
          reject(new Error(validation.error))
          return
        }

        const { autoOptimize = true, generateThumbnail = true, onProgress } = options
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const reader = new FileReader()

        // Progress tracking
        reader.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100
            onProgress(progress)
          }
        }

        reader.onload = async (e) => {
          try {
            let fileContent = e.target?.result as string
            let fileSize = file.size
            let thumbnail: string | undefined

            // Auto-optimize images if enabled
            if (autoOptimize && file.type.startsWith('image/')) {
              const optimized = await this.optimizeImage(fileContent, file.type)
              fileContent = optimized.content
              fileSize = optimized.size
            }

            // Generate thumbnail for images
            if (generateThumbnail && file.type.startsWith('image/')) {
              thumbnail = await this.generateImageThumbnail(fileContent)
            }

            const fileItem: FileItem = {
              id: fileId,
              name: file.name,
              type: 'file',
              mimeType: file.type,
              size: fileSize,
              path: this.generateFilePath(file.name, parentId),
              parentId,
              url: fileContent,
              thumbnail,
              uploadedAt: Date.now(),
              modifiedAt: Date.now(),
              tags: [],
              metadata: this.extractMetadata(file, fileContent)
            }

            this.saveFile(fileItem)
            resolve(fileItem)
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = () => reject(new Error('Failed to read file'))

        // Use appropriate reader method based on file size
        if (file.size < 1024 * 1024) { // < 1MB, use base64
          reader.readAsDataURL(file)
        } else { // >= 1MB, create blob URL for large files
          const blobUrl = URL.createObjectURL(file)
          const fileItem: FileItem = {
            id: fileId,
            name: file.name,
            type: 'file',
            mimeType: file.type,
            size: file.size,
            path: this.generateFilePath(file.name, parentId),
            parentId,
            url: blobUrl,
            uploadedAt: Date.now(),
            modifiedAt: Date.now(),
            tags: [],
            metadata: this.extractMetadata(file)
          }

          this.saveFile(fileItem)
          resolve(fileItem)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  saveFile(file: FileItem): boolean {
    try {
      const files = this.getAllFiles()
      const existingIndex = files.findIndex(f => f.id === file.id)
      
      if (existingIndex >= 0) {
        files[existingIndex] = { ...file, modifiedAt: Date.now() }
      } else {
        files.push(file)
      }
      
      localStorage.setItem(FILE_STORAGE_KEYS.FILES, JSON.stringify(files))
      this.updateStorageQuota()
      return true
    } catch (error) {
      console.error('Error saving file:', error)
      return false
    }
  }

  deleteFile(fileId: string): boolean {
    try {
      const files = this.getAllFiles()
      const filteredFiles = files.filter(file => file.id !== fileId)
      
      localStorage.setItem(FILE_STORAGE_KEYS.FILES, JSON.stringify(filteredFiles))
      this.updateStorageQuota()
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  createFolder(name: string, parentId: string | null = null): FileItem {
    const folder: FileItem = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'folder',
      mimeType: 'folder',
      size: 0,
      path: this.generateFilePath(name, parentId),
      parentId,
      url: '',
      uploadedAt: Date.now(),
      modifiedAt: Date.now(),
      tags: [],
      metadata: {}
    }
    
    this.saveFile(folder)
    return folder
  }

  moveFile(fileId: string, newParentId: string | null): boolean {
    try {
      const file = this.getFileById(fileId)
      if (!file) return false
      
      const updatedFile = {
        ...file,
        parentId: newParentId,
        path: this.generateFilePath(file.name, newParentId),
        modifiedAt: Date.now()
      }
      
      return this.saveFile(updatedFile)
    } catch (error) {
      console.error('Error moving file:', error)
      return false
    }
  }

  renameFile(fileId: string, newName: string): boolean {
    try {
      const file = this.getFileById(fileId)
      if (!file) return false
      
      const updatedFile = {
        ...file,
        name: newName,
        path: this.generateFilePath(newName, file.parentId),
        modifiedAt: Date.now()
      }
      
      return this.saveFile(updatedFile)
    } catch (error) {
      console.error('Error renaming file:', error)
      return false
    }
  }

  // Storage Management
  getStorageQuota(): StorageQuota {
    try {
      const files = this.getAllFiles()
      const breakdown = this.calculateStorageBreakdown(files)
      const used = Object.values(breakdown).reduce((sum, size) => sum + size, 0)
      const total = FILE_SIZE_LIMITS.maxTotalSize
      
      return {
        used,
        limit: total,
        percentage: Math.round((used / total) * 100)
      }
    } catch (error) {
      console.error('Error calculating storage quota:', error)
      return {
        used: 0,
        limit: FILE_SIZE_LIMITS.maxTotalSize,
        percentage: 0
      }
    }
  }

  // File Settings
  getFileSettings(): FileSettings {
    try {
      const stored = localStorage.getItem(FILE_STORAGE_KEYS.SETTINGS)
      if (stored) {
        const settings = JSON.parse(stored)
        return this.validateFileSettings(settings)
      }
    } catch (error) {
      console.error('Error loading file settings:', error)
    }
    return this.createDefaultFileSettings()
  }

  saveFileSettings(settings: Partial<FileSettings>): boolean {
    try {
      const current = this.getFileSettings()
      const updated = {
        ...current,
        ...settings,
        updatedAt: Date.now()
      }
      
      const validated = this.validateFileSettings(updated)
      localStorage.setItem(FILE_STORAGE_KEYS.SETTINGS, JSON.stringify(validated))
      return true
    } catch (error) {
      console.error('Error saving file settings:', error)
      return false
    }
  }

  // Utility methods
  private validateFileUpload(file: File): { valid: boolean; error?: string } {
    const settings = this.getFileSettings()
    
    // Check file size
    if (file.size > settings.maxFileSize) {
      return { 
        valid: false, 
        error: `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(settings.maxFileSize)})` 
      }
    }
    
    // Check file type
    if (!settings.allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `File type ${file.type} is not allowed` 
      }
    }
    
    // Check total storage
    const quota = this.getStorageQuota()
    if (quota.used + file.size > quota.limit) {
      return {
        valid: false,
        error: `Not enough storage space. Need ${this.formatFileSize(file.size)}, but only ${this.formatFileSize(quota.limit - quota.used)} available`
      }
    }
    
    return { valid: true }
  }

  private generateFilePath(fileName: string, parentId: string | null): string {
    if (!parentId) return `/${fileName}`
    
    const parent = this.getFileById(parentId)
    if (!parent) return `/${fileName}`
    
    return `${parent.path}/${fileName}`
  }

  private shouldGenerateThumbnail(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  private generateThumbnail(dataUrl: string, mimeType: string): string {
    if (!this.shouldGenerateThumbnail(mimeType)) return ''
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const size = FILE_SIZE_LIMITS.thumbnailSize
        canvas.width = size
        canvas.height = size
        
        // Calculate aspect ratio
        const aspectRatio = img.width / img.height
        let drawWidth = size
        let drawHeight = size
        let offsetX = 0
        let offsetY = 0
        
        if (aspectRatio > 1) {
          drawHeight = size / aspectRatio
          offsetY = (size - drawHeight) / 2
        } else {
          drawWidth = size * aspectRatio
          offsetX = (size - drawWidth) / 2
        }
        
        ctx?.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      }
      
      img.src = dataUrl
      return canvas.toDataURL('image/jpeg', 0.8)
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      return ''
    }
  }

  private extractMetadata(file: File, dataUrl?: string): any {
    const metadata: any = {}
    
    if (file.type.startsWith('image/') && dataUrl) {
      // For images, we could extract EXIF data here
      // For now, just basic metadata
      metadata.type = 'image'
    } else if (file.type.startsWith('video/')) {
      metadata.type = 'video'
    } else if (file.type.startsWith('audio/')) {
      metadata.type = 'audio'
    } else {
      metadata.type = 'document'
    }
    
    return metadata
  }

  private calculateStorageBreakdown(files: FileItem[]): StorageBreakdown {
    const breakdown: StorageBreakdown = {
      images: 0,
      video: 0,
      documents: 0,
      audio: 0,
      other: 0
    }
    
    files.forEach(file => {
      if (file.type === 'folder') return
      
      if (file.mimeType.startsWith('image/')) {
        breakdown.images += file.size
      } else if (file.mimeType.startsWith('video/')) {
        breakdown.video += file.size
      } else if (file.mimeType.startsWith('audio/')) {
        breakdown.audio += file.size
      } else if (file.mimeType.includes('pdf') || file.mimeType.includes('text') || file.mimeType.includes('document')) {
        breakdown.documents += file.size
      } else {
        breakdown.other += file.size
      }
    })
    
    return breakdown
  }

  private updateStorageQuota(): void {
    const quota = this.getStorageQuota()
    localStorage.setItem(FILE_STORAGE_KEYS.QUOTA, JSON.stringify(quota))
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getFileIcon(mimeType: string): string {
    return FILE_ICONS[mimeType as keyof typeof FILE_ICONS] || FILE_ICONS.default
  }

  // Validation methods
  private validateFileItem(item: any): FileItem {
    return {
      id: item.id || `file_${Date.now()}`,
      name: item.name || 'Untitled',
      type: ['file', 'folder'].includes(item.type) ? item.type : 'file',
      mimeType: item.mimeType || 'application/octet-stream',
      size: Math.max(0, Number(item.size) || 0),
      path: item.path || '/',
      parentId: item.parentId || null,
      url: item.url,
      thumbnail: item.thumbnail,
      uploadedAt: item.uploadedAt || Date.now(),
      modifiedAt: item.modifiedAt || Date.now(),
      tags: Array.isArray(item.tags) ? item.tags : [],
      metadata: item.metadata || {}
    }
  }

  private validateFileSettings(settings: any): FileSettings {
    return {
      maxFileSize: Math.max(1024, Math.min(50 * 1024 * 1024, Number(settings.maxFileSize) || FILE_SIZE_LIMITS.maxFileSize)),
      allowedTypes: Array.isArray(settings.allowedTypes) ? settings.allowedTypes : DEFAULT_FILE_SETTINGS.allowedTypes,
      autoOptimizeImages: Boolean(settings.autoOptimizeImages ?? DEFAULT_FILE_SETTINGS.autoOptimizeImages),
      generateThumbnails: Boolean(settings.generateThumbnails ?? DEFAULT_FILE_SETTINGS.generateThumbnails),
      storageLimit: Math.max(10 * 1024 * 1024, Number(settings.storageLimit) || DEFAULT_FILE_SETTINGS.storageLimit)
    }
  }

  private createDefaultFiles(): FileItem[] {
    // Create some sample files for demonstration
    const sampleFiles: FileItem[] = [
      {
        id: 'folder_uploads',
        name: 'uploads',
        type: 'folder',
        mimeType: 'folder',
        size: 0,
        path: '/uploads',
        parentId: null,
        url: '',
        uploadedAt: Date.now() - 86400000,
        modifiedAt: Date.now() - 86400000,
        tags: [],
        metadata: {}
      },
      {
        id: 'folder_images',
        name: 'images',
        type: 'folder',
        mimeType: 'folder',
        size: 0,
        path: '/uploads/images',
        parentId: 'folder_uploads',
        url: '',
        uploadedAt: Date.now() - 86400000,
        modifiedAt: Date.now() - 86400000,
        tags: [],
        metadata: {}
      }
    ]
    
    localStorage.setItem(FILE_STORAGE_KEYS.FILES, JSON.stringify(sampleFiles))
    return sampleFiles
  }

  private createDefaultFileSettings(): FileSettings {
    const settings: FileSettings = {
      ...DEFAULT_FILE_SETTINGS
    }

    localStorage.setItem(FILE_STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    return settings
  }

  // Image optimization methods
  private async optimizeImage(imageContent: string, mimeType: string, quality: number = 0.8): Promise<{ content: string; size: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        // Calculate optimized dimensions (max 1920x1080)
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const optimizedContent = canvas.toDataURL(mimeType, quality)

        resolve({
          content: optimizedContent,
          size: Math.round(optimizedContent.length * 0.75) // Approximate compressed size
        })
      }
      img.src = imageContent
    })
  }

  private async generateImageThumbnail(imageContent: string, size: number = 200): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        // Calculate thumbnail dimensions (square crop)
        const { width, height } = img
        const minDimension = Math.min(width, height)
        const scale = size / minDimension

        canvas.width = size
        canvas.height = size

        // Center crop
        const sx = (width - minDimension) / 2
        const sy = (height - minDimension) / 2

        ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = imageContent
    })
  }

  // File download functionality
  downloadFile(fileId: string): void {
    const file = this.getFileById(fileId)
    if (!file) {
      throw new Error('File not found')
    }

    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Bulk file operations
  downloadMultipleFiles(fileIds: string[]): void {
    fileIds.forEach(id => {
      try {
        this.downloadFile(id)
      } catch (error) {
        console.error(`Failed to download file ${id}:`, error)
      }
    })
  }

  // Storage optimization tools
  findLargeFiles(minSize: number = 5 * 1024 * 1024): FileItem[] { // Default 5MB
    return this.getAllFiles()
      .filter(file => file.type === 'file' && file.size >= minSize)
      .sort((a, b) => b.size - a.size)
  }

  findDuplicateFiles(): { original: FileItem; duplicates: FileItem[] }[] {
    const files = this.getAllFiles().filter(f => f.type === 'file')
    const duplicateGroups: { original: FileItem; duplicates: FileItem[] }[] = []
    const processed = new Set<string>()

    files.forEach(file => {
      if (processed.has(file.id)) return

      const duplicates = files.filter(f =>
        f.id !== file.id &&
        f.name === file.name &&
        f.size === file.size &&
        !processed.has(f.id)
      )

      if (duplicates.length > 0) {
        duplicateGroups.push({ original: file, duplicates })
        processed.add(file.id)
        duplicates.forEach(d => processed.add(d.id))
      }
    })

    return duplicateGroups
  }

  optimizeStorage(): {
    largeFiles: FileItem[];
    duplicates: { original: FileItem; duplicates: FileItem[] }[];
    totalSavings: number;
  } {
    const largeFiles = this.findLargeFiles()
    const duplicates = this.findDuplicateFiles()

    const totalSavings = duplicates.reduce((total, group) =>
      total + group.duplicates.reduce((sum, file) => sum + file.size, 0), 0
    )

    return { largeFiles, duplicates, totalSavings }
  }
}

export const fileDataManager = FileDataManager.getInstance()
