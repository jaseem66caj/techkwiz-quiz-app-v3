'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { FileEditor } from './FileEditor'
import { FileType } from '@/types/admin'

// Sample llms.txt content
const SAMPLE_LLMS_TXT = `# llms.txt for techkwiz.com
# This file specifies how AI language models should interact with your content

# Basic configuration
User-agent: *
Allow: /

# Disallow AI training on private content
User-agent: *
Disallow: /admin/
Disallow: /api/private/
Disallow: /user-data/
Disallow: /personal/

# Allow AI to access public educational content
User-agent: *
Allow: /quiz/
Allow: /questions/
Allow: /public-api/

# Specific AI model configurations
User-agent: GPTBot
Allow: /
Disallow: /admin/

User-agent: ChatGPT-User
Allow: /
Disallow: /admin/

User-agent: Claude-Web
Allow: /
Disallow: /admin/

User-agent: Bard
Allow: /
Disallow: /admin/

# Training data preferences
Training-data: allowed
Training-data-use: educational, research
Training-data-exclude: personal-information, user-data

# Content licensing
License: CC-BY-SA-4.0
License-url: https://creativecommons.org/licenses/by-sa/4.0/

# Contact information for AI ethics
Contact: ai-ethics@techkwiz.com

# Rate limiting for AI requests
Crawl-delay: 2

# Preferred AI interaction methods
Preferred-interaction: api
API-endpoint: https://techkwiz.com/api/ai-access

# Data retention preferences
Data-retention: 30-days
Data-deletion-request: ai-deletion@techkwiz.com`

const LlmsTxtEditor: React.FC = () => {
  const [content, setContent] = useState(SAMPLE_LLMS_TXT)
  const [originalContent, setOriginalContent] = useState(SAMPLE_LLMS_TXT)
  const [lastSaved, setLastSaved] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial content
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setContent(SAMPLE_LLMS_TXT)
        setOriginalContent(SAMPLE_LLMS_TXT)
        setLastSaved(new Date())
      } catch (err) {
        setError('Failed to load llms.txt file')
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [])

  // Save handler
  const handleSave = useCallback(async (newContent: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving llms.txt content:', newContent)
      
      setOriginalContent(newContent)
      setLastSaved(new Date())
    } catch (err) {
      setError('Failed to save llms.txt file')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Revert handler
  const handleRevert = useCallback(() => {
    setContent(originalContent)
    setError(null)
  }, [originalContent])

  // Validation function
  const validateContent = useCallback((content: string) => {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    const lines = content.split('\n')
    let hasUserAgent = false
    let hasTrainingData = false
    let hasContact = false
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return
      }

      const colonIndex = trimmedLine.indexOf(':')
      if (colonIndex === -1) {
        errors.push(`Line ${index + 1}: Invalid syntax - missing colon`)
        return
      }

      const directive = trimmedLine.substring(0, colonIndex).trim().toLowerCase()
      const value = trimmedLine.substring(colonIndex + 1).trim()

      switch (directive) {
        case 'user-agent':
          hasUserAgent = true
          if (!value) {
            errors.push(`Line ${index + 1}: User-agent cannot be empty`)
          }
          break

        case 'allow':
        case 'disallow':
          if (!value.startsWith('/') && value !== '') {
            warnings.push(`Line ${index + 1}: ${directive} path should start with '/' or be empty`)
          }
          break

        case 'training-data':
          hasTrainingData = true
          const validValues = ['allowed', 'disallowed', 'conditional']
          if (!validValues.includes(value.toLowerCase())) {
            errors.push(`Line ${index + 1}: Training-data must be one of: ${validValues.join(', ')}`)
          }
          break

        case 'license':
          if (!value) {
            errors.push(`Line ${index + 1}: License cannot be empty`)
          }
          break

        case 'license-url':
          if (!value.startsWith('http://') && !value.startsWith('https://')) {
            errors.push(`Line ${index + 1}: License-url must be a valid URL`)
          }
          break

        case 'contact':
          hasContact = true
          if (!value.includes('@') && !value.startsWith('http')) {
            warnings.push(`Line ${index + 1}: Contact should be an email address or URL`)
          }
          break

        case 'crawl-delay':
          if (isNaN(Number(value)) || Number(value) < 0) {
            errors.push(`Line ${index + 1}: Crawl-delay must be a positive number`)
          }
          break

        case 'data-retention':
          if (!value.match(/^\d+-(days|months|years)$/)) {
            warnings.push(`Line ${index + 1}: Data-retention format should be like "30-days" or "1-year"`)
          }
          break

        case 'api-endpoint':
          if (!value.startsWith('http://') && !value.startsWith('https://')) {
            errors.push(`Line ${index + 1}: API-endpoint must be a valid URL`)
          }
          break

        default:
          // Allow custom directives but warn about unknown standard ones
          const knownDirectives = [
            'training-data-use', 'training-data-exclude', 'preferred-interaction',
            'data-deletion-request'
          ]
          if (!knownDirectives.includes(directive)) {
            warnings.push(`Line ${index + 1}: Unknown directive "${directive}" (may be custom)`)
          }
      }
    })

    if (!hasUserAgent) {
      errors.push('Missing User-agent directive - at least one User-agent is required')
    }

    if (!hasTrainingData) {
      suggestions.push('Consider adding Training-data directive to specify AI training preferences')
    }

    if (!hasContact) {
      suggestions.push('Consider adding Contact directive for AI ethics inquiries')
    }

    // Check for privacy considerations
    const hasPrivacyProtection = lines.some(line => 
      line.toLowerCase().includes('disallow:') && 
      (line.includes('/admin') || line.includes('/private') || line.includes('/user'))
    )
    
    if (!hasPrivacyProtection) {
      suggestions.push('Consider disallowing private/admin areas to protect user privacy')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }, [])

  const isModified = content !== originalContent

  return (
    <FileEditor
      fileType={"llms.txt" as FileType}
      initialContent={content}
      onSave={handleSave}
      helpText="The llms.txt file specifies how AI language models should interact with your content, including training data preferences and access controls."
      placeholder="Enter llms.txt content..."
    />
  )
}

export default LlmsTxtEditor
