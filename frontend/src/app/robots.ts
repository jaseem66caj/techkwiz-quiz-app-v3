import { MetadataRoute } from 'next'

// Required for static export
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/private/',
          '/admin/',
          '/jaseem/', // Admin panel route
          '/*?*', // Disallow URLs with query parameters to avoid duplicate content
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/private/', '/admin/', '/jaseem/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/private/', '/admin/', '/jaseem/'],
      }
    ],
    sitemap: 'https://techkwiz.com/sitemap.xml',
    host: 'https://techkwiz.com'
  }
}