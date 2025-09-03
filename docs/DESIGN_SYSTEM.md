# TechKwiz Design System

## Overview

This document serves as the comprehensive design system for the TechKwiz Quiz App, capturing the current theme, colors, and styles to ensure consistency across all future development.

## Color Palette

### Primary Colors
- **Primary Blue**: `#4F46E5` - Used for primary actions, links, and key UI elements
- **Primary Blue Light**: `#818CF8` - Hover states and secondary actions
- **Primary Blue Dark**: `#3730A3` - Active states and pressed interactions

### Secondary Colors
- **Accent Purple**: `#7C3AED` - Special highlights and premium features
- **Accent Pink**: `#EC4899` - Gamification elements and rewards
- **Accent Teal**: `#0D9488` - Success states and positive feedback

### Neutral Colors
- **White**: `#FFFFFF` - Backgrounds and primary text
- **Gray 100**: `#F3F4F6` - Subtle backgrounds and dividers
- **Gray 200**: `#E5E7EB` - Borders and secondary backgrounds
- **Gray 300**: `#D1D5DB` - Disabled states and subtle UI
- **Gray 500**: `#6B7280` - Secondary text and icons
- **Gray 700**: `#374151` - Primary text
- **Gray 900**: `#111827` - Headings and high-contrast text
- **Black**: `#000000` - Maximum contrast elements

### Semantic Colors
- **Success Green**: `#10B981` - Correct answers and positive actions
- **Warning Yellow**: `#F59E0B` - Caution states and medium priority
- **Error Red**: `#EF4444` - Incorrect answers and error states
- **Info Blue**: `#3B82F6` - Informational messages and neutral actions

## Typography

### Font Family
- **Primary Font**: `Inter` with fallbacks `system-ui, sans-serif`
- **Font Loading**: Google Fonts CDN

### Font Sizes
- **Heading 1**: `2.25rem` (36px) - Main page titles
- **Heading 2**: `1.875rem` (30px) - Section headings
- **Heading 3**: `1.5rem` (24px) - Subsection headings
- **Heading 4**: `1.25rem` (20px) - Card titles
- **Body Large**: `1.125rem` (18px) - Lead paragraphs
- **Body Regular**: `1rem` (16px) - Standard text
- **Body Small**: `0.875rem` (14px) - Secondary text
- **Caption**: `0.75rem` (12px) - Metadata and fine print

### Font Weights
- **Regular**: `400` - Standard text
- **Medium**: `500` - Emphasized text
- **Semi-Bold**: `600` - Subheadings
- **Bold**: `700` - Headings
- **Extra-Bold**: `800` - Page titles

### Line Heights
- **Tight**: `1.25` - Headings
- **Normal**: `1.5` - Body text
- **Relaxed**: `1.75` - Paragraphs

## Spacing System

### Scale (based on 4px grid)
- **XXS**: `0.25rem` (4px) - Minimal spacing
- **XS**: `0.5rem` (8px) - Micro spacing
- **S**: `0.75rem` (12px) - Small elements
- **M**: `1rem` (16px) - Standard spacing
- **L**: `1.5rem` (24px) - Section spacing
- **XL**: `2rem` (32px) - Major sections
- **XXL**: `3rem` (48px) - Page-level spacing

### Responsive Spacing
- **Mobile**: Base spacing values
- **Tablet**: 1.25x base values
- **Desktop**: 1.5x base values

## Components

### Buttons

#### Primary Button
- **Background**: `linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)`
- **Text Color**: `#FFFFFF`
- **Padding**: `0.75rem 1.5rem`
- **Border Radius**: `50px`
- **Font Weight**: `600`
- **Hover Effect**: `transform: translateY(-2px)`
- **Active Effect**: `transform: translateY(0)`

#### Secondary Button
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Backdrop Filter**: `blur(10px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)`
- **Text Color**: `#FFFFFF`
- **Padding**: `0.75rem 1.5rem`
- **Border Radius**: `50px`
- **Font Weight**: `600`
- **Hover Effect**: `border-color: rgba(255, 255, 255, 0.4)`

### Cards
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Backdrop Filter**: `blur(10px)`
- **Border Radius**: `15px`
- **Padding**: `1.5rem`
- **Box Shadow**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)`

### Quiz Options
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Backdrop Filter**: `blur(10px)`
- **Border Radius**: `12px`
- **Padding**: `1rem`
- **Margin**: `0.5rem 0`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)`
- **Text Align**: `left`
- **Transition**: `all 0.2s ease-in-out`

#### Selected State
- **Border**: `2px solid #4F46E5`
- **Background**: `rgba(79, 70, 229, 0.2)`

