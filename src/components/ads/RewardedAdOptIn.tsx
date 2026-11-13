'use client'

import { DEFAULT_REWARD_CONFIG } from '@/types/reward'

/**
 * H5 Games rewarded-ad opt-in (scaffolding only).
 *
 * Policy:
 * - Coins granted here are in-game, virtual, and not cash or transferable.
 * - A reward may be granted only after a completed Google H5 Games rewarded
 *   break (`adBreak({ type: 'reward' })` / `adConfig`), via the `adViewed`
 *   callback. Never reward clicks, impressions, or dismissed ads.
 *
 * Ads stay off. This component renders nothing until a later, explicit
 * ads-on change turns `adSettings.enabled` on and wires `adBreak`.
 */
export function RewardedAdOptIn(_props: { coinReward?: number }) {
  if (!DEFAULT_REWARD_CONFIG.adSettings.enabled) {
    return null
  }

  // Reserved for a later ads-on change: show a clear opt-in control, then call
  // adBreak({ type: 'reward', name, beforeReward, adViewed, adDismissed, adBreakDone }).
  // Credit coins only from adViewed — never from a click handler.
  return null
}
