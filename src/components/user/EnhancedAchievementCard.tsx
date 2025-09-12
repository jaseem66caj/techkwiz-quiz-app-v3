'use client'

import { motion } from 'framer-motion'
import { Achievement } from '../../types/reward'

interface EnhancedAchievementCardProps {
  achievement: Achievement & { progress: number; isClose: boolean }
  onShare?: (achievement: Achievement) => void
}

export function EnhancedAchievementCard({ achievement, onShare }: EnhancedAchievementCardProps) {
  const isUnlocked = achievement.progress === 100
  const isRare = achievement.requirement.value >= 100 || 
                 achievement.requirement.type === 'coins_earned' && achievement.requirement.value >= 1000 ||
                 achievement.requirement.type === 'streak_days' && achievement.requirement.value >= 7

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`
        glass-effect rounded-xl p-4 flex flex-col h-full transition-all duration-300
        ${isUnlocked 
          ? 'border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 to-amber-500/10' 
          : 'border border-gray-700/50'
        }
        ${achievement.isClose ? 'ring-2 ring-orange-400/50' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{achievement.icon}</div>
        {isRare && (
          <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            RARE
          </div>
        )}
      </div>
      
      <h3 className={`font-bold text-lg mb-2 ${isUnlocked ? 'text-yellow-400' : 'text-white'}`}>
        {achievement.name}
      </h3>
      
      <p className="text-blue-200 text-sm mb-4 flex-1">
        {achievement.description}
      </p>
      
      {!isUnlocked ? (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{achievement.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="text-xs text-green-400 font-medium">✅ Unlocked</div>
        </div>
      )}
      
      {onShare && isUnlocked && (
        <button
          onClick={() => onShare(achievement)}
          className="text-xs bg-white/10 hover:bg-white/20 text-white py-1 px-2 rounded-lg transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      )}
    </motion.div>
  )
}