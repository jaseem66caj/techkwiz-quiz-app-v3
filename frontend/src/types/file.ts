// File Management Types

export interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType?: string
  size: number
  path: string
  parentId: string | null
  url: string
  thumbnail?: string
  uploadedAt: number
  modifiedAt: number
  tags: string[]
  metadata: {
    description?: string
    author?: string
    copyright?: string
    [key: string]: any
  }
}

export interface FileSettings {
  autoOptimizeImages: boolean
  generateThumbnails: boolean
  maxFileSize: number
  allowedTypes: string[]
  storageLimit: number
}

export interface StorageQuota {
  used: number
  limit: number
  percentage: number
}

export interface StorageBreakdown {
  images: number
  documents: number
  audio: number
  video: number
  other: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export const FILE_STORAGE_KEYS = {
  FILES: 'techkwiz_files',
  SETTINGS: 'techkwiz_file_settings',
  QUOTA: 'techkwiz_storage_quota'
} as const

export const DEFAULT_FILE_SETTINGS: FileSettings = {
  autoOptimizeImages: true,
  generateThumbnails: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'audio/mp3',
    'audio/wav',
    'video/mp4'
  ],
  storageLimit: 100 * 1024 * 1024 // 100MB
} as const

export const ALLOWED_FILE_TYPES = [
  'image/*',
  'application/pdf',
  'text/plain',
  'audio/*',
  'video/*'
] as const

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  AUDIO: 20 * 1024 * 1024, // 20MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxTotalSize: 500 * 1024 * 1024, // 500MB
  thumbnailSize: 150 // 150px
} as const

export const FILE_ICONS: Record<string, string> = {
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
  'image/webp': '🖼️',
  'application/pdf': '📄',
  'text/plain': '📝',
  'audio/mp3': '🎵',
  'audio/wav': '🎵',
  'video/mp4': '🎬',
  'folder': '📁'
} as const