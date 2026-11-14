# GitHub Copilot

`AGENTS.md` at the repo root is the source of truth. Follow it and `docs/ai/` instead of guessing from older files in `docs/`.

Copilot-specific preferences:

- This repo is npm, Next.js 15 App Router, React 19, TypeScript (`@/` → `src/`). Dev command is `npm run dev` (port 3002). Unit tests are Jest via `npx jest`, not an npm script.
- Match nearby code: two-space indent, imports at top, PascalCase components.
- Do not suggest enabling AdSense, clicking ads, overlaying ad slots, or committing secrets.
- Do not suggest merging. PR #10 (`fix/play-guest-flow-layout`) is out of bounds.
- Quiz question edits belong in `src/data/quizDatabase.ts` plus `src/content/quizLandings.ts`. Rounds draw 5 questions. Coins are virtual.
