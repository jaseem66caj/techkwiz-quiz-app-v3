'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface QuizInterfaceProps {
  questionData: {
    question: string
    options: string[]
    correctAnswer: number
    funFact: string
  }
  currentQuestion: number
  totalQuestions: number
  selectedAnswer: number | null
  onAnswerSelect: (answerIndex: number) => void
}

export function QuizInterface({
  questionData,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect
}: QuizInterfaceProps) {
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
    const timer = setTimeout(() => setAnimateIn(false), 500)
    return () => clearTimeout(timer)
  }, [currentQuestion])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass-effect p-8 rounded-2xl ${animateIn ? 'animate-bounce-in' : ''}`}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Quick Start!
        </h2>
        <p className="text-blue-200 text-lg mb-6">
          Answer questions and win coins!
        </p>
        
        <div className="glass-effect inline-block px-6 py-2 rounded-full mb-6">
          <span className="text-white font-semibold">
            {currentQuestion + 1}/{totalQuestions} Question
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-8 leading-relaxed">
          {questionData.question}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {questionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`quiz-option ${selectedAnswer === index ? 'selected' : ''} ${
                selectedAnswer !== null && index === questionData.correctAnswer ? 'correct' : ''
              } ${
                selectedAnswer !== null && selectedAnswer === index && index !== questionData.correctAnswer ? 'incorrect' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}