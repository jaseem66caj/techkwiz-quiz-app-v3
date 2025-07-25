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

interface QuizPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const resolvedParams = await params
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizData, setQuizData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Mock quiz data for different categories
  const generateQuizData = (category: string) => {
    const quizzes: Record<string, any[]> = {
      programming: [
        {
          question: "Which of the following is NOT a JavaScript data type?",
          options: ["String", "Boolean", "Float", "Number"],
          correctAnswer: 2,
          funFact: "JavaScript has 7 primitive data types: string, number, boolean, null, undefined, symbol, and bigint."
        },
        {
          question: "What does the 'this' keyword refer to in JavaScript?",
          options: ["The current function", "The current object", "The global object", "It depends on the context"],
          correctAnswer: 3,
          funFact: "The 'this' keyword in JavaScript refers to different objects depending on how it's called."
        },
        {
          question: "Which method is used to add an element to the end of an array?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correctAnswer: 0,
          funFact: "Array.push() adds elements to the end, while unshift() adds to the beginning."
        },
        {
          question: "What is the purpose of the 'use strict' directive?",
          options: ["Enable strict mode", "Disable debugging", "Optimize performance", "Enable ES6 features"],
          correctAnswer: 0,
          funFact: "Strict mode helps catch common coding mistakes and prevents certain actions."
        },
        {
          question: "Which operator is used for strict equality comparison?",
          options: ["==", "===", "!=", "!=="],
          correctAnswer: 1,
          funFact: "=== checks for both value and type equality, while == performs type coercion."
        }
      ],
      ai: [
        {
          question: "What is the primary goal of machine learning?",
          options: ["To replace human intelligence", "To learn patterns from data", "To create robots", "To increase processing speed"],
          correctAnswer: 1,
          funFact: "Machine learning focuses on algorithms that can learn and improve from experience without being explicitly programmed."
        },
        {
          question: "Which of these is a supervised learning algorithm?",
          options: ["K-means clustering", "Linear regression", "Principal Component Analysis", "DBSCAN"],
          correctAnswer: 1,
          funFact: "Supervised learning uses labeled training data to learn a mapping from inputs to outputs."
        },
        {
          question: "What does 'overfitting' mean in machine learning?",
          options: ["Model is too simple", "Model performs well on training data but poorly on new data", "Model has too few parameters", "Model trains too slowly"],
          correctAnswer: 1,
          funFact: "Overfitting occurs when a model learns the training data too well, including noise and outliers."
        },
        {
          question: "Which activation function is commonly used in hidden layers of neural networks?",
          options: ["Sigmoid", "ReLU", "Tanh", "Softmax"],
          correctAnswer: 1,
          funFact: "ReLU (Rectified Linear Unit) is popular because it's computationally efficient and helps with the vanishing gradient problem."
        },
        {
          question: "What is the purpose of backpropagation in neural networks?",
          options: ["To feed data forward", "To calculate gradients and update weights", "To initialize weights", "To prevent overfitting"],
          correctAnswer: 1,
          funFact: "Backpropagation is the algorithm used to train neural networks by computing gradients of the loss function."
        }
      ],
      'web-dev': [
        {
          question: "Which HTTP status code indicates a successful response?",
          options: ["404", "500", "200", "302"],
          correctAnswer: 2,
          funFact: "HTTP status codes starting with 2xx indicate success, 4xx indicate client errors, and 5xx indicate server errors."
        },
        {
          question: "What does CSS stand for?",
          options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
          correctAnswer: 1,
          funFact: "CSS was first proposed by Håkon Wium Lie in 1994 while working with Tim Berners-Lee at CERN."
        },
        {
          question: "Which HTML element is used for the largest heading?",
          options: ["<h6>", "<h1>", "<header>", "<title>"],
          correctAnswer: 1,
          funFact: "HTML headings go from <h1> (largest) to <h6> (smallest) and are important for SEO and accessibility."
        },
        {
          question: "What is the purpose of the 'alt' attribute in images?",
          options: ["To resize the image", "To provide alternative text for accessibility", "To add filters", "To set image quality"],
          correctAnswer: 1,
          funFact: "The alt attribute is crucial for screen readers and improves web accessibility for visually impaired users."
        },
        {
          question: "Which method is used to make HTTP requests in modern JavaScript?",
          options: ["XMLHttpRequest", "fetch()", "ajax()", "http()"],
          correctAnswer: 1,
          funFact: "The fetch() API is the modern way to make HTTP requests and returns promises for easier async handling."
        }
      ]
    }

    return quizzes[category] || quizzes.programming
  }

  useEffect(() => {
    const data = generateQuizData(resolvedParams.category)
    setQuizData(data)
    setLoading(false)
  }, [resolvedParams.category])

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !quizCompleted) {
      // Time up, move to next question or end quiz
      handleAnswerSelect(-1) // -1 indicates no answer selected
    }
  }, [timeLeft, quizCompleted, loading])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      if (answerIndex === quizData[currentQuestion].correctAnswer) {
        setScore(score + 1)
        dispatch({ type: 'UPDATE_COINS', payload: 200 })
      }
      
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTimeLeft(30) // Reset timer for next question
      } else {
        setQuizCompleted(true)
        dispatch({ 
          type: 'END_QUIZ', 
          payload: { 
            category: resolvedParams.category, 
            score, 
            totalQuestions: quizData.length,
            correctAnswers: score 
          }
        })
      }
    }, 1000)
  }

  const handlePlayAgain = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizCompleted(false)
    setTimeLeft(30)
  }

  const getCategoryInfo = (category: string) => {
    const categoryMap: Record<string, { name: string; icon: string; color: string }> = {
      programming: { name: 'Programming', icon: '💻', color: 'from-blue-500 to-purple-600' },
      ai: { name: 'Artificial Intelligence', icon: '🤖', color: 'from-purple-500 to-pink-600' },
      'web-dev': { name: 'Web Development', icon: '🌐', color: 'from-green-500 to-teal-600' },
      'mobile-dev': { name: 'Mobile Development', icon: '📱', color: 'from-orange-500 to-red-600' },
      'data-science': { name: 'Data Science', icon: '📊', color: 'from-indigo-500 to-blue-600' },
    }
    return categoryMap[category] || categoryMap.programming
  }

  const categoryInfo = getCategoryInfo(resolvedParams.category)

  if (loading) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-2">{categoryInfo.icon}</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {categoryInfo.name} Quiz
          </h1>
          <p className="text-blue-200">
            Test your knowledge and earn coins!
          </p>
        </motion.div>

        {/* AdSense Banner */}
        <AdBanner 
          adSlot="3333333333"
          adFormat="leaderboard"
          className="mb-6"
        />

        <div className="flex flex-col items-center space-y-6">
          {!quizCompleted ? (
            <>
              {/* Timer */}
              <div className="glass-effect p-4 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="text-white font-semibold">Time:</div>
                  <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {timeLeft}s
                  </div>
                </div>
              </div>

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