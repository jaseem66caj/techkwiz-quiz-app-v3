// GA4 event helper for play.techkwiz.com.
// The tag itself loads once, in components/analytics/PlayGa4.tsx. This file only
// pushes events with gtag('event'). No PII (never pass names, emails or user ids),
// no ad-click events. Skips when the browser sends Do Not Track / Global Privacy
// Control, and when the tag is not present (dev, blocked).

export type HomeVariant = 'control' | 'game_first'
export type HomeAbGroup = 'off' | 'assigned' | 'excluded'

type Primitive = string | number | boolean
type Params = Record<string, Primitive | undefined>

type GtagWindow = { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] }

export const HOME_AB_ENABLED = process.env.NEXT_PUBLIC_HOME_AB === 'on'
export const HOME_AB_COOKIE = 'tk_home_v'

function privacySignal(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true
}

/** Variant label from the first-party A/B cookie: game_first, control, or none (excluded / test off). */
export function homeVariantParam(): 'game_first' | 'control' | 'none' {
  if (!HOME_AB_ENABLED || typeof document === 'undefined') return 'none'
  return readAbContext('control').group === 'assigned' ? readAbContext('control').variant : 'none'
}

export function trackEvent(name: string, params: Params = {}): void {
  if (typeof window === 'undefined' || privacySignal()) return
  // home_variant (event-scoped custom dimension in GA4) is added to every event. No PII.
  const clean: Record<string, Primitive> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) clean[k] = v
  }
  clean.home_variant = homeVariantParam() // set last so callers cannot override it
  const w = window as unknown as GtagWindow
  if (typeof w.gtag !== 'function') {
    // Tag script not loaded yet: install the standard gtag stub so events queue in dataLayer.
    w.dataLayer = w.dataLayer || []
    w.gtag = function () {
      w.dataLayer!.push(arguments)
    }
  }
  w.gtag!('event', name, clean)
}

/** Which A/B group is this visitor in? Reads the first-party cookie set by middleware. */
export function readAbContext(fallback: HomeVariant): { variant: HomeVariant; group: HomeAbGroup } {
  if (!HOME_AB_ENABLED) return { variant: fallback, group: 'off' }
  if (typeof document === 'undefined') return { variant: fallback, group: 'assigned' }
  const m = document.cookie.match(new RegExp(`(?:^|; )${HOME_AB_COOKIE}=(gf|ct)`))
  if (!m) return { variant: 'control', group: 'excluded' }
  return { variant: m[1] === 'gf' ? 'game_first' : 'control', group: 'assigned' }
}
