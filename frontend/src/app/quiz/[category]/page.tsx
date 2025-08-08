'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../../providers'
import { Navigation } from '../../../components/Navigation'
import { EnhancedQuizInterface } from '../../../components/EnhancedQuizInterface'
import { FunFact } from '../../../components/FunFact'
import { QuizResult } from '../../../components/QuizResult'
import { AuthModal } from '../../../components/AuthModal'
import { EnhancedRewardPopup } from '../../../components/EnhancedRewardPopup'
import { CountdownTimer } from '../../../components/CountdownTimer'
import { TimeUpModal } from '../../../components/TimeUpModal'
import { ExitConfirmationModal } from '../../../components/ExitConfirmationModal'
import { useExitPrevention } from '../../../hooks/useExitPrevention'
import { seoConfig, generateStructuredData } from '../../../utils/seo'
import { apiRequestJson } from '../../../utils/api'

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  fun_fact: string;
  category: string;
  subcategory: string;
  question_type?: string;
  emoji_clue?: string;
  visual_options?: string[];
  personality_trait?: string;
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
  
  // Progress tracking for 5-question sequence with enhanced flow
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Enhanced reward system state
  const [questionAnswered, setQuestionAnswered] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Array<{question: number, answer: number, correct: boolean}>>([])
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0)
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [currentAdSlot, setCurrentAdSlot] = useState('')
  
  // Flow control with timer states
  const [flowPhase, setFlowPhase] = useState<'question' | 'immediate_reward' | 'mandatory_ad' | 'final_reward' | 'time_up'>('question')
  
  // Timer configuration state
  const [timerConfig, setTimerConfig] = useState<{
    timer_enabled: boolean
    timer_seconds: number
    show_timer_warning: boolean
    auto_advance_on_timeout: boolean
    show_correct_answer_on_timeout: boolean
  } | null>(null)
  
  // Timer control state
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showTimeUpModal, setShowTimeUpModal] = useState(false)
  const [timeUpForQuestion, setTimeUpForQuestion] = useState<QuizQuestion | null>(null)
  
  // Exit prevention state
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)

  // Exit prevention hook - activate during active quiz
  const { disablePrevention } = useExitPrevention({
    isActive: !loading && !quizCompleted && !error,
    onExitAttempt: () => {
      setShowExitConfirmation(true)
    },
    customMessage: "Are you sure you want to leave? Your quiz progress will be lost!"
  })

  // Exit confirmation handlers
  const handleExitConfirm = () => {
    setShowExitConfirmation(false)
    disablePrevention()
    router.push('/start') // Redirect to categories
  }

  const handleExitCancel = () => {
    setShowExitConfirmation(false)
  }

  // Initialize component with proper sequencing
  useEffect(() => {
    params.then(async resolvedParams => {
      setCategoryId(resolvedParams.category)
      
      try {
        // Add small delay to ensure backend is ready
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Fetch data in sequence
        const categoryData = await fetchCategoryInfo(resolvedParams.category)
        const timerData = await fetchTimerConfig(resolvedParams.category)
        
        if (categoryData && timerData) {
          await fetchSequentialQuestions(resolvedParams.category)
        }
      } catch (error) {
        console.error('❌ QuizPage: Initialization error:', error)
        setError('Failed to initialize quiz. Please refresh the page.')
        setLoading(false)
      }
    })
  }, [])

  const fetchTimerConfig = async (catId: string) => {
    try {
      const timerData = await apiRequestJson(`/api/quiz/categories/${catId}/timer-config`)
      setTimerConfig(timerData)
      console.log('✅ QuizPage: Timer config loaded successfully:', timerData)
      return timerData
    } catch (error) {
      console.error('❌ QuizPage: Failed to fetch timer config:', error)
      // Use default timer settings on error
      const defaultConfig = {
        timer_enabled: true,
        timer_seconds: 30,
        show_timer_warning: true,
        auto_advance_on_timeout: true,
        show_correct_answer_on_timeout: true
      }
      setTimerConfig(defaultConfig)
      return defaultConfig
    }
  }

  const fetchCategoryInfo = async (catId: string) => {
    try {
      const categoryData = await apiRequestJson(`/api/quiz/categories/${catId}`)
      setCategoryInfo(categoryData)
      console.log('✅ QuizPage: Category loaded successfully:', categoryData.name)
      return categoryData
    } catch (error) {
      console.error('❌ QuizPage: Error loading category:', error)
      setError('Failed to load category information. Please try again.')
      return null
    }
  }

  const fetchSequentialQuestions = async (catId: string) => {
    try {
      setLoading(true)
      const questionsData = await apiRequestJson(`/api/quiz/sequential-questions/${catId}`)
      
      if (questionsData && questionsData.length === 5) {
        setQuizData(questionsData)
        console.log('✅ QuizPage: 5 sequential questions loaded successfully')
        setLoading(false)
        
        // Start timer when questions are loaded and timer is enabled
        if (timerConfig?.timer_enabled) {
          setTimeout(() => {
            setIsTimerActive(true)
          }, 500)
        }
        
        return questionsData
      } else {
        throw new Error(`Expected 5 questions, got ${questionsData?.length || 0}`)
      }
    } catch (error) {
      console.error('❌ QuizPage: Error loading sequential questions:', error)
      setError('Failed to load quiz questions. Please try again.')
      setLoading(false)
      return []
    }
  }

  // Fetch between-questions ad slots with improved error handling
  const fetchAdSlot = async () => {
    try {
      const adSlots = await apiRequestJson('/api/quiz/between-questions-ads')
      if (adSlots && adSlots.length > 0) {
        // Get random ad slot for this question
        const randomAd = adSlots[Math.floor(Math.random() * adSlots.length)]
        setCurrentAdSlot(randomAd.ad_code || '')
        console.log('✅ QuizPage: Ad slot fetched successfully')
        return randomAd
      }
      console.log('ℹ️ QuizPage: No ad slots available')
    } catch (error) {
      console.error('❌ QuizPage: Error fetching ad slot:', error)
    }
    return null
  }

  // Handle timer expiry
  const handleTimerUp = () => {
    if (questionAnswered || flowPhase !== 'question') return
    
    console.log('⏰ Timer expired for question', currentQuestion + 1)
    
    // Stop the timer
    setIsTimerActive(false)
    
    // Mark question as answered (with no selected answer)
    setQuestionAnswered(true)
    
    // Track as incorrect answer
    const answerRecord = {
      question: currentQuestion,
      answer: -1, // -1 indicates no answer (time up)
      correct: false
    }
    setUserAnswers(prev => [...prev, answerRecord])
    
    // Show correct answer if configured
    if (timerConfig?.show_correct_answer_on_timeout) {
      setTimeUpForQuestion(quizData[currentQuestion])
      setFlowPhase('time_up')
      setShowTimeUpModal(true)
    } else {
      // Directly advance to next question
      setTimeout(() => {
        advanceToNextQuestion()
      }, 1000)
    }
  }

  // Enhanced answer handling with timer integration
  const handleAnswerSelect = async (answerIndex: number) => {
    if (questionAnswered) return
    
    // Stop timer when answer is selected
    setIsTimerActive(false)
    
    setSelectedAnswer(answerIndex)
    setQuestionAnswered(true)
    
    const currentQ = quizData[currentQuestion]
    const isCorrect = answerIndex === currentQ.correct_answer
    
    // Track user answer
    const answerRecord = {
      question: currentQuestion,
      answer: answerIndex,
      correct: isCorrect
    }
    
    setUserAnswers(prev => [...prev, answerRecord])
    
    if (isCorrect) {
      setScore(score + 1)
      const coinsEarned = 25 // TechKwiz standard: 25 coins per correct answer
      setTotalCoinsEarned(prev => prev + coinsEarned)
      
      // Update user's coin balance immediately
      dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
    }
    
    // Phase 1: Immediate Reward Feedback (TechKwiz instant gratification)
    setFlowPhase('immediate_reward')
    setShowRewardPopup(true)
    
    // Fetch ad slot for potential mandatory ad
    await fetchAdSlot()
  }

  // Handle ad completion and coin rewards
  const handleAdCompleted = (adCoins: number) => {
    setTotalCoinsEarned(prev => prev + adCoins)
    dispatch({ type: 'UPDATE_COINS', payload: adCoins })
    
    // Move to final reward phase
    setFlowPhase('final_reward')
    
    // Auto-advance to next question after showing final reward
    setTimeout(() => {
      advanceToNextQuestion()
    }, 2000)
  }

  // Seamless advancement to next question with timer restart
  const advanceToNextQuestion = () => {
    setShowRewardPopup(false)
    setShowTimeUpModal(false)
    
    if (currentQuestion < quizData.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setQuestionAnswered(false)
      setFlowPhase('question')
      
      // Restart timer for next question if enabled
      if (timerConfig?.timer_enabled) {
        setTimeout(() => {
          setIsTimerActive(true)
        }, 500) // Small delay for smooth transition
      }
    } else {
      // Quiz completed - all 5 questions done
      setQuizCompleted(true)
      
      // Final score calculation
      const finalScore = score + (selectedAnswer === quizData[currentQuestion]?.correct_answer ? 1 : 0)
      
      dispatch({
        type: 'END_QUIZ',
        payload: {
          score: finalScore,
          total: quizData.length,
          coinsEarned: totalCoinsEarned
        }
      })
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizCompleted(false)
    setQuestionAnswered(false)
    setUserAnswers([])
    setTotalCoinsEarned(0)
    setShowRewardPopup(false)
    setShowTimeUpModal(false)
    setTimeUpForQuestion(null)
    setCurrentAdSlot('')
    setFlowPhase('question')
    setIsTimerActive(false) // Reset timer state
    
    // Fetch new set of 5 questions and restart timer
    fetchSequentialQuestions(categoryId).then(() => {
      if (timerConfig?.timer_enabled) {
        setTimeout(() => {
          setIsTimerActive(true)
        }, 1000)
      }
    })
  }

  const goToCategories = () => {
    router.push('/start')
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => router.push('/start')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Categories
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {!quizCompleted ? (
          <>
            {/* Quiz Progress Header - Enhanced with encouragement */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-orange-100">
                    {categoryInfo?.icon} {categoryInfo?.name}
                  </h1>
                  <div className="text-orange-300 font-bold">
                    Question {currentQuestion + 1} of 5
                  </div>
                </div>
                
                {/* Enhanced Progress Bar with Animation */}
                <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 h-3 rounded-full shadow-lg"
                  ></motion.div>
                </div>
                
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Score: {score}/{currentQuestion + (questionAnswered ? 1 : 0)}</span>
                  <span>🪙 Earned: {totalCoinsEarned} coins</span>
                </div>
                
                {/* Progress Encouragement Message */}
                <div className="mt-3 text-center">
                  <p className="text-sm text-slate-300">
                    {currentQuestion <= 1 ? "🚀 Just getting started!" :
                     currentQuestion <= 3 ? "🔥 You're on fire!" :
                     "💪 Almost there!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown Timer - Only show during question phase */}
            {flowPhase === 'question' && timerConfig?.timer_enabled && (
              <CountdownTimer
                totalSeconds={timerConfig.timer_seconds}
                isActive={isTimerActive && !questionAnswered}
                onTimeUp={handleTimerUp}
                showWarning={timerConfig.show_timer_warning}
                warningThreshold={10}
                questionNumber={currentQuestion}
                autoAdvance={timerConfig.auto_advance_on_timeout}
              />
            )}

            {/* Quiz Interface - Only show during question phase */}
            {flowPhase === 'question' && quizData.length > 0 && (
              <EnhancedQuizInterface
                question={quizData[currentQuestion]}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                questionAnswered={questionAnswered}
                questionNumber={currentQuestion + 1}
                totalQuestions={5}
                showProgress={false} // Progress already shown in header
                encouragementMessages={true}
              />
            )}

            {/* Enhanced Immediate Reward Popup - Qureka-style engagement */}
            {showRewardPopup && (
              <EnhancedRewardPopup 
                isOpen={showRewardPopup}
                onClose={() => {
                  setShowRewardPopup(false)
                  advanceToNextQuestion()
                }}
                isCorrect={selectedAnswer === quizData[currentQuestion]?.correct_answer}
                coinsEarned={selectedAnswer === quizData[currentQuestion]?.correct_answer ? 25 : 0}
                onAdCompleted={handleAdCompleted}
                autoClose={true}
                showMandatoryAd={currentQuestion < 4} // Show ads between questions 1-4
                adSlotCode={currentAdSlot}
              />
            )}

            {/* Time Up Modal - Show correct answer when timer expires */}
            {showTimeUpModal && timeUpForQuestion && (
              <TimeUpModal
                isOpen={showTimeUpModal}
                question={timeUpForQuestion}
                onClose={() => {
                  setShowTimeUpModal(false)
                  advanceToNextQuestion()
                }}
                autoCloseDelay={3000}
              />
            )}
          </>
        ) : (
          <>
            {/* Quiz Results */}
            <QuizResult 
              score={score}
              totalQuestions={5}
              category={categoryInfo?.name || 'Quiz'}
              coinsEarned={totalCoinsEarned}
              onPlayAgain={restartQuiz}
              onBackToCategories={goToCategories}
            />
            
            {/* Quiz Result Ad Banner - TODO: Implement proper ad slot integration */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 text-center">
                <p className="text-slate-400 text-sm">Quiz Result Advertisement Space</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}