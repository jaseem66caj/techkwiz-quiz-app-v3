'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../providers'
import { Navigation } from '../../components/Navigation'
import { AdBanner } from '../../components/AdBanner'
import { QUIZ_CATEGORIES } from '../../data/quizDatabase'
import { AuthModal } from '../../components/AuthModal'
import { NewsSection } from '../../components/NewsSection'

export default function StartPage() {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Convert the categories object to array
  const categories = Object.values(QUIZ_CATEGORIES)

  const categoryTabs = [
    { id: 'ALL', name: 'All', count: categories.length },
    { id: 'PROGRAMMING', name: 'Programming', count: 2 },
    { id: 'AI', name: 'AI & ML', count: 1 },
    { id: 'WEB', name: 'Web', count: 1 },
    { id: 'MOBILE', name: 'Mobile', count: 1 },
    { id: 'DATA', name: 'Data', count: 1 },
    { id: 'SECURITY', name: 'Security', count: 1 },
    { id: 'CLOUD', name: 'Cloud', count: 1 },
    { id: 'BLOCKCHAIN', name: 'Blockchain', count: 1 },
  ]

  const handleCategorySelect = (categoryId: string) => {
    if (!state.isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    router.push(`/quiz/${categoryId}`)
  }

  const handleLogin = (user: any) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    setShowAuthModal(false)
  }

  const filteredCategories = selectedCategory === 'ALL' 
    ? categories 
    : categories.filter(cat => {
        switch (selectedCategory) {
          case 'PROGRAMMING':
            return ['programming', 'web-dev'].includes(cat.id)
          case 'AI':
            return cat.id === 'ai'
          case 'WEB':
            return cat.id === 'web-dev'
          case 'MOBILE':
            return cat.id === 'mobile-dev'
          case 'DATA':
            return cat.id === 'data-science'
          case 'SECURITY':
            return cat.id === 'cybersecurity'
          case 'CLOUD':
            return cat.id === 'cloud'
          case 'BLOCKCHAIN':
            return cat.id === 'blockchain'
          default:
            return true
        }
      })

  // Show loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading categories...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        
        <main className="flex-1 p-3 sm:p-4 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-4xl mx-auto">
          {/* Mobile-First Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-6 px-2"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Choose Category
            </h1>
            <p className="text-blue-200 text-sm sm:text-base md:text-lg mb-2">
              Select a category to start your quiz journey
            </p>
            <p className="text-blue-300 text-xs sm:text-sm md:text-base">
              {categories.length} categories • 50+ questions • Multiple levels
            </p>
          </motion.div>

          {/* AdSense Banner - Mobile Optimized */}
          <AdBanner 
            adSlot="1111111111"
            adFormat="leaderboard"
            className="mb-4 sm:mb-6 mx-2"
          />

          {/* Category Tabs - Horizontal Scroll on Mobile */}
          <div className="flex overflow-x-auto gap-2 mb-4 sm:mb-6 pb-2 scrollbar-hide px-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab.name}
                <span className="ml-1 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Categories - Mobile-First Card Design */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-3 sm:space-y-4 px-2"
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-effect rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Icon and Info */}
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">
                      {category.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl truncate">
                          {category.name}
                        </h3>
                        <span className="bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                          Live
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                        <div className="text-yellow-400 font-bold flex items-center">
                          <span className="mr-1">🏆</span>
                          <span className="text-sm sm:text-base md:text-lg lg:text-xl">{category.prizePool}</span>
                        </div>
                        
                        <div className="text-blue-200 text-xs">
                          Entry: <span className="text-orange-400">🪙{category.entryFee}</span>
                        </div>
                      </div>
                      
                      <div className="text-gray-400 text-xs mt-1 hidden sm:block">
                        Winner announcement: 00:00:00
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Play Button */}
                  <div className="flex-shrink-0">
                    <button
                      className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all ${
                        state.isAuthenticated && state.user && state.user.coins >= category.entryFee
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-gray-600 text-gray-400'
                      }`}
                    >
                      {!state.isAuthenticated 
                        ? 'LOGIN' 
                        : state.user && state.user.coins >= category.entryFee 
                          ? 'PLAY' 
                          : 'COINS'}
                    </button>
                  </div>
                </div>

                {/* Topics - Desktop Only */}
                <div className="hidden md:block mt-3 pt-3 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.slice(0, 4).map((topic, idx) => (
                      <span
                        key={idx}
                        className="bg-white/10 text-blue-200 px-2 py-1 rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                    {category.subcategories.length > 4 && (
                      <span className="bg-white/10 text-blue-200 px-2 py-1 rounded text-xs">
                        +{category.subcategories.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tech News Section - Inserted between categories and bottom ad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 sm:mt-8 px-2"
          >
            <NewsSection />
          </motion.div>

          {/* Bottom Ad - Mobile Optimized */}
          <AdBanner 
            adSlot="2222222222"
            adFormat="rectangle"
            className="mt-4 sm:mt-6 mx-2"
          />
        </main>
        
        {/* Custom Scrollbar Styles */}
        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleLogin}
      />
    </>
  )
}