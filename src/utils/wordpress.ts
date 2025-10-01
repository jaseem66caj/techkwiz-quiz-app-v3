// WordPress integration utilities
export interface WordPressPost {
  id: string
  title: string
  excerpt: string
  link: string
  publishDate: string
  featuredImage?: string
  category: string
  author?: string
}

interface WordPressTimeoutContext {
  timeoutMs: number
  endpoint: string
  source: 'REST_API' | 'RSS_FEED'
}

class WordPressTimeoutError extends Error {
  readonly code = 'WORDPRESS_TIMEOUT'

  constructor(message: string, public readonly context: WordPressTimeoutContext) {
    super(message)
    this.name = 'WordPressTimeoutError'

    if (process.env.NODE_ENV !== 'production') {
      console.info('WordPressTimeoutError:', { message, context })
    }
  }
}

// Function to fetch posts from WordPress REST API
export async function fetchWordPressPosts(
  siteUrl: string = 'https://techkwiz.com',
  perPage: number = 6
): Promise<WordPressPost[]> {
  const apiUrl = `${siteUrl}/wp-json/wp/v2/posts?per_page=${perPage}&_embed`

  // Create a timeout controller with faster timeout for development
  const controller = new AbortController()
  const isDevelopment = process.env.NODE_ENV === 'development'
  const timeoutMs = isDevelopment ? 3000 : 8000 // 3s dev, 8s prod
  const timeoutReason = new WordPressTimeoutError(
    `WordPress REST API request timed out after ${timeoutMs}ms`,
    {
      timeoutMs,
      endpoint: apiUrl,
      source: 'REST_API'
    }
  )
  const timeoutId = setTimeout(() => controller.abort(timeoutReason), timeoutMs)

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TechKwiz-App/1.0'
      },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`WordPress API responded with status: ${response.status}`)
    }

    const posts = await response.json()

    return posts.map((post: any): WordPressPost => ({
      id: post.id.toString(),
      title: post.title?.rendered || 'Untitled',
      excerpt: extractTextFromHTML(post.excerpt?.rendered || post.content?.rendered || '')
        .substring(0, 150) + '...',
      link: post.link || `${siteUrl}/?p=${post.id}`,
      publishDate: post.date || post.date_gmt || new Date().toISOString(),
      featuredImage: extractFeaturedImage(post),
      category: extractCategory(post),
      author: extractAuthor(post)
    }))

  } catch (error) {
    // Check if this is an intentional timeout abort (not a real error)
    const isTimeoutAbort = isTimeoutError(error)

    if (isTimeoutAbort) {
      // Intentional timeout - log quietly and don't report to Sentry
      const message = error instanceof Error && error.message
        ? error.message
        : `WordPress API timeout after ${timeoutMs}ms`
      console.info(`${message}, falling back to RSS...`)
    } else {
      // Genuine error - log as warning and report to Sentry
      console.warn('WordPress REST API failed:', error)

      // Report genuine errors to Sentry with context
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          tags: {
            component: 'WordPressAPI',
            action: 'fetchPosts',
            apiUrl: siteUrl,
            errorType: 'genuine_network_error'
          },
          extra: {
            perPage,
            requestUrl: apiUrl,
            timeoutMs
          }
        })
      })
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// Function to parse RSS feed as fallback
export async function fetchWordPressRSS(
  feedUrl: string = 'https://techkwiz.com/feed/'
): Promise<WordPressPost[]> {
  // Create timeout controller for RSS API with faster timeout
  const controller = new AbortController()
  const isDevelopment = process.env.NODE_ENV === 'development'
  const timeoutMs = isDevelopment ? 2000 : 5000 // 2s dev, 5s prod
  const rssEndpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
  const timeoutReason = new WordPressTimeoutError(
    `WordPress RSS feed request timed out after ${timeoutMs}ms`,
    {
      timeoutMs,
      endpoint: rssEndpoint,
      source: 'RSS_FEED'
    }
  )
  const timeoutId = setTimeout(() => controller.abort(timeoutReason), timeoutMs)

  try {
    // For client-side RSS parsing, we'll need to use a CORS proxy or server-side parsing
    // This is a simplified version - in production, you'd want to use a proper RSS parser
    const response = await fetch(rssEndpoint, {
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`RSS API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'ok') {
      throw new Error(`RSS parsing failed: ${data.message}`)
    }

    return data.items.map((item: any, index: number): WordPressPost => ({
      id: item.guid || index.toString(),
      title: item.title || 'Untitled',
      excerpt: extractTextFromHTML(item.description || item.content || '').substring(0, 150) + '...',
      link: item.link || item.guid,
      publishDate: item.pubDate || new Date().toISOString(),
      featuredImage: extractImageFromContent(item.content || item.description || ''),
      category: item.categories?.[0] || 'Technology',
      author: item.author || 'TechKwiz Team'
    }))

  } catch (error) {
    // Check if this is an intentional timeout abort (not a real error)
    const isTimeoutAbort = isTimeoutError(error)

    if (isTimeoutAbort) {
      // Intentional timeout - log quietly and don't report to Sentry
      const message = error instanceof Error && error.message
        ? error.message
        : `RSS API timeout after ${timeoutMs}ms`
      console.info(`${message}, falling back to mock data...`)
    } else {
      // Genuine error - log as warning and report to Sentry
      console.warn('RSS feed parsing failed:', error)

      // Report genuine errors to Sentry with context
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          tags: {
            component: 'WordPressRSS',
            action: 'fetchRSS',
            feedUrl,
            errorType: 'genuine_rss_error'
          },
          extra: {
            rssApiUrl: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
            timeoutMs
          }
        })
      })
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const normalizedMessage = error.message?.toLowerCase?.() || ''

  if (error instanceof WordPressTimeoutError) {
    return true
  }

  return error.name === 'AbortError' ||
    error.name === 'TimeoutError' ||
    normalizedMessage.includes('aborted') ||
    normalizedMessage.includes('timed out')
}

// Utility functions
function extractTextFromHTML(html: string): string {
  // Remove HTML tags and decode HTML entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFeaturedImage(post: any): string {
  // Try to get featured media from embedded data
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url
  }

  // Try to get from featured media URL
  if (post.featured_media && post._embedded?.['wp:featuredmedia']) {
    const media = post._embedded['wp:featuredmedia'].find((m: any) => m.id === post.featured_media)
    if (media?.source_url) {
      return media.source_url
    }
  }

  // Generate a placeholder based on the post title
  const title = post.title?.rendered || 'Article'
  const encodedTitle = encodeURIComponent(title.substring(0, 20))
  return `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodedTitle}`
}

function extractCategory(post: any): string {
  // Try to get category from embedded terms
  if (post._embedded?.['wp:term']) {
    const categories = post._embedded['wp:term'].find((termGroup: any[]) =>
      termGroup.some((term: any) => term.taxonomy === 'category')
    )
    if (categories?.length > 0) {
      return categories[0].name
    }
  }

  return 'Technology'
}

function extractAuthor(post: any): string {
  // Try to get author from embedded data
  if (post._embedded?.author?.[0]?.name) {
    return post._embedded.author[0].name
  }

  return 'TechKwiz Team'
}

function extractImageFromContent(content: string): string {
  // Try to extract the first image from content
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1]
  }

  // Return a placeholder if no image found
  return 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Article'
}

// Mock data for development and fallback
export const mockWordPressPosts: WordPressPost[] = [
  {
    id: '1',
    title: 'The Evolution of JavaScript: From ES6 to ES2025',
    excerpt: 'Explore the remarkable journey of JavaScript and the latest features that are shaping modern web development in 2025...',
    link: 'https://techkwiz.com/javascript-evolution-es2025',
    publishDate: '2025-01-20T08:30:00Z',
    featuredImage: 'https://via.placeholder.com/300x200/F7DF1E/000000?text=JavaScript',
    category: 'Web Development',
    author: 'Alex Chen'
  },
  {
    id: '2',
    title: 'Building Scalable Microservices with Node.js and Docker',
    excerpt: 'A comprehensive guide to architecting and deploying microservices using modern containerization techniques...',
    link: 'https://techkwiz.com/microservices-nodejs-docker',
    publishDate: '2025-01-18T12:15:00Z',
    featuredImage: 'https://via.placeholder.com/300x200/339933/FFFFFF?text=Node.js',
    category: 'Backend Development',
    author: 'Sarah Johnson'
  },
  {
    id: '3',
    title: 'Machine Learning in the Browser: TensorFlow.js Deep Dive',
    excerpt: 'Discover how to implement powerful machine learning models directly in web browsers using TensorFlow.js...',
    link: 'https://techkwiz.com/tensorflowjs-ml-browser',
    publishDate: '2025-01-16T15:45:00Z',
    featuredImage: 'https://via.placeholder.com/300x200/FF6F00/FFFFFF?text=TensorFlow',
    category: 'Machine Learning',
    author: 'Dr. Michael Rodriguez'
  },
  {
    id: '4',
    title: 'Progressive Web Apps: The Future of Mobile Development',
    excerpt: 'Learn how PWAs are revolutionizing mobile app development with native-like experiences using web technologies...',
    link: 'https://techkwiz.com/progressive-web-apps-future',
    publishDate: '2025-01-14T10:20:00Z',
    featuredImage: 'https://via.placeholder.com/300x200/5F2D91/FFFFFF?text=PWA',
    category: 'Mobile Development',
    author: 'Emily Zhang'
  },
  {
    id: '5',
    title: 'Quantum Computing: Programming the Unthinkable',
    excerpt: 'An introduction to quantum programming concepts and how they will impact software development in the coming decade...',
    link: 'https://techkwiz.com/quantum-computing-programming',
    publishDate: '2025-01-12T14:10:00Z',
    featuredImage: 'https://via.placeholder.com/300x200/8E44AD/FFFFFF?text=Quantum',
    category: 'Emerging Technologies',
    author: 'Prof. David Kim'
  },
  {
    id: '6',
    title: 'Serverless Architecture: Building Without Servers',
    excerpt: 'Master the art of serverless computing and learn how to build scalable applications without managing infrastructure...',
    link: 'https://techkwiz.com/serverless-architecture-guide',
    publishDate: '2025-01-10T09:30:00Z',
    featuredImage: 'https://via.placeholder.com/300x200/FF9900/000000?text=Serverless',
    category: 'Cloud Computing',
    author: 'Maria Lopez'
  }
]
