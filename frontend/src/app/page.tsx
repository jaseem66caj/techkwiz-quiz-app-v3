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
      question: "Which programming language is known as the 'language of the web'?",
      options: ["JavaScript", "Python", "Java", "C++"],
      correctAnswer: 0,
      funFact: "JavaScript was created in just 10 days by Brendan Eich at Netscape in 1995."
    },
    {
      question: "What does 'AI' stand for in technology?",
      options: ["Advanced Intelligence", "Artificial Intelligence", "Automated Intelligence", "Algorithmic Intelligence"],
      correctAnswer: 1,
      funFact: "The term 'Artificial Intelligence' was coined by John McCarthy in 1956 at the Dartmouth Conference."
    }
  ]

  const handleAnswerSelect = (answerIndex: number) => {
    if (!state.isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      const isCorrect = answerIndex === quickStartQuiz[currentQuestion].correctAnswer
      const coinsEarned = 100
      
      if (isCorrect) {
        setScore(score + 1)
        setLastEarnedCoins(coinsEarned)
        dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
        
        // Show reward popup after first correct answer
        if (currentQuestion === 0) {
          setShowRewardPopup(true)
          return // Don't proceed to next question yet
        }
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
    // Double the coins
    dispatch({ type: 'UPDATE_COINS', payload: lastEarnedCoins })
    
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

  // Guest welcome screen
  if (!state.isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <Navigation />
          
          <main className="flex-1 flex flex-col justify-center p-3 sm:p-4 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-4xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-6 sm:mb-8"
            >
              <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">🚀</div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
                Welcome to <span className="text-orange-400">Tech</span>Kwiz
              </h1>
              <p className="text-blue-200 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 px-2">
                Test your tech knowledge, earn coins, and compete with others!
              </p>
              
              <div className="space-y-3 sm:space-y-4 px-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-colors"
                >
                  🎯 Start Your Quiz Journey
                </button>
                
                <p className="text-blue-300 text-xs sm:text-sm">
                  💡 Demo Mode: Use any email and password to get started
                </p>
              </div>
            </motion.div>

            {/* Features Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 px-2"
            >
              <div className="glass-effect p-3 sm:p-4 rounded-xl text-center">
                <div className="text-2xl sm:text-3xl mb-2">📚</div>
                <h3 className="text-white font-semibold text-sm">8 Categories</h3>
                <p className="text-blue-200 text-xs">Programming, AI, Web Dev & more</p>
              </div>
              
              <div className="glass-effect p-3 sm:p-4 rounded-xl text-center">
                <div className="text-2xl sm:text-3xl mb-2">🪙</div>
                <h3 className="text-white font-semibold text-sm">Earn Coins</h3>
                <p className="text-blue-200 text-xs">500 starting coins for new users</p>
              </div>
              
              <div className="glass-effect p-3 sm:p-4 rounded-xl text-center">
                <div className="text-2xl sm:text-3xl mb-2">🏆</div>
                <h3 className="text-white font-semibold text-sm">Compete</h3>
                <p className="text-blue-200 text-xs">Leaderboards & achievements</p>
              </div>
            </motion.div>

            {/* Sample Question Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-effect p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 mx-2"
            >
              <h3 className="text-white font-semibold text-center mb-3 sm:mb-4">
                📝 Sample Question
              </h3>
              <QuizInterface
                questionData={quickStartQuiz[0]}
                currentQuestion={0}
                totalQuestions={2}
                selectedAnswer={null}
                onAnswerSelect={handleAnswerSelect}
              />
            </motion.div>

            <AdBanner 
              adSlot="9876543210"
              adFormat="rectangle"
              className="mt-4 sm:mt-6 mx-2"
            />
          </main>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleLogin}
        />
      </>
    )
  }

  // Authenticated user quiz interface
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        
        <main className="flex-1 flex flex-col justify-center p-3 sm:p-4 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-4xl mx-auto">
          {/* AdSense Banner - Mobile Optimized */}
          <AdBanner 
            adSlot="1234567890"
            adFormat="auto"
            className="mb-3 sm:mb-4 md:mb-6 mx-2"
          />
          
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 md:space-y-6">
            {!quizCompleted ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full px-2"
                >
                  <QuizInterface
                    questionData={quickStartQuiz[currentQuestion]}
                    currentQuestion={currentQuestion}
                    totalQuestions={quickStartQuiz.length}
                    selectedAnswer={selectedAnswer}
                    onAnswerSelect={handleAnswerSelect}
                  />
                </motion.div>
                
                <FunFact fact={quickStartQuiz[currentQuestion]?.funFact} />
                
                {/* Mobile Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="w-full mt-4 sm:mt-6 px-2"
                >
                  <div className="glass-effect p-3 sm:p-4 rounded-xl">
                    <h3 className="text-white font-semibold text-center mb-2 sm:mb-3 text-sm">
                      🚀 Ready for More?
                    </h3>
                    <button
                      onClick={() => router.push('/start')}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
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
                className="glass-effect p-4 sm:p-6 md:p-8 rounded-2xl text-center w-full mx-2"
              >
                <div className="text-3xl sm:text-4xl mb-4">🎉</div>
                <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-4">
                  Quick Start Complete!
                </h2>
                <p className="text-blue-200 mb-2">
                  You scored {score} out of {quickStartQuiz.length}
                </p>
                <p className="text-orange-400 text-base sm:text-lg font-semibold mb-4">
                  Earned: {score * 100} coins
                </p>
                <div className="text-blue-200 text-sm mb-4">
                  Redirecting to categories...
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/start')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Continue to Categories
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-colors"
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
            className="mt-6 sm:mt-8 md:mt-12 px-2"
          >
            <Features />
          </motion.div>
          
          {/* Bottom Ad - Mobile Optimized */}
          <AdBanner 
            adSlot="9876543210"
            adFormat="rectangle"
            className="mt-4 sm:mt-6 md:mt-8 mx-2"
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