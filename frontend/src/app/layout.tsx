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
      <body className={inter.className} style={{ margin: 0, padding: 0, width: '100vw', overflowX: 'hidden' }}>
        <Providers>
          <div style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0 }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}