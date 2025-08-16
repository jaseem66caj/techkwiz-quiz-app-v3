'use client'

import { useState, useEffect, useCallback } from 'react'
import { QuizQuestion, SearchFilters, QuizManagementSettings } from '@/types/admin'
import { quizDataManager } from '@/utils/quizDataManager'
import { QuestionList } from './QuestionList'
import { QuestionEditor } from './QuestionEditor'
import { QuestionPreview } from './QuestionPreview'
import { BulkOperations } from './BulkOperations'
import { SearchAndFilters } from './SearchAndFilters'
import { CategoryManager } from './CategoryManager'
import ConfirmationDialog from '../../common/ConfirmationDialog'

export default function QuizManagementDashboard() {
  // State management
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([])
  const [settings, setSettings] = useState<QuizManagementSettings>()
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [previewQuestion, setPreviewQuestion] = useState<QuizQuestion | null>(null)

  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  // Category management states
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [questionsData, settingsData] = await Promise.all([
        Promise.resolve(quizDataManager.getQuestions()),
        Promise.resolve(quizDataManager.getSettings())
      ])
      
      setQuestions(questionsData)
      setSettings(settingsData)
      setFilteredQuestions(questionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter questions based on search criteria
  const handleFiltersChange = useCallback((filters: SearchFilters) => {
    if (!settings) return
    
    const filtered = quizDataManager.searchQuestions(filters)
    setFilteredQuestions(filtered)
    
    // Update settings
    const updatedSettings = { ...settings, filters }
    setSettings(updatedSettings)
    quizDataManager.saveSettings(updatedSettings)
  }, [settings])

  // Sync all existing questions
  const handleSyncQuestions = useCallback(async () => {
    try {
      setIsSyncing(true)
      const result = quizDataManager.forceReimportQuestions()

      if (result.success) {
        console.log(`✅ Synced ${result.processedCount} questions from existing sources`)
        loadData() // Reload all data
      } else {
        console.error('❌ Sync failed:', result.errors)
      }
    } catch (error) {
      console.error('❌ Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [loadData])

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    if (settings) {
      handleFiltersChange({
        ...settings.filters,
        category: categoryId
      })
    }
  }, [settings, handleFiltersChange])

  // Question CRUD operations
  const handleCreateQuestion = useCallback(() => {
    setEditingQuestion(null)
    setShowEditor(true)
  }, [])

  const handleEditQuestion = useCallback((question: QuizQuestion) => {
    setEditingQuestion(question)
    setShowEditor(true)
  }, [])

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setQuestionToDelete(questionId)
    setShowDeleteConfirm(true)
  }, [])

  const confirmDeleteQuestion = useCallback(async () => {
    if (!questionToDelete) return

    try {
      quizDataManager.deleteQuestion(questionToDelete)
      await loadData()

      // Remove from selected questions if present
      setSelectedQuestions(prev => prev.filter(id => id !== questionToDelete))

      // Reset confirmation state
      setShowDeleteConfirm(false)
      setQuestionToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
      setShowDeleteConfirm(false)
      setQuestionToDelete(null)
    }
  }, [questionToDelete, loadData])

  const cancelDeleteQuestion = useCallback(() => {
    setShowDeleteConfirm(false)
    setQuestionToDelete(null)
  }, [])

  const handleSaveQuestion = useCallback(async (questionData: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingQuestion) {
        // Update existing question
        quizDataManager.updateQuestion(editingQuestion.id, questionData)
      } else {
        // Create new question
        quizDataManager.saveQuestion(questionData)
      }
      
      await loadData()
      setShowEditor(false)
      setEditingQuestion(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    }
  }, [editingQuestion, loadData])

  // Preview functionality
  const handlePreviewQuestion = useCallback((question: QuizQuestion) => {
    setPreviewQuestion(question)
    setShowPreview(true)
  }, [])

  // Selection management
  const handleSelectionChange = useCallback((questionIds: string[]) => {
    setSelectedQuestions(questionIds)
    
    if (settings) {
      const updatedSettings = { ...settings, selectedQuestions: questionIds }
      setSettings(updatedSettings)
      quizDataManager.saveSettings(updatedSettings)
    }
  }, [settings])

  // Bulk operations
  const handleBulkDelete = useCallback(async (questionIds: string[]) => {
    if (questionIds.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${questionIds.length} question(s)? This action cannot be undone.`)) {
      return
    }

    try {
      const result = quizDataManager.bulkDelete(questionIds)
      
      if (result.success) {
        await loadData()
        setSelectedQuestions([])
      } else {
        setError(`Bulk delete completed with errors: ${result.errors.join(', ')}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete questions')
    }
  }, [loadData])

  // Error handling
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12 space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">Loading quiz management...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage your quiz questions across {questions.length} total questions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m0 8l2 2-2 2" />
            </svg>
            Categories
          </button>

          <button
            onClick={handleSyncQuestions}
            disabled={isSyncing}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSyncing ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {isSyncing ? 'Syncing...' : 'Sync Questions'}
          </button>

          <button
            onClick={handleCreateQuestion}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Question
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Category Manager */}
      {showCategoryManager && (
        <CategoryManager
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Search and Filters */}
      {settings && (
        <SearchAndFilters
          filters={settings.filters}
          onFiltersChange={handleFiltersChange}
          totalQuestions={questions.length}
          filteredCount={filteredQuestions.length}
        />
      )}

      {/* Bulk Operations */}
      {selectedQuestions.length > 0 && (
        <BulkOperations
          selectedCount={selectedQuestions.length}
          selectedQuestions={selectedQuestions.map(id => questions.find(q => q.id === id)!).filter(Boolean)}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => handleSelectionChange([])}
        />
      )}

      {/* Question List */}
      {settings && (
        <QuestionList
          questions={filteredQuestions}
          settings={settings}
          selectedQuestions={selectedQuestions}
          onSelectionChange={handleSelectionChange}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onPreviewQuestion={handlePreviewQuestion}
          onSettingsChange={(newSettings) => {
            setSettings(newSettings)
            quizDataManager.saveSettings(newSettings)
          }}
        />
      )}

      {/* Modals */}
      {showEditor && (
        <QuestionEditor
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowEditor(false)
            setEditingQuestion(null)
          }}
        />
      )}

      {showPreview && previewQuestion && (
        <QuestionPreview
          question={previewQuestion}
          onEdit={() => {
            setShowPreview(false)
            handleEditQuestion(previewQuestion)
          }}
          onDelete={() => {
            setShowPreview(false)
            handleDeleteQuestion(previewQuestion.id)
          }}
          onClose={() => {
            setShowPreview(false)
            setPreviewQuestion(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onConfirm={confirmDeleteQuestion}
        onCancel={cancelDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
