# TechKwiz-v8

A modern interactive quiz game application built with Next.js 15, TypeScript, and Tailwind CSS.

## 📖 Project Overview

TechKwiz-v8 is a client-side only web application that provides an engaging quiz experience with categories like Movies, Social Media, and Influencers. Users can test their knowledge, earn rewards, and track their progress - all running directly in the browser with no backend required.

## 🎯 Key Features

- **Pure Client-Side Operation**: No backend required; runs entirely in the browser
- **Multiple Quiz Categories**: Movies, Social Media, and Influencers
- **Reward System**: Earn coins for correct answers and track progress
- **Interactive UI**: Smooth animations using Framer Motion
- **Local Storage**: Stores user progress and preferences in the browser
- **Responsive Design**: Works seamlessly on mobile and desktop devices

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Visual Testing**: Playwright for visual regression testing

## 🎨 Visual Testing Implementation

This project includes a comprehensive visual regression testing system implemented with Playwright to preserve the current theme, colors, and style for future reference and consistency checking.

### Features:
- Multi-viewport testing (mobile, tablet, desktop)
- Automated screenshot comparison
- Easy baseline updating
- Integrated reporting

### Test Coverage:
- Homepage
- Start page
- Quiz pages
- Profile page

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd Techkwiz-v8
cd frontend
npm install
```

### Development

```bash
# Start the development server
npm run dev

# Run visual tests
npm run test:visual

# View test reports
npx playwright show-report
```

### Building for Production

```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── data/             # Quiz data and database
│   ├── __tests__/        # Test files
│   │   └── visual/       # Visual regression tests
│   └── utils/            # Utility functions
├── docs/                 # Documentation files
└── public/               # Static assets
```

## 🧪 Visual Testing

The visual testing system ensures design consistency across updates by automatically capturing screenshots of key pages and comparing them against baselines.

### Running Visual Tests

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```

2. In another terminal, run the visual tests:
   ```bash
   npm run test:visual
   ```

### Updating Baselines

When intentional design changes are made:
```bash
npm run test:visual -- -u
```

## 📄 Documentation

- [Design System](docs/DESIGN_SYSTEM.md) - Complete design system documentation
- [Visual Testing Implementation](ALTERNATIVE_TOOL_APPROACH.md) - Visual testing approach and implementation details

## 🚢 Deployment

The application can be deployed to multiple platforms:
- Vercel: `npx vercel --prod`
- Netlify: Upload contents of `out` folder
- GitHub Pages: Push `out` folder to `gh-pages` branch

## 📝 License

This project is proprietary and confidential. All rights reserved.