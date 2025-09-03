'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { EnhancedQuizInterface } from '../../../components/EnhancedQuizInterface'
import { EnhancedRewardPopup } from '../../../components/EnhancedRewardPopup'
import { CountdownTimer } from '../../../components/CountdownTimer'
import { TimeUpModal } from '../../../components/TimeUpModal'
import { quizDataManager } from '../../../utils/quizDataManager'
import { useApp } from '../../providers'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  question_type?: string
  fun_fact: string
  category: string
  subcategory: string
  emoji_clue?: string
  visual_options?: string[]
  personality_trait?: string
  prediction_year?: string
}

export default function QuizPage({ params }: { params: Promise<{ category: string }> }) {
  const { dispatch } = useApp()
  const router = useRouter()
  const [categoryId, setCategoryId] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [adSlotCode, setAdSlotCode] = useState<string>('')

  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [showTimeUp, setShowTimeUp] = useState(false)

  // Resolve params Promise
  useEffect(() => {
    params.then(resolvedParams => {
      setCategoryId(resolvedParams.category)
    })
  }, [params])

  // Load config + questions
  useEffect(() => {
    if (!categoryId) return

    const init = async () => {
      try {
        // Use default timer configuration
        setTimerEnabled(true)
        setTimerSeconds(30)

        try {
          // First try to load from admin dashboard
          const adminQuestions = quizDataManager.getQuestionsByCategoryAndSection(categoryId, 'category')

          if (adminQuestions.length >= 3) {
            // Convert admin format to quiz format
            const convertedQuestions = adminQuestions.slice(0, 5).map(q => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correct_answer: q.correctAnswer,
              difficulty: q.difficulty,
              fun_fact: q.funFact || '',
              category: q.category,
              subcategory: q.subcategory || categoryId
            }))
            setQuestions(convertedQuestions)
            console.log(`✅ Using admin questions for category: ${categoryId}`)
          } else {
            // Fallback to quiz database
            const { QUIZ_DATABASE } = await import('../../../data/quizDatabase')
            const fallback = (QUIZ_DATABASE as any)[categoryId] || []
            setQuestions(fallback.slice(0, 5))
            console.log(`⚠️ Using fallback questions for category: ${categoryId}`)
          }
        } catch (error) {
          console.error('Error loading questions:', error)
          const { QUIZ_DATABASE } = await import('../../../data/quizDatabase')
          const fallback = (QUIZ_DATABASE as any)[categoryId] || []
          setQuestions(fallback.slice(0, 5))
        }

        setLoading(false)
      } catch (err: any) {
        setError(err?.message || 'Failed to load quiz')
        setLoading(false)
      }
    }
    init()
  }, [categoryId])

  // Fetch popup interstitial ad code - using default ad code
  useEffect(() => {
    // Removed backend API call for ad slots
    // Using default ad code or empty string
    setAdSlotCode('')
  }, [])

  const handleTimeUp = () => {
    if (selected !== null) return
    setShowTimeUp(true)
    setIsCorrect(false)
    setSelected(-1)
    // Trigger reward on timeout as well
    setTimeout(() => setShowReward(true), 400)
  }

  const handleAnswer = (answerIndex: number) => {
    if (selected !== null) return
    setSelected(answerIndex)

    const correct = questions[current].correct_answer === answerIndex
    setIsCorrect(correct)
    if (correct) {
      setScore(s => s + 1)
      dispatch({ type: 'UPDATE_COINS', payload: 25 })
    }

    // Qureka-style popup for both correct & wrong
    setTimeout(() => setShowReward(true), 400)
  }

  const handleAdCompleted = (coinsFromAd: number) => {
    dispatch({ type: 'UPDATE_COINS', payload: coinsFromAd })
  }

  const advance = () => {
    setShowReward(false)
    setShowTimeUp(false)
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      dispatch({ type: 'END_QUIZ', payload: { score, total: questions.length, coinsEarned: 0 } })
      router.push('/start')
    }
  }

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
          <button onClick={() => router.push('/start')} className="bg-orange-500 hover:bg-orange-600 text-white px  -6 py-3 rounded-lg">Back to Categories</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 pt-10 pb-8 max-w-2xl">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-6">
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
        <EnhancedRewardPopup 
          isOpen={showReward}
          onClose={advance}
          isCorrect={isCorrect}
          coinsEarned={isCorrect ? 25 : 0}
          onAdCompleted={handleAdCompleted}
          autoClose={true}
          showMandatoryAd={true}
          adSlotCode={adSlotCode}
        />
      )}

      {showTimeUp && (
        <TimeUpModal isOpen={showTimeUp} question={questions[current]} onClose={advance} autoCloseDelay={2000} />
      )}
    </div>
  )
}