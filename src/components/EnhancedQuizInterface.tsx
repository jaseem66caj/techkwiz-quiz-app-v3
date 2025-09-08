// ===================================================================
// TechKwiz Enhanced Quiz Interface Component
// ===================================================================
// This component renders an enhanced version of the quiz interface with additional
// features like progress tracking, encouragement messages, and improved animations.
// It builds upon the basic QuizInterface with more engaging user experience elements
// similar to popular quiz apps like Qureka.

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Interface defining the props for the Enhanced Quiz Interface component
interface EnhancedQuizInterfaceProps {
  // The current question object containing all question data
  question: {
    id: string;                    // Unique identifier for the question
    question: string;             // The question text to display
    options: string[];            // Array of answer options
    correct_answer: number;       // Index of correct answer in options array (-1 for personality questions)
    difficulty: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level
    question_type?: string;       // Optional question type for special rendering
    fun_fact: string;             // Educational fun fact related to the question
    category: string;             // Category this question belongs to
    subcategory: string;          // Subcategory within the main category
    emoji_clue?: string;          // Optional emoji clue for emoji decode questions
    visual_options?: string[];    // Optional visual elements for "This or That" questions
    personality_trait?: string;   // Optional personality trait for personality questions
    prediction_year?: string;     // Optional year for prediction questions
  }
  // Index of the currently selected answer (-1 if none selected)
  selectedAnswer: number | null
  // Callback function triggered when user selects an answer
  onAnswerSelect: (answerIndex: number) => void
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
}

// Enhanced Quiz Interface component with progress tracking and encouragement features
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
  // State to control animation when questions change
  const [animateIn, setAnimateIn] = useState(false)
  // State to control visibility of encouragement messages
  const [showEncouragement, setShowEncouragement] = useState(false)

  // Effect to handle animations and encouragement messages when question changes
  useEffect(() => {
    setAnimateIn(true)
    const timer = setTimeout(() => setAnimateIn(false), 500)
    
    // Show encouragement messages at strategic points in the quiz
    if (encouragementMessages && (questionNumber === 2 || questionNumber === 4)) {
      setTimeout(() => {
        setShowEncouragement(true)
        setTimeout(() => setShowEncouragement(false), 3000)
      }, 500)
    }
    
    return () => clearTimeout(timer)
  }, [questionNumber, encouragementMessages])

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

  // Render standard multiple choice question with basic styling
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

  // ===================================================================
  // Main Component Render
  // ===================================================================
  // Renders the complete enhanced quiz interface with all features
  return (
    <div className="relative">
      {/* Encouragement message overlay */}
      {showEncouragement && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg text-center font-bold mb-4"
        >
          {getEncouragementMessage()}
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 w-full ${animateIn ? 'animate-bounce-in' : ''}`}
      >
        {/* Progress indicator section */}
        {showProgress && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Question {questionNumber} of {totalQuestions}</span>
              <span>{Math.round((questionNumber / totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-blue-200">
              {getProgressMessage()}
            </div>
          </div>
        )}
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-3">
            {getQuestionHeader()}
          </h2>
          <p className="text-sm text-blue-200 mb-4">
            {getQuestionSubtext()}
          </p>
        </div>
        
        {/* Question content based on type */}
        {questionType === 'this_or_that' ? renderThisOrThatQuestion() : renderMultipleChoiceQuestion()}
      </motion.div>
    </div>
  )
}