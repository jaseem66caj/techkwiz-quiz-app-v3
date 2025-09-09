// ===================================================================
// Quiz Data Migration Utilities
// ===================================================================
// This file contains utilities for migrating quiz data between different
// formats during the refactoring process. It handles conversion between
// camelCase and snake_case property names and validates data integrity.

import { QuizQuestion } from '@/types/quiz'

// Legacy interface format (camelCase) for migration purposes
interface LegacyQuizQuestion {
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

// Data validation error class
export class DataMigrationError extends Error {
  constructor(message: string, public code: string, public data?: any) {
    super(message)
    this.name = 'DataMigrationError'
  }
}

// Validation rules for quiz questions
const VALIDATION_RULES = {
  QUESTION_MIN_LENGTH: 10,
  QUESTION_MAX_LENGTH: 500,
  OPTION_MIN_LENGTH: 1,
  OPTION_MAX_LENGTH: 100,
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  VALID_DIFFICULTIES: ['beginner', 'intermediate', 'advanced'] as const,
  VALID_SECTIONS: ['onboarding', 'homepage', 'category', 'general'] as const,
  VALID_TYPES: ['regular', 'bonus'] as const
}

/**
 * Validates a quiz question object for data integrity
 * @param question - The question object to validate
 * @param strict - Whether to apply strict validation rules
 * @returns Array of validation errors (empty if valid)
 */
export function validateQuizQuestion(question: any, strict: boolean = false): string[] {
  const errors: string[] = []

  // Required field validation
  if (!question.id || typeof question.id !== 'string') {
    errors.push('Question ID is required and must be a string')
  }

  if (!question.question || typeof question.question !== 'string') {
    errors.push('Question text is required and must be a string')
  } else {
    if (question.question.length < VALIDATION_RULES.QUESTION_MIN_LENGTH) {
      errors.push(`Question text must be at least ${VALIDATION_RULES.QUESTION_MIN_LENGTH} characters`)
    }
    if (question.question.length > VALIDATION_RULES.QUESTION_MAX_LENGTH) {
      errors.push(`Question text must not exceed ${VALIDATION_RULES.QUESTION_MAX_LENGTH} characters`)
    }
  }

  if (!Array.isArray(question.options)) {
    errors.push('Options must be an array')
  } else {
    if (question.options.length < VALIDATION_RULES.MIN_OPTIONS) {
      errors.push(`Must have at least ${VALIDATION_RULES.MIN_OPTIONS} options`)
    }
    if (question.options.length > VALIDATION_RULES.MAX_OPTIONS) {
      errors.push(`Must not have more than ${VALIDATION_RULES.MAX_OPTIONS} options`)
    }
    
    question.options.forEach((option: any, index: number) => {
      if (typeof option !== 'string') {
        errors.push(`Option ${index + 1} must be a string`)
      } else {
        if (option.length < VALIDATION_RULES.OPTION_MIN_LENGTH) {
          errors.push(`Option ${index + 1} must not be empty`)
        }
        if (option.length > VALIDATION_RULES.OPTION_MAX_LENGTH) {
          errors.push(`Option ${index + 1} must not exceed ${VALIDATION_RULES.OPTION_MAX_LENGTH} characters`)
        }
      }
    })
  }

  // Validate correct_answer (allow -1 for personality questions)
  const correctAnswer = question.correct_answer ?? question.correctAnswer
  if (typeof correctAnswer !== 'number') {
    errors.push('Correct answer must be a number')
  } else {
    if (correctAnswer !== -1 && (correctAnswer < 0 || correctAnswer >= question.options?.length)) {
      errors.push('Correct answer index is out of range')
    }
  }

  // Validate difficulty
  if (!question.difficulty || !VALIDATION_RULES.VALID_DIFFICULTIES.includes(question.difficulty)) {
    errors.push(`Difficulty must be one of: ${VALIDATION_RULES.VALID_DIFFICULTIES.join(', ')}`)
  }

  // Validate fun_fact
  const funFact = question.fun_fact ?? question.funFact
  if (!funFact || typeof funFact !== 'string') {
    errors.push('Fun fact is required and must be a string')
  }

  if (!question.category || typeof question.category !== 'string') {
    errors.push('Category is required and must be a string')
  }

  if (!question.subcategory || typeof question.subcategory !== 'string') {
    errors.push('Subcategory is required and must be a string')
  }

  // Optional field validation (strict mode)
  if (strict) {
    if (question.section && !VALIDATION_RULES.VALID_SECTIONS.includes(question.section)) {
      errors.push(`Section must be one of: ${VALIDATION_RULES.VALID_SECTIONS.join(', ')}`)
    }

    if (question.type && !VALIDATION_RULES.VALID_TYPES.includes(question.type)) {
      errors.push(`Type must be one of: ${VALIDATION_RULES.VALID_TYPES.join(', ')}`)
    }

    if (question.tags && !Array.isArray(question.tags)) {
      errors.push('Tags must be an array')
    }
  }

  return errors
}

/**
 * Converts legacy camelCase question format to unified snake_case format
 * @param legacyQuestion - Question in legacy camelCase format
 * @returns Question in unified snake_case format
 */
export function migrateLegacyQuestion(legacyQuestion: LegacyQuizQuestion): QuizQuestion {
  // Validate input
  const errors = validateQuizQuestion(legacyQuestion)
  if (errors.length > 0) {
    throw new DataMigrationError(
      `Invalid legacy question data: ${errors.join(', ')}`,
      'VALIDATION_FAILED',
      { errors, question: legacyQuestion }
    )
  }

  // Convert to unified format
  const migratedQuestion: QuizQuestion = {
    id: legacyQuestion.id,
    question: legacyQuestion.question,
    options: [...legacyQuestion.options], // Create new array to avoid mutations
    correct_answer: legacyQuestion.correctAnswer, // camelCase -> snake_case
    difficulty: legacyQuestion.difficulty,
    fun_fact: legacyQuestion.funFact, // camelCase -> snake_case
    category: legacyQuestion.category,
    subcategory: legacyQuestion.subcategory,
  }

  // Copy optional properties if they exist
  if (legacyQuestion.section) migratedQuestion.section = legacyQuestion.section
  if (legacyQuestion.tags) migratedQuestion.tags = [...legacyQuestion.tags]
  if (legacyQuestion.type) migratedQuestion.type = legacyQuestion.type
  if (legacyQuestion.createdAt) migratedQuestion.createdAt = legacyQuestion.createdAt
  if (legacyQuestion.updatedAt) migratedQuestion.updatedAt = legacyQuestion.updatedAt

  return migratedQuestion
}

/**
 * Converts unified snake_case question format to legacy camelCase format
 * @param unifiedQuestion - Question in unified snake_case format
 * @returns Question in legacy camelCase format
 */
export function convertToLegacyFormat(unifiedQuestion: QuizQuestion): LegacyQuizQuestion {
  // Validate input
  const errors = validateQuizQuestion(unifiedQuestion)
  if (errors.length > 0) {
    throw new DataMigrationError(
      `Invalid unified question data: ${errors.join(', ')}`,
      'VALIDATION_FAILED',
      { errors, question: unifiedQuestion }
    )
  }

  // Convert to legacy format
  const legacyQuestion: LegacyQuizQuestion = {
    id: unifiedQuestion.id,
    question: unifiedQuestion.question,
    options: [...unifiedQuestion.options],
    correctAnswer: unifiedQuestion.correct_answer, // snake_case -> camelCase
    difficulty: unifiedQuestion.difficulty,
    funFact: unifiedQuestion.fun_fact, // snake_case -> camelCase
    category: unifiedQuestion.category,
    subcategory: unifiedQuestion.subcategory,
  }

  // Copy optional properties if they exist
  if (unifiedQuestion.section) legacyQuestion.section = unifiedQuestion.section
  if (unifiedQuestion.tags) legacyQuestion.tags = [...unifiedQuestion.tags]
  if (unifiedQuestion.type) legacyQuestion.type = unifiedQuestion.type
  if (unifiedQuestion.createdAt) legacyQuestion.createdAt = unifiedQuestion.createdAt
  if (unifiedQuestion.updatedAt) legacyQuestion.updatedAt = unifiedQuestion.updatedAt

  return legacyQuestion
}

/**
 * Batch migrates an array of legacy questions to unified format
 * @param legacyQuestions - Array of questions in legacy format
 * @returns Object with migrated questions and any errors encountered
 */
export function batchMigrateLegacyQuestions(legacyQuestions: LegacyQuizQuestion[]): {
  migratedQuestions: QuizQuestion[]
  errors: Array<{ questionId: string; error: string }>
} {
  const migratedQuestions: QuizQuestion[] = []
  const errors: Array<{ questionId: string; error: string }> = []

  legacyQuestions.forEach((question) => {
    try {
      const migrated = migrateLegacyQuestion(question)
      migratedQuestions.push(migrated)
    } catch (error) {
      errors.push({
        questionId: question.id || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  return { migratedQuestions, errors }
}

/**
 * Detects the format of a question object (legacy vs unified)
 * @param question - Question object to analyze
 * @returns 'legacy' | 'unified' | 'unknown'
 */
export function detectQuestionFormat(question: any): 'legacy' | 'unified' | 'unknown' {
  if (!question || typeof question !== 'object') {
    return 'unknown'
  }

  const hasLegacyProps = 'correctAnswer' in question || 'funFact' in question
  const hasUnifiedProps = 'correct_answer' in question || 'fun_fact' in question

  if (hasLegacyProps && !hasUnifiedProps) {
    return 'legacy'
  } else if (hasUnifiedProps && !hasLegacyProps) {
    return 'unified'
  } else if (hasUnifiedProps && hasLegacyProps) {
    // Mixed format - prefer unified
    return 'unified'
  }

  return 'unknown'
}

/**
 * Auto-migrates a question to unified format regardless of input format
 * @param question - Question in any supported format
 * @returns Question in unified format
 */
export function autoMigrateQuestion(question: any): QuizQuestion {
  const format = detectQuestionFormat(question)
  
  switch (format) {
    case 'legacy':
      return migrateLegacyQuestion(question as LegacyQuizQuestion)
    case 'unified':
      // Validate and return as-is
      const errors = validateQuizQuestion(question)
      if (errors.length > 0) {
        throw new DataMigrationError(
          `Invalid unified question: ${errors.join(', ')}`,
          'VALIDATION_FAILED',
          { errors, question }
        )
      }
      return question as QuizQuestion
    default:
      throw new DataMigrationError(
        'Unable to detect question format',
        'UNKNOWN_FORMAT',
        { question }
      )
  }
}
