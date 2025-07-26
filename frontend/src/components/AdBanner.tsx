'use client'

import { useEffect, useRef } from 'react'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'leaderboard' | 'vertical' | 'horizontal'
  adLayout?: string
  adLayoutKey?: string
  className?: string
  style?: React.CSSProperties
  responsive?: boolean
  fullWidthResponsive?: boolean
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function AdBanner({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  className = '',
  style = {},
  responsive = true,
  fullWidthResponsive = true
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
      ...style
    }

    switch (adFormat) {
      case 'leaderboard':
        return {
          ...baseStyles,
          minHeight: '90px',
          maxWidth: '728px',
          width: '100%'
        }
      case 'rectangle':
        return {
          ...baseStyles,
          minHeight: '250px',
          maxWidth: '300px',
          width: '100%'
        }
      case 'vertical':
        return {
          ...baseStyles,
          minHeight: '600px',
          maxWidth: '160px',
          width: '100%'
        }
      case 'horizontal':
        return {
          ...baseStyles,
          minHeight: '280px',
          maxWidth: '336px',
          width: '100%'
        }
      default:
        return baseStyles
    }
  }

  // Don't render ads if AdSense isn't available (development mode)
  if (typeof window === 'undefined') {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm ${className}`}
        style={getAdStyles()}
      >
        <span>Ad Space</span>
      </div>
    )
  }

  return (
    <div className={`ad-container ${className}`} style={{ textAlign: 'center' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={getAdStyles()}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={fullWidthResponsive.toString()}
        data-adtest={process.env.NODE_ENV === 'development' ? 'on' : 'off'}
      />
      
      {/* AdSense compliance: Ad label */}
      <div 
        style={{ 
          fontSize: '10px', 
          color: '#666', 
          textAlign: 'center',
          marginTop: '5px',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        Advertisement
      </div>
    </div>
  )
}

// Specialized ad components for different placements
export function HeaderAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="1111111111"
      adFormat="leaderboard"
      className={`header-ad ${className}`}
      style={{ marginBottom: '20px' }}
    />
  )
}

export function SidebarAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="2222222222"
      adFormat="vertical"
      className={`sidebar-ad ${className}`}
      style={{ margin: '10px 0' }}
    />
  )
}

export function ContentAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="3333333333"
      adFormat="rectangle"
      className={`content-ad ${className}`}
      style={{ margin: '30px auto' }}
    />
  )
}

export function FooterAd({ className }: { className?: string }) {
  return (
    <AdBanner
      adSlot="4444444444"
      adFormat="horizontal"
      className={`footer-ad ${className}`}
      style={{ marginTop: '30px' }}
    />
  )
}

// Responsive ad that adjusts to screen size
export function ResponsiveAd({ adSlot, className }: { adSlot: string, className?: string }) {
  return (
    <AdBanner
      adSlot={adSlot}
      adFormat="auto"
      className={`responsive-ad ${className}`}
      responsive={true}
      fullWidthResponsive={true}
    />
  )
}