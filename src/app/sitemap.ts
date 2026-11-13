import { SITE_URL } from '@/config/site'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'

export default function sitemap() {
  const baseUrl = SITE_URL
  const currentDate = new Date()

  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/start`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }
  ]

  // Quiz category pages - sourced from the real category list so this can't drift
  const categoryPages = Object.keys(QUIZ_CATEGORIES).map(slug => ({
    url: `${baseUrl}/quiz/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages]
}
