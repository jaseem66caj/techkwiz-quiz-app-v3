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
  const { state, dispatch } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Revenue optimization hooks
  const {
    revenueMetrics,
    activeMultipliers,
    currentOffers,
    showDailyBonus,
    showReferralModal,
    setShowReferralModal,
    claimDailyBonus,
    getCurrentMultiplier,
    processReferral
  } = useRevenueOptimization()
  
  const [userReferralCode] = useState(`TK${Math.random().toString(36).substr(2, 6).toUpperCase()}`)

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
    setShowAuthModal(false)
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
              {/* User Section with Enhanced Coins */}
              {!hideHeaderElements && state.isAuthenticated && state.user ? (
                <>
                  {/* Enhanced Coin Display */}
                  <EnhancedCoinDisplay
                    coins={state.user.coins}
                    multiplier={getCurrentMultiplier()}
                    showAnimation={true}
                    compact={true}
                    onClick={() => setShowReferralModal(true)}
                  />
                  
                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowReferralModal(true)}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors border border-purple-400/30"
                      title="Refer friends and earn coins"
                    >
                      👥 Refer
                    </button>
                  </div>
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="text-white hover:text-orange-300 transition-colors"
                    >
                      <span className="text-sm">Hi, {state.user.name.split(' ')[0]}!</span>
                      <span className="ml-1">▼</span>
                    </button>
                  </div>
                </>
              ) : !hideHeaderElements ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors"
                >
                  Login
                </button>
              ) : null}
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
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleLogin}
      />
      
      {/* Revenue Optimization Components */}
      {state.isAuthenticated && (
        <>
          {/* Daily Bonus Modal */}
          <DailyBonusModal
            isOpen={showDailyBonus}
            onClose={() => {}}
            onClaimBonus={claimDailyBonus}
            dayStreak={revenueMetrics.dailyStreak}
          />
          
          {/* Referral System Modal */}
          <ReferralSystemModal
            isOpen={showReferralModal}
            onClose={() => setShowReferralModal(false)}
            onGenerateCode={() => {}}
            userReferralCode={userReferralCode}
            referralStats={{
              totalReferrals: revenueMetrics.referrals,
              coinsEarned: Math.floor(revenueMetrics.referrals * 100),
              pendingRewards: 0
            }}
          />
          
          {/* Streak Multiplier Display */}
          {getCurrentMultiplier() > 1 && (
            <StreakMultiplierDisplay
              currentStreak={revenueMetrics.dailyStreak}
              multiplier={getCurrentMultiplier()}
              isActive={true}
              position="top-right"
            />
          )}
          
          {/* Limited Time Offers */}
          {currentOffers.length > 0 && currentOffers.map((offer) => (
            <LimitedTimeOfferBanner
              key={offer.id}
              offer={offer}
              onClaim={(offerId) => {
                console.log('Claimed offer:', offerId)
                // Handle offer claim logic here
              }}
              onDismiss={(offerId) => {
                console.log('Dismissed offer:', offerId)
                // Handle offer dismiss logic here
              }}
              position="floating"
            />
          ))}
        </>
      )}
    </>
  )
}