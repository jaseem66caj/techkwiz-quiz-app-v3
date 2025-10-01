'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../../providers'
import { QuizQuestion } from '@/types/quiz'
import { TimeUpModal } from '@/components/modals'
import { UnifiedRewardPopup } from '@/components/rewards'
import { getAvatarEmojiById } from '@/utils/avatar'
import { calculateCorrectAnswerReward } from '@/utils/rewardCalculator'
import { useCategoryQuizLoader } from '@/hooks/useCategoryQuizLoader'

const UnifiedQuizInterface = dynamic(() => import('@/components/quiz/UnifiedQuizInterface').then(mod => mod.UnifiedQuizInterface), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
})

const QuizResultsDisplay = dynamic(() => import('@/components/quiz/QuizResultsDisplay').then(mod => mod.QuizResultsDisplay), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-800/50 rounded-xl animate-pulse" />
})

const CountdownTimer = dynamic(() => import('@/components/quiz/CountdownTimer').then(mod => mod.CountdownTimer), {
  ssr: false,
  loading: () => <div className="h-8 bg-gray-800/50 rounded-xl animate-pulse" />
})

// Main Quiz Page component for a specific category
export default function QuizPage({ params }: { params: Promise<{ category: string }> }) {
  // Unwrap the params Promise for Next.js 15+ compatibility
  // React.use() must not be wrapped in try/catch to avoid Suspense violations
  const resolvedParams = React.use(params)

  // Access global application state and dispatch function
  const { state, dispatch } = useApp()
  // Next.js router for navigation
  const router = useRouter()
  // State for the current category ID
  const [categoryId, setCategoryId] = useState<string>(resolvedParams.category || '')

  // Refs for cleanup and mounted state
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  const isMountedRef = useRef(true)
  // Refs to always read the latest state inside callbacks
  const questionsRef = useRef<QuizQuestion[]>([])
  const currentRef = useRef(0)

  // Quiz state management
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  // Results & streak tracking
  const [showResult, setShowResult] = useState(false)

  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const [quizSessionCoins, setQuizSessionCoins] = useState<number>(0)

  // Timer state management
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [showTimeUp, setShowTimeUp] = useState(false)

  const {
    questions,
    loading,
    error,
    insufficientCoins,
    earningPotential,
  } = useCategoryQuizLoader(categoryId, { user: state.user, currentQuiz: state.currentQuiz }, dispatch)

  // Cleanup function for timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    // Ensure mounted flag is set when component is active
    isMountedRef.current = true
    return () => {
      // Mark unmounted and clear any pending timeouts to avoid leaks
      isMountedRef.current = false
      clearAllTimeouts()
    }
  }, [clearAllTimeouts])

  // ===================================================================
  // Parameter Resolution
  // ===================================================================
  // Category ID is now resolved at component initialization via React.use()
  // This useEffect is kept for any additional parameter validation if needed
  useEffect(() => {
    if (resolvedParams.category && categoryId !== resolvedParams.category) {
      setCategoryId(resolvedParams.category)
    }
  }, [resolvedParams, categoryId])

  // ===================================================================
  // Quiz Initialization Effect
  // ===================================================================
  // Effect to load quiz configuration and questions when category changes

  // Load quiz configuration and questions when category ID is available
  useEffect(() => {
    // Keep refs in sync with latest state
    questionsRef.current = questions

    if (questions.length > 0) {
      setTimerEnabled(true)
      setTimerSeconds(30)
    }
  }, [questions])

  useEffect(() => {
    currentRef.current = current
  }, [current])

  // 90s auto-redirect to categories when results are shown (category quiz)
  useEffect(() => {
    if (!showResult) return;

    const timeout = setTimeout(() => {
      try {
        router.push('/start')
      } catch (error) {
        import('@sentry/nextjs').then(Sentry => Sentry.captureException(error as any))
        if (typeof window !== 'undefined') window.location.href = '/start'
      }
    }, 90000)

    return () => {
      clearTimeout(timeout)
    }
  }, [showResult, router])

  // Handle automatic redirection when insufficient coins
  useEffect(() => {
    if (!insufficientCoins) return

    // Set countdown from 5 to 0
    setRedirectCountdown(5)

    const interval = setInterval(() => {
      setRedirectCountdown(prev => Math.max(0, prev - 1))
    }, 1000)
    const timer = setTimeout(() => {
      if (!isMountedRef.current) return
      try {
        router.push('/')
      } catch (error) {
        console.error('Error during insufficient coins redirect:', error)
        import('@sentry/nextjs').then(Sentry => {
          Sentry.captureException(error, {
            tags: { component: 'CategoryQuiz', action: 'insufficientCoinsRedirect' },
            extra: { categoryId }
          })
        })
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
    }, 5000)

    // Track timers for cleanup
    timeoutRefs.current.push(interval as unknown as NodeJS.Timeout)
    timeoutRefs.current.push(timer)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [insufficientCoins, router, categoryId])

  // ===================================================================
  // Quiz Event Handlers
  // ===================================================================
  // Functions to handle various quiz events and user interactions

  // Handle timer expiration
  const handleTimeUp = () => {
    // Guard clause - exit if answer already selected
    if (selected !== null) return
    // Show time up modal
    setShowTimeUp(true)
    // Mark as incorrect
    setIsCorrect(false)
    // Set selected to indicate time expired
    setSelected(-1)
    // Trigger reward popup after delay
    setTimeout(() => setShowReward(true), 400)
  }

  // Handle user answer selection (Category Quiz - Manual Progression Flow)
  const handleAnswer = useCallback((answerIndex: number) => {
    // Guard clause - exit if answer already selected
    if (selected !== null) return;

    try {
      console.info('handleAnswer called with answerIndex:', answerIndex);
      // Apply immediate visual feedback styling (consistent with homepage quiz)
      setSelected(answerIndex);
      console.info('setSelected called with answerIndex:', answerIndex);

      // Check if answer is correct (use refs to avoid stale closures)
      const correct = questionsRef.current[currentRef.current]?.correct_answer === answerIndex;
      setIsCorrect(!!correct);
      console.info('setIsCorrect called with:', !!correct);

      // Update score, streak, and award coins for correct answers
      if (correct) {
        setScore(s => {
          const next = s + 1;
          console.info('Setting score to:', next);
          return next;
        });

        // Award coins immediately for correct answers
        const rewardResult = calculateCorrectAnswerReward();
        dispatch({ type: 'UPDATE_COINS', payload: rewardResult.coins });
        setQuizSessionCoins(prev => prev + rewardResult.coins);
        console.info(`✅ Correct answer! Earned ${rewardResult.coins} coins`);
      } else {
        console.info(`❌ Wrong answer, no coins earned`);
      }

      // Wait exactly 400ms for visual feedback display, then show RewardPopup
      // Quiz progression PAUSES until user manually interacts with popup
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          console.info('Setting showReward to true');
          setShowReward(true); // Display RewardPopup requiring user interaction
        }
      }, 400); // Consistent 400ms timing with homepage quiz

      timeoutRefs.current.push(timeout);
    } catch (error) {
      console.error('Error in handleAnswer:', error)
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          tags: { component: 'CategoryQuiz', action: 'handleAnswer' },
          extra: { answerIndex, currentQuestion: current, categoryId }
        })
      })
    }
  }, [selected, questions, current, dispatch, categoryId]);

  // Advance to next question or complete quiz
  const advance = useCallback(() => {
    try {
      console.info('advance function called', { current, questionsLength: questions.length });
      // Hide reward popup and time up modal
      setShowReward(false);
      setShowTimeUp(false);
      console.info('setShowReward and setShowTimeUp called');

      // Check if there are more questions
      if (current < questions.length - 1) {
        console.info('Advancing to next question');
        // Advance to next question
        setCurrent(c => {
          const next = c + 1;
          console.info('Setting current to', next);
          return next;
        });
        setSelected(null);
        console.info('setSelected called with null');
      } else {
        // Quiz completed - dispatch end quiz action, show results, then navigate
        const totalQuestions = questions.length
        dispatch({ type: 'END_QUIZ', payload: { correctAnswers: score, totalQuestions } });
        setShowResult(true)
        console.info('Quiz completed, showing results');

        // Standardized behavior: results remain visible; 90s timer handles redirect to categories
        // (See effect: 90s auto-redirect when showResult is true)

      }
    } catch (error) {
      console.error('Error in advance function:', error)
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          tags: { component: 'CategoryQuiz', action: 'advance' },
          extra: { current, questionsLength: questions.length, categoryId }
        })
      })
    }
  }, [current, questions.length, score, dispatch, categoryId]);

  // ===================================================================
  // Loading and Error States
  // ===================================================================
  // Render loading and error states

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-orange-100 mt-4">Loading TechKwiz Sequential Quiz...</p>
        </div>
      </div>
    )
  }

  // Insufficient coins redirection UI
  if (insufficientCoins) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-8 border border-slate-700/50 max-w-lg text-center mx-4">
          <div className="text-5xl mb-4">🪙</div>
          <h2 className="text-2xl font-bold text-orange-200 mb-2">Insufficient coins</h2>
          <p className="text-slate-300 mb-2">Taking you to the homepage quiz where you can earn coins for free!</p>
          <p className="text-orange-300 font-medium mb-4">Earn up to <span className="text-white font-bold">{earningPotential}</span> coins in the homepage quiz.</p>
          <div className="text-slate-400 mb-6">Redirecting to homepage quiz in {redirectCountdown}...</div>
          <button
            onClick={() => {
              try { router.push('/') } catch (error) {
                import('@sentry/nextjs').then(Sentry => Sentry.captureException(error))
                if (typeof window !== 'undefined') window.location.href = '/'
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            Go to Homepage Quiz Now
          </button>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button onClick={() => router.push('/start')} className="bg-orange-500 hover:bg-orange-600 text-white px  -6 py-3 rounded-lg">Back to Categories</button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // Main Quiz Interface Render
  // ===================================================================
  // Render the complete quiz interface with all components

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 pt-10 pb-8 max-w-2xl">
        {/* Header with user information and coin balance */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-6">
          {/* User info display for authenticated users */}
          {state.user && state.user.name !== 'Guest' && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center bg-gray-800/50 rounded-full px-4 py-2 border border-gray-700">
                <span className="text-2xl mr-2">{getAvatarEmojiById(state.user.avatar)}</span>
                <span className="text-white font-medium">{state.user.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-orange-500/20 rounded-full px-3 py-1 border border-orange-400/30">
                  <span className="text-lg mr-1">🪙</span>
                  <span className="text-orange-300 text-sm">Wallet: </span>
                  <span className="text-white font-bold text-sm">{state.user.coins}</span>
                </div>
                {quizSessionCoins > 0 && (
                  <div className="flex items-center bg-green-500/20 rounded-full px-3 py-1 border border-green-400/30">
                    <span className="text-lg mr-1">✨</span>
                    <span className="text-green-300 text-sm">Earned: </span>
                    <span className="text-white font-bold text-sm">+{quizSessionCoins}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-100">Question {current + 1} of {questions.length}</h1>
            <div className="text-orange-300 font-bold">Score: {score}</div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 mt-4">
            <motion.div initial={{ width: 0 }} animate={{ width: `${((current + 1) / questions.length) * 100}%` }} transition={{ duration: 0.6 }} className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 h-3 rounded-full"></motion.div>
          </div>
        </div>

        {showResult ? (
          <QuizResultsDisplay
            score={score}
            totalQuestions={questions.length}
            category={categoryId}
            coinsEarned={score * 50}
            onPlayAgain={() => {
              // Reset quiz state
              setCurrent(0)
              setSelected(null)
              setScore(0)
              setShowResult(false)
              setShowReward(false)
              setIsCorrect(false)
            }}
            onBackToCategories={() => router.push('/start')}
          />
        ) : (
          <>
            {timerEnabled && (
              <CountdownTimer totalSeconds={timerSeconds} isActive={selected === null && !showReward && !showTimeUp} onTimeUp={handleTimeUp} showWarning={true} warningThreshold={10} questionNumber={current} autoAdvance={false} />
            )}

            <UnifiedQuizInterface
              question={questions[current]}
              selectedAnswer={selected}
              onAnswerSelect={handleAnswer}
              questionAnswered={selected !== null}
              questionNumber={current + 1}
              totalQuestions={questions.length}
              showProgress={false}
              encouragementMessages={true}
              mode="enhanced"
            />
          </>
        )}
      </div>

      {showReward && (
        <UnifiedRewardPopup
          isOpen={showReward}
          onClose={advance}
          isCorrect={isCorrect}
          coinsEarned={isCorrect ? calculateCorrectAnswerReward().coins : 0}
        />
      )}

      {showTimeUp && (
        <TimeUpModal isOpen={showTimeUp} question={questions[current]} onClose={advance} autoCloseDelay={2000} />
      )}
    </div>
  )
}
