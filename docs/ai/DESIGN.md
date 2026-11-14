# Design — tokens from the code

Sources: `tailwind.config.js`, `src/app/globals.css`, `src/app/layout.tsx`. `docs/DESIGN_SYSTEM.md` (dated 14 Sep 2025) matches many of these hex values and is not the file to update. The owner’s design standard lives outside this repo (`/home/box/side-project/design/`) and was not available here. Contrast ratios were not measured in this audit.

## Palette

| Token | Value | Where |
| --- | --- | --- |
| `primary.50`–`900` | `#eff6ff`, `#dbeafe`, `#3b82f6`, `#2563eb`, `#1d4ed8`, `#1e40af`, `#1e3a8a` | `tailwind.config.js` (500/600/700/800/900 and 50/100 only) |
| `secondary.500` / `600` | `#f59e0b` / `#d97706` | Tailwind `secondary` |
| Page background | `linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)`, `background-attachment: fixed` | `body` in `globals.css` |
| Glass card | `rgba(30, 60, 114, 0.8)`, blur 10px, border `rgba(255,255,255,0.1)`, radius 16px, shadow `0 8px 32px rgba(0,0,0,0.3)` | `.glass-effect` |
| Wordmark accent | `text-orange-400` on “Tech” | `UnifiedNavigation.tsx` |
| Legal links | `text-orange-400`, hover `text-orange-300` | `LegalFooter.tsx`, legal pages |
| Coin chip | `bg-orange-500/20`, border `border-orange-400/30`, text `text-orange-300` | Nav and quiz header |
| Primary button | gradient `#3b82f6` → `#2563eb`, white, weight 600, radius 12px, shadow `0 4px 16px rgba(59,130,246,0.3)` | `.button-primary` |
| Secondary button | `rgba(42, 82, 152, 0.8)`, radius 12px | `.button-secondary` |
| Quiz option | `rgba(42, 82, 152, 0.8)`, radius 16px, white, weight 700 | `.quiz-option` |
| Selected | `rgba(255, 193, 7, 0.8)`, border `#ffc107`, `scale(1.05)` | `.quiz-option.selected` |
| Correct | `rgba(40, 167, 69, 0.8)`, border `#28a745` | `.quiz-option.correct` |
| Incorrect | `rgba(220, 53, 69, 0.8)`, border `#dc3545` | `.quiz-option.incorrect` |

Some screens override the body gradient with Tailwind: homepage result and profile-create use `from-gray-900 via-blue-900 to-purple-900`. The category quiz uses `from-indigo-900 via-purple-900 to-pink-900`. Do not add a fourth page background for one component.

Category cards use per-category Tailwind gradients in `QUIZ_CATEGORIES[].color` (for example Programming `from-blue-500 to-purple-600`).

## Typography

| Use | Spec |
| --- | --- |
| UI font | Inter via `next/font/google` in `src/app/layout.tsx`: weights 400, 500, 600, 700, `subsets: ['latin']`, `display: 'swap'`, `adjustFontFallback: true`. Applied as `inter.className` on `<body>` |
| CSS import | `globals.css` also `@import`s Inter 300–800 from fonts.googleapis.com. Two loaders. Do not add a third |
| Tailwind stack | `fontFamily.sans`: Inter, system-ui, sans-serif |
| Landing title | `text-xl font-semibold leading-7` (`src/app/page.tsx`, `QuizLanding.tsx`) |
| Landing body | `text-sm leading-6 text-gray-200` |
| Legal H2 | `text-2xl font-semibold text-orange-400` |
| Quiz question label | `text-2xl font-bold text-orange-100` on the category page |

`text-orange-400` is the link and heading accent on blue surfaces. Treat it as an accent. Check 4.5:1 before using it for small body text. This audit did not compute contrast.

## Spacing and shape

| Element | Values in code |
| --- | --- |
| Page inset | `px-4`, landing header `pt-4 pb-2` |
| Nav | `px-4 py-3`, sticky `top-0 z-50`, `border-b border-white/10` |
| Quiz option | padding 12px, `min-height: 52px`. Under 640px: `min-height: 48px`, radius 20px, 14px type. Between 400px and 640px: `min-height: 52px`, 16px type |
| Glass / cards | radius 16px (`.glass-effect`) or Tailwind `rounded-xl` / `rounded-2xl` |
| Buttons | radius 12px |
| Max widths | Tailwind extend `max-w-xs` 320 through `max-w-lg` 512. Category quiz column is `max-w-2xl` |
| Motion | `.button-*` and `.quiz-option` hover `translateY(-2px)`. `prefers-reduced-motion: reduce` clears transform on those classes only. Framer Motion on nav, results, and errors is separate |

## Breakpoints

Tailwind screens: `xs` 375, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

Required manual checks (not the Tailwind set): **360, 390, 412, 430, 768, 1024, 1366, 1920**.

Playwright projects (`playwright.config.ts`): mobile 375×667, tablet 768×1024, desktop 1280×800. Passing Playwright does not cover the eight widths.

## Components to reuse

| Need | Use |
| --- | --- |
| App shell | `src/app/layout.tsx`, `MobileLayoutWrapper`, `Providers` |
| Nav | `src/components/navigation/UnifiedNavigation.tsx` (`full` / `simple` / `minimal`). No ad in this bar |
| Quiz play | `src/components/quiz/UnifiedQuizInterface.tsx` |
| Timer slot | `CountdownTimer` is `ssr: false` with a reserved `h-28 mb-6` skeleton in `src/app/quiz/[category]/page.tsx`. Keep a reserved box if you change it |
| Result / reward | `QuizResultsDisplay`, `UnifiedRewardPopup` |
| Exit / time up | `src/components/modals/` |
| Legal page | `LegalPageShell`, `LegalFooter` |
| Category card | `src/components/ui/CategoryCard.tsx` |
| Landing | `QuizLandingTop` / `QuizLandingBottom` |
| Ads | `AdBanner` (returns `null`). Do not draw a fake ad frame |

## Anti-patterns

- Hiding, clipping, scaling, or covering a rendered ad. `AdBanner` currently voids `className` and `style` and returns `null`. When ads are turned on, the slot needs a reserved height in the layout, not `overflow: hidden`, negative margins, or `transform: scale()` on the iframe’s parent.
- Putting an ad in the logo, wordmark, or nav. The nav is `z-50` and sticky; a later ad must not sit under it or under the insufficient-coins overlay (`z-20`, full-viewport `bg-indigo-950/80`).
- `SocialProofBanner` (`fixed`, `z-40`, fake “847362” users). It is not mounted. Do not mount it. A fixed bar over content fights both ads and CLS.
- `.quiz-option.selected { transform: scale(1.05) }` can overflow a narrow column. Do not add more scale animations on answer targets.
- `via.placeholder.com` URLs in `src/utils/wordpress.ts`. Do not use them on a public page.
- A new Google Fonts `<link>` or `@import`. Two Inter loaders already exist.
- Layout shift from late UI: homepage and category quiz use `dynamic()` with a skeleton. Match the skeleton’s height to the real component, as the timer comment already does.
