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

// Data validation schemas
export const VALIDATION_RULES = {
  QUESTION_MIN_LENGTH: 10,
  QUESTION_MAX_LENGTH: 500,
  OPTION_MIN_LENGTH: 1,
  OPTION_MAX_LENGTH: 100,
  MIN_OPTIONS: 4,
  MAX_OPTIONS: 4,
  MAX_BULK_OPERATIONS: 50,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  AUTO_SAVE_INTERVAL: 30000 // 30 seconds
} as const

// Error types
export class QuizDataError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'QuizDataError'
  }
}

// Utility functions for localStorage operations
class QuizDataManager {
  private static instance: QuizDataManager
  private autoSaveTimer: NodeJS.Timeout | null = null

  static getInstance(): QuizDataManager {
    if (!QuizDataManager.instance) {
      QuizDataManager.instance = new QuizDataManager()
    }
    return QuizDataManager.instance
  }

  // Safe localStorage operations with error handling
  private safeGetItem(key: string): string | null {
    // Return null if not on client side
    if (typeof window === 'undefined') {
      return null
    }

    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error)
      return null
    }
  }

  private safeSetItem(key: string, value: string): boolean {
    // Return false if not on client side
    if (typeof window === 'undefined') {
      return false
    }

    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error)
      if (error instanceof DOMException && error.code === 22) {
        throw new QuizDataError('Storage quota exceeded. Please clear some data.', 'QUOTA_EXCEEDED')
      }
      return false
    }
  }

  // Question CRUD operations
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

  // Get questions with filtering support
  getFilteredQuestions(filters?: {
    category?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    type?: 'regular' | 'bonus'
    section?: 'onboarding' | 'homepage' | 'category' | 'general'
    subcategory?: string
    tags?: string[]
  }): QuizQuestion[] {
    const questions = this.getQuestions()

    if (!filters) return questions

    return questions.filter(question => {
      if (filters.category && question.category !== filters.category) return false
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false
      if (filters.type && question.type !== filters.type) return false
      if (filters.section && question.section !== filters.section) return false
      if (filters.subcategory && question.subcategory !== filters.subcategory) return false
      if (filters.tags && !filters.tags.some(tag => question.tags?.includes(tag))) return false
      return true
    })
  }

  // Get questions by section
  getQuestionsBySection(section: 'onboarding' | 'homepage' | 'category' | 'general'): QuizQuestion[] {
    return this.getFilteredQuestions({ section })
  }

  // Get questions by category and section
  getQuestionsByCategoryAndSection(category: string, section?: 'onboarding' | 'homepage' | 'category' | 'general'): QuizQuestion[] {
    return this.getFilteredQuestions({ category, section })
  }

  saveQuestion(question: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>): QuizQuestion {
    this.validateQuestion(question)
    
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
    
    this.validateQuestion(updatedQuestion)
    questions[index] = updatedQuestion
    this.saveQuestions(questions)
    return updatedQuestion
  }

  deleteQuestion(id: string): boolean {
    const questions = this.getQuestions()
    const filteredQuestions = questions.filter(q => q.id !== id)
    
    if (filteredQuestions.length === questions.length) {
      throw new QuizDataError(`Question with id ${id} not found`, 'NOT_FOUND')
    }
    
    this.saveQuestions(filteredQuestions)
    return true
  }

  bulkDelete(ids: string[]): BulkOperationResult {
    if (ids.length > VALIDATION_RULES.MAX_BULK_OPERATIONS) {
      throw new QuizDataError(
        `Cannot delete more than ${VALIDATION_RULES.MAX_BULK_OPERATIONS} questions at once`,
        'BULK_LIMIT_EXCEEDED'
      )
    }

    const questions = this.getQuestions()
    const initialCount = questions.length
    const filteredQuestions = questions.filter(q => !ids.includes(q.id))
    const deletedCount = initialCount - filteredQuestions.length
    
    this.saveQuestions(filteredQuestions)
    
    return {
      success: true,
      processedCount: deletedCount,
      errorCount: ids.length - deletedCount,
      errors: ids.length > deletedCount ? ['Some questions were not found'] : []
    }
  }

  // Search and filter operations
  searchQuestions(filters: SearchFilters): QuizQuestion[] {
    const questions = this.getQuestions()
    
    if (!filters || Object.keys(filters).length === 0) {
      return questions
    }
    
    return questions.filter(question => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase()
        const matchesQuestion = question.question.toLowerCase().includes(query)
        const matchesOptions = question.options.some(option => 
          option.toLowerCase().includes(query)
        )
        const matchesCategory = question.category.toLowerCase().includes(query)
        const matchesSubcategory = question.subcategory.toLowerCase().includes(query)
        const matchesTags = question.tags?.some(tag => 
          tag.toLowerCase().includes(query)
        )
        
        if (!matchesQuestion && !matchesOptions && !matchesCategory && 
            !matchesSubcategory && !matchesTags) {
          return false
        }
      }
      
      // Category filter
      if (filters.category && question.category !== filters.category) {
        return false
      }
      
      // Difficulty filter
      if (filters.difficulty && question.difficulty !== filters.difficulty) {
        return false
      }
      
      // Type filter
      if (filters.type && question.type !== filters.type) {
        return false
      }
      
      // Section filter
      if (filters.section && question.section !== filters.section) {
        return false
      }
      
      // Subcategory filter
      if (filters.subcategory && question.subcategory !== filters.subcategory) {
        return false
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          question.tags?.includes(tag)
        )
        if (!hasMatchingTag) {
          return false
        }
      }
      
      return true
    }).sort((a, b) => {
      // Sorting
      switch (filters.sortBy) {
        case 'createdAt':
          return filters.sortOrder === 'desc' 
            ? (b.createdAt || 0) - (a.createdAt || 0)
            : (a.createdAt || 0) - (b.createdAt || 0)
        case 'updatedAt':
          return filters.sortOrder === 'desc' 
            ? (b.updatedAt || 0) - (a.updatedAt || 0)
            : (a.updatedAt || 0) - (b.updatedAt || 0)
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
          return filters.sortOrder === 'desc' 
            ? (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0)
            : (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0)
        default:
          return 0
      }
    })
  }

  // Import questions from JSON
  importQuestions(jsonData: string): BulkOperationResult {
    try {
      const parsedData = JSON.parse(jsonData)
      const questions: QuizQuestion[] = Array.isArray(parsedData) ? parsedData : [parsedData]
      
      if (questions.length > VALIDATION_RULES.MAX_BULK_OPERATIONS) {
        throw new QuizDataError(
          `Cannot import more than ${VALIDATION_RULES.MAX_BULK_OPERATIONS} questions at once`,
          'BULK_LIMIT_EXCEEDED'
        )
      }
      
      // Validate each question
      questions.forEach(question => this.validateQuestion(question))
      
      // Save to localStorage
      const existingQuestions = this.getQuestions()
      const allQuestions = [...existingQuestions, ...questions.map(q => ({
        ...q,
        id: q.id || this.generateId(),
        createdAt: q.createdAt || Date.now(),
        updatedAt: q.updatedAt || Date.now()
      }))]
      
      this.saveQuestions(allQuestions)
      
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

  // Export questions to JSON
  exportQuestions(filters?: SearchFilters): string {
    const questions = filters 
      ? this.searchQuestions(filters)
      : this.getQuestions()
    
    return JSON.stringify(questions, null, 2)
  }

  // Validation methods
  private validateQuestion(question: any): void {
    if (!question.question || question.question.length < VALIDATION_RULES.QUESTION_MIN_LENGTH) {
      throw new QuizDataError(
        `Question must be at least ${VALIDATION_RULES.QUESTION_MIN_LENGTH} characters long`,
        'INVALID_QUESTION'
      )
    }
    
    if (question.question.length > VALIDATION_RULES.QUESTION_MAX_LENGTH) {
      throw new QuizDataError(
        `Question must be no more than ${VALIDATION_RULES.QUESTION_MAX_LENGTH} characters long`,
        'INVALID_QUESTION'
      )
    }
    
    if (!Array.isArray(question.options) || 
        question.options.length < VALIDATION_RULES.MIN_OPTIONS ||
        question.options.length > VALIDATION_RULES.MAX_OPTIONS) {
      throw new QuizDataError(
        `Question must have exactly ${VALIDATION_RULES.MIN_OPTIONS} options`,
        'INVALID_OPTIONS'
      )
    }
    
    question.options.forEach((option: string, index: number) => {
      if (!option || option.length < VALIDATION_RULES.OPTION_MIN_LENGTH) {
        throw new QuizDataError(
          `Option ${index + 1} must be at least ${VALIDATION_RULES.OPTION_MIN_LENGTH} characters long`,
          'INVALID_OPTION'
        )
      }
      
      if (option.length > VALIDATION_RULES.OPTION_MAX_LENGTH) {
        throw new QuizDataError(
          `Option ${index + 1} must be no more than ${VALIDATION_RULES.OPTION_MAX_LENGTH} characters long`,
          'INVALID_OPTION'
        )
      }
    })
    
    if (typeof question.correct_answer !== 'number' || 
        question.correct_answer < 0 || 
        question.correct_answer >= question.options.length) {
      throw new QuizDataError(
        `Correct answer index must be between 0 and ${question.options.length - 1}`,
        'INVALID_CORRECT_ANSWER'
      )
    }
    
    if (!question.difficulty || !['beginner', 'intermediate', 'advanced'].includes(question.difficulty)) {
      throw new QuizDataError(
        'Question must have a valid difficulty level (beginner, intermediate, or advanced)',
        'INVALID_DIFFICULTY'
      )
    }
    
    if (!question.category) {
      throw new QuizDataError(
        'Question must have a category',
        'INVALID_CATEGORY'
      )
    }
    
    if (!question.subcategory) {
      throw new QuizDataError(
        'Question must have a subcategory',
        'INVALID_SUBCATEGORY'
      )
    }
  }

  // Helper methods
  private saveQuestions(questions: QuizQuestion[]): void {
    this.safeSetItem(QUIZ_STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Initialize with sample data if no data exists
  private initializeWithSampleData(): QuizQuestion[] {
    const sampleQuestions: QuizQuestion[] = [
      {
        id: 'sample-1',
        question: 'Which social media platform is known for short-form videos?',
        options: ['Instagram', 'TikTok', 'Twitter', 'Snapchat'],
        correct_answer: 1,
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
        correct_answer: 0,
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
        correct_answer: 2,
        difficulty: 'beginner',
        fun_fact: 'The first iPhone was released in 2007!',
        category: 'technology',
        subcategory: 'Companies',
        section: 'homepage',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]
    
    this.saveQuestions(sampleQuestions)
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