import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/config/site'

const CONSENT_REGIONS = [
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT',
  'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO',
  'GB','CH',
] as const

/**
 * Internal traffic (Jaseem 27 Nov 2026): our own devices and automation must not be counted.
 * A browser is internal when it has the cookie tk_internal=1 (set on .techkwiz.com by opening
 * https://techkwiz.com/?tk_internal=on or https://play.techkwiz.com/?tk_internal=on), or its user agent
 * contains TKInternalCheck (our automation). (wp-postpass_tkinternal is only there so techkwiz.com's CDN also bypasses its HTML cache for the
 * same browser.) Then GA4's official opt-out flag ga-disable-<ID> is set before
 * gtag.js loads, so no hit is sent. ?tk_internal=off clears it. Public visitors are unaffected.
 */
export function internalTrafficScript(id: string): string {
  const flag = JSON.stringify(`ga-disable-${id}`)
  return `
            (function(){try{
              var d=document,ua=navigator.userAgent||'',q=location.search.match(/[?&]tk_internal=(on|off)(?:&|$)/),
                  on=/(?:^|; )tk_internal=1(?:;|$)/.test(d.cookie)||ua.indexOf('TKInternalCheck')>-1,
                  c=';domain=.techkwiz.com;path=/;SameSite=Lax;Secure';
              if(q){var v=q[1]==='on';['tk_internal','wp-postpass_tkinternal'].forEach(function(n){d.cookie=n+'='+(v?'1;max-age=34560000':';max-age=0')+c});on=v}
              if(on)window[${flag}]=true;
            }catch(e){}})();
          `
}

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
      <script
        dangerouslySetInnerHTML={{
          __html: `${internalTrafficScript(id)}
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              region: ${JSON.stringify(CONSENT_REGIONS)},
              wait_for_update: 500
            });
            gtag('consent', 'default', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              analytics_storage: 'granted',
              wait_for_update: 500
            });
          `,
        }}
      />
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
