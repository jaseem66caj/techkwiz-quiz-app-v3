# play.techkwiz.com — agent guide

Next.js 15.5 App Router quiz (`techkwiz-quiz-app-v3`) at https://play.techkwiz.com, on Vercel. Sister of the WordPress blog https://techkwiz.com. Goal: AdSense revenue from US/UK/CA/AU readers while the account stays compliant. Ads are off.

This file is the source of truth. Detail is in `docs/ai/`.

## Commands (verified 14 Nov 2026)

npm only (`packageManager` `npm@10.0.0`, `package-lock.json`). Engines: Node `>=18`, npm `>=8`. This audit used Node v22.23.4 and npm 10.9.9. CI (`.github/workflows/deploy-production.yml`) pins Node 18 and `npm ci`. Vercel (`vercel.json`): install `npm ci --registry=https://registry.npmjs.org/`, build `npm run build`.

| Task | Command | This audit |
| --- | --- | --- |
| Install | `npm ci` | 924 packages |
| Dev | `npm run dev` | `next dev -H 127.0.0.1 -p 3002`. `/`, `/api/health`, `/ads.txt` returned 200 |
| Lint | `npm run lint` | `next lint`, exit 0, warnings only (`no-explicit-any`, `import/order`). Deprecated; removed in Next.js 16 |
| Unit | `npx jest --watchman=false --forceExit` | No `npm test` script. 7 suites, 62 tests, pass. ~6% statement coverage |
| Coverage | `npx jest --coverage --watchman=false --forceExit` | Writes gitignored `coverage/` |
| Build | `npm run build` | Exit 0, 22 pages. SSG of `/` logs `localStorage is not defined` for `admin_reward_config` and still finishes |
| E2E | `npm run test:e2e:stable` | Playwright `tests/e2e`, 1 worker, 2 retries, 90s, base `http://localhost:3002` (not run this audit) |
| Visual | `npm run test:visual` | Same Playwright config. Snapshots: `tests/e2e/baselines` |
| One spec | `npx playwright test tests/e2e/<file>.spec.ts --timeout=90000` | |
| Bundle | `npm run analyze` | `ANALYZE=true next build`. Also `npm run analyze:script` |

Do not run `npm run pm2:*` here. Jest ignores `src/__tests__/visual/`; that folder is not the Playwright suite. `.env.example` still says port 3001; the script uses 3002.

## Directory

| Path | Role |
| --- | --- |
| `src/app/` | Routes: `/`, `/start`, `/quiz/[category]`, `/leaderboard`, `/profile`, `/about`, `/privacy`, `/terms`, `/contact`, `/api/health`, `sitemap.ts`, `robots.ts` |
| `src/components/` | `ads`, `analytics`, `layout`, `modals`, `navigation`, `quiz`, `rewards`, `seo`, `ui`, `user` |
| `src/hooks/` | Category loader, homepage quiz, exit guard, coin multipliers |
| `src/utils/` | localStorage managers, rewards, `auth.ts`, SEO, Sentry helpers |
| `src/data/quizDatabase.ts` | 8 categories and the question banks |
| `src/content/quizLandings.ts` | Crawlable intro, FAQ, related slugs |
| `src/config/site.ts` | Canonical URL, Play GA4 id, `CONTACT_EMAIL`, `LEGAL_LAST_UPDATED` |
| `src/config/quiz.ts` | `QUESTIONS_PER_ROUND = 5` |
| `public/` | `ads.txt`, icons, `og/*.png`, `sw.js` |
| `tests/e2e/` | Playwright. Jest lives in `src/__tests__/` and `src/utils/__tests__/` |
| `docs/ai/` | Agent context. Older files under `docs/` are often stale |

## Architecture

