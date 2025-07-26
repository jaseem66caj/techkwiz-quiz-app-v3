'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface QuizInterfaceProps {
  questionData: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    fun_fact: string;
    category: string;
    subcategory: string;
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
      className={`glass-effect p-6 rounded-2xl w-full ${animateIn ? 'animate-bounce-in' : ''}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
          Quick Start!
        </h2>
        <p className="text-sm sm:text-base text-blue-200 mb-4">
          Answer questions and win coins!
        </p>
        
        <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-blue-400/30 mb-6">
          <span className="text-sm font-bold text-white">
            {currentQuestion + 1}/{totalQuestions} Question
          </span>
        </div>
        
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 leading-tight px-2">
          {questionData.question}
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {questionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`quiz-option text-sm sm:text-base py-4 px-4 ${selectedAnswer === index ? 'selected' : ''} ${
                selectedAnswer !== null && index === questionData.correct_answer ? 'correct' : ''
              } ${
                selectedAnswer !== null && selectedAnswer === index && index !== questionData.correct_answer ? 'incorrect' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}