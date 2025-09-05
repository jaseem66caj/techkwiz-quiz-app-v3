'use client'

import Link from 'next/link'

interface SimpleNavigationProps {
  hideHeaderElements?: boolean;
}

export function SimpleNavigation({ hideHeaderElements = false }: SimpleNavigationProps) {
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
