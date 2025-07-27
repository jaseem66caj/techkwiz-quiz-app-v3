'use client'

import { useEffect } from 'react'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Global 0 coins enforcement on every page load
  useEffect(() => {
    console.log('🔧 Global coins system enforcement activated')
    
    // Force clear specific keys that might contain coin data
    const coinDataKeys = [
      'techkwiz_user', 'techkwiz_token', 'USER', 'AUTH_TOKEN', 
      'users', 'user_data', 'quiz_data', 'app_data', 'coins'
    ]
    
    coinDataKeys.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        // Ignore errors
      }
    })
    
    console.log('✅ Global coin data cleared on page load')
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}