import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '@/config/site'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import { getLanding } from '@/content/quizLandings'

interface PageMetadataOptions {
  title: string
  description: string
  path: string
  noIndex?: boolean
  imagePath?: string
  imageAlt?: string
}

// Shared Metadata builder for page-level layouts/pages (canonical + OG + twitter)
export function buildPageMetadata({ title, description, path, noIndex, imagePath, imageAlt }: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`
  const image = {
    url: imagePath || '/og/default.png',
    width: 1200,
    height: 630,
    alt: imageAlt || SITE_NAME,
  }

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
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
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

  const landing = getLanding(categorySlug)
  const title = `${category.name} Quiz | TechKwiz`
  const description = landing?.metaDescription || `${category.description}. Play the ${category.name} quiz on TechKwiz.`

  return buildPageMetadata({
    title,
    description,
    path: `/quiz/${categorySlug}`,
    imagePath: `/og/${categorySlug}.png`,
    imageAlt: `${category.name} Quiz | ${SITE_NAME}`,
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
      description: getLanding(categorySlug)?.metaDescription || category.description,
      url: `${SITE_URL}/quiz/${categorySlug}`,
      isAccessibleForFree: true,
      inLanguage: 'en-US',
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    }
  },

  breadcrumb: (categorySlug: string) => {
    const category = QUIZ_CATEGORIES[categorySlug]
    if (!category) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: `${category.name} Quiz`,
          item: `${SITE_URL}/quiz/${categorySlug}`,
        },
      ],
    }
  },
}
