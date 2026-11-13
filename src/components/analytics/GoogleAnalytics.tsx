'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { settingsDataManager } from '@/utils/settingsDataManager'
import { GA_MEASUREMENT_ID } from '@/config/site'

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

      // Official Play GA4 is loaded by PlayGa4 in the root layout. This helper
      // stays in place for an optional extra ID from the in-app settings store.
      const extraId = trackingId || configuredTrackingId
      // Official Play GA4 is already loaded by PlayGa4. Do not inject it again,
      // even if someone passes that same ID as a prop.
      if (!extraId || extraId === GA_MEASUREMENT_ID) {
        return
      }

      setGaTrackingId(extraId)

      // Custom code execution disabled for simplified version

    } catch (error) {
      console.error('📊 Google Analytics initialization error:', error)
    }
  }, [trackingId])

  const finalTrackingId = gaTrackingId
  // Don't render on the server, with no extra ID, or if the extra ID is the official Play stream.
  if (!isClient || !finalTrackingId || finalTrackingId === GA_MEASUREMENT_ID) {
    return null
  }

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
