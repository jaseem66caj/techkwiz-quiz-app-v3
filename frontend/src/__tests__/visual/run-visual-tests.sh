#!/bin/bash

# Visual Testing Script for TechKwiz

echo "🚀 Starting Visual Regression Testing Setup"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Please run this script from the frontend directory"
  exit 1
fi

# Check if Playwright is installed
if ! npm list @playwright/test > /dev/null 2>&1; then
  echo "📦 Installing Playwright..."
  npm install --save-dev @playwright/test
fi

# Install Playwright browsers if not already installed
echo "🔧 Installing Playwright browsers..."
npx playwright install --with-deps

# Check if dev server is running
if nc -z localhost 3000; then
  echo "✅ Development server is running"
else
  echo "⚠️  Development server is not running"
  echo "Please start the development server in another terminal:"
  echo "npm run dev"
  echo ""
  echo "Then run this script again"
  exit 1
fi

# Run visual tests
echo "🔍 Running visual regression tests..."
npx playwright test

echo "✅ Visual testing complete!"
echo "📊 Check the report: npx playwright show-report"