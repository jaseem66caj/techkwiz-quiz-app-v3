'use client'

import Link from 'next/link'

export function MinimalNavigation() {
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