'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../app/providers'
import { UnifiedQuizInterface } from './UnifiedQuizInterface'
import { UnifiedNavigation } from './UnifiedNavigation'
import { calculateCorrectAnswerReward, calculateQuizReward } from '../utils/rewardCalculator'


export default function ClientHomePage() {
  const { state, dispatch } = useApp()
  const router = useRouter()

  // Local component state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  // Refs for cleanup
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  const isMountedRef = useRef(true)


  // Cleanup function for timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      clearAllTimeouts()
    }
  }, [clearAllTimeouts])

  // Auto-create guest user if not authenticated
  useEffect(() => {
    if (!state.isAuthenticated) {
      try {
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

        dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser })
      } catch (error) {
        console.error('Error creating guest user:', error)
        // Import Sentry dynamically to avoid SSR issues
        import('@sentry/nextjs').then(Sentry => {
          Sentry.captureException(error, {
            tags: { component: 'ClientHomePage', action: 'createGuestUser' }
          })
        })
      }
    }
  }, [state.isAuthenticated, dispatch])

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
    },
    {
      id: 'quick-2',
      question: "Which Gen Z slang means 'absolutely amazing'?",
      options: ["Salty", "Bussin", "Cap", "Mid"],
      correct_answer: 1,
      difficulty: 'beginner' as const,
      question_type: 'multiple_choice' as const,
      fun_fact: "Bussin originated from AAVE and became mainstream through social media, especially when describing good food!",
      category: 'pop-culture-flash',
      subcategory: 'Slang'
    },
    {
      id: 'quick-3',
      question: "What's your ideal Friday night?",
      options: ["Netflix & chill 📺", "Gaming with friends 🎮", "Going out dancing 💃", "Reading a good book 📚"],
      correct_answer: -1, // No correct answer for personality
      difficulty: 'beginner' as const,
      question_type: 'this_or_that' as const,
      fun_fact: "Your ideal Friday night reveals whether you're more introverted or extroverted in your social preferences!",
      category: 'swipe-personality',
      subcategory: 'Social'
    },
    {
      id: 'quick-4',
      question: "Which app was NOT owned by Meta (Facebook) in 2023?",
      options: ["Instagram", "WhatsApp", "TikTok", "Threads"],
      correct_answer: 2,
      difficulty: 'intermediate' as const,
      question_type: 'multiple_choice' as const,
      fun_fact: "TikTok is owned by ByteDance, a Chinese company, which has been a major point of discussion in tech policy!",
      category: 'pop-culture-flash',
      subcategory: 'Tech'
    }
  ]

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)

    const timeout1 = setTimeout(() => {
      if (!isMountedRef.current) return

      try {
        const isCorrect = answerIndex === quickStartQuiz[currentQuestion].correct_answer
        // For personality questions (correct_answer = -1), all answers are "correct"
        const isPersonalityQuestion = quickStartQuiz[currentQuestion].correct_answer === -1
        const finalIsCorrect = isPersonalityQuestion || isCorrect
        const rewardResult = finalIsCorrect ? calculateCorrectAnswerReward() : { coins: 0 };
        const coinsEarned = rewardResult.coins;

        if (finalIsCorrect) {
          setScore(prevScore => {
            const newScore = prevScore + 1
            console.log(`✅ ${isPersonalityQuestion ? 'Great choice' : 'Correct answer'}! Earned ${coinsEarned} coins (Score: ${newScore})`)
            return newScore
          })

          // Award coins for correct answers on homepage quiz
          dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
        } else {
          console.log(`❌ Wrong answer, no coins earned`)
        }

        // Proceed to next question after delay
        const timeout2 = setTimeout(() => {
          if (!isMountedRef.current) return

          setCurrentQuestion(prevQuestion => {
            if (prevQuestion < quickStartQuiz.length - 1) {
              setSelectedAnswer(null)
              return prevQuestion + 1
            } else {
              setShowResult(true)
              setQuizCompleted(true)
              return prevQuestion
            }
          })
        }, 1500)

        timeoutRefs.current.push(timeout2)
      } catch (error) {
        console.error('Error in handleAnswerSelect:', error)
        import('@sentry/nextjs').then(Sentry => {
          Sentry.captureException(error, {
            tags: { component: 'ClientHomePage', action: 'handleAnswerSelect' }
          })
        })
      }
    }, 1000)

    timeoutRefs.current.push(timeout1)
  }, [selectedAnswer, currentQuestion, dispatch])



  const handleAdWatched = (coinsEarned: number) => {
    console.log(`📺 Ad watched! Earned ${coinsEarned} coins`)
    dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
  }



  // Show loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <UnifiedNavigation mode="minimal" />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading TechKwiz...</p>
          </div>
        </main>
      </div>
    )
  }

  // (Auto-create guest user is now handled in useEffect above)

  // Show results
  if (showResult && quizCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <UnifiedNavigation mode="minimal" />
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
                <p className="text-white text-2xl font-bold">{calculateQuizReward(score, quickStartQuiz.length).totalCoins}</p>
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
        <UnifiedNavigation mode="minimal" />
        
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
            <UnifiedQuizInterface
              question={quickStartQuiz[currentQuestion]}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              questionAnswered={selectedAnswer !== null}
              questionNumber={currentQuestion + 1}
              totalQuestions={quickStartQuiz.length}
              mode="basic"
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
                <div>🏆 50 coins per correct answer</div>
                <div>🎯 Interactive formats & Gen Z vibes</div>
              </div>
            </div>
          </motion.div>
          
        </main>
      </div>
      

    </>
  )
}