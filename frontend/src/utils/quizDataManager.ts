import { 
  QuizQuestion, 
  QuizCategory, 
  SearchFilters, 
  BulkOperationResult, 
  QuestionDraft,
  QuizManagementSettings,
  QUIZ_STORAGE_KEYS,
  DEFAULT_CATEGORIES 
} from '@/types/admin'

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
    
    return questions.filter(question => {
      // Text search
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        if (!question.question.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      // Category filter
      if (filters.category !== 'all' && question.category !== filters.category) {
        return false
      }
      
      // Difficulty filter
      if (filters.difficulty !== 'all' && question.difficulty !== filters.difficulty) {
        return false
      }
      
      // Type filter
      if (filters.type !== 'all' && question.type !== filters.type) {
        return false
      }

      // Section filter
      if (filters.section !== 'all' && question.section !== filters.section) {
        return false
      }

      // Subcategory filter
      if (filters.subcategory !== 'all' && question.subcategory !== filters.subcategory) {
        return false
      }

      return true
    })
  }

  // Categories management
  getCategories(): QuizCategory[] {
    const questions = this.getQuestions()
    const categoryCounts = questions.reduce((acc, question) => {
      acc[question.category] = (acc[question.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return DEFAULT_CATEGORIES.map(category => ({
      ...category,
      questionCount: categoryCounts[category.id] || 0
    }))
  }

  // Draft management
  saveDraft(draft: QuestionDraft): void {
    const drafts = this.getDrafts()
    const existingIndex = drafts.findIndex(d => d.id === draft.id)
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...draft, lastSaved: Date.now() }
    } else {
      drafts.push({ ...draft, lastSaved: Date.now() })
    }
    
    this.safeSetItem(QUIZ_STORAGE_KEYS.DRAFTS, JSON.stringify(drafts))
  }

  getDrafts(): QuestionDraft[] {
    const data = this.safeGetItem(QUIZ_STORAGE_KEYS.DRAFTS)
    if (!data) return []
    
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Error parsing drafts data:', error)
      return []
    }
  }

  deleteDraft(id: string): void {
    const drafts = this.getDrafts().filter(d => d.id !== id)
    this.safeSetItem(QUIZ_STORAGE_KEYS.DRAFTS, JSON.stringify(drafts))
  }

  // Settings management
  getSettings(): QuizManagementSettings {
    const data = this.safeGetItem(QUIZ_STORAGE_KEYS.SETTINGS)
    if (!data) return this.getDefaultSettings()
    
    try {
      return { ...this.getDefaultSettings(), ...JSON.parse(data) }
    } catch (error) {
      console.error('Error parsing settings data:', error)
      return this.getDefaultSettings()
    }
  }

  saveSettings(settings: Partial<QuizManagementSettings>): void {
    const currentSettings = this.getSettings()
    const updatedSettings = { ...currentSettings, ...settings }
    this.safeSetItem(QUIZ_STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings))
  }

  private getDefaultSettings(): QuizManagementSettings {
    return {
      pageSize: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      filters: {
        searchText: '',
        category: 'all',
        difficulty: 'all',
        type: 'all',
        section: 'all',
        subcategory: 'all'
      },
      selectedQuestions: []
    }
  }

  // Validation
  private validateQuestion(question: Partial<QuizQuestion>): void {
    if (!question.question || question.question.length < VALIDATION_RULES.QUESTION_MIN_LENGTH) {
      throw new QuizDataError(
        `Question must be at least ${VALIDATION_RULES.QUESTION_MIN_LENGTH} characters long`,
        'INVALID_QUESTION_LENGTH'
      )
    }
    
    if (question.question.length > VALIDATION_RULES.QUESTION_MAX_LENGTH) {
      throw new QuizDataError(
        `Question must be no more than ${VALIDATION_RULES.QUESTION_MAX_LENGTH} characters long`,
        'INVALID_QUESTION_LENGTH'
      )
    }
    
    if (!question.options || question.options.length !== VALIDATION_RULES.MIN_OPTIONS) {
      throw new QuizDataError(
        `Question must have exactly ${VALIDATION_RULES.MIN_OPTIONS} options`,
        'INVALID_OPTIONS_COUNT'
      )
    }
    
    // Validate each option
    question.options.forEach((option, index) => {
      if (!option || option.length < VALIDATION_RULES.OPTION_MIN_LENGTH) {
        throw new QuizDataError(
          `Option ${index + 1} must be at least ${VALIDATION_RULES.OPTION_MIN_LENGTH} character long`,
          'INVALID_OPTION_LENGTH'
        )
      }
      
      if (option.length > VALIDATION_RULES.OPTION_MAX_LENGTH) {
        throw new QuizDataError(
          `Option ${index + 1} must be no more than ${VALIDATION_RULES.OPTION_MAX_LENGTH} characters long`,
          'INVALID_OPTION_LENGTH'
        )
      }
    })
    
    // Check for duplicate options
    const uniqueOptions = new Set(question.options.map(opt => opt.toLowerCase().trim()))
    if (uniqueOptions.size !== question.options.length) {
      throw new QuizDataError('All options must be unique', 'DUPLICATE_OPTIONS')
    }
    
    // Validate correct answer
    if (typeof question.correctAnswer !== 'number' || 
        question.correctAnswer < 0 || 
        question.correctAnswer >= question.options.length) {
      throw new QuizDataError('Invalid correct answer selection', 'INVALID_CORRECT_ANSWER')
    }
    
    // Validate category
    const validCategories = DEFAULT_CATEGORIES.map(c => c.id)
    if (!question.category || !validCategories.includes(question.category)) {
      throw new QuizDataError('Invalid category selection', 'INVALID_CATEGORY')
    }
  }

  // Utility methods
  private saveQuestions(questions: QuizQuestion[]): void {
    this.safeSetItem(QUIZ_STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
  }

  private generateId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // CSV Export/Import functionality
  exportToCSV(questions?: QuizQuestion[]): string {
    const questionsToExport = questions || this.getQuestions()

    const headers = [
      'ID', 'Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4',
      'Correct Answer', 'Category', 'Difficulty', 'Type', 'Fun Fact', 'Tags',
      'Created At', 'Updated At'
    ]

    const csvRows = [
      headers.join(','),
      ...questionsToExport.map(q => [
        q.id,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.options[0].replace(/"/g, '""')}"`,
        `"${q.options[1].replace(/"/g, '""')}"`,
        `"${q.options[2].replace(/"/g, '""')}"`,
        `"${q.options[3].replace(/"/g, '""')}"`,
        q.correctAnswer + 1, // 1-based for human readability
        q.category,
        q.difficulty,
        q.type,
        `"${(q.funFact || '').replace(/"/g, '""')}"`,
        `"${(q.tags || []).join(';')}"`,
        new Date(q.createdAt).toISOString(),
        new Date(q.updatedAt).toISOString()
      ].join(','))
    ]

    // Add UTF-8 BOM for Excel compatibility
    return '\uFEFF' + csvRows.join('\n')
  }

  async importFromCSV(csvContent: string): Promise<BulkOperationResult> {
    const lines = csvContent.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new QuizDataError('CSV file must contain at least a header and one data row', 'INVALID_CSV_FORMAT')
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const dataLines = lines.slice(1)

    const results: BulkOperationResult = {
      success: true,
      processedCount: 0,
      errorCount: 0,
      errors: []
    }

    const validQuestions: QuizQuestion[] = []
    const existingQuestions = this.getQuestions()

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = this.parseCSVLine(dataLines[i])
        if (values.length < 8) {
          results.errors.push(`Line ${i + 2}: Insufficient data columns`)
          results.errorCount++
          continue
        }

        const question: QuizQuestion = {
          id: values[0] || this.generateId(),
          question: values[1],
          options: [values[2], values[3], values[4], values[5]],
          correctAnswer: parseInt(values[6]) - 1, // Convert back to 0-based
          category: values[7],
          difficulty: values[8] as 'beginner' | 'intermediate' | 'advanced',
          type: (values[9] || 'regular') as 'regular' | 'bonus',
          funFact: values[10] || undefined,
          tags: values[11] ? values[11].split(';').filter(t => t.trim()) : undefined,
          createdAt: values[12] ? new Date(values[12]).getTime() : Date.now(),
          updatedAt: values[13] ? new Date(values[13]).getTime() : Date.now()
        }

        // Validate the question
        this.validateQuestion(question)

        // Check for duplicates
        const existingIndex = existingQuestions.findIndex(q => q.id === question.id)
        if (existingIndex >= 0) {
          // Update existing question
          existingQuestions[existingIndex] = question
        } else {
          validQuestions.push(question)
        }

        results.processedCount++
      } catch (error) {
        results.errors.push(`Line ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.errorCount++
      }
    }

    // Save all valid questions
    if (validQuestions.length > 0) {
      const allQuestions = [...existingQuestions, ...validQuestions]
      this.saveQuestions(allQuestions)
    }

    results.success = results.errorCount === 0
    return results
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  private initializeWithSampleData(): QuizQuestion[] {
    // Check if we should import existing questions
    if (this.shouldImportExistingQuestions()) {
      return this.importAllExistingQuestions()
    }

    // Initialize with a few sample questions for demonstration
    const sampleQuestions: QuizQuestion[] = [
      {
        id: 'sample_1',
        question: 'Which social media platform is known for its short-form video content and viral dances?',
        options: ['Instagram', 'TikTok', 'Twitter', 'Snapchat'],
        correctAnswer: 1,
        category: 'social-media',
        difficulty: 'beginner',
        type: 'regular',
        section: 'homepage',
        funFact: 'TikTok was originally called Musical.ly before being acquired by ByteDance.',
        tags: ['social-media', 'video', 'viral'],
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 86400000
      }
      // Add more sample questions as needed
    ]

    this.saveQuestions(sampleQuestions)
    return sampleQuestions
  }

  // Check if we should import existing questions
  private shouldImportExistingQuestions(): boolean {
    // Only import if localStorage is empty and we're on client side
    if (typeof window === 'undefined') return false

    const hasImported = this.safeGetItem('quiz_questions_imported')
    return !hasImported
  }

  // Import all existing questions from different sources
  private importAllExistingQuestions(): QuizQuestion[] {
    const allQuestions: QuizQuestion[] = []

    try {
      // Import onboarding questions
      const onboardingQuestions = this.importOnboardingQuestions()
      allQuestions.push(...onboardingQuestions)

      // Import homepage fallback questions
      const homepageQuestions = this.importHomepageQuestions()
      allQuestions.push(...homepageQuestions)

      // Import category questions from quiz database
      const categoryQuestions = this.importCategoryQuestions()
      allQuestions.push(...categoryQuestions)

      console.log(`📊 Imported ${allQuestions.length} questions from existing sources`)

      // Save all imported questions
      this.saveQuestions(allQuestions)

      // Mark as imported
      this.safeSetItem('quiz_questions_imported', 'true')

      return allQuestions
    } catch (error) {
      console.error('Error importing existing questions:', error)
      return []
    }
  }

  // Import methods for existing questions
  private importOnboardingQuestions(): QuizQuestion[] {
    const onboardingQuestions = [
      {
        id: 'onboard-1',
        question: "Which tech company created the iPhone?",
        options: ["Apple 🍎", "Google 🔍", "Samsung 📱", "Microsoft 💻"],
        correctAnswer: 0,
        category: 'technology',
        difficulty: 'beginner' as const,
        type: 'regular' as const,
        section: 'onboarding' as const,
        rewardCoins: 150,
        funFact: "The first iPhone was released on June 29, 2007, revolutionizing the smartphone industry.",
        tags: ['technology', 'apple', 'smartphone'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'onboard-2',
        question: "What does 'WWW' stand for?",
        options: ["World Wide Web 🌐", "World Web Works 🔧", "Web World Wide 🌍", "Wide World Web 📡"],
        correctAnswer: 0,
        category: 'technology',
        difficulty: 'beginner' as const,
        type: 'regular' as const,
        section: 'onboarding' as const,
        rewardCoins: 150,
        funFact: "The World Wide Web was invented by Tim Berners-Lee in 1989 while working at CERN.",
        tags: ['technology', 'internet', 'web'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    return onboardingQuestions
  }

  private importHomepageQuestions(): QuizQuestion[] {
    const homepageQuestions = [
      {
        id: 'homepage-1',
        question: "Which social media platform is known for short-form videos?",
        options: ["Instagram", "TikTok", "Twitter", "Snapchat"],
        correctAnswer: 1,
        category: 'social-media',
        difficulty: 'beginner' as const,
        type: 'regular' as const,
        section: 'homepage' as const,
        funFact: "TikTok was originally called Musical.ly!",
        tags: ['social-media', 'video', 'apps'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'homepage-2',
        question: "What does 'AI' stand for?",
        options: ["Artificial Intelligence", "Automated Internet", "Advanced Interface", "Algorithmic Integration"],
        correctAnswer: 0,
        category: 'technology',
        difficulty: 'beginner' as const,
        type: 'regular' as const,
        section: 'homepage' as const,
        funFact: "The term 'Artificial Intelligence' was first coined in 1956!",
        tags: ['technology', 'ai', 'computing'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'homepage-3',
        question: "Which company created the iPhone?",
        options: ["Google", "Samsung", "Apple", "Microsoft"],
        correctAnswer: 2,
        category: 'technology',
        difficulty: 'beginner' as const,
        type: 'regular' as const,
        section: 'homepage' as const,
        funFact: "The first iPhone was released in 2007!",
        tags: ['technology', 'apple', 'smartphone'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    return homepageQuestions
  }

  private importCategoryQuestions(): QuizQuestion[] {
    // Import a subset of questions from the quiz database
    const categoryQuestions: QuizQuestion[] = []

    try {
      // Sample category questions - in a real implementation, this would import from the actual quiz database
      const sampleCategoryQuestions = [
        {
          id: 'cat-tech-1',
          question: "Which programming language is known for its use in web development and has a coffee-related name?",
          options: ["Python", "Java", "JavaScript", "C++"],
          correctAnswer: 1,
          category: 'technology',
          difficulty: 'intermediate' as const,
          type: 'regular' as const,
          section: 'category' as const,
          subcategory: 'programming',
          funFact: "Java was originally called Oak and was developed by James Gosling at Sun Microsystems.",
          tags: ['programming', 'java', 'development'],
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: 'cat-social-1',
          question: "Which social media platform was originally called 'The Facebook'?",
          options: ["Instagram", "Twitter", "Facebook", "LinkedIn"],
          correctAnswer: 2,
          category: 'social-media',
          difficulty: 'beginner' as const,
          type: 'regular' as const,
          section: 'category' as const,
          subcategory: 'history',
          funFact: "Facebook was founded by Mark Zuckerberg in 2004 while he was a student at Harvard University.",
          tags: ['social-media', 'facebook', 'history'],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]

      categoryQuestions.push(...sampleCategoryQuestions)
    } catch (error) {
      console.error('Error importing category questions:', error)
    }

    return categoryQuestions
  }

  // Force reimport of all questions (for admin use)
  forceReimportQuestions(): BulkOperationResult {
    try {
      // Clear the import flag
      this.safeSetItem('quiz_questions_imported', '')

      // Clear existing questions
      this.safeSetItem(QUIZ_STORAGE_KEYS.QUESTIONS, '')

      // Import all questions
      const importedQuestions = this.importAllExistingQuestions()

      return {
        success: true,
        processedCount: importedQuestions.length,
        errorCount: 0,
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : 'Import failed']
      }
    }
  }

  // Backup and restore functionality
  createBackup(): string {
    const backup = {
      questions: this.getQuestions(),
      settings: this.getSettings(),
      drafts: this.getDrafts(),
      timestamp: Date.now(),
      version: '1.0'
    }

    return JSON.stringify(backup, null, 2)
  }

  restoreFromBackup(backupData: string): BulkOperationResult {
    try {
      const backup = JSON.parse(backupData)

      if (!backup.questions || !Array.isArray(backup.questions)) {
        throw new QuizDataError('Invalid backup format: missing questions array', 'INVALID_BACKUP')
      }

      // Validate all questions in backup
      backup.questions.forEach((q: any, index: number) => {
        try {
          this.validateQuestion(q)
        } catch (error) {
          throw new QuizDataError(
            `Invalid question at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'INVALID_BACKUP_QUESTION'
          )
        }
      })

      // Create current backup before restore
      const currentBackup = this.createBackup()
      this.safeSetItem(QUIZ_STORAGE_KEYS.BACKUP, currentBackup)

      // Restore data
      this.saveQuestions(backup.questions)
      if (backup.settings) {
        this.safeSetItem(QUIZ_STORAGE_KEYS.SETTINGS, JSON.stringify(backup.settings))
      }
      if (backup.drafts) {
        this.safeSetItem(QUIZ_STORAGE_KEYS.DRAFTS, JSON.stringify(backup.drafts))
      }

      return {
        success: true,
        processedCount: backup.questions.length,
        errorCount: 0,
        errors: []
      }
    } catch (error) {
      throw new QuizDataError(
        `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESTORE_FAILED'
      )
    }
  }

  // Auto-save functionality for drafts
  startAutoSave(draftId: string, getDraftData: () => Partial<QuestionDraft>): void {
    this.stopAutoSave()

    this.autoSaveTimer = setInterval(() => {
      try {
        const draftData = getDraftData()
        if (draftData.question && draftData.question.length > 0) {
          const draft: QuestionDraft = {
            id: draftId,
            question: draftData.question || '',
            options: draftData.options || ['', '', '', ''],
            correctAnswer: draftData.correctAnswer || 0,
            category: draftData.category || 'facts',
            difficulty: draftData.difficulty || 'beginner',
            type: draftData.type || 'regular',
            funFact: draftData.funFact,
            tags: draftData.tags,
            lastSaved: Date.now()
          }

          this.saveDraft(draft)
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, VALIDATION_RULES.AUTO_SAVE_INTERVAL)
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
  }

  // CSV Export functionality
  exportToCSV(questionsToExport?: QuizQuestion[]): string {
    const questions = questionsToExport || this.getQuestions()
    const headers = [
      'ID',
      'Question',
      'Option 1',
      'Option 2',
      'Option 3',
      'Option 4',
      'Correct Answer (1-4)',
      'Category',
      'Difficulty',
      'Type',
      'Fun Fact',
      'Tags',
      'Created At',
      'Updated At'
    ]

    const csvRows = [headers.join(',')]

    questions.forEach(question => {
      const row = [
        question.id,
        `"${question.question.replace(/"/g, '""')}"`, // Escape quotes
        `"${question.options[0]?.replace(/"/g, '""') || ''}"`,
        `"${question.options[1]?.replace(/"/g, '""') || ''}"`,
        `"${question.options[2]?.replace(/"/g, '""') || ''}"`,
        `"${question.options[3]?.replace(/"/g, '""') || ''}"`,
        question.correctAnswer + 1, // Convert 0-based to 1-based
        question.category,
        question.difficulty,
        question.type,
        `"${(question.funFact || '').replace(/"/g, '""')}"`,
        `"${(question.tags || []).join(';')}"`,
        new Date(question.createdAt).toISOString(),
        new Date(question.updatedAt).toISOString()
      ]
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  // Download CSV file
  downloadCSV(): void {
    try {
      const csvContent = this.exportToCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `techkwiz-questions-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      throw new QuizDataError('Failed to download CSV file', 'EXPORT_ERROR')
    }
  }

  // Parse CSV content
  parseCSV(csvContent: string): { questions: Partial<QuizQuestion>[]; errors: string[] } {
    const lines = csvContent.split('\n').filter(line => line.trim())
    const errors: string[] = []
    const questions: Partial<QuizQuestion>[] = []

    if (lines.length < 2) {
      errors.push('CSV file must contain at least a header row and one data row')
      return { questions, errors }
    }

    // Skip header row
    const dataLines = lines.slice(1)

    dataLines.forEach((line, index) => {
      try {
        const values = this.parseCSVLine(line)

        if (values.length < 8) {
          errors.push(`Row ${index + 2}: Insufficient columns (minimum 8 required)`)
          return
        }

        const [id, question, opt1, opt2, opt3, opt4, correctAnswer, category, difficulty, type, funFact, tags, createdAt, updatedAt] = values

        // Validate required fields
        if (!question?.trim()) {
          errors.push(`Row ${index + 2}: Question is required`)
          return
        }

        if (!opt1?.trim() || !opt2?.trim() || !opt3?.trim() || !opt4?.trim()) {
          errors.push(`Row ${index + 2}: All 4 options are required`)
          return
        }

        const correctAnswerNum = parseInt(correctAnswer) - 1 // Convert 1-based to 0-based
        if (isNaN(correctAnswerNum) || correctAnswerNum < 0 || correctAnswerNum > 3) {
          errors.push(`Row ${index + 2}: Correct answer must be 1, 2, 3, or 4`)
          return
        }

        if (!category?.trim()) {
          errors.push(`Row ${index + 2}: Category is required`)
          return
        }

        if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
          errors.push(`Row ${index + 2}: Difficulty must be 'beginner', 'intermediate', or 'advanced'`)
          return
        }

        if (!['regular', 'bonus'].includes(type)) {
          errors.push(`Row ${index + 2}: Type must be 'regular' or 'bonus'`)
          return
        }

        const questionData: Partial<QuizQuestion> = {
          id: id || `imported_${Date.now()}_${index}`,
          question: question.trim(),
          options: [opt1.trim(), opt2.trim(), opt3.trim(), opt4.trim()],
          correctAnswer: correctAnswerNum,
          category: category.trim(),
          difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
          type: type as 'regular' | 'bonus',
          funFact: funFact?.trim() || undefined,
          tags: tags ? tags.split(';').map(tag => tag.trim()).filter(Boolean) : [],
          createdAt: createdAt ? new Date(createdAt).getTime() : Date.now(),
          updatedAt: updatedAt ? new Date(updatedAt).getTime() : Date.now()
        }

        questions.push(questionData)
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Parse error'}`)
      }
    })

    return { questions, errors }
  }

  // Helper to parse CSV line with proper quote handling
  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current)
        current = ''
        i++
      } else {
        current += char
        i++
      }
    }

    result.push(current) // Add last field
    return result
  }

  // Import from CSV
  importFromCSV(csvContent: string): BulkOperationResult {
    try {
      const { questions, errors } = this.parseCSV(csvContent)

      if (errors.length > 0) {
        return {
          success: false,
          processedCount: 0,
          errorCount: errors.length,
          errors
        }
      }

      let successCount = 0
      const importErrors: string[] = []

      questions.forEach((questionData, index) => {
        try {
          const fullQuestion: QuizQuestion = {
            id: questionData.id!,
            question: questionData.question!,
            options: questionData.options!,
            correctAnswer: questionData.correctAnswer!,
            category: questionData.category!,
            difficulty: questionData.difficulty!,
            type: questionData.type!,
            funFact: questionData.funFact,
            tags: questionData.tags || [],
            createdAt: questionData.createdAt!,
            updatedAt: questionData.updatedAt!
          }

          // Validate the complete question
          const validation = this.validateQuestion(fullQuestion)
          if (!validation.isValid) {
            importErrors.push(`Question ${index + 1}: ${validation.errors.join(', ')}`)
            return
          }

          this.saveQuestion(fullQuestion)
          successCount++
        } catch (error) {
          importErrors.push(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Save error'}`)
        }
      })

      return {
        success: importErrors.length === 0,
        processedCount: successCount,
        errorCount: importErrors.length,
        errors: importErrors
      }
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : 'Import failed']
      }
    }
  }
}

// Export singleton instance
export const quizDataManager = QuizDataManager.getInstance()
