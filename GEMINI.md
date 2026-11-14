# Gemini

`AGENTS.md` is the only source of truth for play.techkwiz.com. Read it before editing, then the matching file in `docs/ai/`.

Tool preferences for Gemini:

- Prefer repository files over memory. `docs/` outside `docs/ai/` is often stale (wrong port, old design dates). Commands and tokens in `AGENTS.md` and `docs/ai/DESIGN.md` win.
- Run `npm run lint`, `npx jest --watchman=false --forceExit`, and `npm run build` before handing work back. Quote the exit status.
- Do not invent AdSense publisher ids, mailboxes, or legal dates. Use `public/ads.txt`, `CONTACT_EMAIL`, and `LEGAL_LAST_UPDATED`.
- Do not enable ads, click ads, or restyle a rendered ad unit. Do not merge, and do not touch PR #10.
- Quiz content changes go through `.agents/skills/revise-quiz-content/SKILL.md`.
