'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../app/providers'

export function Navigation() {
  const router = useRouter()
  const { state } = useApp()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Categories', href: '/start', icon: '📚' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ]

  return (
    <nav className="glass-effect border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-lg md:text-2xl font-bold text-white">
              <span className="text-orange-400">Tech</span>Kwiz
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-orange-400 transition-colors duration-200 flex items-center space-x-1 text-sm"
              >
                <span className="text-xs">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Coins Display */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="glass-effect px-3 py-1 md:px-4 md:py-2 rounded-full flex items-center space-x-2">
              <span className="text-lg md:text-xl">🪙</span>
              <span className="text-white font-semibold text-sm md:text-base">
                {state.user.coins}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:text-orange-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-3 border-t border-white/10"
          >
            <div className="grid grid-cols-4 gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-orange-400 transition-colors duration-200 flex flex-col items-center space-y-1 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-xs">{item.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}