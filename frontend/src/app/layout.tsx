'use client'

import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  if (isAdminPage) {
    // Full desktop layout for admin pages
    return (
      <div style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0 }}>
        {children}
      </div>
    )
  }

  // Original mobile-first layout for quiz website
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Mobile-web container for desktop */}
      <div className="mx-auto max-w-sm sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm 2xl:max-w-sm min-h-screen bg-gray-900/50 backdrop-blur-sm border-x border-white/10">
        {children}
      </div>
    </div>
  )
}