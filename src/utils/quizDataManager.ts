// ===================================================================
// TechKwiz Quiz Data Management System
// ===================================================================
// This file contains the QuizDataManager class responsible for handling
// all quiz-related data operations including CRUD operations for questions,
// categories, drafts, and settings. It uses localStorage for persistence.

import {
  QuizQuestion,
  QuizCategory,
  SearchFilters,
  BulkOperationResult,
  QuestionDraft,
  QuizManagementSettings,
  QUIZ_STORAGE_KEYS,
  DEFAULT_CATEGORIES
} from '@/types/quiz'
import {
  autoMigrateQuestion,
  batchMigrateLegacyQuestions,
  validateQuizQuestion,
  DataMigrationError
} from './quizDataMigration'

// Data validation rules to ensure data integrity
export const VALIDATION_RULES = {
  QUESTION_MIN_LENGTH: 10,        // Minimum question text length
  QUESTION_MAX_LENGTH: 500,       // Maximum question text length
  OPTION_MIN_LENGTH: 1,           // Minimum option text length
  OPTION_MAX_LENGTH: 100,         // Maximum option text length
  MIN_OPTIONS: 4,                 // Minimum number of options per question
  MAX_OPTIONS: 4,                 // Maximum number of options per question
  MAX_BULK_OPERATIONS: 50,        // Maximum number of operations in bulk actions
  MAX_FILE_SIZE: 5 * 1024 * 1024, // Maximum file size for imports (5MB)
  AUTO_SAVE_INTERVAL: 30000       // Auto-save interval in milliseconds (30 seconds)
} as const

// Custom error class for quiz data operations
export class QuizDataError extends Error {
  constructor(message: string, public code: string, public context?: any) {
    super(message)
    this.name = 'QuizDataError'
    this.logError()
  }

  private logError() {
    const errorData = {
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
      timestamp: new Date().toISOString()
    }

    console.group('🚨 QuizDataError')
    console.error('Code:', this.code)
    console.error('Message:', this.message)
    if (this.context) console.error('Context:', this.context)
    console.error('Stack:', this.stack)
    console.groupEnd()

    // Store error for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('quiz_data_errors') || '[]')
      existingErrors.push(errorData)
      const recentErrors = existingErrors.slice(-20) // Keep last 20 errors
      localStorage.setItem('quiz_data_errors', JSON.stringify(recentErrors))
    } catch (storageError) {
      console.warn('Failed to store QuizDataError:', storageError)
    }
  }
}

// Singleton class for managing all quiz-related data operations
// Uses localStorage for client-side data persistence
class QuizDataManager {
  // Singleton instance
  private static instance: QuizDataManager

  // Timer for auto-save functionality
  private autoSaveTimer: NodeJS.Timeout | null = null

  // Cache for frequently accessed data
  private questionCache = new Map<string, { questions: QuizQuestion[], timestamp: number }>()
  private staticDatabaseCache: Record<string, QuizQuestion[]> | null = null
  private categoryCache = new Map<string, string[]>()

  // Cache configuration
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 50 // Maximum cached categories

  // Get singleton instance of QuizDataManager
  static getInstance(): QuizDataManager {
    if (!QuizDataManager.instance) {
      QuizDataManager.instance = new QuizDataManager()
    }
    return QuizDataManager.instance
  }

  // Safe localStorage getItem with error handling
  // Returns null if operation fails or not in browser environment
  private safeGetItem(key: string): string | null {
    // Return null if not on client side (server-side rendering)
    if (typeof window === 'undefined') {
      return null
    }

    try {
      // Attempt to retrieve item from localStorage
      return localStorage.getItem(key)
    } catch (error) {
      // Log error and return null if operation fails
      console.error(`Error reading from localStorage key ${key}:`, error)
      return null
    }
  }

  // Safe localStorage setItem with error handling
  // Returns boolean indicating success/failure
  private safeSetItem(key: string, value: string): boolean {
    // Return false if not on client side (server-side rendering)
    if (typeof window === 'undefined') {
      return false
    }

    try {
      // Attempt to save item to localStorage
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      // Log error and handle storage quota exceeded error
      console.error(`Error writing to localStorage key ${key}:`, error)
      if (error instanceof DOMException && error.code === 22) {
        throw new QuizDataError('Storage quota exceeded. Please clear some data.', 'QUOTA_EXCEEDED')
      }
      return false
    }
  }

