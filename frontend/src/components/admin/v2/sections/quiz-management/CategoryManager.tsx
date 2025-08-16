'use client'

import { useState, useEffect, useCallback } from 'react'
import { QuizCategory } from '@/types/admin'
import { quizDataManager } from '@/utils/quizDataManager'

interface CategoryManagerProps {
  onCategorySelect?: (categoryId: string) => void
  selectedCategory?: string
}

export function CategoryManager({ onCategorySelect, selectedCategory }: CategoryManagerProps) {
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  })

  // Load categories
  const loadCategories = useCallback(() => {
    try {
      setIsLoading(true)
      const categoriesData = quizDataManager.getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Add new category
  const handleAddCategory = useCallback(async () => {
    if (!newCategory.name.trim()) return

    try {
      // Create a sample question for the new category to register it
      const sampleQuestion = {
        question: `Sample question for ${newCategory.name}`,
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 0,
        category: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        difficulty: 'beginner' as const,
        type: 'regular' as const,
        section: 'category' as const,
        funFact: newCategory.description || `Learn more about ${newCategory.name}!`,
        tags: [newCategory.name.toLowerCase()]
      }

      quizDataManager.saveQuestion(sampleQuestion)
      
      // Reset form
      setNewCategory({ name: '', description: '' })
      setShowAddForm(false)
      
      // Reload categories
      loadCategories()
      
      console.log(`✅ Added new category: ${newCategory.name}`)
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }, [newCategory, loadCategories])

  // Get section breakdown for a category
  const getSectionBreakdown = (categoryId: string) => {
    const questions = quizDataManager.getFilteredQuestions({ category: categoryId })
    const sections = {
      onboarding: questions.filter(q => q.section === 'onboarding').length,
      homepage: questions.filter(q => q.section === 'homepage').length,
      category: questions.filter(q => q.section === 'category').length,
      general: questions.filter(q => q.section === 'general').length
    }
    return sections
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <p className="text-sm text-gray-600">Manage quiz categories and their questions</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Technology, Science, History"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Brief description of this category"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.name.trim()}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Category
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewCategory({ name: '', description: '' })
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="p-6">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📂</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h4>
            <p className="text-gray-600 mb-4">Create your first category to organize quiz questions</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const sections = getSectionBreakdown(category.id)
              const totalQuestions = Object.values(sections).reduce((a, b) => a + b, 0)
              const isSelected = selectedCategory === category.id

              return (
                <div
                  key={category.id}
                  onClick={() => onCategorySelect?.(category.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <span className="text-sm font-medium text-gray-600">{totalQuestions} questions</span>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  
                  {/* Section Breakdown */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">🚀 Onboarding</span>
                      <span className="font-medium">{sections.onboarding}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">🏠 Homepage</span>
                      <span className="font-medium">{sections.homepage}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">📂 Category</span>
                      <span className="font-medium">{sections.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">📝 General</span>
                      <span className="font-medium">{sections.general}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
