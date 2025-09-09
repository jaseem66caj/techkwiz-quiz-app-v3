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
        throw new QuizDataError(
          'Failed to load static quiz database',
          'STATIC_IMPORT_FAILED',
          { categoryId, importError: importError.message }
        )
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
      const { QUIZ_DATABASE } = await import('../data/quizDatabase')
      Object.keys(QUIZ_DATABASE).forEach(cat => categories.add(cat))
    } catch (error) {
      console.warn('Could not load static categories:', error)
    }

    return Array.from(categories)
  }

  /**
   * Check if a category has sufficient questions for a quiz
   * @param categoryId - Category to check
   * @param minQuestions - Minimum number of questions required (default: 3)
   * @returns Promise resolving to boolean
   */
  async hasSufficientQuestions(categoryId: string, minQuestions: number = 3): Promise<boolean> {
    try {
      const questions = await this.getUnifiedQuestions(categoryId, minQuestions)
      return questions.length >= minQuestions
    } catch (error) {
      console.error(`Error checking sufficient questions for ${categoryId}:`, error)
      return false
    }
  }

  // ===================================================================
  // Logging and Analytics Methods
  // ===================================================================

  /**
   * Log successful question loading for analytics
   */
  private logQuestionLoadSuccess(
    source: 'admin' | 'static' | 'sample',
    categoryId: string,
    questionCount: number,
    loadTime: number
  ) {
    const logData = {
      event: 'question_load_success',
      source,
      categoryId,
      questionCount,
      loadTime,
      timestamp: new Date().toISOString()
    }

    console.log(`📈 Question Load Success: ${source} source, ${questionCount} questions, ${loadTime}ms`)

    // Store analytics data
    try {
      const existingLogs = JSON.parse(localStorage.getItem('quiz_analytics') || '[]')
      existingLogs.push(logData)
      const recentLogs = existingLogs.slice(-100) // Keep last 100 events
      localStorage.setItem('quiz_analytics', JSON.stringify(recentLogs))
    } catch (error) {
      console.warn('Failed to store analytics data:', error)
    }
  }

  /**
   * Log question loading errors for debugging
   */
  private logQuestionLoadError(categoryId: string, error: any, loadTime: number) {
    const errorData = {
      event: 'question_load_error',
      categoryId,
      error: error.message || 'Unknown error',
      errorCode: error.code || 'UNKNOWN',
      loadTime,
      timestamp: new Date().toISOString()
    }

    console.error(`📉 Question Load Error: ${categoryId}, ${loadTime}ms`)

    // Store error data
    try {
      const existingErrors = JSON.parse(localStorage.getItem('quiz_load_errors') || '[]')
      existingErrors.push(errorData)
      const recentErrors = existingErrors.slice(-50) // Keep last 50 errors
      localStorage.setItem('quiz_load_errors', JSON.stringify(recentErrors))
    } catch (storageError) {
      console.warn('Failed to store error data:', storageError)
    }
  }

  /**
   * Get analytics data for debugging and monitoring
   */
  getAnalyticsData() {
    try {
      return {
        analytics: JSON.parse(localStorage.getItem('quiz_analytics') || '[]'),
        errors: JSON.parse(localStorage.getItem('quiz_load_errors') || '[]'),
        dataErrors: JSON.parse(localStorage.getItem('quiz_data_errors') || '[]')
      }
    } catch (error) {
      console.warn('Failed to retrieve analytics data:', error)
      return { analytics: [], errors: [], dataErrors: [] }
    }
  }

  /**
   * Clear all analytics and error data
   */
  clearAnalyticsData() {
    try {
      localStorage.removeItem('quiz_analytics')
      localStorage.removeItem('quiz_load_errors')
      localStorage.removeItem('quiz_data_errors')
      console.log('Analytics data cleared')
    } catch (error) {
      console.warn('Failed to clear analytics data:', error)
    }
  }

  // ===================================================================
  // Cache Management Methods
  // ===================================================================

  /**
   * Get cached questions for a category
   */
  private getCachedQuestions(cacheKey: string): QuizQuestion[] | null {
    const cached = this.questionCache.get(cacheKey)
    if (!cached) return null

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.questionCache.delete(cacheKey)
      return null
    }

    return cached.questions
  }

  /**
   * Cache questions for a category
   */
  private setCachedQuestions(cacheKey: string, questions: QuizQuestion[]) {
    // Implement LRU cache behavior
    if (this.questionCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = this.questionCache.keys().next().value
      this.questionCache.delete(oldestKey)
    }

    this.questionCache.set(cacheKey, {
      questions: [...questions], // Create copy to prevent mutations
      timestamp: Date.now()
    })
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.questionCache.clear()
    this.staticDatabaseCache = null
    this.categoryCache.clear()
    console.log('🧹 All caches cleared')
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    return {
      questionCacheSize: this.questionCache.size,
      staticDatabaseCached: this.staticDatabaseCache !== null,
      categoryCacheSize: this.categoryCache.size,
      cacheHitRate: this.calculateCacheHitRate()
    }
  }

  private calculateCacheHitRate(): number {
    // This would need to be tracked over time in a real implementation
    // For now, return a placeholder
    return 0
  }

  // Get filtered questions based on provided criteria
  // Returns all questions if no filters provided
  getFilteredQuestions(filters?: {
    category?: string                      // Filter by category
    difficulty?: 'beginner' | 'intermediate' | 'advanced'  // Filter by difficulty
    type?: 'regular' | 'bonus'            // Filter by question type
    section?: 'onboarding' | 'homepage' | 'category' | 'general'  // Filter by section
    subcategory?: string                  // Filter by subcategory
    tags?: string[]                       // Filter by tags
  }): QuizQuestion[] {
    const questions = this.getQuestions()

    // Return all questions if no filters provided
    if (!filters) return questions

    // Apply filters to questions
    return questions.filter(question => {
      // Category filter
      if (filters.category && question.category !== filters.category) return false
      
      // Difficulty filter
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false
      
      // Type filter
      if (filters.type && question.type !== filters.type) return false
      
      // Section filter
      if (filters.section && question.section !== filters.section) return false
      
      // Subcategory filter
      if (filters.subcategory && question.subcategory !== filters.subcategory) return false
      
      // Tags filter - check if any of the provided tags exist in question tags
      if (filters.tags && !filters.tags.some(tag => question.tags?.includes(tag))) return false
      
      // If all filters pass, include this question
      return true
    })
  }

  // Get questions filtered by section
  getQuestionsBySection(section: 'onboarding' | 'homepage' | 'category' | 'general'): QuizQuestion[] {
    return this.getFilteredQuestions({ section })
  }

  // Get questions filtered by category and optionally by section
  getQuestionsByCategoryAndSection(category: string, section?: 'onboarding' | 'homepage' | 'category' | 'general'): QuizQuestion[] {
    return this.getFilteredQuestions({ category, section })
  }

  // Save a new question to the question bank
  // Validates question before saving and assigns ID/timestamps
  saveQuestion(question: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>): QuizQuestion {
    // Validate question data before saving
    this.validateQuestion(question)
    
    // Get existing questions
    const questions = this.getQuestions()
    
    // Create timestamp for new question
    const now = Date.now()
    
    // Create new question object with ID and timestamps
    const newQuestion: QuizQuestion = {
      ...question,
      id: this.generateId(),      // Generate unique ID
      createdAt: now,             // Set creation timestamp
      updatedAt: now              // Set update timestamp
    }
    
    // Add new question to questions array
    questions.push(newQuestion)
    
    // Save updated questions array
    this.saveQuestions(questions)
    
    // Return the newly created question
    return newQuestion
  }

  // Update an existing question by ID
  // Throws error if question not found
  updateQuestion(id: string, updates: Partial<Omit<QuizQuestion, 'id' | 'createdAt'>>): QuizQuestion {
    // Get all questions
    const questions = this.getQuestions()
    
    // Find index of question to update
    const index = questions.findIndex(q => q.id === id)
    
    // Throw error if question not found
    if (index === -1) {
      throw new QuizDataError(`Question with id ${id} not found`, 'NOT_FOUND')
    }
    
    // Create updated question object
    const updatedQuestion = {
      ...questions[index],         // Start with existing question data
      ...updates,                  // Apply updates
      updatedAt: Date.now()        // Update timestamp
    }
    
    // Validate updated question
    this.validateQuestion(updatedQuestion)
    
    // Replace old question with updated question
    questions[index] = updatedQuestion
    
    // Save updated questions array
    this.saveQuestions(questions)
    
    // Return the updated question
    return updatedQuestion
  }

  // Delete a question by ID
  // Returns true if successful, throws error if question not found
  deleteQuestion(id: string): boolean {
    // Get all questions
    const questions = this.getQuestions()
    
    // Filter out question with matching ID
    const filteredQuestions = questions.filter(q => q.id !== id)
    
    // Throw error if no question was removed (not found)
    if (filteredQuestions.length === questions.length) {
      throw new QuizDataError(`Question with id ${id} not found`, 'NOT_FOUND')
    }
    
    // Save filtered questions array
    this.saveQuestions(filteredQuestions)
    
    // Return success
    return true
  }

  // Delete multiple questions by ID in a single operation
  // Returns result object with operation details
  bulkDelete(ids: string[]): BulkOperationResult {
    // Check if trying to delete more questions than allowed in one operation
    if (ids.length > VALIDATION_RULES.MAX_BULK_OPERATIONS) {
      throw new QuizDataError(
        `Cannot delete more than ${VALIDATION_RULES.MAX_BULK_OPERATIONS} questions at once`,
        'BULK_LIMIT_EXCEEDED'
      )
    }

    // Get all questions
    const questions = this.getQuestions()
    
    // Store initial count for calculating deleted count
    const initialCount = questions.length
    
    // Filter out questions with matching IDs
    const filteredQuestions = questions.filter(q => !ids.includes(q.id))
    
    // Calculate how many questions were actually deleted
    const deletedCount = initialCount - filteredQuestions.length
    
    // Save filtered questions array
    this.saveQuestions(filteredQuestions)
    
    // Return result object with operation details
    return {
      success: true,                                  // Operation success status
      processedCount: deletedCount,                   // Number of questions deleted
      errorCount: ids.length - deletedCount,          // Number of IDs that weren't found
      errors: ids.length > deletedCount ? ['Some questions were not found'] : []  // Error messages
    }
  }

  // ===================================================================
  // Search and Filter Operations
  // ===================================================================
  
  // Advanced search and filter functionality for quiz questions
  // Supports text search, category filtering, difficulty filtering, and sorting
  searchQuestions(filters: SearchFilters): QuizQuestion[] {
    // Get all questions
    const questions = this.getQuestions()
    
    // Return all questions if no filters provided
    if (!filters || Object.keys(filters).length === 0) {
      return questions
    }
    
    // Filter questions based on provided criteria
    return questions.filter(question => {
      // Text search across question, options, category, subcategory, and tags
      if (filters.query) {
        const query = filters.query.toLowerCase()
        
        // Check if query matches question text
        const matchesQuestion = question.question.toLowerCase().includes(query)
        
        // Check if query matches any option text
        const matchesOptions = question.options.some(option => 
          option.toLowerCase().includes(query)
        )
        
        // Check if query matches category
        const matchesCategory = question.category.toLowerCase().includes(query)
        
        // Check if query matches subcategory
        const matchesSubcategory = question.subcategory.toLowerCase().includes(query)
        
        // Check if query matches any tags
        const matchesTags = question.tags?.some(tag => 
          tag.toLowerCase().includes(query)
        )
        
        // If no matches found in any field, exclude this question
        if (!matchesQuestion && !matchesOptions && !matchesCategory && 
            !matchesSubcategory && !matchesTags) {
          return false
        }
      }
      
      // Category filter - exclude if category doesn't match
      if (filters.category && question.category !== filters.category) {
        return false
      }
      
      // Difficulty filter - exclude if difficulty doesn't match
      if (filters.difficulty && question.difficulty !== filters.difficulty) {
        return false
      }
      
      // Type filter - exclude if type doesn't match
      if (filters.type && question.type !== filters.type) {
        return false
      }
      
      // Section filter - exclude if section doesn't match
      if (filters.section && question.section !== filters.section) {
        return false
      }
      
      // Subcategory filter - exclude if subcategory doesn't match
      if (filters.subcategory && question.subcategory !== filters.subcategory) {
        return false
      }
      
      // Tags filter - exclude if none of the provided tags match
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          question.tags?.includes(tag)
        )
        if (!hasMatchingTag) {
          return false
        }
      }
      
      // If all filters pass, include this question
      return true
    }).sort((a, b) => {
      // Sort results based on sortBy parameter
      switch (filters.sortBy) {
        // Sort by creation date
        case 'createdAt':
          return filters.sortOrder === 'desc' 
            ? (b.createdAt || 0) - (a.createdAt || 0)  // Descending order
            : (a.createdAt || 0) - (b.createdAt || 0)  // Ascending order
        
        // Sort by last update date
        case 'updatedAt':
          return filters.sortOrder === 'desc' 
            ? (b.updatedAt || 0) - (a.updatedAt || 0)  // Descending order
            : (a.updatedAt || 0) - (b.updatedAt || 0)  // Ascending order
        
        // Sort by difficulty level
        case 'difficulty':
          // Define difficulty order (beginner < intermediate < advanced)
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
          return filters.sortOrder === 'desc' 
            ? (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0)  // Descending
            : (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0)  // Ascending
        
        // Default sorting (no sorting)
        default:
          return 0
      }
    })
  }

  // ===================================================================
  // Import/Export Operations
  // ===================================================================
  
  // Import questions from JSON string
  // Validates questions and merges with existing data
  importQuestions(jsonData: string): BulkOperationResult {
    try {
      // Parse JSON data
      const parsedData = JSON.parse(jsonData)
      
      // Ensure we have an array of questions
      const questions: QuizQuestion[] = Array.isArray(parsedData) ? parsedData : [parsedData]
      
      // Check if trying to import more questions than allowed in one operation
      if (questions.length > VALIDATION_RULES.MAX_BULK_OPERATIONS) {
        throw new QuizDataError(
          `Cannot import more than ${VALIDATION_RULES.MAX_BULK_OPERATIONS} questions at once`,
          'BULK_LIMIT_EXCEEDED'
        )
      }
      
      // Validate each question before importing
      questions.forEach(question => this.validateQuestion(question))
      
      // Get existing questions
      const existingQuestions = this.getQuestions()
      
      // Merge imported questions with existing questions
      const allQuestions = [...existingQuestions, ...questions.map(q => ({
        ...q,
        // Generate ID if not provided
        id: q.id || this.generateId(),
        // Set creation timestamp if not provided
        createdAt: q.createdAt || Date.now(),
        // Set update timestamp if not provided
        updatedAt: q.updatedAt || Date.now()
      }))]
      
      // Save merged questions
      this.saveQuestions(allQuestions)
      
      // Return success result
      return {
        success: true,
        processedCount: questions.length,
        errorCount: 0,
        errors: []
      }
    } catch (error) {
      if (error instanceof QuizDataError) {
        throw error
      }
      
      throw new QuizDataError(
        `Failed to import questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'IMPORT_FAILED'
      )
    }
  }

  // Export questions to JSON string
  // Optionally filter questions before exporting
  exportQuestions(filters?: SearchFilters): string {
    // Get questions, optionally filtered
    const questions = filters 
      ? this.searchQuestions(filters)  // Apply filters if provided
      : this.getQuestions()           // Get all questions if no filters
    
    // Convert questions to formatted JSON string
    return JSON.stringify(questions, null, 2)
  }

  // ===================================================================
  // Validation Methods
  // ===================================================================
  
  // Validate question data structure and content
  // Throws QuizDataError if validation fails
  private validateQuestion(question: any): void {
    // Validate question text length
    if (!question.question || question.question.length < VALIDATION_RULES.QUESTION_MIN_LENGTH) {
      throw new QuizDataError(
        `Question must be at least ${VALIDATION_RULES.QUESTION_MIN_LENGTH} characters long`,
        'INVALID_QUESTION'
      )
    }
    
    // Validate question text maximum length
    if (question.question.length > VALIDATION_RULES.QUESTION_MAX_LENGTH) {
      throw new QuizDataError(
        `Question must be no more than ${VALIDATION_RULES.QUESTION_MAX_LENGTH} characters long`,
        'INVALID_QUESTION'
      )
    }
    
    // Validate options array structure and count
    if (!Array.isArray(question.options) || 
        question.options.length < VALIDATION_RULES.MIN_OPTIONS ||
        question.options.length > VALIDATION_RULES.MAX_OPTIONS) {
      throw new QuizDataError(
        `Question must have exactly ${VALIDATION_RULES.MIN_OPTIONS} options`,
        'INVALID_OPTIONS'
      )
    }
    
    // Validate each option
    question.options.forEach((option: string, index: number) => {
      // Validate option minimum length
      if (!option || option.length < VALIDATION_RULES.OPTION_MIN_LENGTH) {
        throw new QuizDataError(
          `Option ${index + 1} must be at least ${VALIDATION_RULES.OPTION_MIN_LENGTH} characters long`,
          'INVALID_OPTION'
        )
      }
      
      // Validate option maximum length
      if (option.length > VALIDATION_RULES.OPTION_MAX_LENGTH) {
        throw new QuizDataError(
          `Option ${index + 1} must be no more than ${VALIDATION_RULES.OPTION_MAX_LENGTH} characters long`,
          'INVALID_OPTION'
        )
      }
    })
    
    // Validate correct answer index
    if (typeof question.correct_answer !== 'number' || 
        question.correct_answer < 0 || 
        question.correct_answer >= question.options.length) {
      throw new QuizDataError(
        `Correct answer index must be between 0 and ${question.options.length - 1}`,
        'INVALID_CORRECT_ANSWER'
      )
    }
    
    // Validate difficulty level
    if (!question.difficulty || !['beginner', 'intermediate', 'advanced'].includes(question.difficulty)) {
      throw new QuizDataError(
        'Question must have a valid difficulty level (beginner, intermediate, or advanced)',
        'INVALID_DIFFICULTY'
      )
    }
    
    // Validate category exists
    if (!question.category) {
      throw new QuizDataError(
        'Question must have a category',
        'INVALID_CATEGORY'
      )
    }
    
    // Validate subcategory exists
    if (!question.subcategory) {
      throw new QuizDataError(
        'Question must have a subcategory',
        'INVALID_SUBCATEGORY'
      )
    }
  }

  // ===================================================================
  // Helper Methods
  // ===================================================================
  
  // Save questions array to localStorage
  private saveQuestions(questions: QuizQuestion[]): void {
    this.safeSetItem(QUIZ_STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
  }

  // Generate unique ID for new questions/drafts
  private generateId(): string {
    // Combine timestamp and random string for uniqueness
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Initialize with sample data if no data exists
  // Creates and returns sample questions for initial user experience
  private initializeWithSampleData(): QuizQuestion[] {
    // Define sample questions for initial user experience
    const sampleQuestions: QuizQuestion[] = [
      {
        id: 'sample-1',
        question: 'Which social media platform is known for short-form videos?',
        options: ['Instagram', 'TikTok', 'Twitter', 'Snapchat'],
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
        color: 'bg-blue-500',
        questionCount: 0,
        difficultyLevels: ['beginner', 'intermediate', 'advanced'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'social-media',
        name: 'Social Media',
        description: 'How well do you know social media platforms?',
        icon: '📱',
        color: 'bg-purple-500',
        questionCount: 0,
        difficultyLevels: ['beginner', 'intermediate', 'advanced'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'influencers',
        name: 'Influencers',
        description: 'Test your knowledge of popular influencers',
        icon: '🌟',
        color: 'bg-pink-500',
        questionCount: 0,
        difficultyLevels: ['beginner', 'intermediate', 'advanced'],
        createdAt: now,
        updatedAt: now
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
    
    const backupString = JSON.stringify(backupData)
    this.safeSetItem(QUIZ_STORAGE_KEYS.BACKUP, backupString)
    return backupString
  }

  // Restore from backup
  restoreFromBackup(backupData: string): void {
    try {
      const parsedData = JSON.parse(backupData)
      
      if (parsedData.questions) {
        this.saveQuestions(parsedData.questions)
      }
      
      if (parsedData.categories) {
        this.saveCategories(parsedData.categories)
      }
      
      if (parsedData.settings) {
        this.saveSettings(parsedData.settings)
      }
      
      if (parsedData.drafts) {
        this.safeSetItem(QUIZ_STORAGE_KEYS.DRAFTS, JSON.stringify(parsedData.drafts))
      }
      
      console.log('✅ Successfully restored from backup')
    } catch (error) {
      throw new QuizDataError(
        `Failed to restore from backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESTORE_FAILED'
      )
    }
  }

  // Get backup
  getBackup(): string | null {
    return this.safeGetItem(QUIZ_STORAGE_KEYS.BACKUP)
  }

  // Clear all data
  clearAllData(): void {
    Object.values(QUIZ_STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error clearing data for key ${key}:`, error)
      }
    })
  }
}

// Export singleton instance
export const quizDataManager = QuizDataManager.getInstance()