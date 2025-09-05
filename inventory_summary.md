# Techkwiz-v8 Codebase Inventory (Updated)

## Executive Summary
- Total assets: 92 (framework 5, libraries 2, config 7, layouts 1, routes 9, components 36, hooks 3, utilities 15, other 14)
- Next.js: 15.4.4 (App Router)
- React: 19.1.0; TypeScript: 5.8.3; Tailwind CSS: 3.4.x; Framer Motion: 12.23.9
- Node: v18+ recommended (per Next 15)
- Overall health score: 7/10
- Critical issues: failing production build (RewardPopup props mismatch); npm audit flags Next.js advisories fixed in 15.5.2

## Architecture Overview
- Router: App Router (src/app with page.tsx, layout.tsx, sitemap.ts, robots.ts)
- Pattern: Client-first UI with React Context (useReducer) in src/app/providers.tsx
- Data: LocalStorage/SessionStorage; no backend; quiz content via data managers
- Styling: Tailwind CSS; custom globals.css; Inter via next/font

## Global Dependencies
- Frameworks: Next.js 15.4.4, React 19.1.0, React DOM 19.1.0, TypeScript 5.8.3, Tailwind 3.4.x
- Libraries: Framer Motion 12.23.9, Heroicons 2.2.0
- Config: next.config.js, tsconfig.json, tailwind.config.js, postcss.config.js, .eslintrc.json, playwright.config.ts, .env
- Cross-cutting:
  - Auth: custom auth utils (src/utils/auth.ts)
  - State: React Context in providers.tsx
  - Analytics: GoogleAnalytics component (disabled until configured)
  - SEO: src/utils/seo.ts; sitemap.ts/robots.ts present
  - Error handling: standard try/catch; no global error.tsx

## Feature-Specific Assets
- Routes: /, /start, /quiz/[category], /profile, /leaderboard, /about, /privacy, plus test routes under src/app/test-*
- Dynamic routes: /quiz/[category]
- API routes: none
- Middleware: none detected
- Static assets: under public/ (not extensively used); Inter via next/font

## Dependency Analysis
- Top-level deps (npm ls depth=0): next 15.4.4, react 19.1.0, react-dom 19.1.0, framer-motion 12.23.9, @heroicons/react 2.2.0; dev: typescript, tailwindcss, eslint, @playwright/test
- Outdated: next (15.5.2 available), eslint-config-next (15.5.2), react/react-dom (19.1.1), framer-motion (patch), tailwindcss (4.x available; defer), typescript (5.9.x)
- Vulnerabilities (npm audit): 2 total (low in brace-expansion via tooling; moderate in next <=15.4.6)
- Extraneous/unused present in node_modules: recharts, redux toolkit + peers, d3*, victory-vendor, clsx (not referenced in src/). Recommend removal
- Unused internal: investigate duplicate reward components and unused hooks

## Code Quality Assessment
- TypeScript adoption: ~100% of source; strict false in tsconfig
- Tests: Visual tests via Playwright only; no unit/integration tests
- Lint/format: ESLint config present; Prettier not configured
- Reusability: Many components feature-specific; shared core: Providers, EnhancedQuizInterface, Navigation

## Performance Considerations
- Large deps: Next/React baseline; Framer Motion ~50KB; Tailwind ~50KB
- Dynamic imports: limited; consider using next/dynamic for heavy UI chunks
- Images: using next/image remotePatterns but images minimal
- Fonts: next/font for Inter (good); self-hosted by Next

## Security Analysis
- npm audit: moderate advisories in next; fix by upgrading to 15.5.2
- Sensitive data: none; .env has placeholders only
- Auth: browser-only; no external identity provider

## Maintenance Recommendations
- High: upgrade Next.js to 15.5.2; fix RewardPopup prop mismatch so build passes; remove extraneous packages
- Medium: consolidate reward popups; enable GA via settings or env; add smoke/unit tests for utils/hooks
- Low: tighten tsconfig (enable strict), add Prettier, consider Zustand if state grows

## Action Items
- Immediate: next upgrade + fix build error; uninstall unused deps
- 1–2 sprints: tests, analytics, component consolidation
- Next quarter: adopt stricter TS, consider Tailwind v4 after Next upgrade
