// Quiz question interface
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  question_type?: string
  fun_fact: string
  category: string
  subcategory: string
  emoji_clue?: string
  visual_options?: string[]
  personality_trait?: string
  prediction_year?: string
  section?: 'onboarding' | 'homepage' | 'category' | 'general'
  tags?: string[]
  type?: 'regular' | 'bonus'
  createdAt?: number
  updatedAt?: number
}

// Quiz category interface
export interface QuizCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  questionCount: number
  difficultyLevels: ('beginner' | 'intermediate' | 'advanced')[]
  createdAt: number
  updatedAt: number
}

// Search filters interface
export interface SearchFilters {
  query?: string
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  type?: 'regular' | 'bonus'
  section?: 'onboarding' | 'homepage' | 'category' | 'general'
  subcategory?: string
  tags?: string[]
  sortBy?: 'createdAt' | 'updatedAt' | 'difficulty'
  sortOrder?: 'asc' | 'desc'
}

// Bulk operation result interface
export interface BulkOperationResult {
  success: boolean
  processedCount: number
  errorCount: number
  errors: string[]
}

// Question draft interface
export interface QuestionDraft {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  funFact: string
  category: string
  subcategory: string
  section?: 'onboarding' | 'homepage' | 'category' | 'general'
  tags?: string[]
  createdAt: number
  updatedAt: number
}

// Quiz management settings interface
export interface QuizManagementSettings {
  autoSaveEnabled: boolean
  autoSaveInterval: number
  maxBulkOperations: number
  maxFileSize: number
}

// Quiz storage keys
export const QUIZ_STORAGE_KEYS = {
  QUESTIONS: 'admin_quiz_questions',
  CATEGORIES: 'admin_quiz_categories',
  SETTINGS: 'admin_quiz_settings',
  DRAFTS: 'admin_quiz_drafts',
  BACKUP: 'admin_quiz_backup'
} as const

// Default categories
export const DEFAULT_CATEGORIES = [
  {
    id: 'movies',
    name: 'Movies',
    description: 'Test your knowledge of movies and cinema',
    icon: '🎬',
    color: 'bg-blue-500',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'] as const
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'How well do you know social media platforms?',
    icon: '📱',
    color: 'bg-purple-500',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'] as const
  },
  {
    id: 'influencers',
    name: 'Influencers',
    description: 'Test your knowledge of popular influencers',
    icon: '🌟',
    color: 'bg-pink-500',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'] as const
  }
] as const