#!/bin/bash

# TechKwiz-v8 GitHub Repository Setup Script

echo "🚀 TechKwiz-v8 GitHub Repository Setup"
echo "====================================="

# Check if we're in the correct directory
if [ ! -f "DEPLOYMENT_SUMMARY.md" ]; then
  echo "❌ Please run this script from the Techkwiz-v8 root directory"
  exit 1
fi

echo "✅ Found Techkwiz-v8 project directory"

# Check if git is available
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed or not in PATH"
  echo "Please install Git and try again"
  exit 1
fi

echo "✅ Git is available"

# Remove any existing remote
echo "🔄 Removing existing remote repository..."
git remote remove origin 2>/dev/null || true

# Stage all files
echo "📦 Staging all files..."
git add .

# Check if there are changes to commit
if [ -z "$(git diff --cached)" ]; then
  echo "ℹ️  No changes to commit"
else
  echo "📝 Committing changes..."
  git commit -m "Initial commit: TechKwiz-v8 with Playwright visual testing implementation"
fi

# Show current status
echo ""
echo "🔍 Current Git Status:"
echo "===================="
echo "Branch: $(git branch --show-current)"
echo "Uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"

echo ""
echo "✅ Repository setup complete!"
echo ""
echo "📋 Next Steps:"
echo "============="
echo "1. Create a new repository on GitHub at https://github.com/new"
echo "2. Repository name: TechKwiz-v8"
echo "3. Description: A modern interactive quiz game with visual regression testing"
echo "4. Set to Public or Private (your choice)"
echo "5. Leave all checkboxes UNCHECKED"
echo "6. Click 'Create repository'"
echo ""
echo "7. After creating the repository, run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/TechKwiz-v8.git"
echo "   git push -u origin main"
echo ""
echo "📝 Note: Replace YOUR_USERNAME with your actual GitHub username"
echo ""
echo "📖 For detailed instructions, see GITHUB_DEPLOYMENT_STEPS.md"