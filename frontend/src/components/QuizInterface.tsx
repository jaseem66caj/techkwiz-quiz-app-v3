'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface QuizInterfaceProps {
  question: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    question_type?: 'multiple_choice' | 'this_or_that' | 'emoji_decode' | 'personality' | 'prediction';
    fun_fact: string;
    category: string;
    subcategory: string;
    emoji_clue?: string;
    visual_options?: string[];
    personality_trait?: string;
    prediction_year?: string;
  }
  selectedAnswer: number | null
  onAnswerSelect: (answerIndex: number) => void
  questionAnswered: boolean
  questionNumber: number
  totalQuestions: number
}

export function QuizInterface({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionAnswered,
  questionNumber,
  totalQuestions
}: QuizInterfaceProps) {
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
    const timer = setTimeout(() => setAnimateIn(false), 500)
    return () => clearTimeout(timer)
  }, [questionNumber])

  const questionType = question.question_type || 'multiple_choice'

  // Youth-friendly headers based on question type
  const getQuestionHeader = () => {
    switch (questionType) {
      case 'this_or_that':
        return "Vibe Check! ✨"
      case 'emoji_decode':
        return "Decode This! 🧩"
      case 'personality':
        return "Know Yourself! 🤳"
      case 'prediction':
        return "Future Vision! 🔮"
      default:
        return "Level Up! 🚀"
    }
  }

  const getQuestionSubtext = () => {
    switch (questionType) {
      case 'this_or_that':
        return "Pick your aesthetic and earn coins!"
      case 'emoji_decode':
        return "Crack the emoji code and slay!"
      case 'personality':
        return "Discover your digital persona!"
      case 'prediction':
        return "Predict the future and win!"
      default:
        return "Answer questions and win coins!"
    }
  }

  // Render "This or That" style question
  const renderThisOrThatQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
          {questionData.question}
        </h3>
        {questionData.emoji_clue && (
          <div className="text-3xl mb-4">{questionData.emoji_clue}</div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {questionData.options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log('🔧 QuizInterface: Button clicked, calling onAnswerSelect with index:', index)
              onAnswerSelect(index)
            }}
            disabled={selectedAnswer !== null}
            className={`p-4 rounded-xl text-center font-medium transition-all duration-300 border-2 ${
              selectedAnswer === index 
                ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30' 
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50 hover:border-purple-400/50'
            }`}
          >
            <div className="text-2xl mb-2">
              {questionData.visual_options?.[index] || '✨'}
            </div>
            <div className="text-sm font-medium">
              {option}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // Render emoji decode question
  const renderEmojiDecodeQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
          {questionData.question}
        </h3>
        {questionData.emoji_clue && (
          <div className="bg-purple-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block border border-purple-400/30 mb-4">
            <div className="text-4xl mb-2">{questionData.emoji_clue}</div>
            <div className="text-xs text-purple-200">Decode the emojis!</div>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {questionData.options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log('🔧 QuizInterface: Button clicked, calling onAnswerSelect with index:', index)
              onAnswerSelect(index)
            }}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border ${
              selectedAnswer === index 
                ? 'bg-pink-500 text-white border-pink-400' 
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
            <div className="flex items-center justify-between">
              <span>{option}</span>
              <span className="text-xl">🎯</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // Render personality question
  const renderPersonalityQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
          {questionData.question}
        </h3>
        <div className="text-xs text-blue-200 mb-4">
          No wrong answers - just discover yourself! ✨
        </div>
      </div>
      
      <div className="space-y-3">
        {questionData.options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log('🔧 QuizInterface: Button clicked, calling onAnswerSelect with index:', index)
              onAnswerSelect(index)
            }}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border ${
              selectedAnswer === index 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400' 
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              <span className="text-xl">🌟</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // Render prediction question
  const renderPredictionQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
          {questionData.question}
        </h3>
        {questionData.prediction_year && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-green-400/30 mb-4">
            <span className="text-sm font-bold text-green-200">
              Prediction for {questionData.prediction_year}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {questionData.options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log('🔧 QuizInterface: Button clicked, calling onAnswerSelect with index:', index)
              onAnswerSelect(index)
            }}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border ${
              selectedAnswer === index 
                ? 'bg-green-500 text-white border-green-400' 
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
            <div className="flex items-center justify-between">
              <span>{option}</span>
              <span className="text-xl">🔮</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // Render regular multiple choice question
  const renderMultipleChoiceQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-6 leading-tight">
          {questionData.question}
        </h3>
      </div>
      
      <div className="space-y-3">
        {questionData.options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              console.log('🔧 QuizInterface: Button clicked, calling onAnswerSelect with index:', index)
              onAnswerSelect(index)
            }}
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
  )

  const renderQuestionContent = () => {
    switch (questionType) {
      case 'this_or_that':
        return renderThisOrThatQuestion()
      case 'emoji_decode':
        return renderEmojiDecodeQuestion()
      case 'personality':
        return renderPersonalityQuestion()
      case 'prediction':
        return renderPredictionQuestion()
      default:
        return renderMultipleChoiceQuestion()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 w-full ${animateIn ? 'animate-bounce-in' : ''}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-3">
          {getQuestionHeader()}
        </h2>
        <p className="text-sm text-blue-200 mb-4">
          {getQuestionSubtext()}
        </p>
        
        <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-blue-400/30 mb-6">
          <span className="text-sm font-bold text-white">
            {currentQuestion + 1}/{totalQuestions} Question
          </span>
        </div>
      </div>
      
      {renderQuestionContent()}
    </motion.div>
  )
}