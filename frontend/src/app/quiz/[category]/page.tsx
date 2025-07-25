'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from '../../providers'
import { Navigation } from '../../../components/Navigation'
import { QuizInterface } from '../../../components/QuizInterface'
import { FunFact } from '../../../components/FunFact'
import { AdBanner } from '../../../components/AdBanner'
import { QuizResult } from '../../../components/QuizResult'
import { 
  getQuestionsForCategory, 
  getCategoryInfo, 
  DIFFICULTY_CONFIG,
  type QuizQuestion 
} from '../../../data/quizDatabase'

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
  const [categoryInfo, setCategoryInfo] = useState<any>(null)
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  
  // New features
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [quizStarted, setQuizStarted] = useState(false)
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  // Handle async params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCategoryId(resolvedParams.category)
      setCategoryInfo(getCategoryInfo(resolvedParams.category))
      setLoading(false)
    }
    resolveParams()
  }, [params])

  // Initialize quiz data based on difficulty
  useEffect(() => {
    if (quizStarted && categoryId) {
      const config = DIFFICULTY_CONFIG[difficulty]
      const questions = getQuestionsForCategory(categoryId, difficulty, config.questions)
      setQuizData(questions)
      setTimeLeft(config.timeLimit)
    }
  }, [categoryId, difficulty, quizStarted])

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted && quizStarted && quizData.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !quizCompleted && quizStarted) {
      handleAnswerSelect(-1) // Time up
    }
  }, [timeLeft, quizCompleted, quizStarted, quizData.length])

  const handleDifficultySelect = (selectedDifficulty: 'beginner' | 'intermediate' | 'advanced') => {
    if (!categoryInfo) return
    
    const config = DIFFICULTY_CONFIG[selectedDifficulty]
    const requiredCoins = categoryInfo.entryFee * (selectedDifficulty === 'advanced' ? 2 : selectedDifficulty === 'intermediate' ? 1.5 : 1)
    
    if (state.user.coins >= requiredCoins) {
      setDifficulty(selectedDifficulty)
      setQuizStarted(true)
      // Deduct entry fee
      dispatch({ type: 'UPDATE_COINS', payload: -requiredCoins })
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizData.length === 0) return
    
    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      const isCorrect = answerIndex === quizData[currentQuestion].correctAnswer
      const config = DIFFICULTY_CONFIG[difficulty]
      
      if (isCorrect) {
        const newScore = score + 1
        setScore(newScore)
        
        // Calculate coins with streak bonus
        const baseCoins = config.coinsPerCorrect
        const streakBonus = Math.min(streak * 10, 100) // Max 100 bonus
        const timeBonus = Math.floor(timeLeft / 5) * 5 // 5 coins per 5 seconds left
        const totalCoins = baseCoins + streakBonus + timeBonus
        
        setTotalCoinsEarned(prev => prev + totalCoins)
        setStreak(prev => {
          const newStreak = prev + 1
          setMaxStreak(Math.max(maxStreak, newStreak))
          return newStreak
        })
        
        dispatch({ type: 'UPDATE_COINS', payload: totalCoins })
      } else {
        setStreak(0)
      }
      
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTimeLeft(DIFFICULTY_CONFIG[difficulty].timeLimit)
      } else {
        setQuizCompleted(true)
        
        // Save quiz result
        dispatch({ 
          type: 'END_QUIZ', 
          payload: { 
            category: categoryId, 
            difficulty,
            score, 
            totalQuestions: quizData.length,
            correctAnswers: score,
            coinsEarned: totalCoinsEarned,
            maxStreak,
            completedAt: new Date().toISOString()
          }
        })
      }
    }, 1500)
  }

  const handlePlayAgain = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizCompleted(false)
    setQuizStarted(false)
    setTotalCoinsEarned(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(30)
  }

  if (loading || !categoryInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading quiz...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-1 p-4 max-w-4xl mx-auto">
          {/* Category Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">{categoryInfo.icon}</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {categoryInfo.name} Quiz
            </h1>
            <p className="text-blue-200 text-lg mb-2">
              Choose your difficulty level
            </p>
            <p className="text-blue-300 text-sm">
              Higher difficulties earn more coins but cost more to enter
            </p>
          </motion.div>

          {/* AdSense Banner */}
          <AdBanner 
            adSlot="3333333333"
            adFormat="leaderboard"
            className="mb-8"
          />

          {/* Difficulty Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {Object.entries(DIFFICULTY_CONFIG).map(([level, config], index) => {
              const entryCost = categoryInfo.entryFee * (level === 'advanced' ? 2 : level === 'intermediate' ? 1.5 : 1)
              const canAfford = state.user.coins >= entryCost
              
              return (
                <motion.div
                  key={level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className={`glass-effect p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                    !canAfford ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => canAfford && handleDifficultySelect(level as any)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">
                      {level === 'beginner' ? '🟢' : level === 'intermediate' ? '🟡' : '🔴'}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 capitalize">
                      {level}
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Questions:</span>
                        <span className="text-white font-semibold">{config.questions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Time/Question:</span>
                        <span className="text-white font-semibold">{config.timeLimit}s</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Coins/Correct:</span>
                        <span className="text-yellow-400 font-semibold">🪙{config.coinsPerCorrect}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Entry Fee:</span>
                        <span className="text-red-400 font-semibold">🪙{Math.round(entryCost)}</span>
                      </div>
                    </div>
                    
                    <button
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Start Quiz' : `Need ${Math.round(entryCost - state.user.coins)} more coins`}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => router.push('/start')}
              className="button-secondary px-6 py-3 rounded-xl font-semibold"
            >
              ← Back to Categories
            </button>
          </motion.div>
        </main>
      </div>
    )
  }

  if (quizData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading {difficulty} quiz...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        {/* Quiz Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-4xl">{categoryInfo.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {categoryInfo.name} Quiz
              </h1>
              <p className="text-blue-200 capitalize">
                {difficulty} Level
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress & Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-effect p-4 rounded-xl mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{currentQuestion + 1}/{quizData.length}</div>
              <div className="text-xs text-blue-200">Progress</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                {timeLeft}s
              </div>
              <div className="text-xs text-blue-200">Time Left</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">{score}</div>
              <div className="text-xs text-blue-200">Correct</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">{streak}</div>
              <div className="text-xs text-blue-200">Streak</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
            />
          </div>
        </motion.div>

        <div className="flex flex-col items-center space-y-6">
          {!quizCompleted ? (
            <>
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl"
              >
                <QuizInterface
                  questionData={quizData[currentQuestion]}
                  currentQuestion={currentQuestion}
                  totalQuestions={quizData.length}
                  selectedAnswer={selectedAnswer}
                  onAnswerSelect={handleAnswerSelect}
                />
              </motion.div>
              
              <FunFact fact={quizData[currentQuestion]?.funFact} />
            </>
          ) : (
            <QuizResult
              score={score}
              totalQuestions={quizData.length}
              category={categoryInfo.name}
              difficulty={difficulty}
              coinsEarned={totalCoinsEarned}
              maxStreak={maxStreak}
              onPlayAgain={handlePlayAgain}
              onBackToCategories={() => router.push('/start')}
            />
          )}
        </div>

        {/* Bottom Ad */}
        <AdBanner 
          adSlot="4444444444"
          adFormat="rectangle"
          className="mt-8"
        />
      </main>
    </div>
  )
}