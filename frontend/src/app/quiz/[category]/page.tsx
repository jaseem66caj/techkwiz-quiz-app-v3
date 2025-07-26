'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../../providers'
import { Navigation } from '../../../components/Navigation'
import { QuizInterface } from '../../../components/QuizInterface'
import { FunFact } from '../../../components/FunFact'
import { AdBanner } from '../../../components/AdBanner'
import { QuizResult } from '../../../components/QuizResult'
import { AuthModal } from '../../../components/AuthModal'
import { RewardPopup } from '../../../components/RewardPopup'
import { seoConfig, generateStructuredData } from '../../../utils/seo'

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  fun_fact: string;
  category: string;
  subcategory: string;
}

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

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', coins: 10 },
  intermediate: { label: 'Intermediate', coins: 20 },
  advanced: { label: 'Advanced', coins: 30 }
}

interface QuizPageProps {
  params: Promise<{
    category: string
  }>
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter()
  const { state, dispatch } = useApp()
  
  // Category state
  const [categoryId, setCategoryId] = useState<string>('')
  const [categoryInfo, setCategoryInfo] = useState<QuizCategory | null>(null)
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // New features
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [quizStarted, setQuizStarted] = useState(false)
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [showRewardPopup, setShowRewardPopup] = useState(false)

