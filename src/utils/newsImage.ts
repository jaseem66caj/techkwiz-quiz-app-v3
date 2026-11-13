/** Match the configured image host; missing or unsupported feeds use a local asset. */
export function getNewsImage(source?: string): string {
  if (source?.startsWith('/') && !source.startsWith('//') && !source.includes('\\')) return source
  try {
    const url = new URL(source || '')
    if (url.protocol === 'https:' && url.hostname === 'techkwiz.com') return url.href
  } catch {
    // Missing/malformed image URLs must not reach the Next image optimizer.
  }
  return '/images/news-fallback.svg'
}
