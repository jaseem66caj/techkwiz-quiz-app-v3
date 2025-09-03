'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { settingsDataManager } from '@/utils/settingsDataManager'

interface GoogleAnalyticsProps {
  trackingId?: string
}

// Google Analytics component that injects GA code into all pages
export function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      // Load GA settings from admin dashboard
      const settings = settingsDataManager.getSystemSettings()
      const gaTrackingId = settings.analytics?.googleAnalyticsId

      if (!gaTrackingId) {
        console.log('📊 Google Analytics: Disabled or no tracking ID configured')
        return
      }

      const finalTrackingId = trackingId || gaTrackingId

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

        console.log('📊 Google Analytics initialized:', finalTrackingId)
      }

      // Custom code execution disabled for simplified version

    } catch (error) {
      console.error('📊 Google Analytics initialization error:', error)
    }
  }, [trackingId])

  // Get GA configuration
  const getGATrackingId = () => {
    if (typeof window === 'undefined') return null

    try {
      const settings = settingsDataManager.getSystemSettings()
      return settings.analytics?.googleAnalyticsId
    } catch (error) {
      console.error('Error loading GA config:', error)
      return null
    }
  }

  const gaTrackingId = getGATrackingId()

  // Don't render anything if no tracking ID
  if (!gaTrackingId && !trackingId) {
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

      console.log('📊 GA Page view tracked:', url)
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

      console.log('📊 GA Event tracked:', eventName, parameters)
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
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
