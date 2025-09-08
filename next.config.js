/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Enable SWC minification for better performance
  swcMinify: true,

  // Optimize images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Experimental features
  experimental: {
    // Enable app directory (already using it)
    appDir: true,
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configurations if needed
    
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }

    return config
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects for better SEO and user experience
  async redirects() {
    return [
      // Redirect old routes if any
      {
        source: '/old-route',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Rewrites for API routes or external services
  async rewrites() {
    return [
      // Add rewrites if needed
    ]
  },

  // Output configuration
  output: 'standalone',

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Trailing slash configuration
  trailingSlash: false,

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
