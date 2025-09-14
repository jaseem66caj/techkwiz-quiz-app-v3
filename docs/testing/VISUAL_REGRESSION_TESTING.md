# TechKwiz Visual Regression Testing Standards

**Version 1.0** | **Last Updated:** September 14, 2025 | **Maintained by:** TechKwiz Development Team

## 🎯 Overview

This document defines the visual regression testing standards for the TechKwiz Quiz App. It provides guidelines and procedures to ensure consistent visual appearance across all components and pages, preventing unintended visual changes during development.

## 🧪 Testing Framework

### Playwright Integration
The TechKwiz Quiz App uses Playwright for visual regression testing with the following configuration:

**File: playwright.config.ts**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  snapshotDir: './tests/e2e/baselines',
  projects: [
    {
      name: 'mobile',
      use: {
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'desktop',
      use: {
        viewport: { width: 1280, height: 800 }
      },
    },
  ],
});
```

### Test Organization
Visual regression tests are organized in the following structure:
```
tests/e2e/
├── visual-design-documentation.spec.ts
├── homepage-quiz-detailed.spec.ts
├── category-quiz-fresh-load.spec.ts
├── category-quiz-progress.spec.ts
├── coin-validation-comprehensive.spec.ts
├── debug-reward-popup.spec.ts
├── homepage-quiz-detailed.spec.ts
├── insufficient-coins-redirect.spec.ts
├── local-navigation-test.spec.ts
├── navigation-fix-verification.spec.ts
├── production-navigation.spec.ts
├── quiz-completion-flow.spec.ts
├── quiz-completion-timer.spec.ts
├── quiz-flow.spec.ts
├── quiz-timing-flows.spec.ts
└── ...
```

## 📸 Snapshot Standards

### Baseline Images
Baseline images are stored in:
```
tests/e2e/baselines/
```

### Naming Convention
Baseline images follow this naming convention:
```
{test-file-name}/{test-name}/{viewport}-{state}.png
```

Example:
```
homepage-quiz-detailed/Quiz Interface - Default State/desktop-default.png
category-card/Programming Category - Hover State/mobile-hover.png
```

### Viewport Coverage
All visual tests must cover these viewports:
1. **Mobile**: 375px × 667px (iPhone SE)
2. **Tablet**: 768px × 1024px (iPad Mini)
3. **Desktop**: 1280px × 800px (Standard desktop)

### State Coverage
For interactive components, the following states must be tested:
1. **Default State**: Component in normal state
2. **Hover State**: Component with mouse hover (desktop only)
3. **Focus State**: Component with keyboard focus
4. **Active State**: Component during interaction
5. **Disabled State**: Component when disabled (if applicable)

## 🎯 Test Coverage Requirements

### Core Pages
1. **Homepage** (`/`)
   - Quick quiz interface
   - Results display
   - Profile creation redirect

2. **Category Selection** (`/start`)
   - Category cards grid
   - News section
   - Fortune cookie
   - Navigation bar

3. **Quiz Page** (`/quiz/:category`)
   - Quiz introduction
   - Question display
   - Answer options
   - Timer
   - Results display

4. **Profile Page** (`/profile`)
   - User information
   - Coin balance
   - Achievement showcase
   - Quiz history

5. **Leaderboard Page** (`/leaderboard`)
   - Leaderboard display
   - User ranking

6. **About Page** (`/about`)
   - About content
   - Team information

7. **Privacy Page** (`/privacy`)
   - Privacy policy content

### Core Components
1. **Unified Navigation**
   - Full mode
   - Simple mode
   - Minimal mode
   - Mobile menu

2. **Category Card**
   - Default state
   - Hover state (desktop)
   - Focus state
   - Insufficient coins state

3. **Quiz Interface**
   - Question display
   - Answer options (default, selected, correct, incorrect)
   - Timer
   - Progress bar

4. **Buttons**
   - Primary button (default, hover, focus, active)
   - Secondary button (default, hover, focus, active)

5. **Modals**
   - Auth modal
   - Exit confirmation modal
   - Reward popup
   - Achievement notification

6. **User Components**
   - Create profile form
   - Avatar selector
   - Theme selector

7. **Reward Components**
   - Reward celebration animation
   - Coin display

## 🧪 Test Implementation Standards

### Test Structure
All visual regression tests should follow this structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Name - State Description', () => {
  test('viewport description', async ({ page }) => {
    // Setup
    await page.goto('/page-url');
    
    // Interaction (if applicable)
    await page.locator('selector').hover(); // for hover state
    
    // Assertion
    await expect(page).toHaveScreenshot('filename.png', {
      threshold: 0.01, // 1% threshold
      animations: 'disabled',
      fullPage: false, // or true for full page screenshots
    });
  });
});
```

### Screenshot Options
```typescript
{
  threshold: 0.01, // 1% difference allowed
  animations: 'disabled', // Disable animations
  fullPage: false, // Capture full page or viewport only
  caret: 'hide', // Hide caret
  scale: 'css', // Use CSS pixels
  timeout: 30000, // 30 second timeout
}
```

### Test Data Management
- Use consistent test data across runs
- Mock external dependencies
- Use localStorage for persistent data
- Reset state between tests

