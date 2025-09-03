'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Achievement } from '../types/reward'

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50"
          onClick={onClose}
        >
          <div className="flex items-center">
            <div className="text-3xl mr-4">{achievement.icon}</div>
            <div>
              <h3 className="font-bold">Achievement Unlocked!</h3>
              <p>{achievement.name}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
