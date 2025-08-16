'use client'

import { useState, useEffect, useCallback } from 'react'
import { QuizQuestion, DEFAULT_CATEGORIES } from '@/types/admin'
import { quizDataManager, VALIDATION_RULES } from '@/utils/quizDataManager'

interface QuestionEditorProps {
  question?: QuizQuestion | null
  onSave: (questionData: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  // Form state
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: 'facts',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    type: 'regular' as 'regular' | 'bonus',
    funFact: '',
    tags: [] as string[]
  })

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [tagInput, setTagInput] = useState('')

  // Auto-save draft
  const draftId = question?.id || 'new_question'

  // Initialize form data
  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        category: question.category,
        difficulty: question.difficulty,
        type: question.type,
        funFact: question.funFact || '',
        tags: question.tags || []
      })
    } else {
      // Load draft if available
      const drafts = quizDataManager.getDrafts()
      const existingDraft = drafts.find(d => d.id === draftId)
      
      if (existingDraft) {
        setFormData({
          question: existingDraft.question,
          options: [...existingDraft.options],
          correctAnswer: existingDraft.correctAnswer,
          category: existingDraft.category,
          difficulty: existingDraft.difficulty,
          type: existingDraft.type,
          funFact: existingDraft.funFact || '',
          tags: existingDraft.tags || []
        })
      }
    }
  }, [question, draftId])

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && !question) {
      quizDataManager.startAutoSave(draftId, () => formData)
    }

    return () => {
      quizDataManager.stopAutoSave()
    }
  }, [formData, isDirty, question, draftId])

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    // Question validation
    if (!formData.question.trim()) {
      newErrors.question = 'Question is required'
    } else if (formData.question.length < VALIDATION_RULES.QUESTION_MIN_LENGTH) {
      newErrors.question = `Question must be at least ${VALIDATION_RULES.QUESTION_MIN_LENGTH} characters long`
    } else if (formData.question.length > VALIDATION_RULES.QUESTION_MAX_LENGTH) {
      newErrors.question = `Question must be no more than ${VALIDATION_RULES.QUESTION_MAX_LENGTH} characters long`
    }

    // Options validation
    formData.options.forEach((option, index) => {
      if (!option.trim()) {
        newErrors[`option_${index}`] = `Option ${index + 1} is required`
      } else if (option.length < VALIDATION_RULES.OPTION_MIN_LENGTH) {
        newErrors[`option_${index}`] = `Option ${index + 1} must be at least ${VALIDATION_RULES.OPTION_MIN_LENGTH} character long`
      } else if (option.length > VALIDATION_RULES.OPTION_MAX_LENGTH) {
        newErrors[`option_${index}`] = `Option ${index + 1} must be no more than ${VALIDATION_RULES.OPTION_MAX_LENGTH} characters long`
      }
    })

    // Check for duplicate options
    const uniqueOptions = new Set(formData.options.map(opt => opt.toLowerCase().trim()))
    if (uniqueOptions.size !== formData.options.length) {
      newErrors.options = 'All options must be unique'
    }

    // Correct answer validation
    if (formData.correctAnswer < 0 || formData.correctAnswer >= formData.options.length) {
      newErrors.correctAnswer = 'Please select a valid correct answer'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Form handlers
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    // Clear specific field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const handleOptionChange = useCallback((index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    handleInputChange('options', newOptions)
  }, [formData.options, handleInputChange])

  const handleTagAdd = useCallback(() => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag])
      setTagInput('')
    }
  }, [tagInput, formData.tags, handleInputChange])

  const handleTagRemove = useCallback((tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }, [formData.tags, handleInputChange])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSave({
        question: formData.question.trim(),
        options: formData.options.map(opt => opt.trim()),
        correctAnswer: formData.correctAnswer,
        category: formData.category,
        difficulty: formData.difficulty,
        type: formData.type,
        funFact: formData.funFact.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      })
      
      // Clear draft after successful save
      if (!question) {
        quizDataManager.deleteDraft(draftId)
      }
    } catch (error) {
      console.error('Error saving question:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, onSave, question, draftId])

  const handleCancel = useCallback(() => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return
    }
    
    quizDataManager.stopAutoSave()
    onCancel()
  }, [isDirty, onCancel])

  const getCharacterCount = (text: string, max: number) => {
    const count = text.length
    const isOverLimit = count > max
    return (
      <span className={`text-xs ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
        {count}/{max}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {question ? 'Edit Question' : 'Create New Question'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <div className="relative">
              <textarea
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                placeholder="Enter your question here..."
                rows={3}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.question ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="absolute bottom-2 right-2">
                {getCharacterCount(formData.question, VALIDATION_RULES.QUESTION_MAX_LENGTH)}
              </div>
            </div>
            {errors.question && (
              <p className="mt-1 text-sm text-red-600">{errors.question}</p>
            )}
          </div>

          {/* Answer Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options *
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => handleInputChange('correctAnswer', index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`option_${index}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <div className="absolute bottom-2 right-2">
                      {getCharacterCount(option, VALIDATION_RULES.OPTION_MAX_LENGTH)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-16">
                    {formData.correctAnswer === index ? 'Correct' : ''}
                  </span>
                </div>
              ))}
            </div>
            {errors.options && (
              <p className="mt-1 text-sm text-red-600">{errors.options}</p>
            )}
            {errors.correctAnswer && (
              <p className="mt-1 text-sm text-red-600">{errors.correctAnswer}</p>
            )}
          </div>

          {/* Category, Difficulty, Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DEFAULT_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="regular">Regular</option>
                <option value="bonus">Bonus</option>
              </select>
            </div>
          </div>

          {/* Fun Fact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fun Fact (Optional)
            </label>
            <textarea
              value={formData.funFact}
              onChange={(e) => handleInputChange('funFact', e.target.value)}
              placeholder="Add an interesting fact related to this question..."
              rows={2}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                disabled={!tagInput.trim()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {!question && isDirty && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Auto-saving draft...
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  question ? 'Update Question' : 'Create Question'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
