'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from './providers'
import { EnhancedQuizInterface } from '../components/EnhancedQuizInterface'
import { NewRewardPopup } from '../components/NewRewardPopup'
import { OnboardingFlow } from '../components/OnboardingFlow'
import { ExitConfirmationModal } from '../components/ExitConfirmationModal'
import { useExitPrevention } from '../hooks/useExitPrevention'
import { apiRequestJson } from '../utils/api'

export default function HomePage() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  
  // Onboarding flow state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [onboardingSkipped, setOnboardingSkipped] = useState(false)
  
  // Exit prevention state
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  
  // Local component state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false)
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0)
  const [rewardConfig, setRewardConfig] = useState<any>(null)

  // Exit prevention hook - activate during quiz
  const { disablePrevention } = useExitPrevention({
    isActive: !showOnboarding && !onboardingCompleted && !quizCompleted && !showResult,
    onExitAttempt: () => {
      setShowExitConfirmation(true)
    },
    customMessage: "Are you sure you want to leave? Your progress will be lost!"
  })

  // Debug onboarding state
  useEffect(() => {
    console.log('🔧 HomePage: Onboarding state -', {
      showOnboarding,
      onboardingCompleted, 
      onboardingSkipped,
      userCoins: state.user?.coins
    })
  }, [showOnboarding, onboardingCompleted, onboardingSkipped, state.user?.coins])

  // Debug reward popup state
  useEffect(() => {
    console.log('🔧 HomePage: showRewardPopup state changed to:', showRewardPopup)
  }, [showRewardPopup])

  // Fetch reward configuration with improved error handling
  useEffect(() => {
    const fetchRewardConfig = async () => {
      try {
        const config = await apiRequestJson('/api/quiz/rewarded-config')
        setRewardConfig(config)
        console.log('✅ HomePage: Reward config loaded successfully:', config)
      } catch (error) {
        console.error('❌ HomePage: Failed to fetch reward config:', error)
        // Set default config on network failure
        setRewardConfig({
          coin_reward: 100,
          is_active: true,
          show_on_insufficient_coins: true,
          show_during_quiz: true
        })
      }
    }
    
    // Add a small delay to ensure backend is ready
    setTimeout(fetchRewardConfig, 1000)
  }, [])

  // Auto-create guest user and show onboarding for new users
  useEffect(() => {
    if (!state.isAuthenticated && !state.loading) {
      // Check if user has completed onboarding before
      const hasCompletedOnboarding = localStorage.getItem('techkwiz_onboarding_completed')
      
      if (!hasCompletedOnboarding) {
        console.log('🎯 New user detected - showing onboarding flow')
        setShowOnboarding(true)
      } else {
        console.log('🔄 Returning user - creating guest user and skipping onboarding') 
        // Create guest user for returning users who completed onboarding
        const guestUser = {
          id: `guest_${Date.now()}`,
          name: 'Guest User', 
          email: `guest_${Date.now()}@techkwiz.com`,
          coins: 0, // Start with 0 coins
          level: 1,
          totalQuizzes: 0,
          correctAnswers: 0,
          joinDate: new Date().toISOString(),
          quizHistory: [],
          achievements: []
        }
        
        // Set auth token
        localStorage.setItem('techkwiz_auth', 'dummy_token_' + guestUser.id)
        
        // Save user
        const allUsers = JSON.parse(localStorage.getItem('techkwiz_user') || '[]')
        allUsers.push(guestUser)
        localStorage.setItem('techkwiz_user', JSON.stringify(allUsers))
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser })
        setOnboardingSkipped(true)
      }
    }
  }, [state.isAuthenticated, state.loading, dispatch])

  // Onboarding completion handler
  const handleOnboardingComplete = (coinsEarned: number) => {
    console.log(`🎉 Onboarding completed! Earned ${coinsEarned} coins`)
    setOnboardingCompleted(true)
    setShowOnboarding(false)
    localStorage.setItem('techkwiz_onboarding_completed', 'true')
    
    // Small delay before showing main quiz
    setTimeout(() => {
      setOnboardingCompleted(true)
    }, 500)
  }

  const handleOnboardingSkip = () => {
    console.log('⏭️ Onboarding skipped')
    setOnboardingSkipped(true)
    setShowOnboarding(false)
    localStorage.setItem('techkwiz_onboarding_completed', 'true')
  }

  // Exit confirmation handlers
  const handleExitConfirm = () => {
    setShowExitConfirmation(false)
    disablePrevention()
    router.push('/start') // Redirect to categories
  }

  const handleExitCancel = () => {
    setShowExitConfirmation(false)
  }
  // Youth-focused quick start quiz data (after onboarding)
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
    console.log('🔧 HomePage: handleAnswerSelect called with answerIndex:', answerIndex, 'currentQuestion:', currentQuestion, 'selectedAnswer:', selectedAnswer)
    if (selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      console.log('🔧 HomePage: Processing answer after timeout...')
      const isCorrect = answerIndex === quickStartQuiz[currentQuestion].correct_answer
      // For personality questions (correct_answer = -1), all answers are "correct"
      const isPersonalityQuestion = quickStartQuiz[currentQuestion].correct_answer === -1
      const finalIsCorrect = isPersonalityQuestion || isCorrect
      const coinsEarned = finalIsCorrect ? 25 : 0 // 25 coins per correct answer
      
      console.log('🔧 HomePage: Answer processed - isCorrect:', finalIsCorrect, 'coinsEarned:', coinsEarned)
      
      // Set states for popup
      setIsLastAnswerCorrect(finalIsCorrect)
      setLastEarnedCoins(coinsEarned)
      
      if (finalIsCorrect) {
        setScore(score + 1)
        
        // Award coins for correct answers on homepage quiz
        dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
        
        console.log(`✅ ${isPersonalityQuestion ? 'Great choice' : 'Correct answer'}! Earned ${coinsEarned} coins`)
      } else {
        console.log(`❌ Wrong answer, no coins earned`)
      }
      
      // Show reward popup based on configuration
      const triggerAfterQuestions = rewardConfig?.trigger_after_questions || 1
      const shouldShowPopup = rewardConfig?.is_active && 
                              rewardConfig?.show_during_quiz && 
                              (currentQuestion + 1) % triggerAfterQuestions === 0
      
      console.log('🔧 HomePage: Popup trigger check - currentQuestion:', currentQuestion, 
                  'triggerAfterQuestions:', triggerAfterQuestions, 
                  'shouldShowPopup:', shouldShowPopup,
                  'is_active:', rewardConfig?.is_active,
                  'show_during_quiz:', rewardConfig?.show_during_quiz)
      
      if (shouldShowPopup) {
        console.log('🔧 HomePage: Triggering reward popup after', triggerAfterQuestions, 'questions')
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
    dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
  }

  const handleClaimReward = () => {
    // RewardPopup's onClaimReward doesn't pass parameters, so we use rewardCoins (100)
    handleAdWatched(100)
  }

  // Show loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Minimal Navigation - No hamburger menu, no coin counter, no user info */}
        <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-white">
                <span className="text-orange-400">Tech</span>Kwiz
              </div>
              {/* Empty right side - hiding all header elements */}
            </div>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading TechKwiz...</p>
          </div>
        </main>
      </div>
    )
  }

  // Show onboarding flow for new users
  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    )
  }

  // Show results
  if (showResult && quizCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Minimal Navigation - No hamburger menu, no coin counter, no user info */}
        <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-white">
                <span className="text-orange-400">Tech</span>Kwiz
              </div>
              {/* Empty right side - hiding all header elements */}
            </div>
          </div>
        </nav>
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
        {/* Minimal Navigation - No hamburger menu, no coin counter, no user info */}
        <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-white">
                <span className="text-orange-400">Tech</span>Kwiz
              </div>
              {/* Empty right side - hiding all header elements */}
            </div>
          </div>
        </nav>
        
        <main className="flex-1 p-4 flex flex-col items-center justify-center">
          
          {/* Welcome Message - Enhanced after onboarding */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              🎉 Welcome to <span className="text-orange-400">Youth Quiz Hub!</span>
            </h1>
            <p className="text-blue-200 text-base mb-2">
              Level up with interactive quizzes designed for Gen Z!
            </p>
            {onboardingCompleted && (
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-3 border border-green-400/30 inline-block">
                <p className="text-green-200 text-sm">
                  🚀 Great job! You're all set with <span className="text-yellow-400 font-bold">{state.user?.coins || 0} coins</span>!
                </p>
              </div>
            )}
          </motion.div>
          
          {/* Quiz Interface */}
          <div className="w-full max-w-md">
            <EnhancedQuizInterface
              question={quickStartQuiz[currentQuestion]}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              questionAnswered={selectedAnswer !== null}
              questionNumber={currentQuestion + 1}
              totalQuestions={quickStartQuiz.length}
              showProgress={true}
              encouragementMessages={true}
            />
          </div>
          
          {/* Features teaser - Enhanced messaging */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <p className="text-blue-200 text-sm mb-2">🚀 <strong>What's Next:</strong></p>
              <div className="text-xs text-blue-200 space-y-1">
                <div>💰 Earn more coins in category quizzes (20-45 coins entry)</div>
                <div>🏆 Get 50 coins per correct answer</div>
                <div>🎯 Challenge yourself with timer-based questions</div>
                <div>📺 Watch ads to earn bonus coins</div>
              </div>
            </div>
          </motion.div>
          
        </main>
      </div>
      
      {/* Reward Ad Popup */}
      <NewRewardPopup
        isOpen={showRewardPopup}
        onClose={handlePopupClose}
        coinsEarned={lastEarnedCoins}
        onClaimReward={handleClaimReward}
        onSkipReward={handlePopupClose}
        isCorrect={isLastAnswerCorrect}
        rewardCoins={100}
      />
      
      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={showExitConfirmation}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
        currentProgress={{
          questionNumber: currentQuestion + 1,
          totalQuestions: quickStartQuiz.length,
          coinsAtRisk: score * 25 // Potential coins from correct answers
        }}
      />
    </>
  )
}