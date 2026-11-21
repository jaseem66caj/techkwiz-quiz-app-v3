'use client'

import { useApp } from '@/app/providers'
import { useDailyStreak } from '@/hooks/useDailyStreak'
import { CoinIcon, LevelIcon, FlameIcon } from './CategoryIcons'

export function TopBar() {
  const { state } = useApp()
  const streak = useDailyStreak()
  const coins = state.user?.coins ?? 0
  const level = state.user?.level ?? 1

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-[rgba(30,60,114,.8)] px-2.5 py-2 text-sm font-semibold text-white backdrop-blur-[10px]" aria-label={`${coins} coins`}>
        <CoinIcon />
        {coins}
      </span>
      <span className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-[rgba(30,60,114,.8)] px-2.5 py-2 text-sm font-semibold text-white backdrop-blur-[10px]" aria-label={`Level ${level}`}>
        <LevelIcon />
        Lv {level}
      </span>
      {(
        <span className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-[rgba(30,60,114,.8)] px-2.5 py-2 text-sm font-semibold text-white backdrop-blur-[10px]" aria-label={`${streak} day streak`}>
          <FlameIcon />
          {streak}
        </span>
      )}
    </div>
  )
}
