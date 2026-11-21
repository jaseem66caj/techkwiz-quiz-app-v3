'use client'

import { AchievementNotification } from '@/components/user'
import { LegalFooter } from '@/components/seo/LegalFooter'
import { useApp } from '@/app/providers'

export function MobileLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useApp();

  const handleCloseNotification = () => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="mx-auto min-h-screen max-w-sm border-x border-white/10 bg-gray-900/50 backdrop-blur-sm has-[[data-wide-layout]]:max-w-none has-[[data-wide-layout]]:border-x-0 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm 2xl:max-w-sm">
        {children}
        <LegalFooter />
        <AchievementNotification achievement={state.notification} onClose={handleCloseNotification} />
      </div>
    </div>
  )
}
