'use client'

import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          {/* Mobile-web container for desktop */}
          <div className="mx-auto max-w-sm sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm 2xl:max-w-sm min-h-screen bg-gray-900/50 backdrop-blur-sm border-x border-white/10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}