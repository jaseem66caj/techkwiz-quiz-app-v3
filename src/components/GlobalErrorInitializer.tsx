'use client'

import { useEffect } from 'react'
import { initializeGlobalErrorHandlers } from '@/utils/globalErrorHandler'

/**
 * GlobalErrorInitializer Component
 * 
 * This component initializes global error handlers for the application.
 * It should be included once in the root layout to ensure all unhandled
 * errors are properly captured and reported to Sentry.
 */
export function GlobalErrorInitializer() {
  useEffect(() => {
    // Initialize global error handlers on client side
    initializeGlobalErrorHandlers()
  }, [])

  // This component doesn't render anything
  return null
}
