import { renderToStaticMarkup } from 'react-dom/server'
import { PlayGa4, internalTrafficScript } from '../PlayGa4'

describe('PlayGa4 consent mode', () => {
  const html = renderToStaticMarkup(<PlayGa4 />)
  it('sets denied defaults for EEA/UK/CH before granted default', () => {
    const denied = html.indexOf("analytics_storage: 'denied'")
    const granted = html.indexOf("analytics_storage: 'granted'")
    expect(denied).toBeGreaterThan(-1)
    expect(granted).toBeGreaterThan(denied)
    for (const c of ['DE', 'GB', 'CH', 'FR']) expect(html).toContain(`&quot;${c}&quot;`.replace(/&quot;/g, '"'))
    expect(html).toContain('wait_for_update: 500')
  })
})

describe('PlayGa4 internal traffic opt-out', () => {
  const html = renderToStaticMarkup(<PlayGa4 />)
  it('runs the internal check in the inline script that precedes gtag.js (which loads afterInteractive)', () => {
    const check = html.indexOf('tk_internal')
    expect(check).toBeGreaterThan(-1)
    expect(check).toBeLessThan(html.indexOf("gtag('consent'"))
    expect(html).toContain('TKInternalCheck')
  })
  it('sets only the official ga-disable flag for the configured id, never anything for a normal visitor', () => {
    const js = internalTrafficScript('G-TEST123')
    expect(js).toContain('"ga-disable-G-TEST123"')
    // the flag is assigned only inside the `if(on)` branch
    expect(js).toMatch(/if\(on\)window\["ga-disable-G-TEST123"\]=true/)
  })
  function run(cookie: string, ua: string, search: string) {
    const win: Record<string, unknown> = {}
    const jar: string[] = cookie ? cookie.split('; ') : []
    const doc = {
      get cookie() { return jar.join('; ') },
      set cookie(v: string) { jar.push(v.split(';')[0]) },
    }
    const loc = { search }
    const nav = { userAgent: ua }
    new Function('window', 'document', 'location', 'navigator', internalTrafficScript('G-TEST123'))(win, doc, loc, nav)
    return { win, doc }
  }
  it('does not disable GA for a visitor without the cookie or UA token', () => {
    expect(run('a=1; b=2', 'Mozilla/5.0 Chrome/150', '').win['ga-disable-G-TEST123']).toBeUndefined()
    expect(run('xtk_internal=1', 'Mozilla/5.0', '').win['ga-disable-G-TEST123']).toBeUndefined()
  })
  it('disables GA for the cookie, the UA token and the opt-in link', () => {
    expect(run('a=1; tk_internal=1', 'Mozilla/5.0', '').win['ga-disable-G-TEST123']).toBe(true)
    expect(run('', 'Mozilla/5.0 TKInternalCheck', '').win['ga-disable-G-TEST123']).toBe(true)
    const r = run('', 'Mozilla/5.0', '?tk_internal=on')
    expect(r.win['ga-disable-G-TEST123']).toBe(true)
    expect(r.doc.cookie).toContain('tk_internal=1')
    expect(r.doc.cookie).toContain('wp-postpass_tkinternal=1')
  })
  it('opt-out link clears the flag', () => {
    expect(run('tk_internal=1', 'Mozilla/5.0', '?tk_internal=off').win['ga-disable-G-TEST123']).toBeUndefined()
  })
})
