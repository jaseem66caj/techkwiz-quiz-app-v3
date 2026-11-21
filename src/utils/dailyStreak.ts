export const DAILY_KEY_PREFIX = 'tk_daily_done_'

export function computeDailyStreak(doneDates: Set<string> | string[], todayKey: string): number {
  const dates = new Set(doneDates)
  let streak = 0
  let cursor = dates.has(todayKey) ? todayKey : shiftDate(todayKey, -1)
  
  while (dates.has(cursor)) {
    streak++
    cursor = shiftDate(cursor, -1)
  }
  
  return streak
}

export function readDoneDates(storage: Storage): string[] {
  const dates: string[] = []
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key?.startsWith(DAILY_KEY_PREFIX)) {
        dates.push(key.slice(DAILY_KEY_PREFIX.length))
      }
    }
  } catch {
    /* storage unavailable */
  }
  return dates
}

export function secondsUntilUtcMidnight(now: Date): number {
  const next = new Date(now)
  next.setUTCHours(24, 0, 0, 0)
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
}

export function formatHMS(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function shiftDate(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}
