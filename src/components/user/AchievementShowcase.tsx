'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EnhancedAchievementCard } from './EnhancedAchievementCard'
import { Achievement } from '../../types/reward'

interface AchievementShowcaseProps {
  achievements: (Achievement & { progress: number; isClose: boolean })[]
  onShare?: (achievement: Achievement) => void
}

export function AchievementShowcase({ achievements, onShare }: AchievementShowcaseProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'rare'>('all')
  
  const filteredAchievements = achievements.filter(achievement => {
    switch (filter) {
      case 'unlocked':
        return achievement.progress === 100
      case 'locked':
        return achievement.progress < 100
      case 'rare':
        return achievement.requirement.value >= 100 || 
               achievement.requirement.type === 'coins_earned' && achievement.requirement.value >= 1000 ||
               achievement.requirement.type === 'streak_days' && achievement.requirement.value >= 7
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { id: 'all', name: 'All Achievements' },
          { id: 'unlocked', name: 'Unlocked' },
          { id: 'locked', name: 'Locked' },
          { id: 'rare', name: 'Rare' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-orange-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      {/* Achievement Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <EnhancedAchievementCard 
                achievement={achievement} 
                onShare={onShare}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-effect rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-white font-bold text-lg mb-2">No achievements found</h3>
          <p className="text-blue-200">
            {filter === 'unlocked' 
              ? "You haven't unlocked any achievements yet. Keep playing to earn your first one!" 
              : "No achievements match your current filter."}
          </p>
        </div>
      )}
    </div>
  )
}