import { useState } from 'react'
import { ChangeItem } from '@/utils/bidirectionalSync'

interface QuestionDiffViewProps {
  change: ChangeItem
  isExpanded?: boolean
}

export default function QuestionDiffView({ change, isExpanded = false }: QuestionDiffViewProps) {
  const [expanded, setExpanded] = useState(isExpanded)

  const renderQuestionCard = (question: any, type: 'old' | 'new' | 'single' = 'single') => {
    const bgColor = type === 'old' ? 'bg-red-50 border-red-200' : 
                   type === 'new' ? 'bg-green-50 border-green-200' : 
                   'bg-gray-50 border-gray-200'
    
    const headerColor = type === 'old' ? 'text-red-800 bg-red-100' : 
                       type === 'new' ? 'text-green-800 bg-green-100' : 
                       'text-gray-800 bg-gray-100'

    return (
      <div className={`border rounded-lg p-4 ${bgColor}`}>
        <div className={`text-xs font-medium px-2 py-1 rounded mb-3 inline-block ${headerColor}`}>
          {type === 'old' ? 'Current (Frontend)' : type === 'new' ? 'New (Admin)' : 'Question'}
        </div>
        
        <div className="space-y-3">
          {/* Question Text */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Question:</div>
            <div className="text-sm text-gray-900 bg-white p-2 rounded border">
              {question.question}
            </div>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Category:</div>
              <div className="text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                {question.category}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Difficulty:</div>
              <div className="text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                {question.difficulty}
              </div>
            </div>
          </div>

          {/* Type and Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Type:</div>
              <div className="text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                {question.type}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Tags:</div>
              <div className="text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                {question.tags?.join(', ') || 'None'}
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Answer Options:</div>
            <div className="space-y-1">
              {question.options?.map((option: string, index: number) => (
                <div 
                  key={index}
                  className={`text-sm p-2 rounded border flex items-center gap-2 ${
                    index === question.correctAnswer 
                      ? 'bg-green-100 border-green-300 text-green-800' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                  {index === question.correctAnswer && (
                    <span className="ml-auto text-xs font-medium text-green-600">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fun Fact */}
          {question.funFact && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Fun Fact:</div>
              <div className="text-sm text-gray-900 bg-white p-2 rounded border italic">
                {question.funFact}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            ID: {question.id} | Created: {new Date(question.createdAt).toLocaleDateString()} | 
            Updated: {new Date(question.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    )
  }

  const renderModifiedQuestionDiff = (questionData: any) => {
    const { oldQuestion, newQuestion, changes } = questionData
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderQuestionCard(oldQuestion, 'old')}
          {renderQuestionCard(newQuestion, 'new')}
        </div>
        
        {/* Detailed Changes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-800 mb-3">Detected Changes:</div>
          <div className="space-y-2">
            {Object.entries(changes).map(([field, change]: [string, any]) => (
              <div key={field} className="text-sm">
                <span className="font-medium text-yellow-800 capitalize">{field}:</span>
                <div className="ml-4 mt-1">
                  {field === 'options' ? (
                    <div className="space-y-1">
                      <div className="text-red-600">- {JSON.stringify(change.old)}</div>
                      <div className="text-green-600">+ {JSON.stringify(change.new)}</div>
                    </div>
                  ) : field === 'correctAnswer' ? (
                    <div className="space-y-1">
                      <div className="text-red-600">- Option {change.old.index}: {change.old.text}</div>
                      <div className="text-green-600">+ Option {change.new.index}: {change.new.text}</div>
                    </div>
                  ) : field === 'tags' ? (
                    <div className="space-y-1">
                      <div className="text-red-600">- {change.old.join(', ') || 'None'}</div>
                      <div className="text-green-600">+ {change.new.join(', ') || 'None'}</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-red-600">- {change.old || 'None'}</div>
                      <div className="text-green-600">+ {change.new || 'None'}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getActionIcon = () => {
    switch (change.action) {
      case 'add': return '➕'
      case 'remove': return '➖'
      case 'modify': return '✏️'
      default: return '🔄'
    }
  }

  const getActionColor = () => {
    switch (change.action) {
      case 'add': return 'text-green-600 bg-green-100'
      case 'remove': return 'text-red-600 bg-red-100'
      case 'modify': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const questions = change.details?.questions || []

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-lg px-2 py-1 rounded ${getActionColor()}`}>
              {getActionIcon()}
            </span>
            <div>
              <div className="font-medium text-gray-900">{change.impact}</div>
              <div className="text-sm text-gray-600">
                {change.action === 'add' && `${questions.length} question${questions.length > 1 ? 's' : ''} will be added`}
                {change.action === 'remove' && `${questions.length} question${questions.length > 1 ? 's' : ''} will be removed`}
                {change.action === 'modify' && `${questions.length} question${questions.length > 1 ? 's' : ''} will be modified`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              change.riskLevel === 'safe' ? 'bg-green-100 text-green-800' :
              change.riskLevel === 'caution' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {change.riskLevel}
            </span>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-6">
          {change.action === 'modify' ? (
            // Modified questions with detailed diff
            questions.map((questionData: any, index: number) => (
              <div key={questionData.id || index}>
                {index > 0 && <hr className="my-6" />}
                {renderModifiedQuestionDiff(questionData)}
              </div>
            ))
          ) : (
            // Added or removed questions
            <div className="space-y-4">
              {questions.map((question: any, index: number) => (
                <div key={question.id || index}>
                  {index > 0 && <hr className="my-4" />}
                  {renderQuestionCard(question)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
