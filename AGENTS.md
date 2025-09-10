# Agent Guidelines for TechKwiz-v8

## Build & Test Commands
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Visual Tests**: `npm run test:visual`
- **E2E Tests**: `npm run test:e2e:stable`
- **Single Test**: `npx playwright test tests/e2e/specific-test.spec.ts --timeout=90000`

## Code Style Guidelines

### TypeScript & Imports
- Use absolute imports with `@/` alias (e.g., `import { QuizQuestion } from '@/types/quiz'`)
- Strict mode disabled (`"strict": false`)
- Target ES2017 with modern module resolution

### Naming Conventions
- **Components**: PascalCase (e.g., `QuizInterface`, `CategoryCard`)
- **Functions/Variables**: camelCase (e.g., `onAnswerSelect`, `questionAnswered`)
- **Types/Interfaces**: PascalCase (e.g., `QuizQuestion`, `QuizInterfaceProps`)
- **Files**: PascalCase for components, camelCase for utilities

### Documentation & Comments
- Use extensive JSDoc comments for all interfaces and public functions
- Include parameter descriptions and return types
- Add file-level headers explaining component/utility purpose

### Error Handling
- Use custom error classes extending Error (e.g., `QuizDataError`)
- Include error codes and context for debugging
- Implement proper error logging in custom error classes

### File Structure
- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/utils/` - Utility functions and data managers
- `src/types/` - TypeScript type definitions
- `src/hooks/` - Custom React hooks
- `tests/e2e/` - Playwright end-to-end tests

### ESLint Configuration
- Extends `next/core-web-vitals`
- Disabled rules: `react/no-unescaped-entities`, `react-hooks/exhaustive-deps`, `@next/next/no-html-link-for-pages`, `@next/next/no-img-element`

### Testing
- Playwright for E2E and visual testing
- Test directory: `tests/e2e/`
- Snapshots stored in `tests/e2e/baselines/`
- Supports mobile, tablet, and desktop viewports