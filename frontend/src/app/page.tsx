'use client'

import { useState } from 'react'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('')

  const youthCategories = [
    {
      id: 'swipe-personality',
      name: 'Swipe-Based Personality', 
      icon: '🎉',
      color: 'from-pink-500 to-purple-600',
      description: 'Discover your vibe through rapid-fire choices',
      entry_fee: 25,
    },
    {
      id: 'pop-culture-flash',
      name: 'Pop Culture Flash',
      icon: '🎬', 
      color: 'from-red-500 to-pink-600',
      description: 'Decode trends and viral moments',
      entry_fee: 30,
    },
    {
      id: 'micro-trivia',
      name: 'Micro-Trivia Tournaments',
      icon: '🧠',
      color: 'from-blue-500 to-cyan-600', 
      description: 'Lightning-fast knowledge battles',
      entry_fee: 20,
    },
    {
      id: 'social-identity',
      name: 'Social Identity Quizzes',
      icon: '🤳',
      color: 'from-purple-500 to-indigo-600',
      description: 'Find your digital persona match', 
      entry_fee: 35,
    },
    {
      id: 'trend-vibes',
      name: 'Trend & Local Vibes',
      icon: '🎯',
      color: 'from-orange-500 to-yellow-600',
      description: 'Stay plugged into what\'s viral',
      entry_fee: 40,
    },
    {
      id: 'future-you', 
      name: 'Future-You Simulations',
      icon: '🔮',
      color: 'from-green-500 to-teal-600',
      description: 'Predict your path and tech trends',
      entry_fee: 45,
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-white">
              <span className="text-orange-400">Tech</span>Kwiz
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-400/30">
              <span className="text-sm font-bold text-blue-200">🪙 0</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎉 Welcome to Youth Quiz Hub!
          </h1>
          <p className="text-blue-200 text-base">
            Level up your knowledge with interactive quizzes designed for Gen Z!
          </p>
        </div>

        {/* Quick Start Quiz */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white mb-2">
              ✨ Vibe Check!
            </h2>
            <p className="text-sm text-blue-200 mb-4">
              Quick personality check - earn coins!
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white text-center mb-4">
              Your aesthetic vibe:
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {['Dark Academia ☕📚', 'Soft Girl 🌸✨', 'Y2K Cyber 💿🔮', 'Cottagecore 🍄🌿'].map((option, index) => (
                <button
                  key={index}
                  className="p-3 rounded-xl text-center font-medium transition-all duration-300 border-2 bg-gray-700/50 text-white border-gray-600 hover:bg-purple-600/50 hover:border-purple-400/50"
                >
                  <div className="text-sm font-medium">{option}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              🚀 Choose Your Challenge
            </h2>
            <p className="text-blue-200 text-sm">
              Interactive quizzes with reduced entry fees (20-45 coins)
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {youthCategories.map((category) => (
              <div
                key={category.id}
                className={`bg-gradient-to-r ${category.color} bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:scale-105 transition-transform duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{category.name}</h3>
                      <p className="text-white/80 text-xs">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{category.entry_fee} coins</div>
                    <div className="text-xs text-white/60">25 coins per win</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          <h3 className="text-white font-bold text-center mb-3 text-lg">
            ✨ What's New
          </h3>
          <div className="space-y-2 text-sm text-blue-200">
            <div>🎯 Interactive formats: This or That, Emoji Decode, Personality</div>
            <div>💰 Lower entry fees (20-45 coins vs 100-160)</div>  
            <div>🏆 25 coins per correct answer</div>
            <div>📱 Mobile-first, youth-focused experience</div>
            <div>🔥 Gen Z language & TikTok trends</div>
          </div>
        </div>

      </div>
    </div>
  )
}