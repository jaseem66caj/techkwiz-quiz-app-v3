import type { Metadata } from 'next'
import { buildPageMetadata } from '@/utils/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Service | TechKwiz',
  description: 'Read the TechKwiz Play terms of service for this free quiz site.',
  path: '/terms',
})

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
