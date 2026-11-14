---
name: revise-quiz-content
description: Edit a play.techkwiz.com quiz bank and its landing copy while keeping the 5-question round, the 100-coin gate, and ads off.
---

# Revise quiz content

Use this when the task adds, edits, fact-checks, or removes questions, fun facts, category blurbs, or the crawlable landing for an existing quiz. Do not use it to turn on ads, change coin prices, or touch PR #10.

## Triggers

- “Add a question”, “fix this quiz”, “update the programming bank”, “rewrite the landing”, “check this fun fact”.
- A change whose files are `src/data/quizDatabase.ts` and/or `src/content/quizLandings.ts`.

## Before editing

1. Read the category object and its array in `src/data/quizDatabase.ts`. Slugs: `swipe-personality`, `pop-culture-flash`, `micro-trivia`, `social-identity`, `trend-vibes`, `future-you`, `programming`, `ai`.
2. Read the matching key in `src/content/quizLandings.ts` and `QUESTIONS_PER_ROUND` in `src/config/quiz.ts` (5).
3. Personality banks (`swipe-personality` and any item with no right answer) use `correct_answer: -1`. Scored banks use a 0-based index into `options`.
4. Rounds still call `getStaticQuestions`, which slices the bank to 5, then `quizDataManager.getUnifiedQuestions(categoryId, 5, 'category')`. A longer bank does not lengthen a round. Programming and AI already have 27 questions; the other banks have 5.
5. If the task is the AI “best for image recognition” / CNN item, stop and say so. The owner asked for a factual review. Do not strengthen that claim in passing.

## Steps

1. Edit the question fields that already exist: `id`, `question`, `options` (4 strings), `correct_answer`, `difficulty` (`beginner` | `intermediate` | `advanced`), `fun_fact`, `category` (the slug), `subcategory` (one of that category’s `subcategories`).
2. Keep `id` unique in the whole file. Prefixes already used: `swipe_`, `pop_`, `micro_`, `social_`, `trend_`, `future_`, `prog_`, `ai_` (the CNN item is `ai_002`). Do not reuse an id.
3. If the landing’s intro, FAQ, audience, or meta description would become false, update that slug in `src/content/quizLandings.ts`. Keep “Coins on TechKwiz Play are virtual and are not cash.” Keep “You can play as a guest.”
4. Do not edit `src/app/sitemap.ts` or `src/app/about/page.tsx` for a new category name. Both read `QUIZ_CATEGORIES`.
5. Do not add a category slug unless you also add a `QUIZ_CATEGORIES` entry (`entry_fee: 100`, `color`, `icon`), a bank array, a landing record, and an OG image under `public/og/`. Unknown slugs 404 (`dynamicParams = false`). `generateStaticParams` lists `QUIZ_CATEGORIES` keys.
6. Do not change `entry_fee`, `STANDARD_ENTRY_FEE`, `adSettings.enabled`, `AdBanner`, or `RewardedAdOptIn`.
7. Do not invent a “we tested this” line. Fun facts must be safe to show after an answer. No ad-click language (`docs/ai/VOICE.md`).

## Verification

- `npx jest --watchman=false --forceExit src/__tests__/quizDataManager.test.ts src/__tests__/rewardCalculator.test.ts src/utils/__tests__/rewardCalculator.test.ts`
- `npm run lint`
- `npm run build` (quiz routes are SSG; a bad slug or type error fails here)
- If the landing JSX or category card copy changed, load `/quiz/<slug>` and `/start` at 360, 390, 412, 430, 768, 1024, 1366, and 1920. Playwright’s 375/768/1280 projects are extra, not a substitute.
- Confirm the page still shows publisher text above the fold (the landing header) and that `AdBanner` was not added.
- PR for owner review. Do not merge. Do not push `fix/play-guest-flow-layout`.
