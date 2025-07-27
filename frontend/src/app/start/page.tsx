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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://6617dc70-8b2e-4e8f-97a1-db89d2a8d414.preview.emergentagent.com';
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

    // Check if user is authenticated
    if (!state.isAuthenticated) {
      // Create guest user with 0 coins
      const guestUser = {
        id: `guest_${Date.now()}`,
        name: 'Guest User',
        email: `guest_${Date.now()}@techkwiz.com`,
        coins: 0, // Always start with 0 coins
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        achievements: []
      }
      
      console.log('🔄 Creating guest user with 0 coins:', guestUser)
      dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser })
      
      // Show reward popup since user has 0 coins
      setSelectedCategoryForReward(categoryId)
      setShowRewardPopup(true)
      return
    }

    // Check if user can afford the category
    const userCoins = state.user?.coins || 0
    if (userCoins >= category.entry_fee) {
      // User can afford, proceed to quiz
      router.push(`/quiz/${categoryId}`)
    } else {
      // User can't afford, show reward popup
      console.log(`💰 Insufficient coins: ${userCoins}/${category.entry_fee}`)
      setSelectedCategoryForReward(categoryId)
      setShowRewardPopup(true)
    }
  }

  const handleClaimReward = () => {
    // Give user 100 coins for watching rewarded ad
    const coinsEarned = 100
    dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
    setShowRewardPopup(false)
    
    console.log(`📺 Watched rewarded ad! Earned ${coinsEarned} coins`)
    
    // Check if they can now afford the category
    if (selectedCategoryForReward) {
      const category = categories.find(cat => cat.id === selectedCategoryForReward)
      const newCoinTotal = (state.user?.coins || 0) + coinsEarned
      
      if (category && newCoinTotal >= category.entry_fee) {
        console.log(`✅ Can now afford ${category.name}! (${newCoinTotal}/${category.entry_fee})`)
        router.push(`/quiz/${selectedCategoryForReward}`)
      } else if (category) {
        console.log(`❌ Still can't afford ${category.name} (${newCoinTotal}/${category.entry_fee})`)
        // Could show another reward popup or message here
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
      
      <div className="min-h-screen bg-transparent">
        <Navigation />
        
        <main className="px-4 py-4">
          {/* Mobile-web Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold text-white mb-2">
              Choose Category
            </h1>
            <p className="text-blue-200 text-sm mb-1">
              Select a category to start your quiz journey
            </p>
            <p className="text-blue-300 text-xs">
              {categories.length} categories • 50+ questions • Multiple levels
            </p>
          </motion.div>

          {/* Category Tabs - Mobile-web style */}
          <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all min-w-fit ${
                  selectedCategory === tab.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-white hover:bg-gray-600/50'
                }`}
              >
                {tab.name}
                <span className="ml-1 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
                  </button>
                ))}
              </div>

          {/* Categories Grid - Mobile-web style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-3"
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer border border-white/10"
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Icon and Info */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Category Icon */}
                    <div className="text-3xl flex-shrink-0">
                      {category.icon}
                    </div>
                    
                    {/* Category Details */}
                    <div className="flex-1 min-w-0">
                      {/* Category Name */}
                      <h3 className="text-white font-bold text-base leading-tight mb-1">
                        {category.name}
                      </h3>
                      
                      {/* Prize and Entry Fee */}
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="text-yellow-400 font-semibold flex items-center">
                          <span className="mr-1">🏆</span>
                          <span>{category.prize_pool}</span>
                        </div>
                        
                        <div className="text-blue-300">
                          Entry: <span className="text-orange-400 font-semibold">🪙{category.entry_fee}</span>
                        </div>
                      </div>
                      
                      {/* Winner Timer */}
                      <div className="text-gray-400 text-xs mt-1">
                        Winner: {(() => {
                          const timers = ['01:23:45', '02:15:30', '00:45:12', '03:22:18', '01:55:42', '00:28:36', '02:33:29', '01:08:54', '00:52:17'];
                          const randomIndex = Math.abs(category.name.length + category.id.length) % timers.length;
                          return timers[randomIndex];
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Live Badge and PLAY Button */}
                  <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                    {/* Live Badge */}
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Live
                    </span>
                    
                    {/* PLAY Button */}
                    <button
                      className="px-4 py-2 rounded-lg font-bold text-sm transition-all bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategorySelect(category.id)
                      }}
                    >
                      PLAY
                    </button>
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
        coinsEarned={100}
        onClaimReward={handleClaimReward}
        onSkipReward={handleSkipReward}
      />
    </>
  )
}