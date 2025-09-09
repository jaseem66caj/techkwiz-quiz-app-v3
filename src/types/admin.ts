// Admin types file to resolve import errors

// Import unified QuizQuestion interface
export type { QuizQuestion } from './quiz';

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

// Quiz Question Types - Import from unified types
// Note: QuizQuestion interface moved to src/types/quiz.ts for consistency
// This ensures all components use the same interface definition

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

// Question Draft - Updated to use unified interface format
export interface QuestionDraft {
  id: string;
  question: string;
  options: string[];
  correct_answer: number; // Changed from correctAnswer to match unified interface
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  fun_fact: string; // Changed from funFact to match unified interface
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