  // API functions
  const fetchCategoryInfo = async (catId: string) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://e1fa722c-59e7-417e-8da9-1b5ce19cb430.preview.emergentagent.com';
      const response = await fetch(`${backendUrl}/api/quiz/categories/${catId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCategoryInfo(data);
        return data;
      } else {
        setError('Category not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to load category information');
      return null;
    }
  };

  const fetchQuestions = async (catId: string, count: number = 10) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://e1fa722c-59e7-417e-8da9-1b5ce19cb430.preview.emergentagent.com';
      const response = await fetch(`${backendUrl}/api/quiz/questions/${catId}?count=${count}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuizData(data);
        return data;
      } else {
        setError('No questions available for this category');
        return [];
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load quiz questions');
      return [];
    }
  };

  // SEO optimization
  useEffect(() => {
    if (categoryInfo && categoryId) {
      const seoData = seoConfig.quiz(categoryId, categoryInfo.name)
      document.title = seoData.title
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', seoData.description)
      }
      
      // Add keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', seoData.keywords)
      
      // Add structured data for quiz
      const structuredData = generateStructuredData.quiz(categoryInfo.name, quizData.length)
      let scriptTag = document.querySelector('script[type="application/ld+json"][data-quiz]')
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.setAttribute('type', 'application/ld+json')
        scriptTag.setAttribute('data-quiz', 'true')
        document.head.appendChild(scriptTag)
      }
      scriptTag.textContent = JSON.stringify(structuredData)
    }
  }, [categoryInfo, categoryId, quizData])
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0)
  const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLogin = (user: any) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    setShowAuthModal(false)
  }

  // Handle async params and load data from API
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      const catId = resolvedParams.category
      setCategoryId(catId)
      
      // Fetch category info and questions from database
      const categoryData = await fetchCategoryInfo(catId)
      if (categoryData) {
        await fetchQuestions(catId, 10) // Get 10 questions
      }
      setLoading(false)
    }
    resolveParams()
  }, [params])

  // Auto-start quiz when category is loaded (skip difficulty selection)
  useEffect(() => {
    if (categoryInfo && categoryId && !quizStarted && !loading && quizData.length > 0) {
      // Auto-set to beginner difficulty and start quiz
      setDifficulty('beginner')
      
      // Deduct entry fee first
      const entryFee = categoryInfo.entry_fee
      if (state.user && state.user.coins >= entryFee) {
        dispatch({ type: 'UPDATE_COINS', payload: -entryFee })
        setTimeLeft(30) // Set default time
        setQuizStarted(true)
      } else {
        // Redirect back to categories if insufficient coins
        router.push('/start')
      }
    }
  }, [categoryInfo, categoryId, quizStarted, loading, quizData.length, state.user, dispatch, router])

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted && quizStarted && quizData.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !quizCompleted && quizStarted) {
      handleAnswerSelect(-1) // Time up
    }
  }, [timeLeft, quizCompleted, quizStarted, quizData.length])

  const handleDifficultySelect = (selectedDifficulty: 'beginner' | 'intermediate' | 'advanced') => {
    if (!categoryInfo) return
    
    const config = DIFFICULTY_CONFIG[selectedDifficulty]
    const requiredCoins = categoryInfo.entry_fee * (selectedDifficulty === 'advanced' ? 2 : selectedDifficulty === 'intermediate' ? 1.5 : 1)
    
    if (state.user.coins >= requiredCoins) {
      setDifficulty(selectedDifficulty)
      setQuizStarted(true)
      // Deduct entry fee
      dispatch({ type: 'UPDATE_COINS', payload: -requiredCoins })
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizData.length === 0) return
    
    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      const isCorrect = answerIndex === quizData[currentQuestion].correct_answer
      const config = DIFFICULTY_CONFIG[difficulty]
      const answeredCount = questionsAnsweredCount + 1
      setQuestionsAnsweredCount(answeredCount)
      
      if (isCorrect) {
        const newScore = score + 1
        setScore(newScore)
        
        // Calculate coins with streak bonus
        const baseCoins = config.coinsPerCorrect
        const streakBonus = Math.min(streak * 10, 100) // Max 100 bonus
        const timeBonus = Math.floor(timeLeft / 5) * 5 // 5 coins per 5 seconds left
        const totalCoins = baseCoins + streakBonus + timeBonus
        
        setTotalCoinsEarned(prev => prev + totalCoins)
        setLastEarnedCoins(totalCoins)
        setStreak(prev => {
          const newStreak = prev + 1
          setMaxStreak(Math.max(maxStreak, newStreak))
          return newStreak
        })
        
        dispatch({ type: 'UPDATE_COINS', payload: totalCoins })
        
        // Show reward popup after every 5 questions (but not on the last question)
        if (answeredCount % 5 === 0 && currentQuestion < quizData.length - 1) {
          setShowRewardPopup(true)
          return // Don't proceed to next question yet
        }
      } else {
        setStreak(0)
      }
      
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTimeLeft(DIFFICULTY_CONFIG[difficulty].timeLimit)
      } else {
        setQuizCompleted(true)
        
        // Save quiz result
        dispatch({ 
          type: 'END_QUIZ', 
          payload: { 
            category: categoryId, 
            difficulty,
            score, 
            totalQuestions: quizData.length,
            correctAnswers: score,
            coinsEarned: totalCoinsEarned,
            maxStreak,
            completedAt: new Date().toISOString()
          }
        })
      }
    }, 1500)
  }

  const handleClaimReward = () => {
    // Double the coins
    dispatch({ type: 'UPDATE_COINS', payload: lastEarnedCoins })
    
    // Proceed to next question
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].timeLimit)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleSkipReward = () => {
    // Proceed without doubling coins
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].timeLimit)
    } else {
      setQuizCompleted(true)
    }
  }

  const handlePlayAgain = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizCompleted(false)
    setQuizStarted(false)
    setTotalCoinsEarned(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(30)
    setShowRewardPopup(false)
    setLastEarnedCoins(0)
    setQuestionsAnsweredCount(0)
  }

  // Loading state - show until quiz is fully ready
  if (loading || !categoryInfo || !quizStarted || quizData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            {error ? (
              <>
                <div className="text-red-400 text-xl mb-4">⚠️</div>
                <p className="text-white mb-4">{error}</p>
                <button
                  onClick={() => router.push('/start')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Back to Categories
                </button>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">
                  {loading ? 'Loading quiz...' : 
                   !categoryInfo ? 'Loading category...' :
                   !quizStarted ? 'Starting quiz...' :
                   'Preparing questions...'}
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    )
  }



  // Quiz interface - direct start
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />
      
      <main className="flex-1 p-4 w-full max-w-lg mx-auto">
        {/* Quiz Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-4xl">{categoryInfo.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {categoryInfo.name} Quiz
              </h1>
              <p className="text-blue-200 capitalize">
                {difficulty} Level
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress & Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-effect p-4 rounded-xl mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{currentQuestion + 1}/{quizData.length}</div>
              <div className="text-xs text-blue-200">Progress</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                {timeLeft}s
              </div>
              <div className="text-xs text-blue-200">Time Left</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">{score}</div>
              <div className="text-xs text-blue-200">Correct</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">{streak}</div>
              <div className="text-xs text-blue-200">Streak</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
            />
          </div>
        </motion.div>

        <div className="flex flex-col items-center space-y-6">
          {!quizCompleted ? (
            <>
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl"
              >
                <QuizInterface
                  questionData={quizData[currentQuestion]}
                  currentQuestion={currentQuestion}
                  totalQuestions={quizData.length}
                  selectedAnswer={selectedAnswer}
                  onAnswerSelect={handleAnswerSelect}
                />
              </motion.div>
              
              <FunFact fact={quizData[currentQuestion]?.fun_fact} />
            </>
          ) : (
            <QuizResult
              score={score}
              totalQuestions={quizData.length}
              category={categoryInfo.name}
              difficulty={difficulty}
              coinsEarned={totalCoinsEarned}
              maxStreak={maxStreak}
              onPlayAgain={handlePlayAgain}
              onBackToCategories={() => router.push('/start')}
            />
          )}
        </div>

        {/* Bottom Ad */}
        <AdBanner 
          adSlot="4444444444"
          adFormat="rectangle"
          className="mt-8"
        />
      </main>
      
      {/* Reward Popup */}
      <RewardPopup
        isOpen={showRewardPopup}
        onClose={() => setShowRewardPopup(false)}
        coinsEarned={lastEarnedCoins}
        onClaimReward={handleClaimReward}
        onSkipReward={handleSkipReward}
      />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleLogin}
      />
    </div>
  )
}