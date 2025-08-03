'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { QuizInterface } from './QuizInterface'
import { Navigation } from './Navigation'
import { RewardPopup } from './RewardPopup'

export default function ClientHomePage() {
  const router = useRouter()
  
  // Local component state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false)
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [appContext, setAppContext] = useState<any>(null)

  // Initialize app context dynamically on client
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { useApp } = await import('../app/providers')
        const context = useApp()
        setAppContext(context)
        setIsLoaded(true)
        
        // Auto-create guest user if not authenticated
        if (!context.state.isAuthenticated) {
          const guestUser = {
            id: `guest_${Date.now()}`,
            name: 'Guest User', 
            email: `guest_${Date.now()}@techkwiz.com`,
            coins: 0,
            level: 1,
            totalQuizzes: 0,
            correctAnswers: 0,
            joinDate: new Date().toISOString(),
            quizHistory: [],
            achievements: []
          }
          
          context.dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser })
        }
      } catch (error) {
        console.error('Failed to initialize app context:', error)
        setIsLoaded(true) // Show app anyway
      }
    }
    
    initializeApp()
  }, [])

  // Youth-focused quick start quiz data
  const quickStartQuiz = [
    {
      id: 'quick-0',
      question: "Your vibe check: Pick your aesthetic",
      options: ["Dark Academia ☕📚", "Soft Girl 🌸✨", "Y2K Cyber 💿🔮", "Cottagecore 🍄🌿"],
      correct_answer: -1, // No correct answer for personality
      difficulty: 'beginner' as const,
      question_type: 'this_or_that' as const,
      fun_fact: "Your aesthetic choice reflects your inner personality and how you want to be perceived by others!",
      category: 'swipe-personality',
      subcategory: 'Aesthetic'
    },
    {
      id: 'quick-1',
      question: "Decode this viral trend: 💃🔥🎵",
      options: ["Buss It Challenge", "Renegade Dance", "WAP Dance", "Savage Challenge"],
      correct_answer: 0,
      difficulty: 'beginner' as const,
      question_type: 'emoji_decode' as const,
      fun_fact: "The Buss It Challenge went viral during the pandemic, with millions participating worldwide!",
      category: 'pop-culture-flash',
      subcategory: 'TikTok'
    }
  ]

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      const isCorrect = answerIndex === quickStartQuiz[currentQuestion].correct_answer
      // For personality questions (correct_answer = -1), all answers are "correct"
      const isPersonalityQuestion = quickStartQuiz[currentQuestion].correct_answer === -1
      const finalIsCorrect = isPersonalityQuestion || isCorrect
      const coinsEarned = finalIsCorrect ? 25 : 0 // 25 coins per correct answer
      
      // Set states for popup
      setIsLastAnswerCorrect(finalIsCorrect)
      setLastEarnedCoins(coinsEarned)
      
      if (finalIsCorrect) {
        setScore(score + 1)
        
        // Award coins for correct answers on homepage quiz
        if (appContext) {
          appContext.dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
        }
        
        console.log(`✅ ${isPersonalityQuestion ? 'Great choice' : 'Correct answer'}! Earned ${coinsEarned} coins`)
      } else {
        console.log(`❌ Wrong answer, no coins earned`)
      }
      
      // Show reward popup for both correct and wrong answers on first question
      if (currentQuestion === 0) {
        setShowRewardPopup(true)
        return // Don't proceed to next question yet
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

  const handlePopupClose = () => {
    setShowRewardPopup(false)
    
    // After popup closes, proceed to next question
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

  const handleAdWatched = (coinsEarned: number) => {
    console.log(`📺 Ad watched! Earned ${coinsEarned} coins`)
    if (appContext) {
      appContext.dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
    }
  }

  // Show loading until app is initialized
  if (!isLoaded || !appContext) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
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
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading Youth Quiz Hub...</p>
          </div>
        </main>
      </div>
    )
  }

  // Show loading state
  if (appContext.state.loading) {
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

  // Auto-create guest user if not authenticated
  useEffect(() => {
    // This is now handled in the initial useEffect
  }, [])

  // Show results
  if (showResult && quizCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect p-8 rounded-2xl text-center max-w-md"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Quiz Completed!
            </h2>
            <div className="space-y-3">
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
                <p className="text-green-300 text-sm font-medium">Score</p>
                <p className="text-white text-2xl font-bold">{score}/{quickStartQuiz.length}</p>
              </div>
              
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-400/30">
                <p className="text-orange-300 text-sm font-medium">Coins Earned</p>
                <p className="text-white text-2xl font-bold">{score * 25}</p>
              </div>
            </div>
            
            <p className="text-blue-200 text-sm mt-6">
              Redirecting to categories...
            </p>
          </motion.div>
        </main>
      </div>
    )
  }

  // Main quiz interface
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        
        <main className="flex-1 p-4 flex flex-col items-center justify-center">
          
          {/* Welcome Message */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              🎉 Welcome to <span className="text-orange-400">Youth Quiz Hub!</span>
            </h1>
            <p className="text-blue-200 text-base">
              Level up with interactive quizzes designed for Gen Z!
            </p>
          </motion.div>
          
          {/* Quiz Interface */}
          <div className="w-full max-w-md">
            <QuizInterface
              questionData={quickStartQuiz[currentQuestion]}
              currentQuestion={currentQuestion}
              totalQuestions={quickStartQuiz.length}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
            />
          </div>
          
          {/* Features teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <p className="text-blue-200 text-sm mb-2">🚀 <strong>What's New:</strong></p>
              <div className="text-xs text-blue-200 space-y-1">
                <div>💰 Lower entry fees (20-45 coins)</div>
                <div>🏆 25 coins per correct answer</div>
                <div>🎯 Interactive formats & Gen Z vibes</div>
              </div>
            </div>
          </motion.div>
          
        </main>
      </div>
      
      {/* Reward Ad Popup */}
      <RewardPopup
        isVisible={showRewardPopup}
        onClose={handlePopupClose}
        onAdWatched={handleAdWatched}
        isCorrectAnswer={isLastAnswerCorrect}
        earnedCoins={lastEarnedCoins}
        rewardCoins={100}
      />
    </>
  )
}