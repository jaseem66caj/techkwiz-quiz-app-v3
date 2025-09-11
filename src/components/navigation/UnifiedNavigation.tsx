'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../app/providers'
import { EnhancedCoinDisplay } from '../../components/ui'
import { StreakMultiplierDisplay } from '../../components/ui'
import { useRevenueOptimization } from '../../hooks/useRevenueOptimization'
import { logout } from '../../utils/auth'

interface UnifiedNavigationProps {
  hideHeaderElements?: boolean;
  mode?: 'full' | 'simple' | 'minimal';
}

export function UnifiedNavigation({ 
  hideHeaderElements = false,
  mode = 'full'
}: UnifiedNavigationProps) {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Revenue optimization hooks
  const {
    revenueMetrics,
    activeMultipliers,
    getCurrentMultiplier,
    processReferral
  } = useRevenueOptimization()

  // Debug logging
  console.log('UnifiedNavigation component: hideHeaderElements =', hideHeaderElements, 'mode =', mode)

  const navigationItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Categories', href: '/start', icon: '📚' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ]

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

  // Minimal mode - logo only
  if (mode === 'minimal') {
    return (
      <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-xl font-bold text-white">
                <span className="text-orange-400">Tech</span>Kwiz
              </div>
            </Link>

            {/* Empty right side - no hamburger menu, no coin counter, no user info */}
            <div className="flex items-center space-x-3">
              {/* Intentionally empty - hiding all header elements on home page */}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Simple mode - logo + basic navigation links
  if (mode === 'simple') {
    return (
      <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-xl font-bold text-white">
                <span className="text-orange-400">Tech</span>Kwiz
              </div>
            </Link>

            {/* Simple navigation links */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white hover:text-orange-400 transition-colors text-sm">
                Home
              </Link>
              <Link href="/start" className="text-white hover:text-orange-400 transition-colors text-sm">
                Categories
              </Link>
              <Link href="/about" className="text-white hover:text-orange-400 transition-colors text-sm">
                About
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Full mode - all features (default)
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
              {/* Coin Balance Display - Only show for authenticated users */}
              {state.isAuthenticated && state.user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-orange-500/20 backdrop-blur-sm border border-orange-400/30">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="text-lg"
                    >
                      🪙
                    </motion.span>
                    <span className="text-orange-300 font-medium text-sm">
                      {state.user.coins}
                    </span>
                  </div>
                </motion.div>
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

      {/* Revenue Optimization Components */}
      {state.isAuthenticated && (
        <>
          {/* Streak Multiplier Display */}
          {getCurrentMultiplier() > 1 && (
            <StreakMultiplierDisplay
              currentStreak={revenueMetrics.dailyStreak}
              multiplier={getCurrentMultiplier()}
              isActive={true}
              position="top-right"
            />
          )}
        </>
      )}
    </>
  )
}