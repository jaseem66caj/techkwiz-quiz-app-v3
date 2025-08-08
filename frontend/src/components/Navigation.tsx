'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../app/providers'
import { EnhancedCoinDisplay } from './EnhancedCoinDisplay'
import { DailyBonusModal } from './DailyBonusModal'
import { ReferralSystemModal } from './ReferralSystemModal'
import { LimitedTimeOfferBanner } from './LimitedTimeOfferBanner'
import { StreakMultiplierDisplay } from './StreakMultiplierDisplay'
import { useRevenueOptimization } from '../hooks/useRevenueOptimization'
import { AuthModal } from './AuthModal'
import { logout } from '../utils/auth'

interface NavigationProps {
  hideHeaderElements?: boolean;
}

export function Navigation({ hideHeaderElements = false }: NavigationProps) {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Debug logging
  console.log('Navigation component: hideHeaderElements =', hideHeaderElements)

  const navigationItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Categories', href: '/start', icon: '📚' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ]

  const handleLogin = (user: any) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    setIsAuthModalOpen(false)
  }

  const handleLogout = () => {
    logout()
    dispatch({ type: 'LOGOUT' })
    router.push('/')
  }

  // Show loading state
  if (state.loading) {
    return (
      <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-white">
              <span className="text-orange-400">Tech</span>Kwiz
            </div>
            <div className="animate-pulse bg-white/10 rounded-full h-8 w-20"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-xl font-bold text-white">
                <span className="text-orange-400">Tech</span>Kwiz
              </div>
            </Link>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {state.isAuthenticated ? (
                <>
                  {/* Coins Display - Hidden on home page */}
                  {!hideHeaderElements && (
                    <div className="bg-gray-700 px-3 py-1.5 rounded-full flex items-center space-x-2">
                      <span className="text-lg">🪙</span>
                      <span className="text-white font-semibold text-sm">
                        {state.user?.coins || 0}
                      </span>
                    </div>
                  )}

                  {/* Menu Button - Hidden on home page */}
                  {!hideHeaderElements && (
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                        />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
          
          {/* User info bar - mobile-web style - Hidden on home page */}
          {state.isAuthenticated && !hideHeaderElements && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">
                  Hi, {state.user?.name}!
                </span>
                <button
                  onClick={handleLogout}
                  className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu - Full width dropdown */}
      {isMobileMenuOpen && state.isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gray-800/95 backdrop-blur-sm border-b border-white/10 sticky top-[73px] z-40"
        >
          <div className="px-4 py-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLogin}
      />
    </>
  )
}