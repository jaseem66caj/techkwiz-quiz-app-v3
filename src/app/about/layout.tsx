import type { Metadata } from 'next'
import { buildPageMetadata } from '@/utils/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'About | TechKwiz',
  description: 'Learn more about TechKwiz, the quiz app where you answer questions and earn coins.',
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
