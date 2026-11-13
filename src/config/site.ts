export const SITE_URL = 'https://play.techkwiz.com'
export const SITE_NAME = 'TechKwiz Play'
export const DEFAULT_TITLE = 'TechKwiz'
export const DEFAULT_DESCRIPTION =
  'Play short quizzes on TechKwiz. Answer questions, earn coins, and keep a daily streak.'

// Official play.techkwiz.com GA4 property, created 13 Nov 2026.
// Override only with NEXT_PUBLIC_GA_MEASUREMENT_ID (a real G- ID).
// Do not read NEXT_PUBLIC_ANALYTICS_ID or NEXT_PUBLIC_GA4_MEASUREMENT_ID here:
// those Vercel vars still hold the techkwiz.com blog stream (G-PLE9369CJM).
const GA_ID_PATTERN = /^G-[A-Z0-9]{6,}$/
const PLAY_GA_MEASUREMENT_ID = 'G-22M0WCZK9K'

function officialGaId(): string {
  const override = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim()
  if (GA_ID_PATTERN.test(override) && override !== 'G-XXXXXXXXXX') {
    return override
  }
  return PLAY_GA_MEASUREMENT_ID
}

export const GA_MEASUREMENT_ID = officialGaId()
