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
}

export function CountdownTimer({
  totalSeconds,
  isActive,
  onTimeUp,
  showWarning = true,
  warningThreshold = 10,
  questionNumber
}: CountdownTimerProps) {
  const [clock, setClock] = useState({ questionNumber, totalSeconds, remaining: totalSeconds })
  // A new question must never inherit the previous question's zero during effects.
  const timeLeft = clock.questionNumber === questionNumber && clock.totalSeconds === totalSeconds
    ? clock.remaining : totalSeconds
  const hasCalledTimeUp = useRef(false)
  const isWarning = showWarning && timeLeft <= warningThreshold && timeLeft > 0

  useEffect(() => {
    setClock({ questionNumber, totalSeconds, remaining: totalSeconds })
    hasCalledTimeUp.current = false
  }, [totalSeconds, questionNumber])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => setClock(prev => ({ ...prev, remaining: Math.max(0, prev.remaining - 1) })), 1000)
    return () => clearInterval(interval)
  }, [isActive, questionNumber])

  useEffect(() => {
    if (isActive && timeLeft === 0 && !hasCalledTimeUp.current) {
      hasCalledTimeUp.current = true
      onTimeUp()
    }
  }, [isActive, timeLeft, onTimeUp])

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className={`${getTimerColor()} min-h-[160px] backdrop-blur-md rounded-xl p-4 border transition-all duration-300`}>
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
              <div className="min-h-4">{timeLeft <= 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-300"
                >
                  Hurry up! ⚡
                </motion.div>
              )}</div>
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
          
          <div className="min-h-10 mt-2 text-center text-xs" aria-live="polite">
            {timeLeft === 0 ? "Time’s up!" : timeLeft <= 5 ? `Final countdown! ${timeLeft} seconds left!` : isWarning ? 'Time running out! Answer quickly.' : !isActive ? 'Timer paused' : ''}
          </div>
        </div>
      </div>
    </motion.div>
  )
}