#### Correct State
- **Border**: `2px solid #10B981`
- **Background**: `rgba(16, 185, 129, 0.2)`

#### Incorrect State
- **Border**: `2px solid #EF4444`
- **Background**: `rgba(239, 68, 68, 0.2)`

### Navigation
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Backdrop Filter**: `blur(10px)`
- **Height**: `60px`
- **Padding**: `0 1.5rem`
- **Border Bottom**: `1px solid rgba(255, 255, 255, 0.2)`

### Progress Bar
- **Height**: `8px`
- **Background**: `rgba(255, 255, 255, 0.2)`
- **Border Radius**: `4px`
- **Fill Color**: `#4F46E5`
- **Fill Border Radius**: `4px`

## Animations

### Transitions
- **Default Duration**: `0.2s`
- **Easing**: `ease-in-out`
- **Properties**: `all`

### Specific Animations

#### Fade In
- **Duration**: `0.5s`
- **Easing**: `ease-in`
- **From**: `opacity: 0`
- **To**: `opacity: 1`

#### Slide Up
- **Duration**: `0.3s`
- **Easing**: `ease-out`
- **From**: `transform: translateY(20px); opacity: 0`
- **To**: `transform: translateY(0); opacity: 1`

#### Bounce In
- **Duration**: `0.6s`
- **Easing**: `ease-out`
- **Keyframes**: 
  - `0%`: `transform: scale(0.3); opacity: 0`
  - `50%`: `transform: scale(1.05)`
  - `70%`: `transform: scale(0.9)`
  - `100%`: `transform: scale(1); opacity: 1`

#### Answer Feedback
- **Correct**: `transform: scale(1.05)` for `0.3s`
- **Incorrect**: `transform: translateX(5px)` with alternating directions for `0.1s` (4 times)

#### Coin Bounce
- **Duration**: `0.5s`
- **Easing**: `ease-in-out`
- **Keyframes**:
  - `0%`: `transform: translateY(0)`
  - `30%`: `transform: translateY(-20px)`
  - `50%`: `transform: translateY(0)`
  - `70%`: `transform: translateY(-10px)`
  - `100%`: `transform: translateY(0)`

## Responsive Design

### Breakpoints
- **Mobile (xs)**: `375px`
- **Small (sm)**: `640px`
- **Medium (md)**: `768px`
- **Large (lg)**: `1024px`
- **Extra Large (xl)**: `1280px`
- **2X Large (2xl)**: `1536px`

### Mobile-First Approach
- **Base styles**: Mobile
- **Enhancements**: Progressive at sm, md, lg, xl, 2xl

### Mobile-Specific Adjustments
- **Touch Targets**: Minimum `44px` for interactive elements
- **Navigation**: Collapsed into hamburger menu
- **Content**: Single column layout
- **Spacing**: Reduced horizontal padding

## Iconography

### Emoji Icons
- **Movies**: `🎬`
- **Social Media**: `📱`
- **Influencers**: `🌟`
- **Rewards**: `🪙`
- **Leaderboard**: `🏆`
- **Profile**: `👤`

### Heroicons
- **Used for**: UI controls, navigation, and functional icons
- **Style**: Outline variants
- **Size**: `24px` standard, `20px` for compact UI

## Shadows and Depth

### Elevation Levels
- **Level 1**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Level 2**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Level 3**: `0 10px 15px rgba(0, 0, 0, 0.1)`

## Glass Effect

### Standard Glass
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Backdrop Filter**: `blur(10px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)`

### Strong Glass
- **Background**: `rgba(255, 255, 255, 0.15)`
- **Backdrop Filter**: `blur(15px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.3)`

## Visual Testing

To ensure design consistency across updates, we've implemented visual regression testing using Playwright. This system automatically captures screenshots of key pages and compares them against baselines to detect unintended visual changes.

### Setup

1. Install dependencies:
   ```bash
   npm install
   npx playwright install --with-deps
   ```

2. Run tests:
   ```bash
   npm run test:visual
   ```

### Test Coverage

- Homepage
- Start page
- Quiz pages
- Profile page
- All pages tested on mobile, tablet, and desktop viewports

### Updating Baselines

When intentional design changes are made:
```bash
npm run test:visual -- -u
```

## Maintenance

Regular maintenance of this design system documentation ensures consistency across the TechKwiz platform. When making design changes, always update this documentation and run visual tests to maintain design integrity.

## Conclusion

This design system ensures visual consistency across the TechKwiz Quiz App. All new development should reference these specifications to maintain the established look and feel. Any intentional design changes should be documented here to keep this system up to date.