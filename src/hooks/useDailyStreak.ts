'use client'

import { useEffect, useState } from 'react'
import { computeDailyStreak, readDoneDates } from '@/utils/dailyStreak'
import { utcDateKey } from '@/utils/dailyChallenge'

export const DAILY_UPDATED_EVENT = 'tk-daily-updated'

/** Real daily-challenge streak from localStorage (consecutive UTC days). Updates when a round finishes. */
export function useDailyStreak(): number {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const read = () => {
      try {
        setStreak(computeDailyStreak(readDoneDates(localStorage), utcDateKey()))
      } catch {
        /* storage unavailable */
      }
    }
    read()
    window.addEventListener(DAILY_UPDATED_EVENT, read)
    return () => window.removeEventListener(DAILY_UPDATED_EVENT, read)
  }, [])

  return streak
}
