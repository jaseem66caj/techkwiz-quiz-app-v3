'use client'

import { useEffect } from 'react'

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
  // eslint-disable-next-line no-unused-vars
  interface Window {
    adsbygoogle: any[]
    googletag: any
  }
}

export function AdBanner({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  className = '',
  style,
  responsive = true,
  fullWidthResponsive = true,
  adType = 'adsense'
}: AdSenseProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.adsbygoogle = window.adsbygoogle || []
      // Keep push behaviour so that enabling ads later only requires returning markup
      window.adsbygoogle.push({})
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [adSlot, adFormat, adLayout, adLayoutKey, responsive, fullWidthResponsive, adType])

  // Props are intentionally unused while ad surfaces remain disabled.
  void className
  void style

  return null
}
