import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { GoogleAnalytics } from '@/components/analytics'
import { ErrorBoundary, GlobalErrorInitializer, MobileLayoutWrapper } from '@/components/layout'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TechKwiz',
  description: 'Play short quizzes on TechKwiz. Answer questions, earn coins, and keep a daily streak.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <GlobalErrorInitializer />
        <ErrorBoundary>
          <Providers>
            <MobileLayoutWrapper>{children}</MobileLayoutWrapper>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
