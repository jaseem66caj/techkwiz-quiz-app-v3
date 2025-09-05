'use client'

import { useApp } from '@/app/providers'
import { AchievementNotification } from '@/components/AchievementNotification'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useApp();

  const handleCloseNotification = () => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Mobile-web container for desktop */}
      <div className="mx-auto max-w-sm sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm 2xl-max-w-sm min-h-screen bg-gray-900/50 backdrop-blur-sm border-x border-white/10">
        {children}
        <AchievementNotification achievement={state.notification} onClose={handleCloseNotification} />
      </div>
    </div>
  )
}
