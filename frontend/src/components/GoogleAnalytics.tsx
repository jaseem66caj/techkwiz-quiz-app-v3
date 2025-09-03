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
      const gaConfig = (settings as any).googleAnalytics

      if (!gaConfig?.enabled || !gaConfig.trackingId) {
        console.log('📊 Google Analytics: Disabled or no tracking ID configured')
        return
      }

      const finalTrackingId = trackingId || gaConfig.trackingId

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
          anonymize_ip: gaConfig.anonymizeIp,
          send_page_view: gaConfig.trackPageViews
        })

        // Configure additional measurement ID if provided
        if (gaConfig.measurementId && gaConfig.measurementId !== finalTrackingId) {
          window.gtag('config', gaConfig.measurementId, {
            anonymize_ip: gaConfig.anonymizeIp,
            send_page_view: gaConfig.trackPageViews
          })
        }

        console.log('📊 Google Analytics initialized:', finalTrackingId)
      }

      // Execute custom code if provided
      if (gaConfig.customCode) {
        try {
          // Create a function to safely execute custom code
          const executeCustomCode = new Function(gaConfig.customCode)
          executeCustomCode()
          console.log('📊 Google Analytics custom code executed')
        } catch (error) {
          console.error('📊 Google Analytics custom code error:', error)
        }
      }

    } catch (error) {
      console.error('📊 Google Analytics initialization error:', error)
    }
  }, [trackingId])

  // Get GA configuration
  const getGAConfig = () => {
    if (typeof window === 'undefined') return null
    
    try {
      const settings = settingsDataManager.getSystemSettings()
      return (settings as any).googleAnalytics
    } catch (error) {
      console.error('Error loading GA config:', error)
      return null
    }
  }

  const gaConfig = getGAConfig()
  
  // Don't render anything if GA is disabled or no tracking ID
  if (!gaConfig?.enabled || !gaConfig.trackingId) {
    return null
  }

  const finalTrackingId = trackingId || gaConfig.trackingId

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
            anonymize_ip: ${gaConfig.anonymizeIp},
            send_page_view: ${gaConfig.trackPageViews}
          });
          
          ${gaConfig.measurementId && gaConfig.measurementId !== finalTrackingId ? `
          gtag('config', '${gaConfig.measurementId}', {
            anonymize_ip: ${gaConfig.anonymizeIp},
            send_page_view: ${gaConfig.trackPageViews}
          });
          ` : ''}
          
          ${gaConfig.customCode || ''}
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
      const gaConfig = (settings as any).googleAnalytics

      if (!gaConfig?.enabled || !gaConfig.trackPageViews) return

      window.gtag('config', gaConfig.trackingId, {
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
      const gaConfig = (settings as any).googleAnalytics

      if (!gaConfig?.enabled || !gaConfig.trackEvents) return

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
