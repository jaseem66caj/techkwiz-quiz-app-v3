'use client'

import { useEffect } from 'react'
import { readAbContext, trackEvent, type HomeVariant } from '@/lib/ga4'

/** Fires one homepage_view event per page load with the variant. Renders nothing. */
export function HomeExposure({ variant }: { variant: HomeVariant }) {
  useEffect(() => {
    const ctx = readAbContext(variant)
    trackEvent('homepage_view', {
      experiment_variant: ctx.variant,
      experiment_group: ctx.group,
    })
  }, [variant])
  return null
}
