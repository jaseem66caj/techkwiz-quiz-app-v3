'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminAuth, AdminSession } from '@/utils/adminAuth'

export interface UseAdminAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  session: AdminSession | null
  login: (password: string) => Promise<{ success: boolean; message: string; lockoutUntil?: number }>
  logout: () => void
  updateActivity: () => void
  failedAttempts: number
  lockoutUntil?: number
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<AdminSession | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | undefined>()

  // Check authentication status on mount and periodically
  const checkAuth = useCallback(() => {
    const currentSession = AdminAuth.getSession()
    setSession(currentSession)
    setIsAuthenticated(currentSession?.isAuthenticated === true)
    setFailedAttempts(currentSession?.failedAttempts || 0)
    setLockoutUntil(currentSession?.lockoutUntil)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()

    // Check authentication status every 30 seconds
    const interval = setInterval(checkAuth, 30000)

    // Update activity on user interaction
    const updateActivityOnInteraction = () => {
      if (AdminAuth.isAuthenticated()) {
        AdminAuth.updateActivity()
      }
    }

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, updateActivityOnInteraction, { passive: true })
    })

    return () => {
      clearInterval(interval)
      events.forEach(event => {
        document.removeEventListener(event, updateActivityOnInteraction)
      })
    }
  }, [checkAuth])

  const login = useCallback(async (password: string) => {
    const startTime = performance.now()
    console.log('🔐 Login process started')

    setIsLoading(true)

    try {
      const authStartTime = performance.now()
      const result = AdminAuth.login(password)
      const authEndTime = performance.now()
      console.log(`🔐 Authentication took: ${authEndTime - authStartTime}ms`)

      // Update state based on login result
      if (result.success) {
        const checkAuthStartTime = performance.now()

        // Optimized: Update state directly instead of calling checkAuth()
        const currentSession = AdminAuth.getSession()
        setSession(currentSession)
        setIsAuthenticated(currentSession?.isAuthenticated === true)
        setFailedAttempts(0)
        setLockoutUntil(undefined)

        const checkAuthEndTime = performance.now()
        console.log(`🔐 State update took: ${checkAuthEndTime - checkAuthStartTime}ms`)
      } else {
        setFailedAttempts(AdminAuth.getSession()?.failedAttempts || 0)
        setLockoutUntil(result.lockoutUntil)
      }

      setIsLoading(false)

      const totalTime = performance.now() - startTime
      console.log(`🔐 Total login process took: ${totalTime}ms`)

      return result
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return {
        success: false,
        message: 'An error occurred during login. Please try again.'
      }
    }
  }, [])

  const logout = useCallback(() => {
    AdminAuth.logout()
    setIsAuthenticated(false)
    setSession(null)
    setFailedAttempts(0)
    setLockoutUntil(undefined)
  }, [])

  const updateActivity = useCallback(() => {
    AdminAuth.updateActivity()
  }, [])

  return {
    isAuthenticated,
    isLoading,
    session,
    login,
    logout,
    updateActivity,
    failedAttempts,
    lockoutUntil
  }
}
