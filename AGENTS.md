# Repository Guidelines

## Project Structure & Module Organization
Keep feature work in `src`, grouped by concern: routing and layouts in `src/app`, shared UI in `src/components`, stateful logic in `src/hooks`, reusable helpers in `src/utils`, and domain models in `src/types`. Static quiz assets and icons live in `public`. Test suites reside in `src/__tests__` for unit coverage and `tests/e2e` for Playwright journeys; visual baselines are under `tests/e2e/baselines`.

## Build, Test, and Development Commands
Use `npm run dev` for the Next.js dev server on port 3002. Run `npm run build` before release to ensure the production bundle compiles. `npm run lint` executes `next lint` with the shared ESLint rules. Visual regression checks rely on `npm run test:visual`, while `npm run test:e2e:stable` runs the serialized Playwright suite with retries. For focused debugging, target a spec with `npx playwright test tests/e2e/specific-test.spec.ts --timeout=90000`. Bundle analysis is available via `npm run analyze` when diagnosing size regressions.

## Coding Style & Naming Conventions
This codebase uses TypeScript with ES2017 targets and the `@/` alias for absolute imports. Follow PascalCase for React components and types, camelCase for functions and variables, PascalCase filenames for components, and camelCase for utilities. Maintain two-space indentation, keep Tailwind classes sorted by layout→spacing→color, and document public APIs with JSDoc (include parameter notes and return types). Custom errors should extend `Error`, expose a `code`, and log contextual metadata.

## Testing Guidelines
Unit tests run with Jest; execute `npx jest --coverage` to keep the `coverage` report up to date. Snapshot and golden-image baselines live in `tests/e2e/baselines`; update them only after intentional UI changes. Name new Playwright specs with the feature and viewport target (e.g., `leaderboard-desktop.spec.ts`) and capture any unstable flows with retries disabled locally. Record test evidence in PRs when fixing flaky behaviour.

## Commit & Pull Request Guidelines
Craft concise, descriptive commit messages—recent history favors imperative subjects and optional emoji prefixes (e.g., `🚀 Streamline quiz loader`). Reference related issues where applicable. Pull requests should outline the change intent, list manual and automated checks (`npm run lint`, applicable Playwright commands), and include screenshots or videos for UI-facing work. Keep PRs scoped, link follow-up tasks, and ensure environment variables or migration steps are documented before requesting review.
