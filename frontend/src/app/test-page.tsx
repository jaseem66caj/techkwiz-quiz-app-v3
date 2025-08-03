'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎉 Youth Quiz Hub Works!
        </h1>
        <p className="text-blue-200">
          The app is loading successfully - now debugging the main page...
        </p>
        <div className="mt-8 space-y-4">
          <div className="bg-pink-500/20 backdrop-blur-sm p-4 rounded-xl border border-pink-400/30">
            <h2 className="text-white font-bold">🎉 Swipe-Based Personality</h2>
            <p className="text-pink-200 text-sm">Discover your vibe through rapid-fire choices</p>
            <span className="text-pink-300 font-medium">25 coins</span>
          </div>
          <div className="bg-red-500/20 backdrop-blur-sm p-4 rounded-xl border border-red-400/30">
            <h2 className="text-white font-bold">🎬 Pop Culture Flash</h2>
            <p className="text-red-200 text-sm">Decode trends and viral moments</p>
            <span className="text-red-300 font-medium">30 coins</span>
          </div>
        </div>
      </div>
    </div>
  )
}