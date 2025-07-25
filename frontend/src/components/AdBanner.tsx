'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdBannerProps {
  adSlot: string
  adFormat: 'auto' | 'rectangle' | 'leaderboard' | 'banner'
  className?: string
}

export function AdBanner({ adSlot, adFormat, className = '' }: AdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  const getAdStyle = () => {
    switch (adFormat) {
      case 'leaderboard':
        return { width: '728px', height: '90px' }
      case 'rectangle':
        return { width: '300px', height: '250px' }
      case 'banner':
        return { width: '468px', height: '60px' }
      default:
        return { width: '100%', height: 'auto' }
    }
  }

  return (
    <div className={`ad-container ${className}`}>
      <div className="text-center mb-2">
        <span className="text-xs text-blue-300 opacity-70">Advertisement</span>
      </div>
      
      {/* AdSense Ad */}
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...getAdStyle(),
        }}
        data-ad-client="ca-pub-YOUR-ADSENSE-ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      
      {/* Fallback/Demo Ad */}
      <div className="glass-effect p-4 rounded-xl text-center border-2 border-dashed border-blue-400/30">
        <div className="text-blue-300 text-sm mb-2">
          📢 Advertisement Space
        </div>
        <div className="text-blue-200 text-xs">
          Your ad could be here! Contact us for advertising opportunities.
        </div>
      </div>
    </div>
  )
}