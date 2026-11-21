import { decideHomeVariant, isCrawler, isRestrictedRegion } from '../homeAb'

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1'
const base = { enabled: true, country: 'US', userAgent: UA, cookie: undefined, random: () => 0.1 }

describe('home A/B decision', () => {
  it('is off unless enabled', () => {
    expect(decideHomeVariant({ ...base, enabled: false }).kind).toBe('excluded')
  })
  it('excludes EEA/UK/CH, unknown country and crawlers', () => {
    for (const c of ['DE', 'FR', 'GB', 'CH', 'NO', undefined, null]) {
      expect(decideHomeVariant({ ...base, country: c as string }).kind).toBe('excluded')
    }
    expect(decideHomeVariant({ ...base, userAgent: 'Googlebot/2.1' }).kind).toBe('excluded')
    expect(isCrawler(null)).toBe(true)
    expect(isRestrictedRegion('us')).toBe(false)
  })
  it('splits 50/50 and sets a cookie only on first assignment', () => {
    expect(decideHomeVariant({ ...base, random: () => 0.1 })).toEqual({ kind: 'assigned', variant: 'control', setCookie: true })
    expect(decideHomeVariant({ ...base, random: () => 0.9 })).toEqual({ kind: 'assigned', variant: 'game_first', setCookie: true })
  })
  it('is stable once the cookie exists', () => {
    expect(decideHomeVariant({ ...base, cookie: 'gf', random: () => 0.1 })).toEqual({ kind: 'assigned', variant: 'game_first', setCookie: false })
    expect(decideHomeVariant({ ...base, cookie: 'ct', random: () => 0.9 })).toEqual({ kind: 'assigned', variant: 'control', setCookie: false })
  })
})
