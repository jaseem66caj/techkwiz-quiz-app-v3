import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '@/config/site'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'

interface PageMetadataOptions {
  title: string
  description: string
  path: string
  noIndex?: boolean
}

// Shared Metadata builder for page-level layouts/pages (canonical + OG + twitter)
export function buildPageMetadata({ title, description, path, noIndex }: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export function getCategoryMetadata(categorySlug: string): Metadata {
  const category = QUIZ_CATEGORIES[categorySlug]

  if (!category) {
    return buildPageMetadata({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path: `/quiz/${categorySlug}`,
    })
  }

  const title = `${category.name} Quiz | TechKwiz`
  const description = `${category.description}. Play the ${category.name} quiz on TechKwiz and earn coins.`

  return buildPageMetadata({
    title,
    description,
    path: `/quiz/${categorySlug}`,
  })
}

// Structured data (JSON-LD) generators
export const generateStructuredData = {
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
  }),

  quiz: (categorySlug: string) => {
    const category = QUIZ_CATEGORIES[categorySlug]
    if (!category) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'Quiz',
      name: `${category.name} Quiz`,
      description: category.description,
      url: `${SITE_URL}/quiz/${categorySlug}`,
      isAccessibleForFree: true,
      inLanguage: 'en-US',
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    }
  },
}
