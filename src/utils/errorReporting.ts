import * as Sentry from '@sentry/nextjs'

// Enhanced error reporting utilities for TechKwiz
export class ErrorReporter {
  
  /**
   * Report a quiz-related error
   */
  static reportQuizError(error: Error, context: {
    questionId?: string
    category?: string
    userId?: string
    action?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('errorType', 'quiz')
      scope.setTag('category', context.category || 'unknown')
      scope.setContext('quizContext', context)
      
      if (context.userId) {
        scope.setUser({ id: context.userId })
      }
      
      Sentry.captureException(error)
    })
  }

  /**
   * Report a user authentication error
   */
  static reportAuthError(error: Error, context: {
    action?: 'login' | 'signup' | 'logout' | 'profile_update'
    userId?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('errorType', 'authentication')
      scope.setTag('authAction', context.action || 'unknown')
      scope.setContext('authContext', context)
      
      if (context.userId) {
        scope.setUser({ id: context.userId })
      }
      
      Sentry.captureException(error)
    })
  }

  /**
   * Report a coin/reward system error
   */
  static reportRewardError(error: Error, context: {
    rewardType?: 'coins' | 'achievement' | 'bonus'
    amount?: number
    userId?: string
    action?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('errorType', 'reward')
      scope.setTag('rewardType', context.rewardType || 'unknown')
      scope.setContext('rewardContext', context)
      
      if (context.userId) {
        scope.setUser({ id: context.userId })
      }
      
      Sentry.captureException(error)
    })
  }

  /**
   * Report a data persistence error
   */
  static reportDataError(error: Error, context: {
    operation?: 'save' | 'load' | 'delete' | 'sync'
    dataType?: 'user' | 'quiz' | 'settings' | 'progress'
    userId?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('errorType', 'data')
      scope.setTag('operation', context.operation || 'unknown')
      scope.setTag('dataType', context.dataType || 'unknown')
      scope.setContext('dataContext', context)
      
      if (context.userId) {
        scope.setUser({ id: context.userId })
      }
      
      Sentry.captureException(error)
    })
  }

  /**
   * Report a performance issue
   */
  static reportPerformanceIssue(message: string, context: {
    component?: string
    loadTime?: number
    userId?: string
    action?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('issueType', 'performance')
      scope.setTag('component', context.component || 'unknown')
      scope.setContext('performanceContext', context)
      
      if (context.userId) {
        scope.setUser({ id: context.userId })
      }
      
      Sentry.captureMessage(message, 'warning')
    })
  }

  /**
   * Report user feedback or issues
   */
  static reportUserFeedback(message: string, context: {
    userId?: string
    userEmail?: string
    category?: 'bug' | 'feature' | 'improvement' | 'other'
    severity?: 'low' | 'medium' | 'high'
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('feedbackType', context.category || 'other')
      scope.setTag('severity', context.severity || 'medium')
      scope.setContext('feedbackContext', context)
      
      if (context.userId) {
        scope.setUser({ 
          id: context.userId,
          email: context.userEmail 
        })
      }
      
      Sentry.captureMessage(`User Feedback: ${message}`, 'info')
    })
  }

  /**
   * Set user context for all subsequent error reports
   */
  static setUserContext(user: {
    id: string
    name?: string
    email?: string
    level?: number
    coins?: number
  }) {
    Sentry.setUser({
      id: user.id,
      username: user.name,
      email: user.email,
      level: user.level?.toString(),
      coins: user.coins?.toString()
    })
  }

  /**
   * Clear user context (on logout)
   */
  static clearUserContext() {
    Sentry.setUser(null)
  }

  /**
   * Add breadcrumb for tracking user actions
   */
  static addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000
    })
  }

  /**
   * Track quiz progress for debugging
   */
  static trackQuizProgress(action: string, data: {
    questionNumber?: number
    category?: string
    isCorrect?: boolean
    timeSpent?: number
  }) {
    this.addBreadcrumb(
      `Quiz ${action}`,
      'quiz',
      data
    )
  }

  /**
   * Track user actions for debugging
   */
  static trackUserAction(action: string, data?: Record<string, any>) {
    this.addBreadcrumb(
      `User ${action}`,
      'user',
      data
    )
  }
}

// Convenience functions for common error scenarios
export const reportError = ErrorReporter.reportQuizError
export const reportAuthError = ErrorReporter.reportAuthError
export const reportRewardError = ErrorReporter.reportRewardError
export const reportDataError = ErrorReporter.reportDataError
export const setUserContext = ErrorReporter.setUserContext
export const clearUserContext = ErrorReporter.clearUserContext
export const trackQuizProgress = ErrorReporter.trackQuizProgress
export const trackUserAction = ErrorReporter.trackUserAction
