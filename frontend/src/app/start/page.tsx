'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../providers'
import { Navigation } from '../../components/Navigation'
import { CategoryCard } from '../../components/CategoryCard'
import { AdBanner } from '../../components/AdBanner'

export default function StartPage() {
  const router = useRouter()
  const { state } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const categories = [
    {
      id: 'programming',
      name: 'Programming',
      icon: '💻',
      color: 'from-blue-500 to-purple-600',
      description: 'Test your coding knowledge',
      subcategories: ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js'],
      entryFee: 100,
      prizePool: 2000,
    },
    {
      id: 'ai',
      name: 'Artificial Intelligence',
      icon: '🤖',
      color: 'from-purple-500 to-pink-600',
      description: 'Explore AI concepts and technologies',
      subcategories: ['Machine Learning', 'Deep Learning', 'Neural Networks', 'NLP'],
      entryFee: 150,
      prizePool: 2500,
    },
    {
      id: 'web-dev',
      name: 'Web Development',
      icon: '🌐',
      color: 'from-green-500 to-teal-600',
      description: 'Frontend and backend technologies',
      subcategories: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'APIs'],
      entryFee: 100,
      prizePool: 2000,
    },
    {
      id: 'mobile-dev',
      name: 'Mobile Development',
      icon: '📱',
      color: 'from-orange-500 to-red-600',
      description: 'iOS and Android development',
      subcategories: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      entryFee: 120,
      prizePool: 2200,
    },
    {
      id: 'data-science',
      name: 'Data Science',
      icon: '📊',
      color: 'from-indigo-500 to-blue-600',
      description: 'Analytics and data processing',
      subcategories: ['Statistics', 'Python', 'R', 'SQL', 'Visualization'],
      entryFee: 130,
      prizePool: 2300,
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity',
      icon: '🔒',
      color: 'from-red-500 to-orange-600',
      description: 'Security concepts and practices',
      subcategories: ['Network Security', 'Ethical Hacking', 'Cryptography'],
      entryFee: 140,
      prizePool: 2400,
    },
    {
      id: 'cloud',
      name: 'Cloud Computing',
      icon: '☁️',
      color: 'from-cyan-500 to-blue-600',
      description: 'AWS, Azure, and Google Cloud',
      subcategories: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
      entryFee: 110,
      prizePool: 2100,
    },
    {
      id: 'blockchain',
      name: 'Blockchain',
      icon: '⛓️',
      color: 'from-yellow-500 to-orange-600',
      description: 'Cryptocurrency and blockchain tech',
      subcategories: ['Bitcoin', 'Ethereum', 'Smart Contracts', 'DeFi'],
      entryFee: 160,
      prizePool: 2600,
    },
  ]

  const categoryTabs = [
    { id: 'ALL', name: 'All', count: categories.length },
    { id: 'PROGRAMMING', name: 'Programming', count: 2 },
    { id: 'AI', name: 'AI & ML', count: 1 },
    { id: 'WEB', name: 'Web', count: 1 },
    { id: 'MOBILE', name: 'Mobile', count: 1 },
    { id: 'DATA', name: 'Data', count: 1 },
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
          default:
            return true
        }
      })

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-4 max-w-6xl mx-auto">
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
          <p className="text-blue-200 text-lg">
            Select a category to start your quiz journey
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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