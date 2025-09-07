'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface EnhancedQuizInterfaceProps {
  question: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    question_type?: string;
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
  showProgress?: boolean
  encouragementMessages?: boolean
}

export function EnhancedQuizInterface({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionAnswered,
  questionNumber,
  totalQuestions,
  showProgress = true,
  encouragementMessages = true
}: EnhancedQuizInterfaceProps) {
  const [animateIn, setAnimateIn] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
    const timer = setTimeout(() => setAnimateIn(false), 500)
    
    // Show encouragement messages at strategic points
    if (encouragementMessages && (questionNumber === 2 || questionNumber === 4)) {
      setTimeout(() => {
        setShowEncouragement(true)
        setTimeout(() => setShowEncouragement(false), 3000)
      }, 500)
    }
    
    return () => clearTimeout(timer)
  }, [questionNumber, encouragementMessages])

  const questionType = question?.question_type || 'multiple_choice'

  // Safety check - don't render if question is undefined
  if (!question) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading question...</p>
        </div>
      </div>
    )
  }

  // Enhanced progress messages based on current progress
  const getProgressMessage = () => {
    const progress = questionNumber / totalQuestions
    
    if (progress <= 0.3) {
      return "Just getting started! 🚀"
    } else if (progress <= 0.6) {
      return "You're doing great! 🔥"
    } else if (progress <= 0.9) {
      return "Almost there! 💪"
    } else {
      return "Final question! 🎯"
    }
  }

  // Encouragement messages similar to Qureka
  const getEncouragementMessage = () => {
    const messages = [
      "Awesome! You're on fire! 🔥",
      "Keep it up! You're crushing it! 💪", 
      "Brilliant! You're really smart! 🧠",
      "Fantastic! You're doing amazing! ⭐",
      "Incredible! You're a quiz master! 👑"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

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
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight" data-testid="question-text">
          {question.question}
        </h3>
        {question.emoji_clue && (
          <div className="text-3xl mb-4">{question.emoji_clue}</div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            data-testid="answer-option"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`p-4 rounded-xl text-center font-medium transition-all duration-300 border-2 ${
              selectedAnswer === index
                ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30'
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50 hover:border-purple-400/50'
            }`}
          >
            <div className="text-2xl mb-2">
              {question.visual_options?.[index] || '✨'}
            </div>
            <div className="text-sm font-medium">
              {option}
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
        <h3 className="text-lg font-semibold text-white mb-6 leading-tight" data-testid="question-text">
          {question.question}
        </h3>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            data-testid="answer-option"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border ${
              selectedAnswer === index 
                ? 'bg-blue-500 text-white border-blue-400' 
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50'
            } ${
              selectedAnswer !== null && index === question.correct_answer 
                ? 'bg-green-500 border-green-400' 
                : ''
            } ${
              selectedAnswer !== null && selectedAnswer === index && index !== question.correct_answer 
                ? 'bg-red-500 border-red-400' 
                : ''
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  )

  const renderQuestionContent = () => {
    switch (questionType) {
      case 'this_or_that':
        return renderThisOrThatQuestion()
      default:
        return renderMultipleChoiceQuestion()
    }
  }

  return (
    <div className="relative" data-testid="quiz-interface">
      {/* Encouragement Message Overlay */}
      {showEncouragement && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg border border-green-400/50 backdrop-blur-md">
            <p className="text-sm font-bold text-center whitespace-nowrap">
              {getEncouragementMessage()}
            </p>
          </div>
        </motion.div>
      )}

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
          
          {/* Enhanced Progress Display */}
          {showProgress && (
            <div className="space-y-3 mb-6">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block border border-blue-400/30">
                <span className="text-white font-bold text-lg">
                  {questionNumber}/{totalQuestions}
                </span>
                <span className="text-blue-200 text-sm ml-2">
                  - {getProgressMessage()}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="max-w-xs mx-auto">
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {renderQuestionContent()}
      </motion.div>
    </div>
  )
}