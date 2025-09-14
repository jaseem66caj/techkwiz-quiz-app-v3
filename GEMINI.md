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

## Tech Stack

The application uses Next.js 15 with minimal additional libraries. We use TypeScript for type safety, Tailwind CSS for styling, and vanilla React patterns as much as possible with selective use of Framer Motion for animations. Data is stored locally in the browser using localStorage and sessionStorage.

### Core Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 12.23
- **State Management**: React Context API with useReducer
- **Data Storage**: localStorage and sessionStorage
- **Icons**: Heroicons React 2.2
- **Error Monitoring**: Sentry Next.js 8.46
- **Testing**: Playwright 1.55 for E2E tests

### Key Dependencies

- **Runtime**: Node.js >=18.0.0
- **Package Manager**: npm 10.0.0
- **Build Tools**: Next.js built-in compiler with SWC
- **CSS Processing**: PostCSS 8.4 with Autoprefixer 10.4

## Architecture Choices

### Client-Side Only Architecture

The application is designed as a pure client-side web app with no required backend services. All functionality runs entirely in the browser.

### Component-Based UI Structure

- Modular structure using reusable React components
- Centralized data management through `quizDatabase.ts`
- State management via React Context API in `src/app/providers.tsx`
- Component composition for UI building blocks

### Styling System

- Utility-first CSS with Tailwind CSS
- Custom color palette with primary blue and secondary orange
- Mobile-first responsive design with custom breakpoints
- Inter font family with system-ui fallbacks

### Data Management

- Static quiz data in `src/data/quizDatabase.ts`
- User progress and preferences in localStorage
- Session-specific data in sessionStorage
- No external API dependencies for core functionality

### Performance Optimizations

- Static Site Generation (SSG) for pre-rendered pages
- Bundle splitting for optimized loading
- Image optimization through Next.js
- Client-side caching strategies

### Deployment Model

- Standalone output for easy deployment
- Compatible with static hosting platforms (Vercel, Netlify, GitHub Pages)
- No server-side requirements for core features
- Optional backend integration possible through future extensions

This architecture keeps the application lightweight, fast, and easy to deploy while providing a rich interactive experience through client-side technologies.