  // ===================================================================
  // Question CRUD Operations
  // ===================================================================
  
  // Retrieve all quiz questions from localStorage
  // If no data exists, initializes with sample data
  getQuestions(): QuizQuestion[] {
    const data = this.safeGetItem(QUIZ_STORAGE_KEYS.QUESTIONS)
    if (!data) return this.initializeWithSampleData()

    try {
      const questions = JSON.parse(data)
      return Array.isArray(questions) ? questions : []
    } catch (error) {
      console.error('Error parsing questions data:', error)
      return this.initializeWithSampleData()
    }
  }

  // ===================================================================
  // Unified Question Access with Fallback Logic
  // ===================================================================

  /**
   * Get questions for a specific category with intelligent fallback
   * Priority: Admin questions -> Static database -> Sample data
   * @param categoryId - The category to retrieve questions for
   * @param count - Maximum number of questions to return (default: 5)
   * @param section - Optional section filter
   * @returns Array of QuizQuestion objects
   */
  async getUnifiedQuestions(
    categoryId: string,
    count: number = 5,
    section?: 'onboarding' | 'homepage' | 'category' | 'general'
  ): Promise<QuizQuestion[]> {
    const startTime = Date.now()
    const cacheKey = `${categoryId}-${section || 'all'}-${count}`

    try {
      // Input validation
      if (!categoryId || typeof categoryId !== 'string') {
        throw new QuizDataError(
          'Invalid category ID provided',
          'INVALID_CATEGORY_ID',
          { categoryId, count, section }
        )
      }

      if (count < 1 || count > 50) {
        throw new QuizDataError(
          'Question count must be between 1 and 50',
          'INVALID_COUNT',
          { categoryId, count, section }
        )
      }

      // Check cache first
      const cachedQuestions = this.getCachedQuestions(cacheKey)
      if (cachedQuestions && cachedQuestions.length >= count) {
        console.log(`⚡ Cache hit for ${categoryId}: returning ${cachedQuestions.length} cached questions`)
        return cachedQuestions.slice(0, count)
      }

      console.log(`🔄 Loading ${count} questions for category: ${categoryId}${section ? ` (section: ${section})` : ''}`)

      // Step 1: Try to get admin-created questions
      let adminQuestions: QuizQuestion[] = []
      try {
        adminQuestions = this.getQuestionsByCategoryAndSection(categoryId, section)
        console.log(`📊 Found ${adminQuestions.length} admin questions for category: ${categoryId}`)
      } catch (adminError) {
        console.warn('Failed to load admin questions:', adminError)
        // Continue to fallback - don't throw here
      }

      if (adminQuestions.length >= Math.min(count, 3)) {
        const selectedQuestions = adminQuestions.slice(0, count)
        console.log(`✅ Using ${selectedQuestions.length} admin questions for category: ${categoryId}`)

        // Cache the results
        this.setCachedQuestions(cacheKey, selectedQuestions)

        this.logQuestionLoadSuccess('admin', categoryId, selectedQuestions.length, Date.now() - startTime)
        return selectedQuestions
      }

      // Step 2: Fallback to static database (with caching)
      console.log(`⚠️ Insufficient admin questions (${adminQuestions.length}), falling back to static database`)

      try {
        // Use cached static database if available
        if (!this.staticDatabaseCache) {
          console.log('📦 Importing static quiz database...');
          const { QUIZ_DATABASE } = await import('../data/quizDatabase')
          this.staticDatabaseCache = QUIZ_DATABASE as Record<string, QuizQuestion[]>
          console.log('📦 Static database cached for future use')
        }

        const staticQuestions = this.staticDatabaseCache[categoryId] || []

        if (staticQuestions.length > 0) {
          console.log(`📊 Found ${staticQuestions.length} static questions for category: ${categoryId}`)

          // Validate and migrate static questions if needed (with caching)
          const migrationCacheKey = `migration-${categoryId}`
          let validatedQuestions = this.getCachedQuestions(migrationCacheKey)

          if (!validatedQuestions) {
            validatedQuestions = []
            let migrationErrors = 0

            for (const q of staticQuestions) {
              try {
                const migratedQuestion = autoMigrateQuestion(q)
                validatedQuestions.push(migratedQuestion)
              } catch (migrationError) {
                migrationErrors++
                console.warn(`Failed to migrate question ${q.id}:`, migrationError)
              }
            }

            if (migrationErrors > 0) {
              console.warn(`⚠️ ${migrationErrors} questions failed migration for category: ${categoryId}`)
            }

            // Cache migrated questions
            if (validatedQuestions.length > 0) {
              this.setCachedQuestions(migrationCacheKey, validatedQuestions)
            }
          }

          if (validatedQuestions.length > 0) {
            const selectedQuestions = validatedQuestions.slice(0, count)
            console.log(`✅ Using ${selectedQuestions.length} static questions for category: ${categoryId}`)

            // Cache the final results
            this.setCachedQuestions(cacheKey, selectedQuestions)

            this.logQuestionLoadSuccess('static', categoryId, selectedQuestions.length, Date.now() - startTime)
            return selectedQuestions
          }
        }
      } catch (importError) {
        console.error('Failed to import static quiz database:', importError)
        // Don't throw here, continue to sample data fallback
      }

      // Step 3: Final fallback to sample data
      console.log(`⚠️ No questions found for category: ${categoryId}, using sample data`)
      const sampleQuestions = this.initializeWithSampleData()
      const selectedQuestions = sampleQuestions.slice(0, count)

      // Cache sample data as well
      this.setCachedQuestions(cacheKey, selectedQuestions)

      this.logQuestionLoadSuccess('sample', categoryId, selectedQuestions.length, Date.now() - startTime)
      return selectedQuestions

    } catch (error) {
      const loadTime = Date.now() - startTime
      console.error(`❌ Error in getUnifiedQuestions after ${loadTime}ms:`, error)

      // Log the error with context
      this.logQuestionLoadError(categoryId, error, loadTime)

      // Emergency fallback - return sample data but don't throw
      try {
        const sampleQuestions = this.initializeWithSampleData()
        const emergencyQuestions = sampleQuestions.slice(0, count)
        console.log(`🆘 Emergency fallback: returning ${emergencyQuestions.length} sample questions`)
        return emergencyQuestions
      } catch (emergencyError) {
        // If even sample data fails, return empty array
        console.error('Emergency fallback failed:', emergencyError)
        return []
      }
    }
  }

