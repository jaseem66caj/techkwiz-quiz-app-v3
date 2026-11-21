import { renderToStaticMarkup } from 'react-dom/server'
import { PlayGa4 } from '../PlayGa4'

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
