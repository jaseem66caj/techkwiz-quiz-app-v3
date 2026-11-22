/** @jest-environment jsdom */
describe('trackEvent home_variant', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_HOME_AB = 'on'
    document.cookie = 'tk_home_v=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    ;(window as unknown as { gtag?: unknown }).gtag = jest.fn()
  })
  const run = (cookie?: string) => {
    if (cookie) document.cookie = `tk_home_v=${cookie}; path=/`
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { trackEvent } = require('../ga4')
    trackEvent('share', { method: 'copy' })
    return (window as unknown as { gtag: jest.Mock }).gtag.mock.calls[0]
  }
  it('adds game_first / control / none', () => {
    expect(run('gf')[2]).toMatchObject({ home_variant: 'game_first', method: 'copy' })
  })
  it('control', () => { expect(run('ct')[2].home_variant).toBe('control') })
  it('none without cookie', () => { expect(run()[2].home_variant).toBe('none') })
})