  /**
   * Get random questions from any available source
   * @param categoryId - Category to get questions from
   * @param count - Number of questions to return
   * @returns Promise resolving to array of questions
   */
  async getRandomUnifiedQuestions(categoryId: string, count: number = 5): Promise<QuizQuestion[]> {
    const questions = await this.getUnifiedQuestions(categoryId, count * 2) // Get more to randomize

    // Shuffle questions randomly
    const shuffled = questions.sort(() => Math.random() - 0.5)

    return shuffled.slice(0, count)
  }

  /**
   * Get all available categories from both admin and static sources
   * @returns Promise resolving to array of category IDs
   */
  async getAvailableCategories(): Promise<string[]> {
    const categories = new Set<string>()

    // Add admin categories
    const adminQuestions = this.getQuestions()
    adminQuestions.forEach(q => categories.add(q.category))

    // Add static categories
    try {
      if (!this.staticDatabaseCache) {
        const { QUIZ_DATABASE } = await import('../data/quizDatabase')
        this.staticDatabaseCache = QUIZ_DATABASE as Record<string, QuizQuestion[]>
      }

      Object.keys(this.staticDatabaseCache).forEach(categoryId => {
        categories.add(categoryId)
      })
    } catch (importError) {
      console.warn('Failed to import static database for categories:', importError)
    }

    return Array.from(categories)
  }

  // Get questions by category and optional section filter
  getQuestionsByCategoryAndSection(categoryId: string, section?: string): QuizQuestion[] {
    const allQuestions = this.getQuestions()
    return allQuestions.filter(q => 
      q.category === categoryId && 
      (!section || q.section === section)
    )
  }

  // Get questions by section
  getQuestionsBySection(section: string): QuizQuestion[] {
    const allQuestions = this.getQuestions()
    return allQuestions.filter(q => q.section === section)
  }

