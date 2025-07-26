'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../providers'
import { Navigation } from '../../components/Navigation'
import { CategoryPageTopAd, CategoryPageBottomAd, HeaderBannerAd, SidebarRightAd } from '../../components/AdBanner'
import { AuthModal } from '../../components/AuthModal'
import { NewsSection } from '../../components/NewsSection'
import { RewardPopup } from '../../components/RewardPopup'
import { CategoryShare, SocialShare } from '../../components/SocialShare'
import { FortuneCookie } from '../../components/FortuneCookie'
import { Metadata } from 'next'
import { seoConfig } from '../../utils/seo'

interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subcategories: string[];
  entry_fee: number;
  prize_pool: number;
}

export default function StartPage() {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [selectedCategoryForReward, setSelectedCategoryForReward] = useState<string | null>(null)
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://c55faa32-b8b8-4d69-a850-28e031d21be6.preview.emergentagent.com';
      const response = await fetch(`${backendUrl}/api/quiz/categories`);
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
        setError('Failed to load quiz categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load quiz categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    
    // Set page title and meta description for SEO
    document.title = seoConfig.categories.title
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', seoConfig.categories.description)
    }
    
    // Add keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', seoConfig.categories.keywords)
  }, [])

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
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) return

    // Auto-login if not authenticated (guest user)
    if (!state.isAuthenticated) {
      const guestUser = {
        name: 'Guest User',
        email: 'guest@techkwiz.com',
        coins: 500,
        quizHistory: [],
        achievements: [],
        joinDate: new Date().toISOString()
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser })
      
      // Wait for state update then check coins
      setTimeout(() => {
        const currentCoins = 500 // We know guest starts with 500
        if (currentCoins >= category.entry_fee) {
          router.push(`/quiz/${categoryId}`)
        } else {
          setSelectedCategoryForReward(categoryId)
          setShowRewardPopup(true)
        }
      }, 100)
    } else {
      // Check if user has enough coins
      const userCoins = state.user?.coins || 0
      if (userCoins >= category.entry_fee) {
        // User has enough coins, proceed directly to quiz
        router.push(`/quiz/${categoryId}`)
      } else {
        // Show rewarded ad popup to earn coins
        setSelectedCategoryForReward(categoryId)
        setShowRewardPopup(true)
      }
    }
  }

  const handleClaimReward = () => {
    // Give user coins (simulate watching ad)
    const coinsEarned = 200 // Give 200 coins for watching ad
    dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
    setShowRewardPopup(false)
    
    // Now check if they can afford the category
    if (selectedCategoryForReward) {
      const category = categories.find(cat => cat.id === selectedCategoryForReward)
      if (category && (state.user?.coins || 0) + coinsEarned >= category.entry_fee) {
        router.push(`/quiz/${selectedCategoryForReward}`)
      }
    }
    setSelectedCategoryForReward(null)
  }

  const handleSkipReward = () => {
    setShowRewardPopup(false)
    setSelectedCategoryForReward(null)
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
  if (loading) {
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="text-red-400 text-xl mb-4">⚠️</div>
            <p className="text-white mb-4">{error}</p>
            <button
              onClick={fetchCategories}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      {/* Fortune Cookie Feature */}
      <FortuneCookie />
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        
        {/* Header Banner Ad */}
        <HeaderBannerAd className="mt-4" />
        
        <main className="flex-1 p-3 sm:p-4 w-full mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile-First Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-4 px-2"
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                  Choose Category
                </h1>
                <p className="text-sm sm:text-base text-blue-200 mb-1">
                  Select a category to start your quiz journey
                </p>
                <p className="text-xs sm:text-sm text-blue-300">
                  {categories.length} categories • 50+ questions • Multiple levels
                </p>
              </motion.div>

              {/* Top Category Page Ad */}
              <CategoryPageTopAd className="mb-3" />

              {/* Category Tabs - Compact Mobile Design */}
              <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide px-2">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all min-w-fit ${
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

              {/* Categories - Compact Qureka Style Cards */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="space-y-2 px-2"
              >
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass-effect rounded-xl p-3 hover:scale-[1.02] transition-all duration-300 cursor-pointer w-full"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left Section - Icon and Basic Info */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Category Icon */}
                        <div className="text-2xl sm:text-3xl flex-shrink-0">
                          {category.icon}
                        </div>
                        
                        {/* Category Details */}
                        <div className="flex-1 min-w-0">
                          {/* Category Name */}
                          <div className="mb-1">
                            <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                              {category.name}
                            </h3>
                          </div>
                          
                          {/* Prize and Entry Fee */}
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <div className="text-yellow-400 font-bold flex items-center">
                              <span className="mr-1 text-sm">🏆</span>
                              <span className="text-sm">{category.prize_pool}</span>
                            </div>
                            
                            <div className="text-blue-200 text-xs">
                              Entry: <span className="text-orange-400 font-semibold">🪙{category.entry_fee}</span>
                            </div>
                          </div>
                          
                          {/* Winner Announcement with Random Timer */}
                          <div className="text-gray-400 text-xs mt-1">
                            Winner: {(() => {
                              // Generate random timer for each category
                              const timers = ['01:23:45', '02:15:30', '00:45:12', '03:22:18', '01:55:42', '00:28:36', '02:33:29', '01:08:54', '00:52:17'];
                              const randomIndex = Math.abs(category.name.length + category.id.length) % timers.length;
                              return timers[randomIndex];
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Live Badge and Action Button */}
                      <div className="flex-shrink-0 ml-2 flex flex-col items-end space-y-1">
                        {/* Live Badge - Static on Right */}
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          Live
                        </span>
                        
                        {/* Action Button - Always PLAY */}
                        <button
                          className="px-2 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-all bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCategorySelect(category.id)
                          }}
                        >
                          PLAY
                        </button>
                      </div>
                    </div>

                    {/* Topics - Only show on larger screens and collapse for mobile */}
                    <div className="hidden sm:block mt-2 pt-2 border-t border-white/10">
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.slice(0, 3).map((topic, idx) => (
                          <span
                            key={idx}
                            className="bg-white/10 text-blue-200 px-2 py-0.5 rounded text-xs"
                          >
                            {topic}
                          </span>
                        ))}
                        {category.subcategories.length > 3 && (
                          <span className="bg-white/10 text-blue-200 px-2 py-0.5 rounded text-xs">
                            +{category.subcategories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

          {/* Bottom Category Page Ad */}
          <CategoryPageBottomAd className="mt-6" />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block lg:w-80 space-y-6">
          <SidebarRightAd />
          
          {/* Social Sharing Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="glass-effect p-6 rounded-2xl"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <span className="mr-2">🚀</span>
              Share TechKwiz
            </h3>
            <p className="text-blue-200 text-sm mb-4">
              Challenge your friends to beat your scores!
            </p>
            <SocialShare 
              title="🚀 Join me on TechKwiz - Test Your Tech Knowledge!"
              hashtags={['TechKwiz', 'Programming', 'TechSkills', 'Quiz']}
            />
          </motion.div>

          {/* Stats Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="glass-effect p-6 rounded-2xl"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Platform Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-200">Total Quizzes:</span>
                <span className="text-white font-semibold">{categories.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Questions:</span>
                <span className="text-white font-semibold">50+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Difficulty Levels:</span>
                <span className="text-white font-semibold">3</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tech News Section - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-6 sm:mt-8 px-2"
      >
        <NewsSection />
      </motion.div>
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

      <RewardPopup
        isOpen={showRewardPopup}
        onClose={() => setShowRewardPopup(false)}
        coinsEarned={200}
        onClaimReward={handleClaimReward}
        onSkipReward={handleSkipReward}
      />
    </>
  )
}