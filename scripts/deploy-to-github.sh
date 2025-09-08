#!/bin/bash

# TechKwiz-v8 GitHub Deployment Script

echo "🚀 Starting TechKwiz-v8 GitHub Deployment"
echo "========================================"

# Check if we're in the correct directory
if [ ! -d ".git" ]; then
    echo "❌ Error: This doesn't appear to be a git repository"
    echo "Please navigate to the Techkwiz-v8 project directory"
    exit 1
fi

echo "✅ Git repository found"

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    USE_GH_CLI=true
else
    echo "ℹ️  GitHub CLI not found, will use standard git commands"
    USE_GH_CLI=false
fi

# Check if repository already exists on GitHub
if [ "$USE_GH_CLI" = true ]; then
    echo "🔍 Checking if repository exists on GitHub..."
    # This would check if repo exists, but we'll skip for now
fi

# Stage all files
echo "📦 Staging all files..."
git add .

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  No changes to commit"
else
    echo "📝 Committing changes..."
    git commit -m "Deploy TechKwiz-v8 with Playwright visual testing implementation"
fi

# GitHub deployment instructions
echo ""
echo "🌐 GitHub Deployment Instructions:"
echo "=================================="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Name: TechKwiz-v8"
echo "   - Set to Public or Private"
echo "   - DO NOT initialize with README, .gitignore, or license"
echo "   - Click 'Create repository'"
echo ""
echo "2. Connect your local repository to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/TechKwiz-v8.git"
echo ""
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "4. Verify deployment:"
echo "   - Visit your repository on GitHub"
echo "   - Confirm all files have been uploaded"
echo ""
echo "✅ Deployment preparation complete!"
echo "Follow the instructions above to complete the deployment."