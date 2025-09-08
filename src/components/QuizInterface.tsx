// ===================================================================
// TechKwiz Quiz Interface Component
// ===================================================================
// This component renders the interactive quiz interface where users answer questions.
// It supports multiple question types including multiple choice, "This or That", 
// emoji decode, personality, and prediction questions with unique visual styling
// for each type. The component handles user interactions, answer selection,
// and visual feedback for correct/incorrect answers.

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Interface defining the structure of quiz question data
interface QuizInterfaceProps {
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
}

// Main Quiz Interface component that renders questions with appropriate styling
export function QuizInterface({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionAnswered,
  questionNumber,
  totalQuestions
}: QuizInterfaceProps) {
  // State to control animation when questions change
  const [animateIn, setAnimateIn] = useState(false)

  // Effect to trigger animation when question number changes
  useEffect(() => {
    setAnimateIn(true)
    const timer = setTimeout(() => setAnimateIn(false), 500)
    return () => clearTimeout(timer)
  }, [questionNumber])

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
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
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

  // Render emoji decode question with special styling for emoji clues
  const renderEmojiDecodeQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
          {question.question}
        </h3>
        {question.emoji_clue && (
          <div className="bg-purple-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block border border-purple-400/30 mb-4">
            <div className="text-4xl mb-2">{question.emoji_clue}</div>
            <div className="text-xs text-purple-200">Decode the emojis!</div>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
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
              selectedAnswer !== null && index === question.correct_answer 
                ? 'bg-green-500 border-green-400' 
                : ''
            } ${
              selectedAnswer !== null && selectedAnswer === index && index !== question.correct_answer 
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

  // Render personality question with special styling (no correct answers)
  const renderPersonalityQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
          {question.question}
        </h3>
        <div className="text-xs text-blue-200 mb-4">
          No wrong answers - just discover yourself! ✨
        </div>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
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

  // Render prediction question with futuristic styling
  const renderPredictionQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
          {question.question}
        </h3>
        {question.prediction_year && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-green-400/30 mb-4">
            <span className="text-sm font-bold text-green-200">
              Prediction for {question.prediction_year}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
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
              selectedAnswer !== null && index === question.correct_answer 
                ? 'bg-green-500 border-green-400' 
                : ''
            } ${
              selectedAnswer !== null && selectedAnswer === index && index !== question.correct_answer 
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

  // Render standard multiple choice question with basic styling
  const renderMultipleChoiceQuestion = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-6 leading-tight">
          {question.question}
        </h3>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
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
          </button>
        ))}
      </div>
    </div>
  )

  // Select appropriate rendering function based on question type
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
            {questionNumber}/{totalQuestions} Question
          </span>
        </div>
      </div>
      
      {renderQuestionContent()}
    </motion.div>
  )
}