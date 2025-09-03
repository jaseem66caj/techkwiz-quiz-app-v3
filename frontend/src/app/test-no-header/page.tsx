'use client'

export default function TestNoHeaderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Test Navigation - No header elements */}
      <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-white">
              <span className="text-orange-400">Tech</span>Kwiz
            </div>
            {/* NO HAMBURGER MENU, NO COIN COUNTER, NO USER INFO */}
          </div>
        </div>
      </nav>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="glass-effect p-8 rounded-2xl text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            ✅ TEST PAGE - NO HEADER ELEMENTS
          </h1>
          <p className="text-blue-200 mb-4">
            This page demonstrates the navigation without:
          </p>
          <ul className="text-left text-blue-200 space-y-2">
            <li>• Hamburger menu (☰)</li>
            <li>• Coin counter (🪙 0)</li>
            <li>• "Hi, Guest User!" text</li>
            <li>• "Logout" button</li>
          </ul>
          <div className="mt-6">
            <a href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
              Back to Home
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}