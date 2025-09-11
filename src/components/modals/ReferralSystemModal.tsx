'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReferralSystemModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerateCode: () => void
  userReferralCode?: string
  referralStats?: {
    totalReferrals: number
    coinsEarned: number
    pendingRewards: number
  }
}

interface ReferralReward {
  level: number
  referrals: number
  reward: number
  unlocked: boolean
  icon: string
}

export function ReferralSystemModal({ 
  isOpen, 
  onClose, 
  onGenerateCode,
  userReferralCode = '',
  referralStats = { totalReferrals: 0, coinsEarned: 0, pendingRewards: 0 }
}: ReferralSystemModalProps) {
  const [copied, setCopied] = useState(false)
  const [shareMethod, setShareMethod] = useState<'link' | 'code'>('link')
  const [showRewardTiers, setShowRewardTiers] = useState(false)

  const referralRewards: ReferralReward[] = [
    { level: 1, referrals: 1, reward: 100, unlocked: referralStats.totalReferrals >= 1, icon: '🎯' },
    { level: 2, referrals: 3, reward: 300, unlocked: referralStats.totalReferrals >= 3, icon: '🚀' },
    { level: 3, referrals: 5, reward: 500, unlocked: referralStats.totalReferrals >= 5, icon: '⭐' },
    { level: 4, referrals: 10, reward: 1000, unlocked: referralStats.totalReferrals >= 10, icon: '🏆' },
    { level: 5, referrals: 25, reward: 2500, unlocked: referralStats.totalReferrals >= 25, icon: '👑' },
    { level: 6, referrals: 50, reward: 5000, unlocked: referralStats.totalReferrals >= 50, icon: '💎' }
  ]

  const referralLink = `https://techkwiz.com/join?ref=${userReferralCode}`

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleShare = async (method: 'whatsapp' | 'telegram' | 'twitter' | 'facebook') => {
    const message = `Join me on TechKwiz! 🎯 Test your knowledge and earn coins! Use my code: ${userReferralCode} or click: ${referralLink}`
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join me on TechKwiz! 🎯')}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`
    }
    
    window.open(urls[method], '_blank', 'width=600,height=400')
  }

  const getNextReward = () => {
    return referralRewards.find(reward => !reward.unlocked) || referralRewards[referralRewards.length - 1]
  }

  const getProgressToNextReward = () => {
    const nextReward = getNextReward()
    if (!nextReward) return 100
    return (referralStats.totalReferrals / nextReward.referrals) * 100
  }

  if (!isOpen) return null

  const nextReward = getNextReward()
  const progressPercent = getProgressToNextReward()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 max-w-lg mx-auto border border-indigo-400/30 text-center relative overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -rotate-12"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl z-20"
          >
            ×
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 relative z-10"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              👥 Refer Friends & Earn!
            </h1>
            <p className="text-indigo-200">
              Both you and your friend get 100 coins when they join!
            </p>
          </motion.div>

          {/* Stats Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mb-6 relative z-10"
          >
            <div className="bg-indigo-500/20 rounded-lg p-4 border border-indigo-400/20">
              <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
              <div className="text-indigo-200 text-xs">Friends Joined</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/20">
              <div className="text-2xl font-bold text-white">{referralStats.coinsEarned}</div>
              <div className="text-green-200 text-xs">Coins Earned</div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-400/20">
              <div className="text-2xl font-bold text-white">{referralStats.pendingRewards}</div>
              <div className="text-yellow-200 text-xs">Pending</div>
            </div>
          </motion.div>

          {/* Progress to Next Reward */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30 mb-6 relative z-10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Next Reward:</span>
              <span className="text-yellow-400 font-bold">
                {nextReward.icon} {nextReward.reward} coins
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
              />
            </div>
            <div className="text-purple-200 text-sm">
              {referralStats.totalReferrals} / {nextReward.referrals} friends
              {progressPercent >= 100 ? ' - Ready to claim!' : ''}
            </div>
          </motion.div>

          {/* Share Methods Toggle */}
          <div className="flex bg-indigo-700/30 rounded-lg p-1 mb-6 relative z-10">
            <button
              onClick={() => setShareMethod('link')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                shareMethod === 'link' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Share Link
            </button>
            <button
              onClick={() => setShareMethod('code')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                shareMethod === 'code' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Share Code
            </button>
          </div>

          {/* Share Content */}
          <motion.div
            key={shareMethod}
            initial={{ opacity: 0, x: shareMethod === 'link' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 relative z-10"
          >
            {shareMethod === 'link' ? (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-300 text-sm mb-2">Your Referral Link:</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-900 rounded-lg p-3 text-white text-sm font-mono break-all">
                    {referralLink}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyToClipboard(referralLink)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    {copied ? '✓' : '📋'}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="text-gray-300 text-sm mb-2">Your Referral Code:</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-900 rounded-lg p-3 text-white text-2xl font-bold text-center tracking-wider">
                    {userReferralCode}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyToClipboard(userReferralCode)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    {copied ? '✓' : '📋'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Social Share Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-4 gap-3 mb-6 relative z-10"
          >
            <button
              onClick={() => handleShare('whatsapp')}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors"
              title="Share on WhatsApp"
            >
              💬
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors"
              title="Share on Telegram"
            >
              ✈️
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="bg-sky-500 hover:bg-sky-600 text-white p-3 rounded-lg transition-colors"
              title="Share on Twitter"
            >
              🐦
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
              title="Share on Facebook"
            >
              📘
            </button>
          </motion.div>

          {/* Reward Tiers Toggle */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setShowRewardTiers(!showRewardTiers)}
            className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 text-white py-3 px-4 rounded-lg transition-colors mb-4 relative z-10"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🏆 View All Reward Tiers</span>
              <motion.span
                animate={{ rotate: showRewardTiers ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </div>
          </motion.button>

          {/* Reward Tiers Expandable */}
          <AnimatePresence>
            {showRewardTiers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-3 mb-6 relative z-10"
              >
                {referralRewards.map((reward) => (
                  <div
                    key={reward.level}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${reward.unlocked 
                        ? 'border-green-400 bg-green-400/20' 
                        : 'border-gray-600 bg-gray-600/20'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{reward.icon}</div>
                    <div className="text-white font-bold">{reward.reward} coins</div>
                    <div className="text-xs text-gray-300">
                      {reward.referrals} friend{reward.referrals === 1 ? '' : 's'}
                    </div>
                    {reward.unlocked && (
                      <div className="text-green-400 text-xs mt-1">✓ Unlocked</div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center relative z-10"
          >
            <p className="text-indigo-200 text-sm">
              💡 Tip: Friends who use your code get 100 bonus coins to start!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}