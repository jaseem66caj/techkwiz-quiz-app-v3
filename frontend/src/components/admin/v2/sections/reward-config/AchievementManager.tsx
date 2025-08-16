'use client'

import { useState, useCallback } from 'react'
import { RewardConfig, Achievement, DEFAULT_ACHIEVEMENT_TEMPLATES, ACHIEVEMENT_ICONS, DEFAULT_CATEGORIES } from '@/types/admin'
import { rewardDataManager } from '@/utils/rewardDataManager'

interface AchievementManagerProps {
  config: RewardConfig
  onConfigChange: (updates: Partial<RewardConfig>) => void
  onSave: (updates: Partial<RewardConfig>) => void
}

export function AchievementManager({ config, onConfigChange, onSave }: AchievementManagerProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Achievement CRUD operations
  const handleCreateAchievement = useCallback(() => {
    setEditingAchievement(null)
    setShowEditor(true)
  }, [])

  const handleEditAchievement = useCallback((achievement: Achievement) => {
    setEditingAchievement(achievement)
    setShowEditor(true)
  }, [])

  const handleDeleteAchievement = useCallback(async (achievementId: string) => {
    if (!confirm('Are you sure you want to delete this achievement? This action cannot be undone.')) {
      return
    }

    try {
      setIsLoading(true)
      rewardDataManager.deleteAchievement(achievementId)
      
      // Update local state
      const updatedAchievements = config.achievements.filter(a => a.id !== achievementId)
      const updates = { achievements: updatedAchievements }
      onConfigChange(updates)
      await onSave(updates)
    } catch (error) {
      console.error('Error deleting achievement:', error)
      alert('Failed to delete achievement. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [config.achievements, onConfigChange, onSave])

  const handleToggleAchievement = useCallback(async (achievementId: string) => {
    try {
      setIsLoading(true)
      const achievement = config.achievements.find(a => a.id === achievementId)
      if (!achievement) return

      const updatedAchievement = rewardDataManager.updateAchievement(achievementId, {
        isActive: !achievement.isActive
      })

      // Update local state
      const updatedAchievements = config.achievements.map(a => 
        a.id === achievementId ? updatedAchievement : a
      )
      const updates = { achievements: updatedAchievements }
      onConfigChange(updates)
      await onSave(updates)
    } catch (error) {
      console.error('Error toggling achievement:', error)
      alert('Failed to update achievement. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [config.achievements, onConfigChange, onSave])

  const handleCreateFromTemplate = useCallback(async (templateIndex: number) => {
    try {
      setIsLoading(true)
      const newAchievement = rewardDataManager.createAchievementFromTemplate(templateIndex)
      
      // Update local state
      const updatedAchievements = [...config.achievements, newAchievement]
      const updates = { achievements: updatedAchievements }
      onConfigChange(updates)
      await onSave(updates)
    } catch (error) {
      console.error('Error creating achievement from template:', error)
      alert('Failed to create achievement. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [config.achievements, onConfigChange, onSave])

  const getRequirementText = useCallback((achievement: Achievement) => {
    const { requirement } = achievement
    switch (requirement.type) {
      case 'questions_answered':
        return `Answer ${requirement.value} question${requirement.value !== 1 ? 's' : ''}`
      case 'correct_streak':
        return `Get ${requirement.value} correct answer${requirement.value !== 1 ? 's' : ''} in a row`
      case 'category_master':
        const categoryName = requirement.category 
          ? DEFAULT_CATEGORIES.find(c => c.id === requirement.category)?.name || requirement.category
          : 'any category'
        return `Answer ${requirement.value} question${requirement.value !== 1 ? 's' : ''} correctly in ${categoryName}`
      case 'daily_login':
        return `Log in for ${requirement.value} consecutive day${requirement.value !== 1 ? 's' : ''}`
      default:
        return 'Unknown requirement'
    }
  }, [])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievement Management</h3>
          <p className="text-gray-600">
            Create and manage achievements that users can unlock. Currently {config.achievements.length} achievement{config.achievements.length !== 1 ? 's' : ''} configured.
          </p>
        </div>
        
        <button
          onClick={handleCreateAchievement}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Achievement
        </button>
      </div>

      {/* Quick Templates */}
      {config.achievements.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">Quick Start Templates</h4>
          <p className="text-blue-800 mb-4">
            Get started quickly with these pre-built achievement templates:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEFAULT_ACHIEVEMENT_TEMPLATES.map((template, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{template.icon}</span>
                  <h5 className="font-medium text-gray-900">{template.name}</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    {template.reward.coins} coins
                  </span>
                  <button
                    onClick={() => handleCreateFromTemplate(index)}
                    disabled={isLoading}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement List */}
      {config.achievements.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h4 className="text-lg font-semibold text-gray-900">Current Achievements</h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {config.achievements.map((achievement) => (
              <div key={achievement.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="text-lg font-semibold text-gray-900">{achievement.name}</h5>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          achievement.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {achievement.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{achievement.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Requirement:</span>
                          <p className="text-gray-600">{getRequirementText(achievement)}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Reward:</span>
                          <p className="text-gray-600">{achievement.reward.coins} coins</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Created:</span>
                          <p className="text-gray-600">{formatDate(achievement.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleAchievement(achievement.id)}
                      disabled={isLoading}
                      className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                        achievement.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50`}
                    >
                      {achievement.isActive ? 'Disable' : 'Enable'}
                    </button>
                    
                    <button
                      onClick={() => handleEditAchievement(achievement)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                      title="Edit achievement"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAchievement(achievement.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      title="Delete achievement"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No achievements yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first achievement to motivate users and reward their progress.
          </p>
        </div>
      )}

      {/* Achievement Editor Modal */}
      {showEditor && (
        <AchievementEditor
          achievement={editingAchievement}
          onSave={async (achievementData) => {
            try {
              setIsLoading(true)
              let updatedAchievements: Achievement[]
              
              if (editingAchievement) {
                // Update existing achievement
                const updatedAchievement = rewardDataManager.updateAchievement(editingAchievement.id, achievementData)
                updatedAchievements = config.achievements.map(a => 
                  a.id === editingAchievement.id ? updatedAchievement : a
                )
              } else {
                // Create new achievement
                const newAchievement = rewardDataManager.saveAchievement(achievementData)
                updatedAchievements = [...config.achievements, newAchievement]
              }
              
              const updates = { achievements: updatedAchievements }
              onConfigChange(updates)
              await onSave(updates)
              setShowEditor(false)
              setEditingAchievement(null)
            } catch (error) {
              console.error('Error saving achievement:', error)
              alert('Failed to save achievement. Please try again.')
            } finally {
              setIsLoading(false)
            }
          }}
          onCancel={() => {
            setShowEditor(false)
            setEditingAchievement(null)
          }}
        />
      )}
    </div>
  )
}

// Achievement Editor Modal Component (placeholder for now)
function AchievementEditor({ 
  achievement, 
  onSave, 
  onCancel 
}: {
  achievement: Achievement | null
  onSave: (data: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {achievement ? 'Edit Achievement' : 'Create Achievement'}
        </h3>
        <p className="text-gray-600 mb-4">
          Achievement editor will be implemented in the next step.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({
              name: 'Sample Achievement',
              description: 'This is a sample achievement',
              icon: '🎯',
              requirement: { type: 'questions_answered', value: 1 },
              reward: { coins: 25 },
              isActive: true
            })}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
