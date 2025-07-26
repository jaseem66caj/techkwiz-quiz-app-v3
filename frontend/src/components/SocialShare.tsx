'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SocialShareProps {
  url?: string
  title?: string
  description?: string
  hashtags?: string[]
  via?: string
  className?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'buttons' | 'floating' | 'modal'
  showLabels?: boolean
}

interface ShareData {
  title: string
  text: string
  url: string
}

const socialPlatforms = {
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-blue-500 hover:bg-blue-600',
    getUrl: (url: string, title: string, hashtags: string[] = []) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags.join(',')}`
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700 hover:bg-blue-800',
    getUrl: (url: string, title: string) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600 hover:bg-blue-700',
    getUrl: (url: string, title: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    getUrl: (url: string, title: string) => 
      `https://www.instagram.com/` // Instagram doesn't support direct sharing, opens app
  },
  snapchat: {
    name: 'Snapchat',
    icon: '👻',
    color: 'bg-yellow-400 hover:bg-yellow-500',
    getUrl: (url: string, title: string) => 
      `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500 hover:bg-green-600',
    getUrl: (url: string, title: string) => 
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  },
  telegram: {
    name: 'Telegram',
    icon: '📱',
    color: 'bg-blue-500 hover:bg-blue-600',
    getUrl: (url: string, title: string) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  reddit: {
    name: 'Reddit',
    icon: '🔶',
    color: 'bg-orange-500 hover:bg-orange-600',
    getUrl: (url: string, title: string) => 
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  }
}

export function SocialShare({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Check out TechKwiz - Test Your Tech Knowledge!',
  description = 'Take amazing tech quizzes and test your programming, AI, and web development skills.',
  hashtags = ['TechKwiz', 'Programming', 'Quiz', 'TechSkills'],
  via = 'TechKwiz',
  className = '',
  size = 'medium',
  variant = 'buttons',
  showLabels = true
}: SocialShareProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  // Native sharing API support
  const canUseNativeShare = typeof navigator !== 'undefined' && navigator.share

  const handleNativeShare = async () => {
    if (canUseNativeShare) {
      try {
        const shareData: ShareData = {
          title,
          text: description,
          url
        }
        await navigator.share(shareData)
      } catch (error) {
        console.log('Native sharing failed:', error)
      }
    }
  }

  const handleSocialShare = (platform: keyof typeof socialPlatforms) => {
    const config = socialPlatforms[platform]
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = config.getUrl(url, title, hashtags)
        break
      case 'instagram':
        // For Instagram, we'll copy to clipboard with instructions
        copyToClipboard(`${title} - ${url}`)
        alert('Link copied! Open Instagram and paste in your story or post.')
        return
      case 'snapchat':
        // Snapchat also needs special handling
        copyToClipboard(`${title} - ${url}`)
        alert('Link copied! Open Snapchat and share in your story.')
        return
      default:
        shareUrl = config.getUrl(url, title)
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleCopyLink = () => {
    copyToClipboard(url)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-sm'
      case 'large':
        return 'w-14 h-14 text-lg'
      default:
        return 'w-10 h-10 text-base'
    }
  }

  const ShareButton = ({ platform, config }: { 
    platform: keyof typeof socialPlatforms, 
    config: typeof socialPlatforms[keyof typeof socialPlatforms] 
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleSocialShare(platform)}
      className={`${config.color} text-white rounded-full ${getSizeClasses()} flex items-center justify-center transition-all duration-200 shadow-lg`}
      title={`Share on ${config.name}`}
    >
      <span className="text-lg">{config.icon}</span>
    </motion.button>
  )

  if (variant === 'floating') {
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-3 ${className}`}>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-full p-2 shadow-lg"
        >
          <div className="flex flex-col space-y-2">
            {Object.entries(socialPlatforms).slice(0, 5).map(([platform, config]) => (
              <ShareButton key={platform} platform={platform as keyof typeof socialPlatforms} config={config} />
            ))}
            
            {/* Copy link button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className={`bg-gray-600 hover:bg-gray-700 text-white rounded-full ${getSizeClasses()} flex items-center justify-center transition-all duration-200 shadow-lg`}
              title="Copy Link"
            >
              <span className="text-lg">{copiedToClipboard ? '✅' : '🔗'}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium shadow-lg transition-all duration-200 ${className}`}
        >
          <span className="mr-2">🚀</span>
          Share This Quiz
        </button>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Results! 🎉</h3>
                  <p className="text-gray-600">Let your friends know about this awesome quiz</p>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {Object.entries(socialPlatforms).map(([platform, config]) => (
                    <div key={platform} className="text-center">
                      <ShareButton platform={platform as keyof typeof socialPlatforms} config={config} />
                      {showLabels && (
                        <p className="text-xs text-gray-600 mt-1">{config.name}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Native share button */}
                {canUseNativeShare && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg flex items-center justify-center mb-4 transition-colors"
                  >
                    <span className="mr-2">📲</span>
                    More Sharing Options
                  </button>
                )}

                {/* Copy link */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      copiedToClipboard 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {copiedToClipboard ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Default buttons variant
  return (
    <div className={`social-share ${className}`}>
      <div className="flex items-center justify-center space-x-3 flex-wrap">
        <span className="text-gray-700 font-medium mr-2">Share:</span>
        
        {Object.entries(socialPlatforms).slice(0, 5).map(([platform, config]) => (
          <div key={platform} className="flex flex-col items-center">
            <ShareButton platform={platform as keyof typeof socialPlatforms} config={config} />
            {showLabels && size !== 'small' && (
              <span className="text-xs text-gray-600 mt-1">{config.name}</span>
            )}
          </div>
        ))}
        
        {/* More options button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          title="More sharing options"
        >
          <span>⋯</span>
        </button>

        {/* Copy link button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyLink}
          className={`bg-gray-600 hover:bg-gray-700 text-white rounded-full ${getSizeClasses()} flex items-center justify-center transition-all duration-200 shadow-lg`}
          title="Copy Link"
        >
          <span className="text-lg">{copiedToClipboard ? '✅' : '🔗'}</span>
        </motion.button>
      </div>

      {/* Modal for more options */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">More Sharing Options</h3>
              
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(socialPlatforms).map(([platform, config]) => (
                  <div key={platform} className="text-center">
                    <ShareButton platform={platform as keyof typeof socialPlatforms} config={config} />
                    <p className="text-xs text-gray-600 mt-1">{config.name}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
  const shareDescription = `Think you can beat my score? Test your ${category} knowledge and challenge your friends!`
  
  return (
    <SocialShare
      title={shareTitle}
      description={shareDescription}
      hashtags={['TechKwiz', category.replace(/\s+/g, ''), 'QuizChallenge', 'TechSkills']}
      variant="modal"
      className={className}
    />
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
  const shareDescription = `Test your ${categoryName} skills with expert-created questions. Free and fun!`
  
  return (
    <SocialShare
      title={shareTitle}
      description={shareDescription}
      hashtags={['TechKwiz', categoryName.replace(/\s+/g, ''), 'Learning', 'TechSkills']}
      size="small"
      showLabels={false}
      className={className}
    />
  )
}

export function FloatingSocialShare({ className }: { className?: string }) {
  return (
    <SocialShare
      variant="floating"
      size="small"
      showLabels={false}
      className={className}
    />
  )
}