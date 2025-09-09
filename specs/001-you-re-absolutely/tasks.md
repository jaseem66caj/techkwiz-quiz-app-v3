# Tasks for Interactive Technology Quiz Platform (Client-Side Only)

This document breaks down the implementation of the Interactive Technology Quiz Platform into executable tasks. The tasks are ordered by dependency, with tests preceding implementation wherever possible.

## Task List

### Phase 1: Project Setup & Foundation

- **T001: Initialize Project**
  - **File**: `package.json`
  - **Action**: Create a new Next.js project with TypeScript and Tailwind CSS. Initialize a git repository.

- **T002: Install Dependencies**
  - **File**: `package.json`
  - **Action**: Install `framer-motion` and `heroicons`.
  - **Depends on**: T001

- **T003: Configure Linting**
  - **File**: `.eslintrc.json`, `.prettierrc`
  - **Action**: Set up ESLint and Prettier to enforce code quality and consistency.
  - **Depends on**: T001

### Phase 2: Data Models and Core Logic

- **T004: Define Data Types [P]**
  - **File**: `src/types/quiz.ts`
  - **Action**: Create TypeScript types for `Quiz`, `Question`, and `Reward` based on `data-model.md`.

- **T005: Define User Type [P]**
  - **File**: `src/types/user.ts`
  - **Action**: Create the TypeScript type for `User` based on `data-model.md`.

- **T006: Create Dummy Data**
  - **File**: `src/data/quizDatabase.ts`
  - **Action**: Create a dummy database of quizzes and questions to use for development.

- **T007: Set Up State Management**
  - **File**: `src/app/providers.tsx`
  - **Action**: Create a React Context and `useReducer` for global state management.

- **T008: Implement Quiz State Logic**
  - **File**: `src/app/providers.tsx`
  - **Action**: Implement the reducer logic for managing the quiz state (e.g., current question, score, timer).
  - **Depends on**: T007

- **T009: Implement User Progress Logic**
  - **File**: `src/hooks/useUserProgress.ts`
  - **Action**: Create a custom hook to manage user progress (coins, streaks) using `localStorage`.

### Phase 3: UI Component Development

- **T010: Create Quiz Category Card [P]**
  - **File**: `src/components/QuizCategoryCard.tsx`
  - **Action**: Develop the UI component for displaying a single quiz category on the homepage.

- **T011: Create Question Card [P]**
  - **File**: `src/components/QuestionCard.tsx`
  - **Action**: Develop the UI component for displaying a quiz question and its answer options.

- **T012: Create Timer Component [P]**
  - **File**: `src/components/Timer.tsx`
  - **Action**: Develop the UI component for the countdown timer.

- **T013: Create Scoreboard Component [P]**
  - **File**: `src/components/Scoreboard.tsx`
  - **Action**: Develop the UI component for displaying the user's score.

- **T014: Create Reward Popup [P]**
  - **File**: `src/components/RewardPopup.tsx`
  - **Action**: Develop the UI component for displaying reward notifications.

### Phase 4: Page Creation

- **T015: Create Homepage**
  - **File**: `src/app/page.tsx`
  - **Action**: Develop the homepage to display a list of available quiz categories.
  - **Depends on**: T010

- **T016: Create Quiz Page**
  - **File**: `src/app/quiz/[category]/page.tsx`
  - **Action**: Develop the quiz page to display questions for the selected category.
  - **Depends on**: T011, T012, T013

- **T017: Create Results Page**
  - **File**: `src/app/results/page.tsx`
  - **Action**: Develop the results page to display the user's final score and rewards.
  - **Depends on**: T013

### Phase 5: Testing

- **T018: Write E2E Test for Quiz Flow [P]**
  - **File**: `src/__tests__/visual/quiz-flow.spec.ts`
  - **Action**: Create a Playwright E2E test to verify the main user journey of taking a quiz, as described in `quickstart.md`.

### Phase 6: Polish & Refinement

- **T019: Add Animations [P]**
  - **File**: `src/components/*.tsx`
  - **Action**: Add `framer-motion` animations to the UI components to enhance the user experience.

- **T020: Ensure Responsiveness [P]**
  - **File**: `src/styles/globals.css`
  - **Action**: Ensure the application is fully responsive across mobile, tablet, and desktop devices.

- **T021: Refine Styles [P]**
  - **File**: `tailwind.config.js`, `src/styles/globals.css`
  - **Action**: Review and refine the Tailwind CSS styles to ensure a polished and consistent look and feel.

## Parallel Execution

Tasks marked with `[P]` can be executed in parallel. For example, the UI components in Phase 3 can be developed simultaneously.

**Example of parallel execution:**

```bash
# Terminal 1
gemini agent execute --task T010

# Terminal 2
gemini agent execute --task T011

# Terminal 3
gemini agent execute --task T012
```
