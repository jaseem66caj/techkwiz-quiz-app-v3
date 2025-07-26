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
    email: false,
    address: false,
    telephone: false,
  },
  referrer: 'origin-when-cross-origin'
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
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "ca-pub-XXXXXXXXXXXXXXXXX",
                enable_page_level_ads: true,
                overlays: {bottom: true}
              });
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
                allow_ad_personalization_signals: true
              });
            `
          }}
        />
        
        {/* Prebid.js for header bidding */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
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