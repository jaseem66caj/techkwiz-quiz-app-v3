import type { Metadata } from 'next'
import { buildPageMetadata } from '@/utils/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Leaderboard | TechKwiz',
  description: 'See top TechKwiz players ranked by coins earned.',
  path: '/leaderboard',
})

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
