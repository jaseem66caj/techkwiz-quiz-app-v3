'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Achievement } from '../../types/reward'

interface EnhancedAchievementNotificationProps {
  achievement: Achievement | null
  onClose: () => void
  onShare?: (achievement: Achievement) => void
}

export function EnhancedAchievementNotification({ 
  achievement, 
  onClose,
  onShare
}: EnhancedAchievementNotificationProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed top-4 right-4 bg-gradient-to-br from-yellow-600 to-amber-700 text-white p-4 rounded-xl shadow-xl z-50 max-w-sm border border-yellow-400/30"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">🎉 Achievement Unlocked!</h3>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white"
              aria-label="Close notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="text-3xl mr-3">{achievement.icon}</div>
            <div>
              <p className="font-bold">{achievement.name}</p>
              <p className="text-sm text-yellow-100">{achievement.description}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
            {onShare && (
              <button
                onClick={() => {
                  onShare(achievement)
                  onClose()
                }}
                className="flex-1 bg-white text-amber-700 hover:bg-gray-100 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}