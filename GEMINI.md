# Techkwiz-v8

## Project Overview

This is a client-side rendered, interactive quiz application built with Next.js and TypeScript. The application is designed to be a fun and engaging quiz game, with a focus on tech-related topics. It features a reward system, user progress tracking, and a modern, animated user interface. All data is stored locally in the browser, and no backend is required.

### Key Technologies

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **State Management:** React Context API with `useReducer`
*   **Testing:** Playwright for visual regression testing
*   **Build Configuration:** Craco for custom Webpack configuration

### Architecture

The application follows a standard Next.js project structure.

*   `src/app/`: Contains the main application pages, following the Next.js App Router paradigm. The main layout in `src/app/layout.tsx` defines a mobile-first container for the quiz and a separate full-width layout for admin pages.
*   `src/components/`: Reusable React components used throughout the application.
*   `src/data/`: Holds the quiz data, including questions and categories.
*   `src/hooks/`: Custom React hooks for managing application logic.
*   `src/utils/`: Utility functions for various tasks, including a browser-only authentication system.
*   `src/app/providers.tsx`: The core of the application's state management, using React's `useReducer` and `useContext` to provide a global state.

## Building and Running

### Prerequisites

*   Node.js 18+
*   npm or yarn

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Building for Production

```bash
npm run build
```

This will create an optimized production build in the `.next` directory.

### Running in Production Mode

```bash
npm run start
```

This will start a production server.

### Testing

The project uses Playwright for visual regression testing. The configuration is in `playwright.config.ts`.

*   Run tests in headless mode:
    ```bash
    npm run test:visual
    ```
*   Run tests with the Playwright UI:
    ```bash
    npm run test:visual:ui
    ```

Tests are located in `src/__tests__/visual` and snapshots are stored in `src/__tests__/visual/baselines`. The tests use screenshot comparison to ensure visual consistency, as seen in `src/__tests__/visual/techkwiz-homepage.spec.js`.

## Development Conventions

*   **Authentication:** A simple browser-only authentication system is implemented in `src/utils/auth.ts`. User data is stored in `localStorage` and `sessionStorage`.
*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
*   **State Management:** Application state is managed globally via React's Context API and `useReducer` hook in `src/app/providers.tsx`.
*   **Data:** All quiz questions and categories are stored in `src/data/quizDatabase.ts`.
*   **Build:** The project uses Craco for custom Webpack configurations, including a `@` alias for the `src` directory.
*   **Testing:** Visual regression tests are written for mobile, tablet, and desktop viewports.
