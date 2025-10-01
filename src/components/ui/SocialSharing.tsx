'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface SocialSharingProps {
  url?: string
  title?: string
  hashtags?: string[]
  className?: string
}

type SocialPlatform = {
  name: string
  icon: string
  color: string
  getUrl: () => string
}

export function SocialSharing({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Check out TechKwiz - Test Your Tech Knowledge!',
  hashtags = ['TechKwiz', 'Programming', 'Quiz', 'TechSkills'],
  className = ''
}: SocialSharingProps) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  const socialPlatforms: SocialPlatform[] = [
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-500 hover:bg-blue-600',
      getUrl: () => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags.join(',')}`
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-800',
      getUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      getUrl: () => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
    }
  ]

  const handleSocialShare = (platform: SocialPlatform) => {
    const shareUrl = platform.getUrl()
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <div className={`social-share ${className}`}>
      <div className="flex items-center justify-center space-x-3 flex-wrap">
        <span className="text-gray-700 font-medium mr-2">Share:</span>
        
        {socialPlatforms.map((platform) => (
          <motion.button
            key={platform.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSocialShare(platform)}
            className={`${platform.color} text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 shadow-lg`}
            title={`Share on ${platform.name}`}
          >
            <span className="text-lg">{platform.icon}</span>
          </motion.button>
        ))}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyToClipboard}
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 shadow-lg"
          title="Copy Link"
        >
          <span className="text-lg">{copiedToClipboard ? '✅' : '🔗'}</span>
        </motion.button>
      </div>
    </div>
  )
}

// Specialized share components for different contexts
export function QuizResultShare({ 
  score, 
  totalQuestions, 
  category,
  className 
}: { 
  score: number, 
  totalQuestions: number, 
  category: string,
  className?: string 
}) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const shareTitle = `🎉 I scored ${score}/${totalQuestions} (${percentage}%) on the ${category} quiz at TechKwiz!`
  
  return (
    <div className={`bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-lg ${className}`}>
      <h3 className="text-white font-bold text-center mb-3">🚀 Share Your Results!</h3>
      <SocialSharing
        title={shareTitle}
        hashtags={['TechKwiz', category.replace(/\s+/g, ''), 'QuizChallenge']}
      />
    </div>
  )
}

export function CategoryShare({ 
  categoryName, 
  className 
}: { 
  categoryName: string,
  className?: string 
}) {
  const shareTitle = `🚀 Join me in taking the ${categoryName} quiz on TechKwiz!`
  
  return (
    <SocialSharing
      title={shareTitle}
      hashtags={['TechKwiz', categoryName.replace(/\s+/g, ''), 'Learning']}
      className={className}
    />
  )
}

export function FloatingSocialShare({ className }: { className?: string }) {
  return (
    <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
      <div className="bg-white rounded-full p-2 shadow-lg">
        <SocialSharing />
      </div>
    </div>
  )
}
