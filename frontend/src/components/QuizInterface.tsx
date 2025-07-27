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
      className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 w-full ${animateIn ? 'animate-bounce-in' : ''}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-3">
          Quick Start!
        </h2>
        <p className="text-sm text-blue-200 mb-4">
          Answer questions and win coins!
        </p>
        
        <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-blue-400/30 mb-6">
          <span className="text-sm font-bold text-white">
            {currentQuestion + 1}/{totalQuestions} Question
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-6 leading-tight">
          {questionData.question}
        </h3>
        
        <div className="space-y-3">
          {questionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border ${
                selectedAnswer === index 
                  ? 'bg-blue-500 text-white border-blue-400' 
                  : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50'
              } ${
                selectedAnswer !== null && index === questionData.correct_answer 
                  ? 'bg-green-500 border-green-400' 
                  : ''
              } ${
                selectedAnswer !== null && selectedAnswer === index && index !== questionData.correct_answer 
                  ? 'bg-red-500 border-red-400' 
                  : ''
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