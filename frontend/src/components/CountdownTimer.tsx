'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface CountdownTimerProps {
  totalSeconds: number
  isActive: boolean
  onTimeUp: () => void
  showWarning?: boolean
  warningThreshold?: number
  questionNumber: number
  autoAdvance?: boolean
}

export function CountdownTimer({
  totalSeconds,
  isActive,
  onTimeUp,
  showWarning = true,
  warningThreshold = 10,
  questionNumber,
  autoAdvance = true
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [isWarning, setIsWarning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasCalledTimeUp = useRef(false)

  // Reset timer when question changes or when totalSeconds changes
  useEffect(() => {
    setTimeLeft(totalSeconds)
    setIsWarning(false)
    hasCalledTimeUp.current = false
  }, [totalSeconds, questionNumber])

  // Timer countdown logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          
          // Show warning when time is running low
          if (showWarning && newTime <= warningThreshold && newTime > 0) {
            setIsWarning(true)
          }
          
          // Time's up
          if (newTime <= 0 && !hasCalledTimeUp.current) {
            hasCalledTimeUp.current = true
            if (autoAdvance) {
              setTimeout(() => {
                onTimeUp()
              }, 100) // Small delay to ensure state updates
            }
            return 0
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft, showWarning, warningThreshold, autoAdvance, onTimeUp])

  // Calculate progress percentage
  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get timer color based on time left
  const getTimerColor = () => {
    if (timeLeft <= 5) return 'text-red-400 bg-red-500/20 border-red-400'
    if (isWarning) return 'text-orange-400 bg-orange-500/20 border-orange-400'
    return 'text-green-400 bg-green-500/20 border-green-400'
  }

  // Get progress bar color
  const getProgressColor = () => {
    if (timeLeft <= 5) return 'from-red-500 to-red-600'
    if (isWarning) return 'from-orange-500 to-orange-600'
    return 'from-green-500 to-green-600'
  }

  // Don't render if not active
  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className={`${getTimerColor()} backdrop-blur-md rounded-xl p-4 border transition-all duration-300`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={isWarning ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ repeat: isWarning ? Infinity : 0, duration: 1 }}
              >
                ⏱️
              </motion.div>
              <span className="text-sm font-medium">Time Remaining</span>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
                {formatTime(timeLeft)}
              </div>
              {timeLeft <= 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-300"
                >
                  Hurry up! ⚡
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 ease-linear`}
              style={{ width: `${progressPercentage}%` }}
              animate={timeLeft <= 5 ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
              transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.5 }}
            />
          </div>
          
          {/* Warning message */}
          {isWarning && timeLeft > 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-2"
            >
              <span className="text-xs text-orange-300">
                ⚠️ Time running out! Answer quickly to earn coins!
              </span>
            </motion.div>
          )}
          
          {/* Final countdown message */}
          {timeLeft <= 5 && timeLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-2"
            >
              <span className="text-xs text-red-300 font-medium">
                🚨 Final countdown! {timeLeft} second{timeLeft !== 1 ? 's' : ''} left!
              </span>
            </motion.div>
          )}
          
          {/* Time's up message */}
          {timeLeft <= 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-2"
            >
              <span className="text-sm text-red-300 font-bold">
                ⏰ Time's up! Moving to next question...
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}