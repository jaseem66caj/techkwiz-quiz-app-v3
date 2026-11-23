# Backlog

Sources are comments and stubs in this repo on 14 Nov 2026, plus gaps confirmed while reading the same files. “Comment” means the code says so. “Audit” means this pass observed it and there is no TODO comment.

PR #10 (`fix/play-guest-flow-layout`, draft, open) is the owner’s review item. Agents do not move it, so it is not listed as agent work below.

## In progress

Nothing in the working tree is a half-finished feature branch besides the owner’s PR #10.

Ads-off is intentional, not a paused patch:

- `src/components/ads/AdBanner.tsx` — “Props are intentionally unused while ad surfaces remain disabled.” Returns `null`.
- `src/components/ads/RewardedAdOptIn.tsx` — “Ads stay off.” Reserved comment for a later `adBreak({ type: 'reward' })`.
- `src/types/reward.ts` — `adSettings.enabled: false`, `rewardCoins: 0`.

Do not flip those in a drive-by change.

## Up next

| Item | Source | File |
| --- | --- | --- |
| Streak achievements do not move. The switch reads `user.streak`, and the comment says to implement streak tracking. No assignment to `user.streak` exists under `src/`. New users get `streak: 0` | Comment `// TODO: Implement streak tracking` | `src/utils/achievements.ts` line 115 |
| `login` / `signup` ignore email and password and only write `localStorage` | Comment “For now” / “In a real app” | `src/utils/auth.ts` lines 131–139 |
| Homepage SSG touches `admin_reward_config` and throws `localStorage is not defined` (build still exits 0) | Audit, `npm run build` log | `rewardDataManager` via the homepage reward path |

Leave auth as a local profile unless a task designs a server. Do not store passwords in `localStorage` to “finish” `login`.

## Icebox

| Item | Source | File |
| --- | --- | --- |
| Premium avatars. Function returns `avatar.isPremium`. Comment says none are premium | Comment “placeholder for future premium avatar functionality” | `src/utils/avatar.ts` lines 61–64 |
| Premium themes. Same pattern | Comment “placeholder for future premium theme functionality” | `src/utils/theme.ts` lines 51–54 |
| Admin QR code is a filled canvas labeled “QR Code”, with a comment that a real implementation would use a QR library. Secret would sit in `localStorage` | Comment | `src/utils/twoFactorAuth.ts` lines 56–63 |
| WordPress helper falls back to `via.placeholder.com` images | Comment “Generate a placeholder” | `src/utils/wordpress.ts` line 251 |
| Fake live user banner (starts at 847362, invented names). No other file imports it | Audit | `src/components/ui/SocialProofBanner.tsx` |
| Rate-limit numbers exist only as settings fields (60/min). Nothing enforces them | Audit | `src/types/settings.ts` `rateLimiting` |
| `.env.production` is not in `.gitignore` | Audit | `.gitignore` |
| Playwright viewports are 375, 768, 1280, not the eight required widths | Audit | `playwright.config.ts` |
| Inter is loaded twice (`next/font` and a CSS `@import`) | Audit | `src/app/layout.tsx`, `src/app/globals.css` |
| No CMP component in `src/` | Audit | — |
| AI bank asks which architecture is “best for image recognition” and the keyed answer is CNN. Owner roadmap flagged this for a factual review. Do not “fix” it inside an unrelated edit | Owner roadmap, confirmed in code | `src/data/quizDatabase.ts` question `id` `ai_002` |
| `correct_answer: -1` on `swipe-personality` and `social-identity` never equals an option index. Category page and `useHomepageQuizProgression` mark every choice wrong and pay 0 coins. The preference branch is only in unused `src/components/layout/HomePageClient.tsx` | Codex review on the context PR, confirmed in code | `src/app/quiz/[category]/page.tsx`, `src/hooks/useHomepageQuizProgression.ts` |

## Not a backlog item

`G-XXXXXXXXXX` in `src/config/site.ts` is a guard so a placeholder env value does not override the real Play measurement id. Do not replace that string with a live id inside the condition.
