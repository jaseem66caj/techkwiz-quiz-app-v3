# Plan — TechKwiz Play

## Overview

play.techkwiz.com is Jaseem’s free browser quiz (package `techkwiz-quiz-app-v3`). The business goal is AdSense revenue from Tier-1 traffic (United States, United Kingdom, Canada, Australia) on honest quiz pages. The WordPress how-to site https://techkwiz.com is a separate property. This repo does not publish those articles.

Ads on Play are off as of 13 Nov 2026: `AdBanner` returns `null`, and `DEFAULT_REWARD_CONFIG.adSettings.enabled` is `false`. They stay off until pages are fast enough, a Google-certified CMP is in place for EEA/UK/Switzerland, and a reviewed PR implements H5 Games ads (`adBreak()`).

## Problem

The account earns from AdSense only if pages stay policy-safe and useful. Current code already has the compliance shell (privacy, about, contact, terms, `ads.txt`, ads-off components) and a playable quiz. It does not yet have a proven ad placement, a CMP in this repo, or field Core Web Vitals. Owner research (14 Nov 2026) recorded $0.00 AdSense earnings and said Play ads.txt discovery and consent behavior were still unverified. This audit did not re-check the live AdSense account.

## Users

- Players: general audience, 13 and older, not a child-directed site. They play a short round in the browser, optionally save a display name on the device, and earn virtual coins.
- Owner: Jaseem reviews every PR. Agents open PRs and stop. They do not merge.
- Agents: implement small, tested changes against `AGENTS.md`.

## What ships today (MVP)

- Eight categories in `src/data/quizDatabase.ts`: Swipe-Based Personality, Pop Culture Flash, Micro-Trivia Tournaments, Social Identity Quizzes, Trend & Local Vibes, Future-You Simulations, Programming (27 questions), Artificial Intelligence (27 questions). The other six banks have 5 questions each. Counts are `id:` fields in each bank array on 14 Nov 2026.
- A round draws 5 (`QUESTIONS_PER_ROUND`, and `getStaticQuestions` slices to 5).
- Free homepage quiz. Category rounds cost 100 coins. Guests start at 0, so the category gate sends them home to earn coins.
- Crawlable landing copy in `src/content/quizLandings.ts`, JSON-LD from `src/utils/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`.
- Legal footer links: `/about`, `/privacy`, `/terms`, `/contact`. Contact mailbox `techkwiz@gmail.com`.
- `public/ads.txt` authorizes `pub-9542222034675291`.
- Play GA4 tag `G-22M0WCZK9K` in `src/config/site.ts`, loaded by `src/components/analytics/PlayGa4.tsx`.
- Sentry 10.78 and `GET /api/health`.
- Client-only profiles in `localStorage` (`techkwiz_user`).

## Non-goals

- Turning ads on, editing AdSense Auto ads, Privacy & messaging, or site review. The AdSense token is read-only. Those UI changes are Jaseem’s.
- Cash, crypto, gift cards, or transferable coins. Rewards stay inside this site.
- Buying traffic, click incentives, pop-ups, or prestitial ads before play.
- Child-directed quizzes or collecting data from children under 13.
- Publishing or editing techkwiz.com WordPress posts from this repo.
- Paid tools, new subscriptions, or merging PR #10 (`fix/play-guest-flow-layout`).
- Inventing a business address or a second mailbox.
- Scaled unreviewed AI pages. About already says some drafts may be prepared with AI and checked before they go live.

## Key decisions already in the code

| Decision | Where |
| --- | --- |
| Ads render nothing until a later explicit change | `src/components/ads/AdBanner.tsx`, `RewardedAdOptIn.tsx`, `adSettings.enabled: false` |
| Rewarded coins only after a completed H5 view, never a click | Comments and guards in `RewardedAdOptIn.tsx` and `useRevenueOptimization.ts` `trackAdView` |
| Play analytics stay off the blog property | `src/config/site.ts` ignores `NEXT_PUBLIC_ANALYTICS_ID` |
| Unknown quiz slugs 404 | `dynamicParams = false` in `src/app/quiz/[category]/layout.tsx` |
| Legal date is fixed | `LEGAL_LAST_UPDATED = '13 November 2026'` |
| One authorized ads.txt line | `public/ads.txt` |
| Production build must typecheck and lint | `typescript.ignoreBuildErrors: false`, `eslint.ignoreDuringBuilds: false` |

## Key decisions agents must not reopen

- Changes land as a PR for owner review. Agents do not merge.
- PR #10 stays open, unmerged, and unmodified.
- Layout checks use widths 360, 390, 412, 430, 768, 1024, 1366, 1920 even though Playwright only defines 375, 768, and 1280.
- Work in small steps: spec, change, test (`npm run lint`, `npx jest --watchman=false --forceExit`, `npm run build`), review, PR. UI work includes a page-speed look (`npm run analyze` when the bundle grows) and a browser pass on the routes that share the changed component.

## Owner roadmap items that are not this repo’s next code task

The 14 Nov 2026 roadmap’s content refreshes (Instagram, Telegram, WhatsApp, Sora) are techkwiz.com articles, not Play quiz files. Play items called out there: finish review of PR #10 (owner, not this agent), audit quiz factual accuracy (the AI bank asks which architecture is “best for image recognition” and lists CNN), and keep ads off until consent, seller discovery, and speed gates pass.
