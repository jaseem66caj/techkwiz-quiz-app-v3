# Claude Code

`AGENTS.md` is the only source of truth for play.techkwiz.com. Read it before editing, then the linked file under `docs/ai/` that matches the task.

Tool preferences for Claude Code:

- Use `npm` and the commands in `AGENTS.md`. There is no `npm test` script; unit tests are `npx jest --watchman=false --forceExit`.
- Dev server is `npm run dev` on `http://127.0.0.1:3002`.
- Keep edits small. Do not reformat unrelated files. Do not commit `.env*`, `coverage/`, or `.next/`.
- Ads stay off. Do not change `AdBanner`, `RewardedAdOptIn`, or `adSettings.enabled` unless the task is an owner-approved ads PR.
- Open a pull request for review. Do not merge. Leave PR #10 (`fix/play-guest-flow-layout`) untouched.
- For a quiz-bank edit, follow `.agents/skills/revise-quiz-content/SKILL.md`.