## 🔧 Test Execution

### Running Tests
```bash
# Run all visual regression tests
npm run test:visual

# Run specific test file
npm run test:visual tests/e2e/homepage-quiz-detailed.spec.ts

# Update baselines after approved changes
npm run test:visual -- --update-snapshots

# Run with UI mode for debugging
npm run test:visual:ui
```

### CI/CD Integration
Visual regression tests are integrated into the CI/CD pipeline:
```yaml
# .github/workflows/visual-tests.yml
name: Visual Regression Tests
on: [pull_request]
jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run visual tests
        run: npm run test:visual
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-test-results
          path: test-results/
```

## 📊 Test Reporting

### Test Results
Test results are stored in:
```
test-results/
```

### Report Format
Each test run generates:
1. **Pass/Fail Status**: For each test case
2. **Diff Images**: For failed tests showing differences
3. **Baseline Images**: Reference images
4. **Actual Images**: Current screenshots
5. **HTML Report**: Detailed test report

### Failure Analysis
When tests fail:
1. Review diff images to identify changes
2. Determine if changes are intentional
3. If intentional, update baselines
4. If unintentional, fix implementation

## 🔄 Baseline Management

### Updating Baselines
When intentional visual changes are made:
```bash
# Update all baselines
npm run test:visual -- --update-snapshots

# Update specific test
npm run test:visual tests/e2e/component-test.spec.ts -- --update-snapshots
```

### Baseline Review Process
1. Run tests with updated implementation
2. Review failing tests
3. Verify changes are intentional
4. Update baselines with approved changes
5. Commit updated baselines with implementation

### Baseline Storage
- Baselines are stored in version control
- Baselines are organized by test file and viewport
- Baselines are named consistently
- Baselines are updated only with intentional changes

## 🎨 Design System Compliance

### Color Verification
- All color values must match design system specifications
- Color contrast must meet accessibility standards
- Brand colors must be consistent across components

### Typography Verification
- Font families must match design system
- Font sizes must follow design system scale
- Font weights must be consistent
- Line heights must meet readability standards

### Spacing Verification
- All spacing must follow 4px grid system
- Padding and margins must be consistent
- Component spacing must match design specifications

### Component Verification
- Component styles must match design system
- Component states must be properly implemented
- Component interactions must be consistent
- Component animations must follow standards

## 📱 Responsive Testing

### Breakpoint Coverage
Tests must cover all responsive breakpoints:
1. **Mobile**: 375px width
2. **Tablet**: 768px width
3. **Desktop**: 1280px width

### Layout Verification
- Grid layouts must be correct
- Component sizing must be appropriate
- Text must be readable
- Touch targets must be adequate

### Component Behavior
- Components must adapt to viewport size
- Interactive elements must be accessible
- Content must reflow appropriately
- No horizontal scrolling on mobile

## ⚙️ Configuration Standards

### Playwright Configuration
**File: playwright.config.ts**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  snapshotDir: './tests/e2e/baselines',
  timeout: 30000,
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      threshold: 0.01,
      animations: 'disabled',
    },
  },
  projects: [
    {
      name: 'mobile',
      use: {
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'desktop',
      use: {
        viewport: { width: 1280, height: 800 }
      },
    },
  ],
});
```

### Percy Configuration (if used)
**File: .percy.yml**
```yaml
version: 2
snapshot:
  widths: [375, 768, 1280]
  min-height: 1024
  percy-css: |
    /* Hide dynamic content */
    .animation { animation: none; }
discovery:
  allowed-hostnames:
    - localhost
```

## 🛡️ Quality Assurance

### Pre-Implementation Checklist
- [ ] Test plan created for new components
- [ ] Viewport coverage defined
- [ ] State coverage defined
- [ ] Test data prepared
- [ ] Baseline images captured

### Post-Implementation Checklist
- [ ] All tests pass
- [ ] Visual consistency verified
- [ ] Responsive behavior confirmed
- [ ] Accessibility compliance checked
- [ ] Baselines updated if needed

### Regular Maintenance
- [ ] Weekly test runs
- [ ] Monthly baseline review
- [ ] Quarterly test coverage audit
- [ ] Annual framework update

## 🆘 Troubleshooting

### Common Issues
1. **Flaky Tests**
   - Solution: Increase timeout, disable animations, use consistent test data

2. **False Positives**
   - Solution: Adjust threshold, review diff images, update baselines if needed

3. **Missing States**
   - Solution: Add missing state tests, verify component behavior

4. **Responsive Issues**
   - Solution: Add viewport tests, verify layout at breakpoints

### Debugging Process
1. Run failing test in UI mode
2. Review diff images
3. Check test implementation
4. Verify component implementation
5. Update baselines if changes are intentional

## 📚 References

- **Website Design Standards**: [docs/website-standards/WEBSITE_DESIGN_STANDARDS.md](../website-standards/WEBSITE_DESIGN_STANDARDS.md)
- **Component Organization**: [docs/architecture/COMPONENT_ORGANIZATION.md](../architecture/COMPONENT_ORGANIZATION.md)
- **Design System**: [docs/DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- **Playwright Documentation**: https://playwright.dev/
- **Project README**: [README.md](../../README.md)