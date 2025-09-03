'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../app/providers'
import { quizDataManager } from '../utils/quizDataManager'

interface OnboardingQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  reward_coins: number
}

interface OnboardingFlowProps {
  onComplete: (coinsEarned: number) => void
  onSkip: () => void
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const { dispatch } = useApp()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [onboardingQuestions, setOnboardingQuestions] = useState<OnboardingQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)

  // Load onboarding questions from admin dashboard
  useEffect(() => {
    const loadOnboardingQuestions = () => {
      try {
        setIsLoadingQuestions(true)

        // Get onboarding section questions from admin dashboard
        const adminQuestions = quizDataManager.getQuestionsBySection('onboarding')

        if (adminQuestions.length >= 2) {
          // Convert admin format to onboarding format
          const convertedQuestions: OnboardingQuestion[] = adminQuestions.slice(0, 2).map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correct_answer: q.correctAnswer,
            reward_coins: q.rewardCoins || 150,
            fun_fact: q.funFact || "Great job!"
          }))

          setOnboardingQuestions(convertedQuestions)
          console.log('✅ Using admin onboarding questions')
        } else {
          // Use fallback questions
          setOnboardingQuestions(getFallbackOnboardingQuestions())
          console.log('⚠️ Using fallback onboarding questions')
        }
      } catch (error) {
        console.error('Error loading onboarding questions:', error)
        setOnboardingQuestions(getFallbackOnboardingQuestions())
      } finally {
        setIsLoadingQuestions(false)
      }
    }

    loadOnboardingQuestions()
  }, [])

  // Fallback onboarding questions
  const getFallbackOnboardingQuestions = (): OnboardingQuestion[] => [
    {
      id: 'onboard-1',
      question: "Which tech company created the iPhone?",
      options: ["Apple 🍎", "Google 🔍", "Samsung 📱", "Microsoft 💻"],
      correct_answer: 0,
      reward_coins: 150
    },
    {
      id: 'onboard-2', 
      question: "What does 'www' stand for in website URLs?",
      options: ["World Wide Web 🌐", "World Web Works 🔧", "Web World Wide 🌍", "Wide Web World 📡"],
      correct_answer: 0,
      reward_coins: 150
    }
  ]

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)

    setTimeout(() => {
      const currentQ = onboardingQuestions[currentQuestion]
      const isCorrect = answerIndex === currentQ.correct_answer
      const coinsEarned = isCorrect ? currentQ.reward_coins : 75 // Give 75 coins even for wrong answers

      // Award coins immediately
      dispatch({ type: 'UPDATE_COINS', payload: coinsEarned })
      setTotalCoinsEarned(prev => prev + coinsEarned)

      // Show reward animation
      setShowReward(true)

      setTimeout(() => {
        setShowReward(false)
        
        if (currentQuestion < onboardingQuestions.length - 1) {
          // Next question
          setCurrentQuestion(currentQuestion + 1)
          setSelectedAnswer(null)
        } else {
          // Onboarding complete!
          setIsCompleted(true)
          setTimeout(() => {
            onComplete(totalCoinsEarned + coinsEarned)
          }, 2000)
        }
      }, 2000)
    }, 1000)
  }

  // Show loading state while questions are being loaded
  if (isLoadingQuestions) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-800/90 to-purple-900/90 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-blue-400/30 text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Questions...</h2>
          <p className="text-blue-100">Preparing your onboarding experience</p>
        </motion.div>
      </div>
    )
  }

  // Show message if no questions available
  if (onboardingQuestions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-red-800/90 to-pink-900/90 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-red-400/30 text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">No Questions Available</h2>
          <p className="text-red-100">Please add onboarding questions in the admin dashboard</p>
        </motion.div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-800/90 to-emerald-900/90 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-green-400/30 text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-4">Awesome!</h2>
          <p className="text-green-100 mb-4">
            You've earned <span className="text-yellow-400 font-bold text-2xl">{totalCoinsEarned}</span> coins!
          </p>
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
            <p className="text-green-200 text-sm">Ready to test your knowledge on more challenging quizzes?</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (showReward) {
    const isCorrect = selectedAnswer === onboardingQuestions[currentQuestion].correct_answer
    const coinsEarned = isCorrect ? onboardingQuestions[currentQuestion].reward_coins : 75

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${isCorrect ? 'bg-gradient-to-br from-purple-800/90 to-pink-900/90' : 'bg-gradient-to-br from-orange-800/90 to-red-900/90'} backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border ${isCorrect ? 'border-purple-400/30' : 'border-orange-400/30'} text-center`}
        >
          <div className="text-6xl mb-4">{isCorrect ? '🎯' : '💪'}</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {isCorrect ? 'Super!' : 'Good try!'}
          </h2>
          <p className="text-white mb-4">
            You won <span className="text-yellow-400 font-bold text-2xl">{coinsEarned}</span> coins
          </p>
          <div className={`${isCorrect ? 'bg-purple-500/20' : 'bg-orange-500/20'} backdrop-blur-sm rounded-xl p-4 border ${isCorrect ? 'border-purple-400/30' : 'border-orange-400/30'}`}>
            <p className="text-white text-sm">
              {isCorrect ? 'Correct! Well done!' : "Don't worry, you still earned coins!"}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-md rounded-2xl p-8 max-w-lg mx-auto border border-blue-400/30">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Let's get started! 🚀
          </h1>
          <p className="text-yellow-300 text-lg font-medium mb-4">
            Answer 2 simple questions to get <span className="text-yellow-400 font-bold">300 coins</span> now
          </p>
          
          {/* Progress Indicator */}
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block border border-blue-400/30 mb-6">
            <span className="text-white font-bold text-lg">
              {currentQuestion + 1}/2 - Question
            </span>
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6 text-center leading-relaxed">
            {onboardingQuestions[currentQuestion].question}
          </h2>

          <div className="space-y-3">
            {onboardingQuestions[currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border-2 ${
                  selectedAnswer === index
                    ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30'
                    : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50 hover:border-purple-400/50'
                } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{option}</span>
                  <span className="text-2xl">
                    {selectedAnswer === index ? '✅' : '👆'}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Skip option */}
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm underline"
          >
            Skip onboarding
          </button>
        </div>
      </div>
    </div>
  )
}