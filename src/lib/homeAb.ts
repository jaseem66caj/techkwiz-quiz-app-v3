// Pure A/B assignment logic for the play.techkwiz.com homepage. Used by middleware.
// EEA, UK and Switzerland visitors, unknown countries and crawlers always get control
// and are never given a cookie.

export const EEA_UK_CH = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU',
  'MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH',
])

const BOT_RE =
  /bot|crawl|spider|slurp|mediapartners|adsbot|bingpreview|facebookexternalhit|embedly|quora link|lighthouse|pagespeed|headless|python-requests|curl\/|wget\//i

export function isCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true
  return BOT_RE.test(userAgent)
}

export function isRestrictedRegion(country: string | null | undefined): boolean {
  if (!country) return true
  return EEA_UK_CH.has(country.toUpperCase())
}

export type AbDecision =
  | { kind: 'excluded' }
  | { kind: 'assigned'; variant: 'control' | 'game_first'; setCookie: boolean }

export function decideHomeVariant(input: {
  enabled: boolean
  country: string | null | undefined
  userAgent: string | null | undefined
  cookie: string | undefined
  random: () => number
}): AbDecision {
  if (!input.enabled) return { kind: 'excluded' }
  if (isCrawler(input.userAgent) || isRestrictedRegion(input.country)) return { kind: 'excluded' }
  if (input.cookie === 'gf') return { kind: 'assigned', variant: 'game_first', setCookie: false }
  if (input.cookie === 'ct') return { kind: 'assigned', variant: 'control', setCookie: false }
  const variant = input.random() < 0.5 ? 'control' : 'game_first'
  return { kind: 'assigned', variant, setCookie: true }
}
