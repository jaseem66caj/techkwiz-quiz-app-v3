// ===================================================================
// TechKwiz Quiz Type Definitions
// ===================================================================
// This file contains TypeScript interface definitions for all quiz-related
// data structures used throughout the TechKwiz application. These types
// ensure type safety and provide clear documentation for quiz data models.

// Interface defining the structure of a quiz question
export interface QuizQuestion {
  // Unique identifier for the question
  id: string
  // The question text to display to users
  question: string
  // Array of answer options (typically 4 options)
  options: string[]
  // Index of the correct answer in the options array (-1 for personality questions)
  correct_answer: number
  // Difficulty level of the question (beginner, intermediate, advanced)
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  // Optional question type for special rendering (e.g., 'this_or_that', 'emoji_decode')
  question_type?: string
  // Educational fun fact related to the question content
  fun_fact: string
  // Category identifier this question belongs to
  category: string
  // Subcategory within the main category for more granular organization
  subcategory: string
  // Optional emoji clue for emoji decode questions
  emoji_clue?: string
  // Optional visual elements for "This or That" questions
  visual_options?: string[]
  // Optional personality trait for personality questions
  personality_trait?: string
  // Optional year for prediction questions
  prediction_year?: string
  // Section where this question appears (onboarding, homepage, etc.)
  section?: 'onboarding' | 'homepage' | 'category' | 'general'
  // Optional tags for categorization and filtering
  tags?: string[]
  // Question type classification (regular question or bonus question)
  type?: 'regular' | 'bonus'
  // Timestamp when question was created
  createdAt?: number
  // Timestamp when question was last updated
  updatedAt?: number
}

// Interface defining the structure of a quiz category
export interface QuizCategory {
  // Unique identifier for the category
  id: string
  // Display name of the category
  name: string
  // Brief description of what the category covers
  description: string
  // Emoji icon representing the category
  icon: string
  // CSS class for visual styling (typically a color class)
  color: string
  // Number of questions in this category
  questionCount: number
  // Array of difficulty levels available in this category
  difficultyLevels: ('beginner' | 'intermediate' | 'advanced')[]
  // Timestamp when category was created
  createdAt: number
  // Timestamp when category was last updated
  updatedAt: number
}

// Interface defining search filter options for finding questions
export interface SearchFilters {
  // Text to search for in questions, options, or fun facts
  query?: string
  // Category identifier to filter by
  category?: string
  // Difficulty level to filter by
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  // Question type to filter by (regular or bonus)
  type?: 'regular' | 'bonus'
  // Section to filter by (onboarding, homepage, etc.)
  section?: 'onboarding' | 'homepage' | 'category' | 'general'
  // Subcategory to filter by
  subcategory?: string
  // Tags to filter by
  tags?: string[]
  // Field to sort results by
  sortBy?: 'createdAt' | 'updatedAt' | 'difficulty'
  // Sort order (ascending or descending)
  sortOrder?: 'asc' | 'desc'
}

// Interface defining the result structure for bulk operations
export interface BulkOperationResult {
  // Whether the operation was successful overall
  success: boolean
  // Number of items successfully processed
  processedCount: number
  // Number of items that encountered errors
  errorCount: number
  // Array of error messages for failed operations
  errors: string[]
}

// Interface defining the structure of a question draft
export interface QuestionDraft {
  // Unique identifier for the draft
  id: string
  // The question text being drafted
  question: string
  // Array of answer options being drafted
  options: string[]
  // Index of the correct answer in the options array
  correctAnswer: number
  // Difficulty level of the question being drafted
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  // Educational fun fact being drafted
  funFact: string
  // Category identifier for the draft
  category: string
  // Subcategory for the draft
  subcategory: string
  // Section where this draft question will appear
  section?: 'onboarding' | 'homepage' | 'category' | 'general'
  // Tags for the draft question
  tags?: string[]
  // Timestamp when draft was created
  createdAt: number
  // Timestamp when draft was last updated
  updatedAt: number
}

// Interface defining quiz management settings
export interface QuizManagementSettings {
  // Whether automatic saving is enabled
  autoSaveEnabled: boolean
  // Interval in milliseconds for automatic saving
  autoSaveInterval: number
  // Maximum number of items allowed in bulk operations
  maxBulkOperations: number
  // Maximum file size allowed for imports in bytes
  maxFileSize: number
}

// ===================================================================
// Quiz Storage Constants
// ===================================================================
// Constants defining localStorage keys used for quiz data persistence

// Object containing all localStorage keys used by the quiz system
export const QUIZ_STORAGE_KEYS = {
  // Key for storing quiz questions
  QUESTIONS: 'admin_quiz_questions',
  // Key for storing quiz categories
  CATEGORIES: 'admin_quiz_categories',
  // Key for storing quiz management settings
  SETTINGS: 'admin_quiz_settings',
  // Key for storing question drafts
  DRAFTS: 'admin_quiz_drafts',
  // Key for storing backup data
  BACKUP: 'admin_quiz_backup'
} as const

// ===================================================================
// Default Category Definitions
// ===================================================================
// Predefined default categories to initialize the quiz system

// Array of default categories with their properties
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