/**
 * Global Error Handler for techkwiz-quiz-app-v3
 * 
 * This module sets up global error handling for unhandled promise rejections,
 * uncaught exceptions, and other critical errors that might not be caught
 * by component-level error boundaries.
 */

import * as Sentry from '@sentry/nextjs'

// Track if error handlers have been initialized
let handlersInitialized = false

/**
 * Initialize global error handlers
 * Should be called once during application startup
 */
export function initializeGlobalErrorHandlers() {
  // Prevent multiple initializations
  if (handlersInitialized || typeof window === 'undefined') {
    return
  }

  console.info('🛡️ Initializing global error handlers...')

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason)
    
    // Report to Sentry
    Sentry.captureException(event.reason, {
      tags: {
        errorType: 'unhandledPromiseRejection',
        component: 'globalErrorHandler'
      },
      extra: {
        promiseRejectionReason: event.reason,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    })

    // Prevent the default browser behavior (logging to console)
    event.preventDefault()
  })

  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('🚨 Uncaught Error:', event.error)
    
    // Report to Sentry
    Sentry.captureException(event.error, {
      tags: {
        errorType: 'uncaughtError',
        component: 'globalErrorHandler'
      },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    })
  })

  // Handle resource loading errors (images, scripts, etc.)
  window.addEventListener('error', (event) => {
    const target = event.target

    if (target && target !== window && target instanceof HTMLElement) {
      console.error('🚨 Resource Loading Error:', {
        tagName: target.tagName,
        src: (target as any).src || (target as any).href,
        message: event.message
      })
      
      // Report to Sentry
      Sentry.captureMessage('Resource loading failed', {
        level: 'warning',
        tags: {
          errorType: 'resourceLoadingError',
          component: 'globalErrorHandler',
          resourceType: target.tagName
        },
        extra: {
          tagName: target.tagName,
          src: (target as any).src || (target as any).href,
          outerHTML: target.outerHTML?.substring(0, 200),
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      })
    }
  }, true) // Use capture phase for resource errors

  // Handle network errors and failed requests
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args)
      
      // Log failed HTTP requests
      if (!response.ok) {
        console.warn('🌐 HTTP Request Failed:', {
          url: args[0],
          status: response.status,
          statusText: response.statusText
        })
        
        // Report significant failures to Sentry
        if (response.status >= 500) {
          Sentry.captureMessage('HTTP request failed with server error', {
            level: 'warning',
            tags: {
              errorType: 'httpError',
              component: 'globalErrorHandler',
              statusCode: response.status.toString()
            },
            extra: {
              url: args[0],
              status: response.status,
              statusText: response.statusText,
              timestamp: new Date().toISOString()
            }
          })
        }
      }
      
      return response
    } catch (error) {
      const normalizedMessage = error instanceof Error && typeof error.message === 'string'
        ? error.message.toLowerCase()
        : ''
      const errorCode = (error as { code?: string } | undefined)?.code
      const isAbortOrTimeout = error instanceof Error && (
        error.name === 'AbortError' ||
        error.name === 'TimeoutError' ||
        error.name === 'WordPressTimeoutError' ||
        normalizedMessage.includes('aborted') ||
        normalizedMessage.includes('timed out') ||
        errorCode === 'WORDPRESS_TIMEOUT'
      )

      if (isAbortOrTimeout) {
        console.info('🌐 Fetch aborted or timed out:', {
          url: args[0],
          name: (error as Error).name,
          message: (error as Error).message,
          code: errorCode
        })
        throw error
      }

      console.error('🌐 Network Request Failed:', error)

      // Report network failures to Sentry
      Sentry.captureException(error, {
        tags: {
          errorType: 'networkError',
          component: 'globalErrorHandler'
        },
        extra: {
          url: args[0],
          timestamp: new Date().toISOString()
        }
      })
      
      throw error
    }
  }

  // Handle localStorage quota exceeded errors
  const originalSetItem = localStorage.setItem
  localStorage.setItem = function(key: string, value: string) {
    try {
      originalSetItem.call(this, key, value)
    } catch (error) {
      console.error('💾 localStorage Error:', error)
      
      // Report storage errors to Sentry
      Sentry.captureException(error, {
        tags: {
          errorType: 'localStorageError',
          component: 'globalErrorHandler'
        },
        extra: {
          key,
          valueSize: value.length,
          timestamp: new Date().toISOString()
        }
      })
      
      // Try to clear some space and retry
      if (error instanceof DOMException && error.code === 22) {
        console.warn('💾 localStorage quota exceeded, attempting cleanup...')
        try {
          // Remove old data to make space
          const keysToRemove = ['old_quiz_data', 'temp_data', 'cache_data']
          keysToRemove.forEach(k => {
            if (localStorage.getItem(k)) {
              localStorage.removeItem(k)
            }
          })
          
          // Retry the operation
          originalSetItem.call(this, key, value)
        } catch (retryError) {
          console.error('💾 localStorage cleanup failed:', retryError)
          throw retryError
        }
      } else {
        throw error
      }
    }
  }

  // Mark handlers as initialized
  handlersInitialized = true
  console.info('✅ Global error handlers initialized successfully')
}

/**
 * Manually report an error to Sentry with context
 */
export function reportError(error: Error, context: {
  component?: string
  action?: string
  userId?: string
  extra?: Record<string, any>
} = {}) {
  console.error('📊 Manually reporting error:', error)
  
  Sentry.withScope((scope) => {
    // Set user context if provided
    if (context.userId) {
      scope.setUser({ id: context.userId })
    }
    
    // Set tags
    scope.setTag('component', context.component || 'unknown')
    scope.setTag('action', context.action || 'unknown')
    scope.setTag('reportType', 'manual')
    
    // Set extra context
    if (context.extra) {
      scope.setContext('additionalContext', context.extra)
    }
    
    // Capture the exception
    Sentry.captureException(error)
  })
}

/**
 * Report a message to Sentry
 */
export function reportMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context: Record<string, any> = {}) {
  console.info(`📊 Reporting message [${level}]:`, message)
  
  Sentry.captureMessage(message, {
    level,
    tags: {
      reportType: 'manual',
      ...context.tags
    },
    extra: context.extra
  })
}

/**
 * Check if global error handlers are initialized
 */
export function areErrorHandlersInitialized(): boolean {
  return handlersInitialized
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined' && !handlersInitialized) {
  // Initialize after a short delay to ensure Sentry is ready
  setTimeout(initializeGlobalErrorHandlers, 100)
}
