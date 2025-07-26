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
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Quick Start!
        </h2>
        <p className="text-lg sm:text-xl text-blue-200 mb-6">
          Answer questions and win coins!
        </p>
        
        <div className="glass-effect inline-block px-8 py-3 rounded-full mb-8">
          <span className="text-base sm:text-lg text-white font-semibold">
            {currentQuestion + 1}/{totalQuestions} Question
          </span>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-8 leading-relaxed px-2">
          {questionData.question}
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {questionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`quiz-option text-lg sm:text-xl py-6 px-6 ${selectedAnswer === index ? 'selected' : ''} ${
                selectedAnswer !== null && index === questionData.correct_answer ? 'correct' : ''
              } ${
                selectedAnswer !== null && selectedAnswer === index && index !== questionData.correct_answer ? 'incorrect' : ''
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