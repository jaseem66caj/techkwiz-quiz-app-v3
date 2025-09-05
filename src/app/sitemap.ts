export default function sitemap() {
  const baseUrl = 'https://techkwiz.com'
  const currentDate = new Date()
  
  // Static pages with proper priorities and change frequencies
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
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
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

  // Quiz category pages - high priority as they're core content
  const categories = [
    { slug: 'programming', name: 'Programming' },
    { slug: 'ai', name: 'Artificial Intelligence' },
    { slug: 'web-dev', name: 'Web Development' }, 
    { slug: 'mobile-dev', name: 'Mobile Development' },
    { slug: 'data-science', name: 'Data Science' },
    { slug: 'cybersecurity', name: 'Cybersecurity' },
    { slug: 'cloud', name: 'Cloud Computing' },
    { slug: 'blockchain', name: 'Blockchain' }
  ]

  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/quiz/${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Future: Dynamic news article pages could be added here
  // if we implement individual news article pages
  
  return [...staticPages, ...categoryPages]
}