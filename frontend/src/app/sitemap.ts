import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://techkwiz.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/start`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  ]

  // Quiz category pages
  const categories = [
    'programming',
    'ai',
    'web-dev', 
    'mobile-dev',
    'data-science',
    'cybersecurity',
    'cloud',
    'blockchain'
  ]

  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/quiz/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages]
}