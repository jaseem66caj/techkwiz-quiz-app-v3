import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { LayoutWrapper } from '@/components/LayoutWrapper'
import ErrorBoundary from '@/components/ErrorBoundary'
import { GlobalErrorInitializer } from '@/components/GlobalErrorInitializer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TechKwiz',
  description: 'Test your knowledge with TechKwiz - the ultimate quiz app',
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
            <LayoutWrapper>{children}</LayoutWrapper>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}