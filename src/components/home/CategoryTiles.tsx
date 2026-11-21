'use client'

import Link from 'next/link'
import { trackEvent, type HomeVariant } from '@/lib/ga4'

export interface TileCategory {
  slug: string
  name: string
  icon: string
}

// Placeholder tiles in the DESIGN.md dark style (Raised Charcoal, Graphite Border, Signal Blue).
// Original illustrations replace the emoji in a later step.
export function CategoryTiles({ categories, variant }: { categories: TileCategory[]; variant: HomeVariant }) {
  return (
    <section aria-labelledby="tiles-heading" className="px-4 pt-6">
      <h2 id="tiles-heading" className="text-base font-semibold text-[#F2EFE8]">
        Pick a quiz
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-3">
        {categories.map(c => (
          <li key={c.slug}>
            <Link
              href={`/quiz/${c.slug}`}
              onClick={() =>
                trackEvent('homepage_quiz_cta', { category: c.slug, source: 'tile', experiment_variant: variant })
              }
              className="flex h-full min-h-[104px] flex-col justify-between rounded-lg border border-[#3A3A3D] bg-[#2A2A2D] p-3 text-[#F2EFE8] transition-colors hover:border-[#4DB2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4DB2FF]"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#242426] text-2xl ring-1 ring-[#3A3A3D]"
              >
                {c.icon}
              </span>
              <span className="mt-3 text-sm font-semibold leading-5">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
