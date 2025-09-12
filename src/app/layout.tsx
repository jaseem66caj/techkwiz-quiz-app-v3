import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { GoogleAnalytics } from '@/components/analytics'
import { MobileLayoutWrapper } from '@/components/layout'
import { ErrorBoundary } from '@/components/layout'
import { GlobalErrorInitializer } from '@/components/layout'
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
            <MobileLayoutWrapper>{children}</MobileLayoutWrapper>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}