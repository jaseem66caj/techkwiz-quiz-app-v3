'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { EnhancedQuizInterface } from '../../../components/EnhancedQuizInterface'

import { CountdownTimer } from '../../../components/CountdownTimer'
import { TimeUpModal } from '../../../components/TimeUpModal'
import { RewardPopup } from '../../../components/RewardPopup'
import { quizDataManager } from '../../../utils/quizDataManager'
import { useApp } from '../../providers'

// Interface defining the structure of quiz questions for this page
interface QuizQuestion {
  // Unique identifier for the question
  id: string
  // The question text to display to users
  question: string
  // Array of answer options
  options: string[]
  // Index of the correct answer in the options array
  correct_answer: number
  // Difficulty level of the question
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  // Optional question type for special rendering
  question_type?: string
  // Educational fun fact related to the question
  fun_fact: string
  // Category identifier this question belongs to
  category: string
  // Subcategory within the main category
  subcategory: string
  // Optional emoji clue for emoji decode questions
  emoji_clue?: string
  // Optional visual elements for "This or That" questions
  visual_options?: string[]
  // Optional personality trait for personality questions
  personality_trait?: string
  // Optional year for prediction questions
  prediction_year?: string
}

// Main Quiz Page component for a specific category
export default function QuizPage({ params }: { params: Promise<{ category: string }> }) {
  // Access global application state and dispatch function
  const { state, dispatch } = useApp()
  // Next.js router for navigation
  const router = useRouter()
  // State for the current category ID
  const [categoryId, setCategoryId] = useState<string>('')

  // Loading and error state management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Quiz state management
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [adSlotCode, setAdSlotCode] = useState<string>('')

  // Timer state management
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [showTimeUp, setShowTimeUp] = useState(false)

  // ===================================================================
  // Parameter Resolution Effect
  // ===================================================================
  // Effect to resolve the category parameter from the URL

  // Resolve the category parameter from the URL path
  useEffect(() => {
    params.then(resolvedParams => {
      setCategoryId(resolvedParams.category)
    })
  }, [params])

  // ===================================================================
  // Quiz Initialization Effect
  // ===================================================================
  // Effect to load quiz configuration and questions when category changes

  // Load quiz configuration and questions when category ID is available
  useEffect(() => {
    // Guard clause - exit if no category ID
    if (!categoryId) return;

    // Async initialization function
    const init = async () => {
      try {
        // Load category information
        const { QUIZ_CATEGORIES } = await import('../../../data/quizDatabase');
        const categoryInfo = (QUIZ_CATEGORIES as any)[categoryId];
        const entryFee = categoryInfo ? categoryInfo.entry_fee : 0;

        // Dispatch action to start quiz and deduct entry fee
        dispatch({ type: 'START_QUIZ', payload: { quiz: { category: categoryId }, entryFee } });

        // Enable timer with default configuration
        setTimerEnabled(true)
        setTimerSeconds(30)

        try {
          // First try to load questions from admin dashboard
          const adminQuestions = quizDataManager.getQuestionsByCategoryAndSection(categoryId, 'category')

          // Use admin questions if enough are available
          if (adminQuestions.length >= 3) {
            // Convert admin format to quiz format
            const convertedQuestions = adminQuestions.slice(0, 5).map(q => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correct_answer: q.correct_answer ?? 0,
              difficulty: q.difficulty,
              fun_fact: q.fun_fact || '',
              category: q.category,
              subcategory: q.subcategory || categoryId
            }))
            setQuestions(convertedQuestions)
            console.log(`✅ Using admin questions for category: ${categoryId}`)
          } else {
            // Fallback to quiz database if not enough admin questions
            const { QUIZ_DATABASE } = await import('../../../data/quizDatabase')
            const fallback = (QUIZ_DATABASE as any)[categoryId] || []
            setQuestions(fallback.slice(0, 5))
            console.log(`⚠️ Using fallback questions for category: ${categoryId}`)
          }
        } catch (error) {
          // Handle errors in loading questions
          console.error('Error loading questions:', error)
          const { QUIZ_DATABASE } = await import('../../../data/quizDatabase')
          const fallback = (QUIZ_DATABASE as any)[categoryId] || []
          setQuestions(fallback.slice(0, 5))
        }

        // Set loading state to false when initialization is complete
        setLoading(false)
      } catch (err: any) {
        // Handle initialization errors
        setError(err?.message || 'Failed to load quiz')
        setLoading(false)
      }
    }
    init()
  }, [categoryId, dispatch])

  // ===================================================================
  // Ad Slot Loading Effect
  // ===================================================================
  // Effect to load ad configuration (currently using default)

  // Fetch popup interstitial ad code - using default ad code
  useEffect(() => {
    // Removed backend API call for ad slots
    // Using default ad code or empty string
    setAdSlotCode('')
  }, [])

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

  // Handle user answer selection
  const handleAnswer = (answerIndex: number) => {
    // Guard clause - exit if answer already selected
    if (selected !== null) return;
    // Set selected answer
    setSelected(answerIndex);

    // Check if answer is correct
    const correct = questions[current].correct_answer === answerIndex;
    setIsCorrect(correct);
    // Update score if correct
    if (correct) {
      setScore(s => s + 1);
    }

    // Show Qureka-style reward popup for both correct and wrong answers
    setTimeout(() => setShowReward(true), 400);
  };

  // Handle ad completion and reward distribution
  const handleAdCompleted = (coinsFromAd: number) => {
    // Dispatch action to update user coins
    dispatch({ type: 'UPDATE_COINS', payload: coinsFromAd });
  };

  // Advance to next question or complete quiz
  const advance = () => {
    // Hide reward popup and time up modal
    setShowReward(false);
    setShowTimeUp(false);
    
    // Check if there are more questions
    if (current < questions.length - 1) {
      // Advance to next question
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      // Quiz completed - dispatch end quiz action and navigate
      dispatch({ type: 'END_QUIZ', payload: { correctAnswers: score, totalQuestions: questions.length } });
      router.push('/start');
    }
  };

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
                <span className="text-2xl mr-2">{state.user.avatar}</span>
                <span className="text-white font-medium">{state.user.name}</span>
              </div>
              <div className="flex items-center bg-orange-500/20 rounded-full px-4 py-2 border border-orange-400/30">
                <span className="text-2xl mr-2">🪙</span>
                <span className="text-orange-300 font-medium">Coins: </span>
                <span className="text-white font-bold ml-1">{state.user.coins}</span>
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

        {timerEnabled && (
          <CountdownTimer totalSeconds={timerSeconds} isActive={selected === null && !showReward && !showTimeUp} onTimeUp={handleTimeUp} showWarning={true} warningThreshold={10} questionNumber={current} autoAdvance={false} />
        )}

        <EnhancedQuizInterface
          question={questions[current]}
          selectedAnswer={selected}
          onAnswerSelect={handleAnswer}
          questionAnswered={selected !== null}
          questionNumber={current + 1}
          totalQuestions={questions.length}
          showProgress={false}
          encouragementMessages={true}
        />
      </div>

      {showReward && (
        <RewardPopup
          isOpen={showReward}
          onClose={advance}
          isCorrect={isCorrect}
          coinsEarned={isCorrect ? 25 : 0}
          onClaimReward={() => {
            handleAdCompleted(isCorrect ? 25 : 0);
            advance();
          }}
          onSkipReward={advance}
        />
      )}

      {showTimeUp && (
        <TimeUpModal isOpen={showTimeUp} question={questions[current]} onClose={advance} autoCloseDelay={2000} />
      )}
    </div>
  )
}