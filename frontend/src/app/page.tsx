'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from './providers'
import { QuizInterface } from '../components/QuizInterface'
import { FunFact } from '../components/FunFact'
import { Features } from '../components/Features'
import { AdBanner } from '../components/AdBanner'
import { Navigation } from '../components/Navigation'

export default function Home() {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Quick start quiz data
  const quickStartQuiz = [
    {
      question: "Which programming language is known as the 'language of the web'?",
      options: ["JavaScript", "Python", "Java", "C++"],
      correctAnswer: 0,
      funFact: "JavaScript was created in just 10 days by Brendan Eich at Netscape in 1995."
    },
    {
      question: "What does 'AI' stand for in technology?",
      options: ["Advanced Intelligence", "Artificial Intelligence", "Automated Intelligence", "Algorithmic Intelligence"],
      correctAnswer: 1,
      funFact: "The term 'Artificial Intelligence' was coined by John McCarthy in 1956 at the Dartmouth Conference."
    }
  ]

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      if (answerIndex === quickStartQuiz[currentQuestion].correctAnswer) {
        setScore(score + 1)
        dispatch({ type: 'UPDATE_COINS', payload: 100 })
      }
      
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

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizCompleted(false)
    setShowResult(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-width-lg">
          {/* AdSense Banner */}
          <AdBanner 
            adSlot="1234567890"
            adFormat="auto"
            className="mb-6"
          />
          
          <div className="flex flex-col items-center space-y-6">
            {!quizCompleted ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-md"
                >
                  <QuizInterface
                    questionData={quickStartQuiz[currentQuestion]}
                    currentQuestion={currentQuestion}
                    totalQuestions={quickStartQuiz.length}
                    selectedAnswer={selectedAnswer}
                    onAnswerSelect={handleAnswerSelect}
                  />
                </motion.div>
                
                <FunFact fact={quickStartQuiz[currentQuestion]?.funFact} />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="glass-effect p-8 rounded-2xl text-center max-w-md w-full"
              >
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-white text-2xl font-bold mb-4">
                  Quick Start Complete!
                </h2>
                <p className="text-blue-200 mb-2">
                  You scored {score} out of {quickStartQuiz.length}
                </p>
                <p className="text-yellow-400 text-lg font-semibold mb-4">
                  Earned: {score * 100} coins
                </p>
                <div className="text-blue-200 text-sm mb-4">
                  Redirecting to categories...
                </div>
                <button
                  onClick={() => router.push('/start')}
                  className="button-primary px-6 py-3 rounded-lg font-semibold"
                >
                  Continue to Categories
                </button>
              </motion.div>
            )}
            
            <Features />
            
            {/* Bottom Ad */}
            <AdBanner 
              adSlot="9876543210"
              adFormat="rectangle"
              className="mt-6"
            />
          </div>
        </div>
      </main>
    </div>
  )
}