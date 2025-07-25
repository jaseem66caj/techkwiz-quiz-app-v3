import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TechKwiz - Test Your Tech Knowledge & Win Coins',
  description: 'Join thousands of tech enthusiasts in our quiz platform. Test your knowledge in Programming, AI, Web Development, and more. Win coins and compete with others!',
  keywords: 'tech quiz, programming quiz, AI quiz, web development, mobile development, data science, technology trivia, coding quiz, software development',
  authors: [{ name: 'TechKwiz Team' }],
  creator: 'TechKwiz',
  publisher: 'TechKwiz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://techkwiz.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TechKwiz - Test Your Tech Knowledge & Win Coins',
    description: 'Join thousands of tech enthusiasts in our quiz platform. Test your knowledge in Programming, AI, Web Development, and more!',
    url: 'https://techkwiz.com',
    siteName: 'TechKwiz',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechKwiz - Test Your Tech Knowledge & Win Coins',
    description: 'Join thousands of tech enthusiasts in our quiz platform. Test your knowledge in Programming, AI, Web Development, and more!',
    creator: '@techkwiz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ADSENSE-ID" crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}