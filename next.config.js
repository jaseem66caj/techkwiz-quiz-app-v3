// /** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // SWC minification is enabled by default in Next.js 13+

  // Optimize images (updated for Next.js 15)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'techkwiz.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Experimental features (app directory is stable in Next.js 13+)

  // Webpack configuration for build optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size for production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }

      // Enable tree shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    // Improve build performance
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
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

const { withSentryConfig } = require("@sentry/nextjs");
module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
    automaticVercelMonitors: true,
  }
);