'use client'

import dynamic from 'next/dynamic'

// Dynamically import the client-side home page component to avoid SSR issues
const ClientHomePage = dynamic(() => import('../components/ClientHomePage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-white">
              <span className="text-orange-400">Tech</span>Kwiz
            </div>
            {/* Hide header elements on home page loading state */}
          </div>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center">
        <div className="glass-effect p-8 rounded-2xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading Youth Quiz Hub...</p>
        </div>
      </main>
    </div>
  )
})

export default function HomePage() {
  return <ClientHomePage />
}