'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from './providers'
import { Navigation } from '../components/Navigation'
import { AdBanner } from '../components/AdBanner'
import { QuizInterface } from '../components/QuizInterface'
import { FunFact } from '../components/FunFact'
import { Features } from '../components/Features'
import { AuthModal } from '../components/AuthModal'
import { RewardPopup } from '../components/RewardPopup'

export default function HomePage() {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0)

  // Quick start quiz data
  const quickStartQuiz = [
    {
      id: 'quick-0',
      question: "Which programming language is known as the 'language of the web'?",
      options: ["JavaScript", "Python", "Java", "C++"],
      correct_answer: 0,
      difficulty: 'beginner' as const,
      fun_fact: "JavaScript was created in just 10 days by Brendan Eich at Netscape in 1995.",
      category: 'programming',
      subcategory: 'Languages'
    },
    {
      id: 'quick-1',
      question: "What does 'AI' stand for in technology?",
      options: ["Advanced Intelligence", "Artificial Intelligence", "Automated Intelligence", "Algorithmic Intelligence"],
      correct_answer: 1,
      difficulty: 'beginner' as const,
      fun_fact: "The term 'Artificial Intelligence' was coined by John McCarthy in 1956 at the Dartmouth Conference.",
      category: 'ai',
      subcategory: 'Fundamentals'
    }
  ]

  const handleAnswerSelect = (answerIndex: number) => {
    if (!state.isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      const isCorrect = answerIndex === quickStartQuiz[currentQuestion].correct_answer
      const coinsEarned = isCorrect ? 50 : 0 // 50 coins per correct answer
      
      if (isCorrect) {
        setScore(score + 1)
        setLastEarnedCoins(coinsEarned)
        
        // Award coins for correct answers on homepage quiz
        dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
        
        console.log(`✅ Correct answer! Earned ${coinsEarned} coins`)
        
        // Show reward popup after first correct answer with earned coins
        if (currentQuestion === 0) {
          setShowRewardPopup(true)
          return // Don't proceed to next question yet
        }
      } else {
        console.log(`❌ Wrong answer, no coins earned`)
      }
      
      // Proceed to next question or complete quiz
      if (currentQuestion < quickStartQuiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setQuizCompleted(true)
        setShowResult(true)
        
        // After 3 seconds, redirect to categories page
        setTimeout(() => {
          router.push('/start')
        }, 3000)
      }
    }, 1000)
  }

  const handleClaimReward = () => {
    // Give additional 100 coins for watching rewarded ad
    const adRewardCoins = 100
    dispatch({ type: 'UPDATE_COINS', payload: adRewardCoins })
    
    console.log(`📺 Watched ad! Earned ${adRewardCoins} coins`)
    
    // Proceed to next question or complete quiz
    if (currentQuestion < quickStartQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setQuizCompleted(true)
      setShowResult(true)
      
      setTimeout(() => {
        router.push('/start')
      }, 3000)
    }
  }

  const handleSkipReward = () => {
    // Proceed without doubling coins
    if (currentQuestion < quickStartQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setQuizCompleted(true)
      setShowResult(true)
      
      setTimeout(() => {
        router.push('/start')
      }, 3000)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizCompleted(false)
    setShowResult(false)
    setShowRewardPopup(false)
    setLastEarnedCoins(0)
  }

  const handleLogin = (user: any) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    setShowAuthModal(false)
  }

  // Show loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading TechKwiz...</p>
          </div>
        </main>
      </div>
    )
  }

  // Ensure user is authenticated - create guest user if needed
  if (!state.isAuthenticated) {
    // Auto-login as guest user with 0 coins (session-based)
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
    
    // Set auth token to prevent infinite loop
    localStorage.setItem('techkwiz_auth', 'dummy_token_' + guestUser.id)
    
    // Save user to storage
    const allUsers = JSON.parse(localStorage.getItem('techkwiz_user') || '[]')
    allUsers.push({ ...guestUser, coins: 0 }) // Store without coins in localStorage
    localStorage.setItem('techkwiz_user', JSON.stringify(allUsers))
    
    // Dispatch login success and continue rendering
    dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser })
  }

  // Authenticated user quiz interface - Direct quiz like quizwinz.com
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        
        <main className="flex-1 flex flex-col justify-center p-4 w-full mx-auto">
          <div className="flex flex-col items-center space-y-6">
            {!quizCompleted ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full mx-auto"
                >
                  <QuizInterface
                    questionData={quickStartQuiz[currentQuestion]}
                    currentQuestion={currentQuestion}
                    totalQuestions={quickStartQuiz.length}
                    selectedAnswer={selectedAnswer}
                    onAnswerSelect={handleAnswerSelect}
                  />
                </motion.div>
                
                <div className="w-full mx-auto">
                  <FunFact fact={quickStartQuiz[currentQuestion]?.fun_fact} />
                </div>
                
                {/* Mobile Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="w-full mx-auto mt-4"
                >
                  <div className="glass-effect p-4 rounded-xl">
                    <h3 className="text-white font-bold text-center mb-3 text-lg">
                      🚀 Ready for More?
                    </h3>
                    <button
                      onClick={() => router.push('/start')}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-base rounded-xl transition-colors"
                    >
                      Explore All Categories
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="glass-effect p-4 sm:p-6 rounded-xl text-center w-full max-w-md mx-auto"
              >
                <div className="text-3xl sm:text-4xl mb-3">🎉</div>
                <h2 className="text-white text-lg sm:text-xl font-bold mb-3">
                  Quick Start Complete!
                </h2>
                <p className="text-blue-200 text-sm sm:text-base mb-2">
                  You scored {score} out of {quickStartQuiz.length}
                </p>
                <p className="text-orange-400 text-base sm:text-lg font-semibold mb-4">
                  Earned: {score * 50} coins
                </p>
                <div className="text-blue-200 text-xs sm:text-sm mb-4">
                  Redirecting to categories...
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/start')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-sm sm:text-base rounded-lg transition-colors"
                  >
                    Continue to Categories
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 text-sm sm:text-base rounded-lg transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Features Section - Simplified for Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 sm:mt-12 w-full max-w-lg mx-auto"
          >
            <Features />
          </motion.div>
          
          {/* Bottom Ad - Mobile Optimized */}
          <AdBanner 
            adSlot="9876543210"
            adFormat="rectangle"
            className="mt-6 sm:mt-8 w-full max-w-lg mx-auto"
          />
        </main>
      </div>

      {/* Reward Popup */}
      <RewardPopup
        isOpen={showRewardPopup}
        onClose={() => setShowRewardPopup(false)}
        coinsEarned={lastEarnedCoins}
        onClaimReward={handleClaimReward}
        onSkipReward={handleSkipReward}
      />
    </>
  )
}