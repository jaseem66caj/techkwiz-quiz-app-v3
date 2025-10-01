'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { settingsDataManager } from '@/utils/settingsDataManager'

interface GoogleAnalyticsProps {
  trackingId?: string
}

// Google Analytics component that injects GA code into all pages
export function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  const [gaTrackingId, setGaTrackingId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side
    setIsClient(true)

    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      // Load GA settings from admin dashboard
      const settings = settingsDataManager.getSystemSettings()
      const configuredTrackingId = settings.analytics?.googleAnalyticsId

      if (!configuredTrackingId) {
        console.info('📊 Google Analytics: Disabled or no tracking ID configured')
        return
      }

      setGaTrackingId(configuredTrackingId)

      const finalTrackingId = trackingId || configuredTrackingId

      // Initialize Google Analytics
      if (typeof window.gtag === 'undefined') {
        // Create gtag function
        window.dataLayer = window.dataLayer || []
        window.gtag = function gtag() {
          window.dataLayer.push(arguments)
        }

        // Configure GA
        window.gtag('js', new Date())
        window.gtag('config', finalTrackingId, {
          page_title: document.title,
          page_location: window.location.href,
          anonymize_ip: true,
          send_page_view: true
        })

        console.info('📊 Google Analytics initialized:', finalTrackingId)
      }

      // Custom code execution disabled for simplified version

    } catch (error) {
      console.error('📊 Google Analytics initialization error:', error)
    }
  }, [trackingId])

  // Don't render anything on server side or if no tracking ID
  if (!isClient || (!gaTrackingId && !trackingId)) {
    return null
  }

  const finalTrackingId = trackingId || gaTrackingId

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${finalTrackingId}`}
        strategy="afterInteractive"
      />

      {/* Google Analytics Configuration */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${finalTrackingId}', {
            anonymize_ip: true,
            send_page_view: true
          });
        `}
      </Script>
    </>
  )
}

// Hook to track page views manually
export function useGoogleAnalytics() {
  const trackPageView = (url: string, title?: string) => {
    if (typeof window === 'undefined' || typeof window.gtag === 'undefined') return

    try {
      const settings = settingsDataManager.getSystemSettings()
      const gaTrackingId = settings.analytics?.googleAnalyticsId

      if (!gaTrackingId) return

      window.gtag('config', gaTrackingId, {
        page_title: title || document.title,
        page_location: url
      })

      console.info('📊 GA Page view tracked:', url)
    } catch (error) {
      console.error('📊 GA Page view tracking error:', error)
    }
  }

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window === 'undefined' || typeof window.gtag === 'undefined') return

    try {
      const settings = settingsDataManager.getSystemSettings()
      const gaTrackingId = settings.analytics?.googleAnalyticsId

      if (!gaTrackingId) return

      window.gtag('event', eventName, parameters)

      console.info('📊 GA Event tracked:', eventName, parameters)
    } catch (error) {
      console.error('📊 GA Event tracking error:', error)
    }
  }

  return {
    trackPageView,
    trackEvent
  }
}

// Extend Window interface for TypeScript
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    dataLayer: any[]
    gtag: (..._args: any[]) => void
  }
}
