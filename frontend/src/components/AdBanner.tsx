'use client'

import { useEffect, useRef } from 'react'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'leaderboard' | 'vertical' | 'horizontal' | 'square'
  adLayout?: string
  adLayoutKey?: string
  className?: string
  style?: React.CSSProperties
  responsive?: boolean
  fullWidthResponsive?: boolean
  adType?: 'adsense' | 'adx' | 'prebid'
}

declare global {
  interface Window {
    adsbygoogle: any[]
    googletag: any
  }
}

// Placeholder Publisher IDs for testing
const ADSENSE_PUBLISHER_ID = "ca-pub-1234567890123456" // Placeholder - replace with real ID
const ADX_PUBLISHER_ID = "ca-pub-9876543210987654" // Placeholder - replace with real ID

export function AdBanner({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  className = '',
  style = {},
  responsive = true,
  fullWidthResponsive = true,
  adType = 'adsense'
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    try {
      // Ensure AdSense script is loaded
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // Push ad to AdSense queue
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // Ad format specific styles for better user experience
  const getAdStyles = () => {
    const baseStyles: React.CSSProperties = {
      display: 'block',
      margin: '20px auto',
      textAlign: 'center' as const,
      borderRadius: '8px',
      backgroundColor: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      ...style
    }

    switch (adFormat) {
      case 'leaderboard':
        return {
          ...baseStyles,
          minHeight: '90px',
          maxWidth: '728px',
          width: '100%',
          height: '90px'
        }
      case 'rectangle':
        return {
          ...baseStyles,
          minHeight: '250px',
          maxWidth: '300px',
          width: '300px',
          height: '250px'
        }
      case 'square':
        return {
          ...baseStyles,
          minHeight: '250px',
          maxWidth: '250px',
          width: '250px',
          height: '250px'
        }
      case 'vertical':
        return {
          ...baseStyles,
          minHeight: '600px',
          maxWidth: '160px',
          width: '160px',
          height: '600px'
        }
      case 'horizontal':
        return {
          ...baseStyles,
          minHeight: '280px',
          maxWidth: '336px',
          width: '336px',
          height: '280px'
        }
      default:
        return {
          ...baseStyles,
          minHeight: '90px',
          width: '100%'
        }
    }
  }

  // Get publisher ID based on ad type
  const getPublisherId = () => {
    switch (adType) {
      case 'adx':
        return ADX_PUBLISHER_ID
      case 'prebid':
        return ADSENSE_PUBLISHER_ID // Prebid still uses AdSense
      default:
        return ADSENSE_PUBLISHER_ID
    }
  }

  // Always return null to completely remove ads in development
  return null
}

// Specialized ad components for different placements matching QuizWinz structure
export function HeaderBannerAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="1111111111"
      adFormat="leaderboard"
      className={`header-banner-ad ${className}`}
      style={{ marginBottom: '20px' }}
      adType="adsense"
    />
  )
}

export function SidebarRightAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="2222222222"
      adFormat="rectangle"
      className={`sidebar-right-ad ${className}`}
      style={{ margin: '10px 0' }}
      adType="adsense"
    />
  )
}

export function BetweenQuestionsAd1({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="3333333333"
      adFormat="rectangle"
      className={`between-questions-1-ad ${className}`}
      style={{ margin: '30px auto' }}
      adType="adx"
    />
  )
}

export function BetweenQuestionsAd2({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="4444444444"
      adFormat="square"
      className={`between-questions-2-ad ${className}`}
      style={{ margin: '30px auto' }}
      adType="adx"
    />
  )
}

export function BetweenQuestionsAd3({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="5555555555"
      adFormat="horizontal"
      className={`between-questions-3-ad ${className}`}
      style={{ margin: '30px auto' }}
      adType="prebid"
    />
  )
}

export function FooterBannerAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="6666666666"
      adFormat="leaderboard"
      className={`footer-banner-ad ${className}`}
      style={{ marginTop: '30px' }}
      adType="adsense"
    />
  )
}

export function PopupInterstitialAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="7777777777"
      adFormat="rectangle"
      className={`popup-interstitial-ad ${className}`}
      style={{ margin: '20px auto' }}
      adType="adx"
    />
  )
}

export function QuizResultBannerAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="8888888888"
      adFormat="leaderboard"
      className={`quiz-result-banner-ad ${className}`}
      style={{ margin: '20px auto' }}
      adType="adsense"
    />
  )
}

export function CategoryPageTopAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="9999999999"
      adFormat="leaderboard"
      className={`category-page-top-ad ${className}`}
      style={{ marginBottom: '20px' }}
      adType="prebid"
    />
  )
}

export function CategoryPageBottomAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="0000000000"
      adFormat="rectangle"
      className={`category-page-bottom-ad ${className}`}
      style={{ marginTop: '30px' }}
      adType="adx"
    />
  )
}

// Responsive ad that adjusts to screen size
export function ResponsiveAd({ adSlot, className, adType = 'adsense' }: { 
  adSlot: string, 
  className?: string,
  adType?: 'adsense' | 'adx' | 'prebid'
}) {
  return (
    <AdBanner
      adSlot={adSlot}
      adFormat="auto"
      className={`responsive-ad ${className}`}
      responsive={true}
      fullWidthResponsive={true}
      adType={adType}
    />
  )
}

// Smart ad component that chooses format based on screen size
export function SmartAd({ adSlot, className }: { adSlot: string, className?: string }) {
  return (
    <div className={className}>
      {/* Desktop/Tablet: Leaderboard */}
      <div className="hidden md:block">
        <AdBanner
          adSlot={adSlot}
          adFormat="leaderboard"
          adType="adsense"
        />
      </div>
      
      {/* Mobile: Rectangle */}
      <div className="block md:hidden">
        <AdBanner
          adSlot={adSlot}
          adFormat="rectangle"
          adType="adsense"
        />
      </div>
    </div>
  )
}