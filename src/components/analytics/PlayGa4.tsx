import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/config/site'

/**
 * Official play.techkwiz.com GA4 tag (G-22M0WCZK9K unless overridden by env).
 * Uses next/script afterInteractive. The script tags take no layout space.
 */
export function PlayGa4() {
  const id = GA_MEASUREMENT_ID
  if (!id) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-play" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  )
}
