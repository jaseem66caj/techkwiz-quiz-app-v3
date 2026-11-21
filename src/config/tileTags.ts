// Tags are editorial config for highlighting fresh categories — not fabricated engagement stats.
export const NEW_UNTIL: Record<string, string> = {
  'pop-culture-flash': '2026-12-21',
  'micro-trivia': '2026-12-21',
  'trend-vibes': '2026-12-21',
  'future-you': '2026-12-21',
}

export function getTileTag(slug: string, dailySlug: string | null, todayKey: string): 'Hot' | 'New' | null {
  if (slug === dailySlug) return 'Hot'
  const until = NEW_UNTIL[slug]
  if (until && todayKey <= until) return 'New'
  return null
}
