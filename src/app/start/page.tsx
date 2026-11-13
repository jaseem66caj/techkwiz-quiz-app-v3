'use client'

import * as Sentry from '@sentry/nextjs'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useApp } from '../providers'
import { UnifiedNavigation } from '@/components/navigation'

const NewsSection = dynamic(() => import('@/components/ui/NewsSection').then(mod => mod.NewsSection), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-800/50 rounded-xl animate-pulse" />
})

const FortuneCookie = dynamic(() => import('@/components/ui/FortuneCookie').then(mod => mod.FortuneCookie), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-800/50 rounded-xl animate-pulse" />
})

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
  const { state } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [navigating, setNavigating] = useState<string | null>(null) // Track which category is being navigated to

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

      console.info('🔄 Loading quiz categories...');
      const { QUIZ_CATEGORIES, QUIZ_DATABASE } = await import('@/data/quizDatabase');

      if (!QUIZ_CATEGORIES || typeof QUIZ_CATEGORIES !== 'object') {
        throw new Error('Invalid quiz categories data structure');
      }

      const categoriesArray = Object.values(QUIZ_CATEGORIES);

      if (categoriesArray.length === 0) {
        throw new Error('No quiz categories found');
      }

      setCategories(categoriesArray);
      const questionTotal = Object.values(QUIZ_DATABASE).reduce((sum, bank) => sum + bank.length, 0);
      setTotalQuestions(questionTotal);
      console.info('✅ Loaded categories from local database:', categoriesArray.length);
    } catch (error) {
      console.error('❌ Error loading local categories:', error);

      // Report error to Sentry with context
      Sentry.captureException(error, {
        tags: {
          component: 'StartPage',
          action: 'fetchCategories'
        },
        extra: {
          userAuthenticated: state.isAuthenticated,
          userId: state.user?.id,
          timestamp: new Date().toISOString()
        }
      });

      setError(`Failed to load quiz categories: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Provide fallback categories if main data fails
      const { calculateCategoryMaxCoins } = await import('@/utils/rewardCalculator');
      setCategories([
        {
          id: 'programming',
          name: 'Programming Basics',
          icon: '💻',
          color: 'from-blue-500 to-purple-600',
          description: 'Test your programming knowledge',
          subcategories: ['JavaScript', 'Python', 'Web Development'],
          entry_fee: 0,
          prize_pool: calculateCategoryMaxCoins('programming') // Automatically calculates based on QUIZ_DATABASE['programming'].length × 50 coins
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [])

  const categoryTabs = [
    { id: 'ALL', name: 'All', count: categories.length },
    ...categories.map(category => ({ id: category.id, name: category.name, count: 1 })),
  ]

  const handleCategorySelect = (categoryId: string) => {
    try {
      // PERFORMANCE OPTIMIZATION: Provide immediate visual feedback
      setNavigating(categoryId);

      const category = categories.find(cat => cat.id === categoryId)
      if (!category) {
        console.error('Category not found:', categoryId)
        Sentry.captureMessage('Category not found', {
          level: 'error',
          tags: { component: 'StartPage', action: 'categorySelect' },
          extra: { categoryId, availableCategories: categories.map(c => c.id) }
        });
        setError('Category not found')
        setNavigating(null)
        return
      }

      router.push(`/quiz/${categoryId}`)
    } catch (error) {
      console.error('Error in handleCategorySelect:', error);
      Sentry.captureException(error, {
        tags: { component: 'StartPage', action: 'categorySelect' },
        extra: { categoryId, userState: state.user }
      });
      setError('An error occurred while selecting the category. Please try again.');
    }
  }



  const filteredCategories = selectedCategory === 'ALL'
    ? categories
    : categories.filter(cat => cat.id === selectedCategory)

  // Show loading state for categories or auth initialization
  if (loading || state.loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <UnifiedNavigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">{loading ? 'Loading categories...' : 'Initializing...'}</p>
          </div>
        </main>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <UnifiedNavigation />
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
        <UnifiedNavigation />

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
              Play any category for free. No profile or coins required.
            </p>
            <p className="text-blue-300 text-xs">
              {categories.length} categories • {totalQuestions} questions • Multiple levels
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
                data-testid="category-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer border border-white/10"
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
                          <span className="text-green-300 font-semibold">Free entry</span>
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

                  {/* Right Section - PLAY Button only (removed Live Badge) */}
                  <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                    {/* PLAY Button with loading state */}
                    <button
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
                        navigating === category.id
                          ? 'bg-orange-600 cursor-wait'
                          : 'bg-orange-500 hover:bg-orange-600'
                      } text-white`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategorySelect(category.id)
                      }}
                      disabled={navigating === category.id}
                    >
                      {navigating === category.id ? (
                        <div className="flex items-center space-x-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        'PLAY'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* News Section - Mobile-web style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6"
          >
            <NewsSection />
          </motion.div>
        </main>
      </div>


    </>
  )
}
