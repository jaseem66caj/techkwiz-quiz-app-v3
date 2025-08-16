'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0)
  
  const { login, failedAttempts, lockoutUntil } = useAdminAuth()

  // Update lockout countdown
  useEffect(() => {
    if (lockoutUntil) {
      const updateCountdown = () => {
        const now = Date.now()
        const remaining = Math.max(0, Math.ceil((lockoutUntil - now) / 1000))
        setLockoutTimeRemaining(remaining)
        
        if (remaining === 0) {
          setMessage('')
        }
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 1000)
      
      return () => clearInterval(interval)
    } else {
      setLockoutTimeRemaining(0)
    }
  }, [lockoutUntil])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitStartTime = performance.now()
    console.log('🔐 Login form submitted')

    if (lockoutTimeRemaining > 0) {
      return
    }

    if (!password.trim()) {
      setMessage('Please enter a password')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const loginStartTime = performance.now()
      const result = await login(password)
      const loginEndTime = performance.now()

      console.log(`🔐 Login hook took: ${loginEndTime - loginStartTime}ms`)

      if (!result.success) {
        setMessage(result.message)
        setPassword('')
        setIsSubmitting(false)
      } else {
        // Keep submitting state true during redirect to show loading
        console.log(`🔐 Login successful, redirecting...`)
        // Don't set isSubmitting to false on success - let the redirect handle it
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      setIsSubmitting(false)
    }

    const totalSubmitTime = performance.now() - submitStartTime
    console.log(`🔐 Total form submission took: ${totalSubmitTime}ms`)
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const isLocked = lockoutTimeRemaining > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Access</h2>
            <p className="text-gray-600 mt-2">Enter your password to access the admin dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isLocked}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>

            {/* Error/Status Messages */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successful') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    {message.includes('successful') ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}

            {/* Lockout Timer */}
            {isLocked && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Account Locked</p>
                    <p className="text-sm text-yellow-700">
                      Try again in {formatTime(lockoutTimeRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Failed Attempts Warning */}
            {failedAttempts > 0 && !isLocked && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {5 - failedAttempts} attempts remaining
                    </p>
                    <p className="text-sm text-orange-700">
                      Account will be locked for 15 minutes after 5 failed attempts
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLocked || !password.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : isLocked ? (
                'Account Locked'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              TechKwiz Admin Dashboard • Secure Access Required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
