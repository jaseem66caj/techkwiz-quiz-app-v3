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
    console.info('🔧 beforeunload event triggered, isActive:', preventionActiveRef.current)
    if (!preventionActiveRef.current) return

    console.info('🚨 beforeunload: Preventing exit and calling onExitAttempt')
    
    // Modern browsers ignore the custom message and show their own
    event.preventDefault()
    event.returnValue = customMessage
    
    // Trigger our custom exit attempt handler
    onExitAttemptRef.current()
    
    return customMessage
  }, [customMessage])

  // Back button / navigation handler
  const handlePopState = useCallback((_event: PopStateEvent) => {
    console.info('🔧 popstate event triggered, isActive:', preventionActiveRef.current)
    if (!preventionActiveRef.current) return

    console.info('🚨 popstate: Preventing navigation and calling onExitAttempt')
    
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
      console.info('🚨 keyboard shortcut detected:', event.key, 'calling onExitAttempt')
      event.preventDefault()
      onExitAttemptRef.current()
    }
  }, [])

  useEffect(() => {
    console.info('🔧 useExitPrevention: Effect running, isActive:', isActive)

    // Check if exit prevention is disabled (for testing environments)
    if (process.env.NEXT_PUBLIC_DISABLE_EXIT_GUARD === 'true') {
      console.info('🔧 useExitPrevention: Exit prevention disabled by environment variable')
      return
    }

    if (!isActive) return

    console.info('🔧 useExitPrevention: Adding event listeners...')
    
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    // Push initial state to enable back button detection
    window.history.pushState(null, '', window.location.pathname)
    
    console.info('🔧 useExitPrevention: Event listeners added successfully')

    return () => {
      console.info('🔧 useExitPrevention: Cleaning up event listeners...')
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
