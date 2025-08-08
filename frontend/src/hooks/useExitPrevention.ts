'use client'

import { useEffect, useCallback, useRef } from 'react'

interface ExitPreventionOptions {
  isActive: boolean
  onExitAttempt: () => void
  customMessage?: string
}

export function useExitPrevention({ 
  isActive, 
  onExitAttempt, 
  customMessage = "Are you sure you want to leave? Your progress will be lost!" 
}: ExitPreventionOptions) {
  const preventionActiveRef = useRef(isActive)
  const onExitAttemptRef = useRef(onExitAttempt)

  // Update refs when props change
  useEffect(() => {
    preventionActiveRef.current = isActive
    onExitAttemptRef.current = onExitAttempt
  }, [isActive, onExitAttempt])

  // Browser beforeunload event handler
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (!preventionActiveRef.current) return

    // Modern browsers ignore the custom message and show their own
    event.preventDefault()
    event.returnValue = customMessage
    
    // Trigger our custom exit attempt handler
    onExitAttemptRef.current()
    
    return customMessage
  }, [customMessage])

  // Back button / navigation handler
  const handlePopState = useCallback((event: PopStateEvent) => {
    if (!preventionActiveRef.current) return

    // Prevent navigation
    window.history.pushState(null, '', window.location.pathname)
    
    // Trigger our custom exit attempt handler
    onExitAttemptRef.current()
  }, [])

  // Keyboard shortcuts handler (Alt+F4, Ctrl+W, etc.)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!preventionActiveRef.current) return

    // Detect common exit shortcuts
    const isExitShortcut = (
      (event.altKey && event.key === 'F4') || // Alt+F4
      (event.ctrlKey && event.key === 'w') || // Ctrl+W
      (event.ctrlKey && event.key === 'q') || // Ctrl+Q  
      (event.metaKey && event.key === 'w') ||  // Cmd+W (Mac)
      (event.metaKey && event.key === 'q')     // Cmd+Q (Mac)
    )

    if (isExitShortcut) {
      event.preventDefault()
      onExitAttemptRef.current()
    }
  }, [])

  useEffect(() => {
    if (!isActive) return

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    // Push initial state to enable back button detection
    window.history.pushState(null, '', window.location.pathname)

    return () => {
      // Cleanup event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, handleBeforeUnload, handlePopState, handleKeyDown])

  // Cleanup function to disable prevention
  const disablePrevention = useCallback(() => {
    preventionActiveRef.current = false
  }, [])

  return { disablePrevention }
}