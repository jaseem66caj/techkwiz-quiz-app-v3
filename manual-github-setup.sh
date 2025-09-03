#!/bin/bash

# TechKwiz-v8 Manual GitHub Repository Setup Script

echo "🔧 TechKwiz-v8 Manual GitHub Repository Setup"
echo "========================================"

# Check if we're in the correct directory
if [ ! -f "README.md" ]; then
  echo "❌ Please run this script from the Techkwiz-v8 root directory"
  exit 1
fi

echo "✅ Correct directory detected"

# Check if git is available
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed or not in PATH"
  echo "Please install Git and try again"
  exit 1
fi

echo "✅ Git is available"

# Remove any existing remote
echo "🔄 Removing existing remote repository configuration..."
git remote remove origin 2>/dev/null || true

# Stage all files
echo "📦 Staging all files..."
git add .

# Check if there are changes to commit
echo "📝 Creating initial commit..."
git commit -m "Initial commit: TechKwiz-v8 project with Playwright visual testing"

echo ""
echo "📋 Manual Setup Instructions:"
echo "==========================="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Sign in with your GitHub account"
echo "   - Repository name: TechKwiz-v8"
echo "   - Description: A modern interactive quiz game with visual regression testing"
echo "   - Set to Private"
echo "   - Leave all checkboxes UNCHECKED"
echo "   - Click 'Create repository'"
echo ""
echo "2. After creating the repository, run these commands:"
echo "   git remote add origin https://github.com/jaseem66caj/TechKwiz-v8.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "📝 Note: Replace 'jaseem66caj' with your actual GitHub username if different"
echo ""
echo "✅ Repository setup preparation complete!"
echo "Follow the instructions above to manually create and connect your GitHub repository."