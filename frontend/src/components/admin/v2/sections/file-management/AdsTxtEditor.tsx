'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { FileEditor } from './FileEditor'
import { FileType } from '@/types/admin'

// Sample ads.txt content
const SAMPLE_ADS_TXT = `# ads.txt for techkwiz.com
# This file specifies authorized digital sellers for your website

# Google AdSense
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0

# Google Ad Manager
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0

# Other ad networks (examples)
# facebook.com, 000000000000000, DIRECT, c3e20eee3f780d68
# amazon-adsystem.com, 0000-0000-0000-0000, DIRECT, 78b21b5075a45d5
# pubmatic.com, 000000, DIRECT, 5d62403b186f2ace

# Reseller relationships
# Example: google.com, pub-0000000000000000, RESELLER, f08c47fec0942fa0

# Variables (optional)
# CONTACT=admin@techkwiz.com
# SUBDOMAIN=ads

# Important notes:
# - Replace pub-0000000000000000 with your actual publisher ID
# - DIRECT means you have a direct relationship with the ad network
# - RESELLER means you work through an intermediary
# - The certification authority ID is provided by each ad network
# - Keep this file updated when you add/remove ad partners`

const AdsTxtEditor: React.FC = () => {
  const [content, setContent] = useState(SAMPLE_ADS_TXT)
  const [originalContent, setOriginalContent] = useState(SAMPLE_ADS_TXT)
  const [lastSaved, setLastSaved] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial content
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, this would load from localStorage or API
        const stored = localStorage.getItem('admin_ads_txt_content')
        const initialContent = stored || SAMPLE_ADS_TXT
        
        setContent(initialContent)
        setOriginalContent(initialContent)
        setLastSaved(new Date())
      } catch (err) {
        setError('Failed to load ads.txt file')
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
      // Validate content before saving
      const validation = validateAdsContent(newContent)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Save to localStorage (in real app, would save to server)
      localStorage.setItem('admin_ads_txt_content', newContent)
      
      setOriginalContent(newContent)
      setLastSaved(new Date())
      
      console.log('Saved ads.txt content:', newContent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ads.txt file')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Validation function
  const validateAdsContent = useCallback((content: string) => {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    const lines = content.split('\n')
    let hasValidEntry = false
    let hasGoogleAdsense = false
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return
      }

      // Check for variable declarations
      if (trimmedLine.includes('=')) {
        const [key, value] = trimmedLine.split('=', 2)
        if (!key.trim() || !value.trim()) {
          warnings.push(`Line ${index + 1}: Variable declaration should have format KEY=value`)
        }
        return
      }

      // Parse ad network entries
      const parts = trimmedLine.split(',').map(part => part.trim())
      
      if (parts.length < 3 || parts.length > 4) {
        errors.push(`Line ${index + 1}: Entry must have 3 or 4 comma-separated values`)
        return
      }

      const [domain, publisherId, relationship, certificationId] = parts

      // Validate domain
      if (!domain || !domain.includes('.')) {
        errors.push(`Line ${index + 1}: Invalid domain "${domain}"`)
        return
      }

      // Validate publisher ID
      if (!publisherId) {
        errors.push(`Line ${index + 1}: Publisher ID is required`)
        return
      }

      // Validate relationship
      if (!['DIRECT', 'RESELLER'].includes(relationship.toUpperCase())) {
        errors.push(`Line ${index + 1}: Relationship must be DIRECT or RESELLER`)
        return
      }

      // Check for Google AdSense
      if (domain.toLowerCase() === 'google.com' && publisherId.startsWith('pub-')) {
        hasGoogleAdsense = true
      }

      // Validate certification ID (if provided)
      if (parts.length === 4 && !certificationId) {
        warnings.push(`Line ${index + 1}: Empty certification authority ID`)
      }

      hasValidEntry = true
    })

    if (!hasValidEntry) {
      errors.push('No valid ad network entries found')
    }

    if (!hasGoogleAdsense) {
      suggestions.push('Consider adding Google AdSense entry if you use AdSense')
    }

    // Check for placeholder values
    const hasPlaceholders = content.includes('pub-0000000000000000') || 
                           content.includes('000000000000000') ||
                           content.includes('0000-0000-0000-0000')
    
    if (hasPlaceholders) {
      warnings.push('Replace placeholder IDs with your actual publisher IDs')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }, [])

  return (
    <FileEditor
      fileType={"ads.txt" as FileType}
      initialContent={content}
      onSave={handleSave}
      helpText="The ads.txt file helps prevent counterfeit inventory in programmatic advertising by listing authorized digital sellers."
      placeholder="Enter ads.txt content..."
    />
  )
}

export default AdsTxtEditor
