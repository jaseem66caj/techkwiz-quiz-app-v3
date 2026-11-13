import type { Metadata } from 'next'
import { buildPageMetadata } from '@/utils/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Quiz Categories | TechKwiz',
  description: 'Choose a quiz category on TechKwiz and start earning coins.',
  path: '/start',
})

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children
}
