'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { FileEditor } from './FileEditor'
import { FileType } from '@/types/admin'

// Sample robots.txt content
const SAMPLE_ROBOTS_TXT = `# robots.txt for techkwiz.com
# This file tells search engine crawlers which pages to crawl

# Allow all crawlers to access all content
User-agent: *
Allow: /

# Disallow access to admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Disallow temporary or test pages
Disallow: /test/
Disallow: /staging/
Disallow: /*.json$

# Allow specific important pages
Allow: /api/sitemap.xml
Allow: /api/rss.xml

# Crawl delay (optional - be careful with this)
# Crawl-delay: 1

# Sitemap location
Sitemap: https://techkwiz.com/sitemap.xml

# Special rules for specific crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Block aggressive crawlers (uncomment if needed)
# User-agent: BadBot
# Disallow: /`

const RobotsTxtEditor: React.FC = () => {
  const [content, setContent] = useState(SAMPLE_ROBOTS_TXT)
  const [originalContent, setOriginalContent] = useState(SAMPLE_ROBOTS_TXT)
  const [lastSaved, setLastSaved] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial content
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setContent(SAMPLE_ROBOTS_TXT)
        setOriginalContent(SAMPLE_ROBOTS_TXT)
        setLastSaved(new Date())
      } catch (err) {
        setError('Failed to load robots.txt file')
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
      console.log('Saving robots.txt content:', newContent)
      
      setOriginalContent(newContent)
      setLastSaved(new Date())
    } catch (err) {
      setError('Failed to save robots.txt file')
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
    let currentUserAgent = ''
    let hasUserAgent = false
    let hasSitemap = false
    
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
          currentUserAgent = value
          hasUserAgent = true
          if (!value) {
            errors.push(`Line ${index + 1}: User-agent cannot be empty`)
          }
          break

        case 'disallow':
        case 'allow':
          if (!currentUserAgent) {
            errors.push(`Line ${index + 1}: ${directive} directive must come after User-agent`)
          }
          if (!value.startsWith('/') && value !== '') {
            warnings.push(`Line ${index + 1}: ${directive} path should start with '/' or be empty`)
          }
          break

        case 'crawl-delay':
          if (isNaN(Number(value)) || Number(value) < 0) {
            errors.push(`Line ${index + 1}: Crawl-delay must be a positive number`)
          }
          if (Number(value) > 10) {
            warnings.push(`Line ${index + 1}: High crawl-delay (${value}s) may significantly slow down indexing`)
          }
          break

        case 'sitemap':
          hasSitemap = true
          if (!value.startsWith('http://') && !value.startsWith('https://')) {
            errors.push(`Line ${index + 1}: Sitemap URL must be absolute (start with http:// or https://)`)
          }
          break

        default:
          warnings.push(`Line ${index + 1}: Unknown directive "${directive}"`)
      }
    })

    if (!hasUserAgent) {
      errors.push('Missing User-agent directive - at least one User-agent is required')
    }

    if (!hasSitemap) {
      suggestions.push('Consider adding a Sitemap directive to help search engines find your sitemap')
    }

    // Check for common security issues
    const hasAdminDisallow = lines.some(line => 
      line.toLowerCase().includes('disallow:') && 
      (line.includes('/admin') || line.includes('/api'))
    )
    
    if (!hasAdminDisallow) {
      suggestions.push('Consider disallowing admin and API paths for security')
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
      fileType={"robots.txt" as FileType}
      content={content}
      onContentChange={setContent}
      onSave={handleSave}
      onRevert={handleRevert}
      isModified={isModified}
      lastSaved={lastSaved}
      isLoading={isLoading}
      error={error}
      validateContent={validateContent}
      language="text"
      description="The robots.txt file tells search engine crawlers which pages or files they can or can't request from your site."
      documentation="https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt"
    />
  )
}

export default RobotsTxtEditor
