# Visual Regression Testing

This directory contains visual regression tests for the TechKwiz website using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

## Running Visual Tests

1. Start the development server in one terminal:
   ```bash
   npm run dev
   ```

2. In another terminal, run the visual tests:
   ```bash
   npm run test:visual
   ```

## Updating Baselines

When intentional design changes are made, update the baselines:
```bash
npm run test:visual -- -u
```

## Test Structure

- Mobile viewport: 375px × 667px
- Tablet viewport: 768px × 1024px
- Desktop viewport: 1280px × 800px

Tests cover:
- Homepage
- Start page
- Quiz page (/quiz/swipe-personality)
- Profile page