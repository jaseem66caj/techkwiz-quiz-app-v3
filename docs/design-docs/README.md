# TechKwiz Design Documentation

This directory contains visual documentation of the TechKwiz quiz application design, including screenshots and design specifications.

## Contents

- [DESIGN_OVERVIEW.md](./DESIGN_OVERVIEW.md) - Comprehensive overview of the application design
- [WEBSITE_PAGES.md](./WEBSITE_PAGES.md) - Documentation of all website pages and navigation
- [screenshots/](./screenshots/) - Visual references of the application UI

## Screenshot Organization

Screenshots are organized by device type:
- `desktop/` - Desktop views (1280px width)
- `mobile/` - Mobile views (375px width)
- `tablet/` - Tablet views (768px width)

## Updating Screenshots

To update the design screenshots, ensure the application is running locally and execute:

```bash
node scripts/update-design-screenshots.js
```

This script will:
1. Capture screenshots of all main pages
2. Organize them by device type
3. Update the documentation timestamp

## Visual Regression Testing

These screenshots serve as baselines for visual regression testing. Any unintended visual changes can be detected by comparing current views with these references.

## Version Information

Current documentation version represents the application state as of September 14, 2025.