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
  webpack: (config, { dev }) => {
    // Let Next.js 15's default splitChunks heuristics run in production —
    // forcing every node_modules package into one "vendors" cache group
    // (previously here) defeats per-route async chunking.

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

const { withSentryConfig } = require("@sentry/nextjs/config");
// Sentry 10 single-options form (the old two-object signature is deprecated).
// See node_modules/@sentry/nextjs/build/types-ts3.8/config/types.d.ts for current field names.
module.exports = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppresses source map uploading logs during build
  silent: true,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Deletes the uploaded source maps from the public build output after Sentry has them
  // (current equivalent of the removed `hideSourceMaps` option).
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Tree-shake Sentry SDK debug/logger statements out of the client bundle
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    automaticVercelMonitors: true,
  },
});