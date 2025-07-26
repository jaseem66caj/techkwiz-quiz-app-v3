import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { seoConfig, generateStructuredData } from '../utils/seo'
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e40af',
  colorScheme: 'dark',
  viewportFit: 'cover'
}

export const metadata: Metadata = {
  ...seoConfig.homepage,
  metadataBase: new URL('https://techkwiz.com'),
  alternates: {
    canonical: 'https://techkwiz.com'
  },
  verification: {
    google: 'your-google-site-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code'
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'education',
  classification: 'Educational Technology Platform',
  creator: 'TechKwiz Team',
  publisher: 'TechKwiz',
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  // Enhanced Open Graph for better social sharing
  openGraph: {
    title: 'TechKwiz - Master Technology Through Interactive Quizzes',
    description: 'Join thousands of developers testing their skills on TechKwiz. Free quizzes covering Programming, AI, Web Dev, Mobile, Data Science, Cybersecurity, Cloud, and Blockchain.',
    url: 'https://techkwiz.com',
    siteName: 'TechKwiz',
    images: [
      {
        url: 'https://techkwiz.com/og-image-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'TechKwiz - Free Tech Quiz Platform',
      },
      {
        url: 'https://techkwiz.com/og-image-square.jpg',
        width: 1080,
        height: 1080,
        alt: 'TechKwiz - Tech Knowledge Testing',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  // Enhanced Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'TechKwiz - Free Online Tech Quiz Platform',
    description: 'Test your programming and tech skills with interactive quizzes. Earn coins, compete globally, and master technology concepts.',
    site: '@TechKwiz',
    creator: '@TechKwiz',
    images: ['https://techkwiz.com/og-image-homepage.jpg'],
  },
  // App-specific metadata
  applicationName: 'TechKwiz',
  appleWebApp: {
    title: 'TechKwiz',
    statusBarStyle: 'default',
    capable: true,
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteStructuredData = generateStructuredData.website()
  const organizationStructuredData = generateStructuredData.organization()
  const faqStructuredData = generateStructuredData.faq()

  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* DNS prefetch for ad networks */}
        <link rel="dns-prefetch" href="//securepubads.g.doubleclick.net" />
        <link rel="dns-prefetch" href="//tpc.googlesyndication.com" />
        <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData)
          }}
        />
        
        {/* Google AdSense - Auto Ads */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "ca-pub-1234567890123456",
                enable_page_level_ads: true,
                overlays: {bottom: true}
              });
            `
          }}
        />
        
        {/* Google AdX/Ad Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.googletag = window.googletag || {cmd: []};
              googletag.cmd.push(function() {
                // Define ad slots for AdX
                googletag.defineSlot('/1234567890/techkwiz-header-banner', [728, 90], 'div-gpt-ad-header-banner').addService(googletag.pubads());
                googletag.defineSlot('/1234567890/techkwiz-sidebar-right', [300, 250], 'div-gpt-ad-sidebar-right').addService(googletag.pubads());
                googletag.defineSlot('/1234567890/techkwiz-footer-banner', [728, 90], 'div-gpt-ad-footer-banner').addService(googletag.pubads());
                
                // Configure pubads
                googletag.pubads().enableSingleRequest();
                googletag.pubads().collapseEmptyDivs();
                googletag.pubads().setCentering(true);
                googletag.enableServices();
              });
            `
          }}
        />
        <script
          async
          src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
        />
        
        {/* Prebid.js for header bidding */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var PREBID_TIMEOUT = 3000;
              var FAILSAFE_TIMEOUT = 3300;
              var pbjs = pbjs || {};
              pbjs.que = pbjs.que || [];
              
              // Prebid configuration
              pbjs.que.push(function() {
                pbjs.addAdUnits([
                  {
                    code: 'header-banner-ad',
                    mediaTypes: {
                      banner: {
                        sizes: [[728, 90], [970, 90]]
                      }
                    },
                    bids: [{
                      bidder: 'appnexus',
                      params: {
                        placementId: 13144370
                      }
                    }]
                  }
                ]);
                
                pbjs.setConfig({
                  debug: false,
                  enableSendAllBids: false,
                  bidderTimeout: PREBID_TIMEOUT
                });
                
                pbjs.requestBids({
                  timeout: PREBID_TIMEOUT,
                  bidsBackHandler: function() {
                    if (typeof googletag !== 'undefined') {
                      pbjs.setTargetingForGPTAsync();
                      googletag.pubads().refresh();
                    }
                  }
                });
              });
            `
          }}
        />
        
        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1234567890123456'); // Replace with real Pixel ID
              fbq('track', 'PageView');
              fbq('track', 'ViewContent', {
                content_type: 'quiz_platform',
                content_category: 'education'
              });
            `
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{display: 'none'}}
            src="https://www.facebook.com/tr?id=1234567890123456&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        
        {/* Twitter/X Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
              },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
              a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
              twq('init','abcde'); // Replace with real Twitter Pixel ID
              twq('track','PageView');
            `
          }}
        />
        
        {/* LinkedIn Insight Tag */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              _linkedin_partner_id = "1234567"; // Replace with real LinkedIn Partner ID
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            `
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);})(window.lintrk);
              lintrk('track', { conversion_id: 1234567 });
            `
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{display: 'none'}} 
            alt="" 
            src="https://px.ads.linkedin.com/collect/?pid=1234567&fmt=gif" 
          />
        </noscript>
        
        {/* Snapchat Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
              {a.handleRequestFunc?a.handleRequestFunc.apply(a,arguments):a.queue.push(arguments)};
              a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
              r.src=n;var u=t.getElementsByTagName(s)[0];
              u.parentNode.insertBefore(r,u);})(window,document,
              'https://sc-static.net/scevent.min.js');
              snaptr('init', 'abcd-1234-efgh-5678', {}); // Replace with real Snapchat Pixel ID
              snaptr('track', 'PAGE_VIEW');
            `
          }}
        />
        
        {/* TikTok Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('ABCD1234EFGH5678'); // Replace with real TikTok Pixel ID
                ttq.page();
              }(window, document, 'ttq');
            `
          }}
        />
        
        {/* Google Analytics 4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', {
                page_title: document.title,
                page_location: window.location.href,
                content_group1: 'Education',
                content_group2: 'Tech Quiz',
                send_page_view: true,
                allow_google_signals: true,
                allow_ad_personalization_signals: true,
                enhanced_conversions: true
              });
              
              // Enhanced ecommerce tracking for quiz completions
              gtag('event', 'page_view', {
                app_name: 'TechKwiz',
                app_version: '2.0',
                screen_name: document.title
              });
            `
          }}
        />
        
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXXXXX'); // Replace with real GTM ID
            `
          }}
        />
              var pbjs = pbjs || {};
              pbjs.que = pbjs.que || [];
              
              // Prebid configuration
              pbjs.que.push(function() {
                pbjs.setConfig({
                  priceGranularity: "medium",
                  cache: {
                    url: 'https://prebid.adnxs.com/pbc/v1/cache'
                  },
                  bidderTimeout: 2000,
                  enableSendAllBids: true,
                  userSync: {
                    userIds: [{
                      name: "id5Id",
                      params: {
                        partner: 173
                      }
                    }],
                    auctionDelay: 50
                  }
                });
              });
            `
          }}
        />
        
        {/* Core Web Vitals reporting */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function sendToAnalytics(metric) {
                gtag('event', metric.name, {
                  event_category: 'Web Vitals',
                  event_label: metric.id,
                  value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                  non_interaction: true,
                });
              }
              
              // Load Web Vitals library
              import('https://unpkg.com/web-vitals?module').then(({getCLS, getFID, getFCP, getLCP, getTTFB}) => {
                getCLS(sendToAnalytics);
                getFID(sendToAnalytics);
                getFCP(sendToAnalytics);
                getLCP(sendToAnalytics);
                getTTFB(sendToAnalytics);
              });
            `
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 min-h-screen`}>
        <Providers>
          {children}
        </Providers>
        
        {/* Service Worker registration for PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
}