  // Get cached questions with TTL check
  private getCachedQuestions(cacheKey: string): QuizQuestion[] | null {
    const cached = this.questionCache.get(cacheKey)
    if (!cached) return null

    // Check if cache is still valid
    const now = Date.now()
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.questionCache.delete(cacheKey)
      return null
    }

    return cached.questions
  }

  // Set cached questions
  private setCachedQuestions(cacheKey: string, questions: QuizQuestion[]): void {
    // Limit cache size
    if (this.questionCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.questionCache.keys().next().value
      if (firstKey) this.questionCache.delete(firstKey)
    }

    this.questionCache.set(cacheKey, {
      questions,
      timestamp: Date.now()
    })
  }

  // Log successful question loading
  private logQuestionLoadSuccess(
    source: 'admin' | 'static' | 'sample',
    categoryId: string,
    count: number,
    loadTime: number
  ): void {
    console.log(`✅ Loaded ${count} questions from ${source} for category ${categoryId} in ${loadTime}ms`)
  }

  // Log question loading error
  private logQuestionLoadError(
    categoryId: string,
    error: any,
    loadTime: number
  ): void {
    console.error(`❌ Failed to load questions for category ${categoryId} after ${loadTime}ms:`, error)
  }

  // ===================================================================
  // Sample Data Initialization
  // ===================================================================

  // Initialize with sample data for development/testing
  private initializeWithSampleData(): QuizQuestion[] {
    console.log('🔄 Initializing with sample quiz data...')
    
    const sampleQuestions: QuizQuestion[] = [
      {
        id: 'sample-1',
        question: 'Which social media platform was originally called Musical.ly?',
        options: ['Instagram', 'TikTok', 'Snapchat', 'Twitter'],
        correct_answer: 1,          // TikTok is correct
        difficulty: 'beginner',
        fun_fact: 'TikTok was originally called Musical.ly!',
        category: 'social-media',
        subcategory: 'Platforms',
        section: 'homepage',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'sample-2',
        question: 'What does "AI" stand for?',
        options: ['Artificial Intelligence', 'Automated Internet', 'Advanced Interface', 'Algorithmic Integration'],
        correct_answer: 0,          // Artificial Intelligence is correct
        difficulty: 'beginner',
        fun_fact: 'The term "Artificial Intelligence" was first coined in 1956!',
        category: 'technology',
        subcategory: 'Acronyms',
        section: 'homepage',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'sample-3',
        question: 'Which company created the iPhone?',
        options: ['Google', 'Samsung', 'Apple', 'Microsoft'],
        correct_answer: 2,          // Apple is correct
        difficulty: 'beginner',
        fun_fact: 'The first iPhone was released in 2007!',
        category: 'technology',
        subcategory: 'Companies',
        section: 'homepage',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]
    
    // Save sample questions to localStorage
    this.saveQuestions(sampleQuestions)
    
    // Return sample questions
    return sampleQuestions
  }

  // Get categories
  getCategories(): QuizCategory[] {
    const data = this.safeGetItem(QUIZ_STORAGE_KEYS.CATEGORIES)
    if (!data) return this.initializeWithSampleCategories()

    try {
      const categories = JSON.parse(data)
      return Array.isArray(categories) ? categories : this.initializeWithSampleCategories()
    } catch (error) {
      console.error('Error parsing categories data:', error)
      return this.initializeWithSampleCategories()
    }
  }

  private initializeWithSampleCategories(): QuizCategory[] {
    const now = Date.now()
    const sampleCategories: QuizCategory[] = [
      {
        id: 'movies',
        name: 'Movies',
        description: 'Test your knowledge of movies and cinema',
        icon: '🎬',
        color: 'from-blue-500 to-purple-600',
        subcategories: ['Action', 'Comedy', 'Drama'],
        entry_fee: 100,
        prize_pool: 250
      },
      {
        id: 'social-media',
        name: 'Social Media',
        description: 'How well do you know social media platforms?',
        icon: '📱',
        color: 'from-purple-500 to-pink-600',
        subcategories: ['Platforms', 'Trends', 'Influencers'],
        entry_fee: 100,
        prize_pool: 250
      },
      {
        id: 'influencers',
        name: 'Influencers',
        description: 'Test your knowledge of popular influencers',
        icon: '🌟',
        color: 'from-pink-500 to-red-600',
        subcategories: ['Fashion', 'Tech', 'Lifestyle'],
        entry_fee: 100,
        prize_pool: 250
      }
    ]
    
    this.safeSetItem(QUIZ_STORAGE_KEYS.CATEGORIES, JSON.stringify(sampleCategories))
    return sampleCategories
  }

  // Save categories
  saveCategories(categories: QuizCategory[]): void {
    this.safeSetItem(QUIZ_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  }

  // Get settings
  getSettings(): QuizManagementSettings {
    const data = this.safeGetItem(QUIZ_STORAGE_KEYS.SETTINGS)
    if (!data) return this.initializeWithDefaultSettings()

    try {
      const settings = JSON.parse(data)
      return typeof settings === 'object' ? settings : this.initializeWithDefaultSettings()
    } catch (error) {
      console.error('Error parsing settings data:', error)
      return this.initializeWithDefaultSettings()
    }
  }

  private initializeWithDefaultSettings(): QuizManagementSettings {
    const defaultSettings: QuizManagementSettings = {
      autoSaveEnabled: true,
      autoSaveInterval: VALIDATION_RULES.AUTO_SAVE_INTERVAL,
      maxBulkOperations: VALIDATION_RULES.MAX_BULK_OPERATIONS,
      maxFileSize: VALIDATION_RULES.MAX_FILE_SIZE
    }
    
    this.safeSetItem(QUIZ_STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings))
    return defaultSettings
  }

  // Save settings
  saveSettings(settings: QuizManagementSettings): void {
    this.safeSetItem(QUIZ_STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  }

  // Get drafts
  getDrafts(): QuestionDraft[] {
    const data = this.safeGetItem(QUIZ_STORAGE_KEYS.DRAFTS)
    if (!data) return []

    try {
      const drafts = JSON.parse(data)
      return Array.isArray(drafts) ? drafts : []
    } catch (error) {
      console.error('Error parsing drafts data:', error)
      return []
    }
  }

  // Save draft
  saveDraft(draft: Omit<QuestionDraft, 'id' | 'createdAt' | 'updatedAt'>): QuestionDraft {
    const drafts = this.getDrafts()
    const now = Date.now()
    const newDraft: QuestionDraft = {
      ...draft,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    }
    
    drafts.push(newDraft)
    this.safeSetItem(QUIZ_STORAGE_KEYS.DRAFTS, JSON.stringify(drafts))
    return newDraft
  }

  // Update draft
  updateDraft(id: string, updates: Partial<Omit<QuestionDraft, 'id' | 'createdAt'>>): QuestionDraft {
    const drafts = this.getDrafts()
    const index = drafts.findIndex(d => d.id === id)
    
    if (index === -1) {
      throw new QuizDataError(`Draft with id ${id} not found`, 'NOT_FOUND')
    }
    
    const updatedDraft = {
      ...drafts[index],
      ...updates,
      updatedAt: Date.now()
    }
    
    drafts[index] = updatedDraft
    this.safeSetItem(QUIZ_STORAGE_KEYS.DRAFTS, JSON.stringify(drafts))
    return updatedDraft
  }

  // Delete draft
  deleteDraft(id: string): boolean {
    const drafts = this.getDrafts()
    const filteredDrafts = drafts.filter(d => d.id !== id)
    
    if (filteredDrafts.length === drafts.length) {
      throw new QuizDataError(`Draft with id ${id} not found`, 'NOT_FOUND')
    }
    
    this.safeSetItem(QUIZ_STORAGE_KEYS.DRAFTS, JSON.stringify(filteredDrafts))
    return true
  }

  // Create backup
  createBackup(): string {
    const backupData = {
      questions: this.getQuestions(),
      categories: this.getCategories(),
      settings: this.getSettings(),
      drafts: this.getDrafts(),
      timestamp: Date.now(),
      version: '1.0'
    }
    
    return JSON.stringify(backupData, null, 2)
  }

  // Restore from backup
  restoreFromBackup(backupData: string): void {
    try {
      const parsed = JSON.parse(backupData)
      
      if (parsed.questions) {
        this.saveQuestions(parsed.questions)
      }
      
      if (parsed.categories) {
        this.saveCategories(parsed.categories)
      }
      
      if (parsed.settings) {
        this.saveSettings(parsed.settings)
      }
      
      if (parsed.drafts) {
        this.safeSetItem(QUIZ_STORAGE_KEYS.DRAFTS, JSON.stringify(parsed.drafts))
      }
      
      console.log('✅ Quiz data restored from backup')
    } catch (error) {
      throw new QuizDataError('Failed to restore from backup', 'BACKUP_RESTORE_FAILED', { error })
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Save questions
  saveQuestions(questions: QuizQuestion[]): void {
    this.safeSetItem(QUIZ_STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
  }

  // Add question
  addQuestion(question: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>): QuizQuestion {
    const questions = this.getQuestions()
    const now = Date.now()
    const newQuestion: QuizQuestion = {
      ...question,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    }
    
    questions.push(newQuestion)
    this.saveQuestions(questions)
    return newQuestion
  }

  // Update question
  updateQuestion(id: string, updates: Partial<Omit<QuizQuestion, 'id' | 'createdAt'>>): QuizQuestion {
    const questions = this.getQuestions()
    const index = questions.findIndex(q => q.id === id)
    
    if (index === -1) {
      throw new QuizDataError(`Question with id ${id} not found`, 'NOT_FOUND')
    }
    
    const updatedQuestion = {
      ...questions[index],
      ...updates,
      updatedAt: Date.now()
    }
    
    questions[index] = updatedQuestion
    this.saveQuestions(questions)
    return updatedQuestion
  }

  // Delete question
  deleteQuestion(id: string): boolean {
    const questions = this.getQuestions()
    const filteredQuestions = questions.filter(q => q.id !== id)
    
    if (filteredQuestions.length === questions.length) {
      throw new QuizDataError(`Question with id ${id} not found`, 'NOT_FOUND')
    }
    
    this.saveQuestions(filteredQuestions)
    return true
  }

  // Search questions
  searchQuestions(filters: SearchFilters): QuizQuestion[] {
    const questions = this.getQuestions()
    
    return questions.filter(question => {
      // Category filter
      if (filters.category && question.category !== filters.category) {
        return false
      }
      
      // Difficulty filter
      if (filters.difficulty && question.difficulty !== filters.difficulty) {
        return false
      }
      
      // Search term filter
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase()
        const matchesQuestion = question.question.toLowerCase().includes(searchTerm)
        const matchesOptions = question.options.some(option => 
          option.toLowerCase().includes(searchTerm)
        )
        const matchesSubcategory = question.subcategory.toLowerCase().includes(searchTerm)
        
        if (!matchesQuestion && !matchesOptions && !matchesSubcategory) {
          return false
        }
      }
      
      return true
    })
  }

  // Bulk operations
  async performBulkOperation(
    operation: 'add' | 'update' | 'delete',
    data: any[]
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processedCount: 0,
      errorCount: 0,
      errors: []
    }
    
    // Limit bulk operations to prevent performance issues
    if (data.length > VALIDATION_RULES.MAX_BULK_OPERATIONS) {
      throw new QuizDataError(
        `Bulk operation limit exceeded. Maximum ${VALIDATION_RULES.MAX_BULK_OPERATIONS} operations allowed.`,
        'BULK_LIMIT_EXCEEDED'
      )
    }
    
    switch (operation) {
      case 'add':
        for (const item of data) {
          try {
            this.addQuestion(item)
            result.processedCount++
          } catch (error) {
            result.errorCount++
            result.errors.push(
              error instanceof Error ? error.message : 'Unknown error'
            )
          }
        }
        break
        
      case 'update':
        for (const item of data) {
          try {
            if (!item.id) {
              throw new QuizDataError('Item ID is required for update operation', 'MISSING_ID')
            }
            this.updateQuestion(item.id, item)
            result.processedCount++
          } catch (error) {
            result.errorCount++
            result.errors.push(
              error instanceof Error ? error.message : 'Unknown error'
            )
          }
        }
        break
        
      case 'delete':
        for (const item of data) {
          try {
            const id = typeof item === 'string' ? item : item.id
            if (!id) {
              throw new QuizDataError('Item ID is required for delete operation', 'MISSING_ID')
            }
            this.deleteQuestion(id)
            result.processedCount++
          } catch (error) {
            result.errorCount++
            result.errors.push(
              error instanceof Error ? error.message : 'Unknown error'
            )
          }
        }
        break
        
      default:
        throw new QuizDataError(`Unsupported bulk operation: ${operation}`, 'UNSUPPORTED_OPERATION')
    }
    
    // Update success status
    result.success = result.errorCount === 0
    
    return result
  }

  // Import questions from file
  async importQuestionsFromFile(file: File): Promise<BulkOperationResult> {
    // Check file size
    if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
      throw new QuizDataError(
        `File size exceeds limit of ${VALIDATION_RULES.MAX_FILE_SIZE} bytes`,
        'FILE_SIZE_EXCEEDED'
      )
    }
    
    // Check file type
    const validTypes = ['application/json', 'text/csv']
    if (!validTypes.includes(file.type)) {
      throw new QuizDataError(
        'Invalid file type. Only JSON and CSV files are supported',
        'INVALID_FILE_TYPE'
      )
    }
    
    try {
      const content = await file.text()
      let questions: any[] = []
      
      if (file.type === 'application/json') {
        questions = JSON.parse(content)
      } else {
        // Parse CSV (simplified implementation)
        const lines = content.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
          throw new QuizDataError('CSV file must contain at least header and one data row', 'INVALID_CSV')
        }
        
        const headers = lines[0].split(',').map(h => h.trim())
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          const question: any = {}
          
          headers.forEach((header, index) => {
            if (index < values.length) {
              question[header] = values[index]
            }
          })
          
          questions.push(question)
        }
      }
      
      // Validate and transform imported questions
      const validatedQuestions = questions.map(q => {
        // Ensure required fields
        return {
          ...q,
          id: q.id || this.generateId(),
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options : [],
          correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : -1,
          difficulty: q.difficulty || 'beginner',
          fun_fact: q.fun_fact || '',
          category: q.category || 'general',
          subcategory: q.subcategory || 'general',
          section: q.section || 'general',
          createdAt: q.createdAt || Date.now(),
          updatedAt: Date.now()
        }
      })
      
      // Perform bulk add operation
      return this.performBulkOperation('add', validatedQuestions)
    } catch (error) {
      throw new QuizDataError(
        `Failed to import questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'IMPORT_FAILED',
        { fileName: file.name, fileType: file.type }
      )
    }
  }

  // Export questions to file
  exportQuestionsToFile(format: 'json' | 'csv' = 'json'): string {
    const questions = this.getQuestions()
    
    if (format === 'json') {
      return JSON.stringify(questions, null, 2)
    } else {
      // Convert to CSV
      if (questions.length === 0) {
        return 'id,question,options,correct_answer,difficulty,fun_fact,category,subcategory,section,createdAt,updatedAt\n'
      }
      
      const headers = Object.keys(questions[0]).join(',')
      const rows = questions.map(q => {
        return Object.values(q).map(v => {
          if (Array.isArray(v)) {
            return `"${v.join('|')}"`
          }
          return `"${String(v).replace(/"/g, '""')}"`
        }).join(',')
      })
      
      return `${headers}\n${rows.join('\n')}`
    }
  }

  // Get statistics
  getStatistics(): {
    totalQuestions: number
    totalCategories: number
    questionsByCategory: Record<string, number>
    questionsByDifficulty: Record<string, number>
  } {
    const questions = this.getQuestions()
    const categories = this.getCategories()
    
    const questionsByCategory: Record<string, number> = {}
    const questionsByDifficulty: Record<string, number> = {}
    
    questions.forEach(q => {
      questionsByCategory[q.category] = (questionsByCategory[q.category] || 0) + 1
      questionsByDifficulty[q.difficulty] = (questionsByDifficulty[q.difficulty] || 0) + 1
    })
    
    return {
      totalQuestions: questions.length,
      totalCategories: categories.length,
      questionsByCategory,
      questionsByDifficulty
    }
  }

  // Clear all data
  clearAllData(): void {
    try {
      Object.values(QUIZ_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Clear caches
      this.questionCache.clear()
      this.staticDatabaseCache = null
      this.categoryCache.clear()
      
      console.log('✅ All quiz data cleared')
    } catch (error) {
      throw new QuizDataError('Failed to clear data', 'CLEAR_FAILED', { error })
    }
  }
}

// Export singleton instance
export const quizDataManager = QuizDataManager.getInstance()