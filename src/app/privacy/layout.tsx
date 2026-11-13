import type { Metadata } from 'next'
import { buildPageMetadata } from '@/utils/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy | TechKwiz',
  description: 'Read the TechKwiz privacy policy to learn how your data is handled.',
  path: '/privacy',
})

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
