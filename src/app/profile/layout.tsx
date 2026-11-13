import type { Metadata } from 'next'
import { buildPageMetadata } from '@/utils/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Your Profile | TechKwiz',
  description: 'View your TechKwiz coin balance, stats, and quiz history.',
  path: '/profile',
  noIndex: true,
})

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
