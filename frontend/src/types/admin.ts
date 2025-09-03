// Admin types file to resolve import errors

// System Settings Types
export interface SystemSettings {
  id: string;
  name: string;
  version: string;
  googleAnalytics?: GoogleAnalyticsConfig;
  updatedAt: number;
}

// Google Analytics Configuration
export interface GoogleAnalyticsConfig {
  enabled: boolean;
  trackingId: string;
  measurementId?: string;
  anonymizeIp: boolean;
  trackPageViews: boolean;
  trackEvents: boolean;
  customCode?: string;
}

// Quiz Question Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  funFact: string;
  category: string;
  subcategory: string;
  section?: 'onboarding' | 'homepage' | 'category' | 'general';
  tags?: string[];
  type?: 'regular' | 'bonus';
  createdAt?: number;
  updatedAt?: number;
}

// Quiz Category Types
export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionCount: number;
  difficultyLevels: ('beginner' | 'intermediate' | 'advanced')[];
  createdAt: number;
  updatedAt: number;
}

// Search Filters
export interface SearchFilters {
  query?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  type?: 'regular' | 'bonus';
  section?: 'onboarding' | 'homepage' | 'category' | 'general';
  subcategory?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

// Bulk Operation Result
export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  errorCount: number;
  errors: string[];
}

// Question Draft
export interface QuestionDraft {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  funFact: string;
  category: string;
  subcategory: string;
  section?: 'onboarding' | 'homepage' | 'category' | 'general';
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// Quiz Management Settings
export interface QuizManagementSettings {
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  maxBulkOperations: number;
  maxFileSize: number;
}

// Storage Keys
export const ADMIN_STORAGE_KEYS = {
  QUESTIONS: 'admin_quiz_questions',
  CATEGORIES: 'admin_quiz_categories',
  SETTINGS: 'admin_quiz_settings',
  DRAFTS: 'admin_quiz_drafts',
  BACKUP: 'admin_quiz_backup'
} as const;

// Default Categories
export const DEFAULT_ADMIN_CATEGORIES = [
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
] as const;

const adminTypes = {}
export default adminTypes