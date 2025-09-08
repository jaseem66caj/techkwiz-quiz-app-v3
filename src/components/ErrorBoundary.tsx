'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { motion } from 'framer-motion'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging to console
    console.error('🚨 ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR'
    })

    // Enhanced Sentry reporting
    Sentry.withScope((scope) => {
      scope.setTag('component', 'ErrorBoundary')
      scope.setTag('errorType', 'componentError')
      scope.setLevel('error')

      // Add detailed context
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      })

      // Add browser context if available
      if (typeof window !== 'undefined') {
        scope.setContext('browserInfo', {
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        })
      }

      // Add user context from localStorage if available
      try {
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('techkwiz_user')
          if (userStr) {
            const user = JSON.parse(userStr)
            scope.setUser({
              id: user.id,
              username: user.name
            })
          }
        }
      } catch (userError) {
        // Ignore user context errors
      }

      Sentry.captureException(error)
    })

    // Update state with error info
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 max-w-md w-full text-center"
          >
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              We've encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                <summary className="text-red-400 font-semibold cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to capture errors
export const useSentryErrorHandler = () => {
  const captureError = (error: Error, context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additionalContext', context)
      }
      scope.setTag('source', 'manual')
      Sentry.captureException(error)
    })
  }

  const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    Sentry.captureMessage(message, level)
  }

  return { captureError, captureMessage }
}

export default ErrorBoundary
