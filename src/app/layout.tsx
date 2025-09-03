'use client'

import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
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
      <head>
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}

import { AchievementNotification } from '@/components/AchievementNotification';
import { useApp } from './providers';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, dispatch } = useApp();

  const handleCloseNotification = () => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  };

  // Check for both legacy admin routes and current jaseemadmin route
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/jaseemadmin')

  if (isAdminPage) {
    // Full desktop layout for admin pages - no width constraints
    return (
      <div className="w-full min-h-screen">
        {children}
        <AchievementNotification achievement={state.notification} onClose={handleCloseNotification} />
      </div>
    )
  }

  // Original mobile-first layout for quiz website
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Mobile-web container for desktop */}
      <div className="mx-auto max-w-sm sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm 2xl:max-w-sm min-h-screen bg-gray-900/50 backdrop-blur-sm border-x border-white/10">
        {children}
        <AchievementNotification achievement={state.notification} onClose={handleCloseNotification} />
      </div>
    </div>
  )
}