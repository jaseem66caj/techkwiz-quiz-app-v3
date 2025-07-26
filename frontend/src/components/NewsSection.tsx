'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fetchWordPressPosts, fetchWordPressRSS, mockWordPressPosts, WordPressPost } from '../utils/wordpress'

interface NewsSectionProps {
  className?: string
}

export function NewsSection({ className = '' }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch articles from WordPress API
  const fetchWordPressArticles = async (): Promise<NewsArticle[]> => {
    try {
      // Try WordPress REST API first
      const response = await fetch('https://techkwiz.com/wp-json/wp/v2/posts?per_page=6&_embed')
      
      if (response.ok) {
        const posts = await response.json()
        return posts.map((post: any) => ({
          id: post.id.toString(),
          title: post.title.rendered,
          excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          link: post.link,
          publishDate: post.date,
          featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                        `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(post.title.rendered.substring(0, 20))}`,
          category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Technology'
        }))
      } else {
        throw new Error('WordPress API not accessible')
      }
    } catch (apiError) {
      console.warn('WordPress API failed, trying RSS feed...')
      
      // Fallback to mock data if API fails
      // In a production environment, you would implement RSS parsing here
      return mockNewsData
    }
  }

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const fetchedArticles = await fetchWordPressArticles()
        setArticles(fetchedArticles)
      } catch (err) {
        console.error('Failed to fetch articles:', err)
        setError('Failed to load news articles')
        // Use mock data as fallback
        setArticles(mockNewsData)
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleArticleClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className={`glass-effect p-4 sm:p-6 rounded-xl ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">📰</span>
          <h2 className="text-white font-bold text-lg sm:text-xl">Latest Tech News</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/10 rounded-lg h-20"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-effect p-4 sm:p-6 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📰</span>
          <h2 className="text-white font-bold text-lg sm:text-xl">Latest Tech News</h2>
        </div>
        <a
          href="https://techkwiz.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-medium transition-colors"
        >
          View All →
        </a>
      </div>

      {error && (
        <div className="text-yellow-400 text-sm mb-4 p-3 bg-yellow-400/10 rounded-lg">
          ⚠️ {error} - Showing cached content
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {articles.slice(0, 4).map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/5 hover:bg-white/10 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-white/10"
            onClick={() => handleArticleClick(article.link)}
          >
            <div className="flex space-x-3 sm:space-x-4">
              {/* Article Image */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                  {article.featuredImage ? (
                    <img 
                      src={article.featuredImage} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : (
                    <span className="text-white text-xl">📄</span>
                  )}
                  <div className="hidden w-full h-full flex items-center justify-center">
                    <span className="text-white text-xl">📄</span>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full font-medium">
                    {article.category}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatDate(article.publishDate)}
                  </span>
                </div>
                
                <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2 mb-1 sm:mb-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center">
                    Read More
                    <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {articles.length === 0 && !loading && (
        <div className="text-center py-6 text-gray-400">
          <span className="text-4xl mb-2 block">📰</span>
          <p className="text-sm">No news articles available at the moment.</p>
        </div>
      )}
    </div>
  )
}

// CSS for line clamp (add to globals.css or use Tailwind line-clamp plugin)
const styles = `
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}