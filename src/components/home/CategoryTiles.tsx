'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CategoryIcon, CATEGORY_ICONS } from './CategoryIcons'
import { getTileTag } from '@/config/tileTags'
import { getDailyChallenge, utcDateKey } from '@/utils/dailyChallenge'
import { trackEvent } from '@/lib/ga4'

type Category = {
  slug: string
  name: string
}

export function CategoryTiles({ categories, variant }: { categories: Category[]; variant: string }) {
  const [dailySlug, setDailySlug] = useState<string | null>(null)
  const [todayKey, setTodayKey] = useState<string | null>(null)

  useEffect(() => {
    setDailySlug(getDailyChallenge().category)
    setTodayKey(utcDateKey())
  }, [])

  return (
    <section aria-labelledby="pick-quiz-heading" className="mt-0">
      <h3 id="pick-quiz-heading" className="mb-4 text-2xl font-bold text-white">
        Pick a <span className="text-orange-400">quiz</span>
      </h3>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map(category => {
          const tag = dailySlug && todayKey ? getTileTag(category.slug, dailySlug, todayKey) : null
          const icon = CATEGORY_ICONS[category.slug]
          return (
            <Link
              key={category.slug}
              href={`/quiz/${category.slug}`}
              onClick={() => trackEvent('homepage_quiz_cta', { category: category.slug, source: 'tile', experiment_variant: variant })}
              className="group relative flex min-h-[128px] flex-col rounded-2xl border border-white/10 bg-[rgba(30,60,114,.8)] p-4 shadow transition-transform motion-safe:hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 lg:min-h-[168px]"
            >
              {tag && (
                <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-bold ${tag === 'Hot' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {tag}
                </span>
              )}
              <div className="mb-3 h-12 w-12" style={{ color: icon?.color ?? '#e5e7eb' }}>
                <CategoryIcon slug={category.slug} className="h-12 w-12" />
              </div>
              <span className="text-sm font-semibold leading-snug text-white">{category.name}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
