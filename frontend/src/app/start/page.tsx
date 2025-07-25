'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../providers'
import { Navigation } from '../../components/Navigation'
import { CategoryCard } from '../../components/CategoryCard'
import { AdBanner } from '../../components/AdBanner'
import { QUIZ_CATEGORIES } from '../../data/quizDatabase'

export default function StartPage() {
  const router = useRouter()
  const { state } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('ALL')

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
    router.push(`/quiz/${categoryId}`)
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Tech Category
          </h1>
          <p className="text-blue-200 text-lg mb-2">
            Select a category to start your quiz journey
          </p>
          <p className="text-blue-300 text-sm">
            {categories.length} categories • 50+ original questions • Multiple difficulty levels
          </p>
        </motion.div>

        {/* AdSense Banner */}
        <AdBanner 
          adSlot="1111111111"
          adFormat="leaderboard"
          className="mb-8"
        />

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === tab.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab.name}
              <span className="ml-2 text-sm opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <CategoryCard
                category={category}
                onSelect={handleCategorySelect}
                userCoins={state.user.coins}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 glass-effect p-8 rounded-2xl"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            🎯 Quiz Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎚️</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                3 Difficulty Levels
              </h3>
              <p className="text-blue-200 text-sm">
                Beginner, Intermediate, and Advanced levels with different rewards and challenges
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Timed Questions
              </h3>
              <p className="text-blue-200 text-sm">
                Race against time! Faster answers earn bonus coins and build your streak
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Streak System
              </h3>
              <p className="text-blue-200 text-sm">
                Build consecutive correct answers for streak bonuses and special achievements
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Ad */}
        <AdBanner 
          adSlot="2222222222"
          adFormat="rectangle"
          className="mt-8"
        />
      </main>
    </div>
  )
}