- State is `src/app/providers.tsx` (`useReducer` + `localStorage` key `techkwiz_user`). No database and no server session.
- Category play: `useCategoryQuizLoader` paints 5 static questions, then `START_QUIZ` deducts `entry_fee` (100 on every category; `STANDARD_ENTRY_FEE` is also 100). Guests start at 0 coins. The insufficient-coins dialog sends them to `/` to earn coins. It must not send them to an ad.
- Homepage quiz is separate (`HomePageClient`, `useHomepageQuizQuestions`) and is free. After completion it waits 90s, then opens `CreateProfile`.
- Correct answer pays 50 coins (`DEFAULT_REWARD_CONFIG` in `src/types/reward.ts`). Coins are virtual. `adSettings.enabled` is `false`.
- `AdBanner` and `RewardedAdOptIn` return `null`. `public/ads.txt` is one line: `google.com, pub-9542222034675291, DIRECT, f08c47fec0942fa0`.
- `PlayGa4` uses `G-22M0WCZK9K` unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is a real `G-` id. Do not send Play traffic to the blog stream.
- Sentry is `@sentry/nextjs` 10.78 (`src/instrumentation.ts`, `withSentryConfig` in `next.config.js`, tunnel `/monitoring`).
- `next.config.js`: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: origin-when-cross-origin`, `output: 'standalone'`, `poweredByHeader: false`. Quiz routes are SSG; `dynamicParams = false` (unknown slug 404s).

## Conventions

- TypeScript `strict`, target ES2017, `@/` → `src/`. Two-space indent. PascalCase components and types. camelCase functions. Component filenames PascalCase.
- Imports at the top. `import/order` (warning): builtin, external, internal, parent, sibling, index; no blank lines between groups.
- New domain errors extend `Error` with `name` and `code` (`QuizDataError`, `RewardDataError`, `DataMigrationError`).
- JSDoc on new public helpers in `src/utils`. Do not retrofit the tree.
- Tailwind classes: layout, then spacing, then color. Tokens: `tailwind.config.js`, `src/app/globals.css`. See `docs/ai/DESIGN.md`.
- `noFallthroughCasesInSwitch` is on. Handle every union member.
- Copy rules: `docs/ai/VOICE.md`.

## Hard rules

- Never hide, clip, resize, or cover a rendered ad, and never push one off-screen with CSS. Reserve the slot’s height before the ad script runs. Labels: “Advertisements” or “Sponsored Links” only.
- Never click our ads or ask anyone to. Banned nearby copy: “click the ads”, “support us”, “visit these links”, “help keep this site running”.
- Leave ads off until a reviewed PR sets `adSettings.enabled` and calls H5 `adBreak()` at a natural break, with a certified CMP already live. Reward in-game coins only, only from `adViewed`, and skipping must still leave the app usable.
- No ads in the logo, the “TechKwiz” wordmark, or `UnifiedNavigation`.
- Check UI at 360, 390, 412, 430, 768, 1024, 1366, and 1920. Playwright projects are 375, 768, and 1280 only.
- Speed matters. This build: `/` first-load JS 248 kB, `/quiz/[category]` 245 kB, shared 175 kB. `layout.tsx` loads Inter via `next/font` (`display: 'swap'`). `globals.css` also `@import`s Inter. Do not add another font loader.
- Spec, small change, test, review, PR. Do not merge. The owner reviews.
- Never commit secrets. AdSense API use is read-only. Do not change Auto ads, Privacy & messaging, or site-review settings.
- PR **#10** (`fix/play-guest-flow-layout`, draft, open) stays unmerged and untouched. Do not push that branch, rebase it, or close it.
- Audience is general 13+, not child-directed.
- Contact is only `techkwiz@gmail.com` (`CONTACT_EMAIL`). Do not invent another mailbox or a street address.
- Legal pages use `LEGAL_LAST_UPDATED` (`13 November 2026`), not `new Date()`.

## Shipping

Branch from `main`. PR body lists `npm run lint`, `npx jest --watchman=false --forceExit`, and `npm run build`. For UI, name which of the eight widths you checked. Do not merge.

## Deep docs

- `docs/ai/PLAN.md` — product, scope, decisions
- `docs/ai/DESIGN.md` — tokens and anti-patterns
- `docs/ai/VOICE.md` — copy
- `docs/ai/SECURITY.md` — secrets, auth, ads
- `docs/ai/BACKLOG.md` — unfinished comments and known gaps
- `docs/ai/SESSIONS.md` — handoff template
- `.agents/skills/revise-quiz-content/SKILL.md` — quiz-bank workflow
