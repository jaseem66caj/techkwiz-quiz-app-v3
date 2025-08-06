'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../../providers'
import { Navigation } from '../../../components/Navigation'
import { QuizInterface } from '../../../components/QuizInterface'
import { FunFact } from '../../../components/FunFact'
import { QuizResult } from '../../../components/QuizResult'
import { AuthModal } from '../../../components/AuthModal'
import { EnhancedRewardPopup } from '../../../components/EnhancedRewardPopup'
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
  
  // Flow control
  const [flowPhase, setFlowPhase] = useState<'question' | 'immediate_reward' | 'mandatory_ad' | 'final_reward'>('question')

  // Initialize component
  useEffect(() => {
    params.then(resolvedParams => {
      setCategoryId(resolvedParams.category)
      fetchCategoryInfo(resolvedParams.category)
      fetchSequentialQuestions(resolvedParams.category)
    })
  }, [])

  const fetchCategoryInfo = async (catId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
      const response = await fetch(`${backendUrl}/api/quiz/categories/${catId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch category')
      }
      
      const categoryData = await response.json()
      setCategoryInfo(categoryData)
      console.log('✅ Loaded category from API:', categoryData.name)
      return categoryData
    } catch (error) {
      console.error('Error loading category:', error)
      setError('Failed to load category information')
      return null
    }
  }

  const fetchSequentialQuestions = async (catId: string) => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
      const response = await fetch(`${backendUrl}/api/quiz/sequential-questions/${catId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }
      
      const questionsData = await response.json()
      
      if (questionsData && questionsData.length === 5) {
        setQuizData(questionsData)
        console.log('✅ Loaded 5 sequential questions from API')
        setLoading(false)
        return questionsData
      } else {
        setError('Expected 5 questions for sequential quiz')
        setLoading(false)
        return []
      }
    } catch (error) {
      console.error('Error loading sequential questions:', error)
      setError('Failed to load quiz questions')
      setLoading(false)
      return []
    }
  }

  // Fetch between-questions ad slots
  const fetchAdSlot = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
      const response = await fetch(`${backendUrl}/api/quiz/between-questions-ads`)
      
      if (response.ok) {
        const adSlots = await response.json()
        if (adSlots && adSlots.length > 0) {
          // Get random ad slot for this question
          const randomAd = adSlots[Math.floor(Math.random() * adSlots.length)]
          setCurrentAdSlot(randomAd.ad_code || '')
          return randomAd
        }
      }
    } catch (error) {
      console.error('Error fetching ad slot:', error)
    }
    return null
  }

  // Enhanced answer handling with Qureka-style flow: Question → Answer → Ad → Reward → Next Question
  const handleAnswerSelect = async (answerIndex: number) => {
    if (questionAnswered) return
    
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

  // Seamless advancement to next question
  const advanceToNextQuestion = () => {
    setShowRewardPopup(false)
    
    if (currentQuestion < quizData.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setQuestionAnswered(false)
      setFlowPhase('question')
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
    setCurrentAdSlot('')
    setFlowPhase('question')
    
    // Fetch new set of 5 questions
    fetchSequentialQuestions(categoryId)
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
            {/* Quiz Progress Header */}
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
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-slate-400 mt-2">
                  <span>Score: {score}/{currentQuestion + (questionAnswered ? 1 : 0)}</span>
                  <span>🪙 Earned: {totalCoinsEarned} coins</span>
                </div>
              </div>
            </div>

            {/* Quiz Interface - Only show during question phase */}
            {flowPhase === 'question' && quizData.length > 0 && (
              <QuizInterface
                question={quizData[currentQuestion]}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                questionAnswered={questionAnswered}
                questionNumber={currentQuestion + 1}
                totalQuestions={5}
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