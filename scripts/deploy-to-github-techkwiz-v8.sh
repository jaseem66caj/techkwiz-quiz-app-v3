#!/bin/bash

# TechKwiz-v8 GitHub Deployment Script
# This script will prepare and deploy the TechKwiz-v8 project to a new GitHub repository

echo "🚀 Starting TechKwiz-v8 GitHub Deployment"
echo "========================================"

# Navigate to project directory
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8

# Check if we're in the correct directory
if [ ! -d ".git" ]; then
    echo "❌ Error: This doesn't appear to be a git repository"
    exit 1
fi

echo "✅ Git repository found"

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

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "🔧 Next Steps (Manual):"
echo "======================="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: TechKwiz-v8"
echo "   - Set to Public or Private (your choice)"
echo "   - IMPORTANT: Leave all checkboxes UNCHECKED"
echo "   - Click 'Create repository'"
echo ""
echo "2. After creating the repository, connect your local repository:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/TechKwiz-v8.git"
echo ""
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "📝 Note: Replace YOUR_USERNAME with your actual GitHub username"
echo ""
echo "✅ Your TechKwiz-v8 project is ready for deployment!"