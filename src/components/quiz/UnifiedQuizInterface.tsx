// ===================================================================
// TechKwiz Unified Quiz Interface Component
// ===================================================================
// This component renders the interactive quiz interface where users answer questions.
// It supports multiple question types including multiple choice, "This or That", 
// emoji decode, personality, and prediction questions with unique visual styling
// for each type. The component handles user interactions, answer selection,
// and visual feedback for correct/incorrect answers. It also includes enhanced
// features like progress tracking and encouragement messages.

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { QuizQuestion } from '@/types/quiz'

// Interface defining the structure of quiz question data
interface UnifiedQuizInterfaceProps {
  // The current question object containing all question data
  question: QuizQuestion
  // Index of the currently selected answer (-1 if none selected)
  selectedAnswer: number | null
  // Callback function triggered when user selects an answer
  onAnswerSelect: (_answerIndex: number) => void
  // Flag indicating if the current question has been answered
  questionAnswered: boolean
  // Current question number in the quiz sequence
  questionNumber: number
  // Total number of questions in the quiz
  totalQuestions: number
  // Flag to control whether to show progress indicators (default: true)
  showProgress?: boolean
  // Flag to control whether to show encouragement messages (default: true)
  encouragementMessages?: boolean
  // Flag to control whether to show question headers (default: true)
  showQuestionHeaders?: boolean
  // Mode to preset configurations
  mode?: 'basic' | 'enhanced'
}

// Unified Quiz Interface component that renders questions with appropriate styling
export function UnifiedQuizInterface({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionAnswered,
  questionNumber,
  totalQuestions,
  showProgress = true,
  encouragementMessages = true,
  showQuestionHeaders = true,
  mode = 'enhanced'
}: UnifiedQuizInterfaceProps) {
  // Apply mode-based defaults
  const isEnhancedMode = mode === 'enhanced'
  const shouldShowProgress = isEnhancedMode ? showProgress : false
  const shouldShowEncouragement = isEnhancedMode ? encouragementMessages : false
  const shouldShowHeaders = showQuestionHeaders

  // State to control animation when questions change
  const [animateIn, setAnimateIn] = useState(false)
  // State to control visibility of encouragement messages
  const [showEncouragementMessage, setShowEncouragementMessage] = useState(false)

  // Effect to handle animations and encouragement messages when question changes
  useEffect(() => {
    setAnimateIn(true)
    const timer = setTimeout(() => setAnimateIn(false), 500)
    
    // Show encouragement messages at strategic points in the quiz (only in enhanced mode)
    if (shouldShowEncouragement && (questionNumber === 2 || questionNumber === 4)) {
      setTimeout(() => {
        setShowEncouragementMessage(true)
        setTimeout(() => setShowEncouragementMessage(false), 3000)
      }, 500)
    }
    
    return () => clearTimeout(timer)
  }, [questionNumber, shouldShowEncouragement])

  // Determine question type with fallback to multiple choice
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

  // ===================================================================
  // Progress and Encouragement Functions
  // ===================================================================
  // Functions to generate dynamic progress and encouragement messages

  // Generate progress message based on current quiz completion percentage
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

  // Generate random encouragement messages to boost user engagement
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

  // ===================================================================
  // Question Header Generation Functions
  // ===================================================================
  // Generate engaging headers based on question type to enhance user experience

  // Get youth-friendly header text based on question type
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

  // Get descriptive subtext based on question type
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

  // ===================================================================
  // Question Rendering Functions
  // ===================================================================
  // Each function renders a specific question type with unique styling and interactions

  // Render "This or That" style question with visual options in a grid layout
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
            onClick={() => {
              console.info('🔧 QuizInterface: Button clicked, calling onAnswerSelect with index:', index)
              onAnswerSelect(index)
            }}
            disabled={selectedAnswer !== null}
            className={`p-4 rounded-xl text-center font-medium transition-all duration-300 border-2 ${
              selectedAnswer === index
                ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30'
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50 hover:border-purple-400/50'
            }`}
          >
            <span className="block text-sm leading-tight">{option}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // Render emoji decode question with large emoji display
  const renderEmojiDecodeQuestion = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-6" data-testid="emoji-clue">
          {question.emoji_clue}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2" data-testid="question-text">
          {question.question}
        </h3>
        <p className="text-blue-200 text-sm">Crack the emoji code!</p>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            data-testid="answer-option"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border-2 ${
              selectedAnswer === index
                ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/30'
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50 hover:border-green-400/50'
            }`}
          >
            <span className="block">{option}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // Render personality question with visual options
  const renderPersonalityQuestion = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2" data-testid="question-text">
          {question.question}
        </h3>
        <p className="text-blue-200 text-sm">Choose what resonates with you!</p>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            data-testid="answer-option"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border-2 ${
              selectedAnswer === index
                ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/30'
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50 hover:border-pink-400/50'
            }`}
          >
            <span className="block">{option}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // Render prediction question with futuristic styling
  const renderPredictionQuestion = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🔮</div>
        <h3 className="text-xl font-semibold text-white mb-2" data-testid="question-text">
          {question.question}
        </h3>
        <p className="text-blue-200 text-sm">Predict the future!</p>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            data-testid="answer-option"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border-2 ${
              selectedAnswer === index
                ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50 hover:border-blue-400/50'
            }`}
          >
            <span className="block">{option}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // Render standard multiple choice question
  const renderMultipleChoiceQuestion = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2" data-testid="question-text">
          {question.question}
        </h3>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            data-testid="answer-option"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 border-2 ${
              selectedAnswer === index
                ? question.correct_answer === index
                  ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/30'
                  : 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/30'
                : 'bg-gray-700/50 text-white border-gray-600 hover:bg-gray-600/50 hover:border-purple-400/50'
            } ${
              questionAnswered && question.correct_answer === index
                ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/30'
                : ''
            }`}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center mr-3 flex-shrink-0">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="block">{option}</span>
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Fun fact display for answered questions */}
      {questionAnswered && question.fun_fact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30"
        >
          <div className="flex items-start">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h4 className="font-semibold text-blue-200 mb-1">Fun Fact!</h4>
              <p className="text-white text-sm">{question.fun_fact}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )

  // Render question content based on question type
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

  // ===================================================================
  // Main Component Render
  // ===================================================================
  // Renders the complete quiz interface with question content and progress indicators
  return (
    <div className="relative">
      {/* Encouragement message overlay (only in enhanced mode) - Simplified animation */}
      {showEncouragementMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg text-center font-bold mb-4"
        >
          {getEncouragementMessage()}
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 w-full ${animateIn ? 'animate-fade-in' : ''}`}
        data-testid="quiz-interface"
      >
        {/* Progress indicator section (only in enhanced mode) */}
        {shouldShowProgress && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Question {questionNumber} of {totalQuestions}</span>
              <span>{Math.round((questionNumber / totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-blue-200">
              {getProgressMessage()}
            </div>
          </div>
        )}
        
        {/* Question headers (optional) */}
        {shouldShowHeaders && (
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-3">
              {getQuestionHeader()}
            </h2>
            <p className="text-sm text-blue-200 mb-4">
              {getQuestionSubtext()}
            </p>
            
            {/* Question counter for basic mode */}
            {!isEnhancedMode && (
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-blue-400/30 mb-6">
                <span className="text-sm font-bold text-white">
                  {questionNumber}/{totalQuestions} Question
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Question content based on type */}
        {renderQuestionContent()}
      </motion.div>
    </div>
  )
}
