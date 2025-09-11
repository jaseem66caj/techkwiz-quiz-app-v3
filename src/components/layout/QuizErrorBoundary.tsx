'use client'

import React, { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

/**
 * Error boundary component for quiz-related errors
 * Provides graceful fallback UI when quiz components crash
 */
export class QuizErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('Quiz Error Boundary caught an error:', error, errorInfo)
    
    // Update state with error info
    this.setState({ errorInfo })
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to analytics or error reporting service
    this.logError(error, errorInfo)
  }

  private logError(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging with context
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }

    // Log to console with structured data
    console.group('🚨 Quiz Error Boundary')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Full Error Data:', errorData)
    console.groupEnd()

    // Store error in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('quiz_errors') || '[]')
      existingErrors.push(errorData)
      
      // Keep only last 10 errors to prevent storage bloat
      const recentErrors = existingErrors.slice(-10)
      localStorage.setItem('quiz_errors', JSON.stringify(recentErrors))
    } catch (storageError) {
      console.warn('Failed to store error in localStorage:', storageError)
    }
  }

  private handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    // Reload the page as last resort
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center"
          >
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-blue-200 mb-6">
              Don't worry, this happens sometimes. Let's get you back to the quiz!
            </p>
            
            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-orange-300 cursor-pointer mb-2">
                  Error Details (Dev Mode)
                </summary>
                <div className="bg-black/20 rounded p-3 text-xs text-red-300 font-mono">
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-white/20 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/30 transition-all duration-200"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full text-blue-200 hover:text-white transition-colors duration-200"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook to access error boundary functionality
 */
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Quiz Error${context ? ` (${context})` : ''}:`, error)
    
    // Log structured error data
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: context || 'unknown',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('quiz_errors') || '[]')
      existingErrors.push(errorData)
      const recentErrors = existingErrors.slice(-10)
      localStorage.setItem('quiz_errors', JSON.stringify(recentErrors))
    } catch (storageError) {
      console.warn('Failed to store error:', storageError)
    }
  }

  const clearErrors = () => {
    try {
      localStorage.removeItem('quiz_errors')
      console.log('Quiz errors cleared from localStorage')
    } catch (error) {
      console.warn('Failed to clear errors:', error)
    }
  }

  const getStoredErrors = () => {
    try {
      return JSON.parse(localStorage.getItem('quiz_errors') || '[]')
    } catch (error) {
      console.warn('Failed to retrieve stored errors:', error)
      return []
    }
  }

  return { handleError, clearErrors, getStoredErrors }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withQuizErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <QuizErrorBoundary fallback={fallback}>
        <Component {...props} />
      </QuizErrorBoundary>
    )
  }
}
