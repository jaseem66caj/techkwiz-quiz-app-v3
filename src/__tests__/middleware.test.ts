/** @jest-environment node */
import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile Safari/604.1'
const req = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`https://play.techkwiz.com${path}`, { headers: { 'user-agent': UA, ...headers } })

describe('middleware', () => {
  const env = { ...process.env }
  afterEach(() => { process.env = { ...env } })

  it('still blocks /test- pages', () => {
    const res = middleware(req('/test-foo'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://play.techkwiz.com/')
  })
  it('does nothing on / while the A/B flag is off', () => {
    const res = middleware(req('/', { 'x-vercel-ip-country': 'US' }))
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('set-cookie')).toBeNull()
  })
})
