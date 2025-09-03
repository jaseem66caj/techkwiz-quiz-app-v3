#!/bin/bash

# TechKwiz-v8 GitHub Initial Setup Script

echo "🚀 TechKwiz-v8 GitHub Repository Setup"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "GITHUB_SETUP_GUIDE.md" ]; then
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

# Check current git status
echo "🔍 Checking current git status..."
git status --porcelain > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Git repository not found or not initialized"
  echo "Please make sure you're in a git repository"
  exit 1
fi

echo "✅ Git repository found"

# Show current remotes
echo "📡 Current git remotes:"
git remote -v

echo ""
echo "📋 Next Steps:"
echo "1. Create a new repository on GitHub at https://github.com/new"
echo "2. Name it 'TechKwiz-v8' (don't initialize with README/.gitignore)"
echo "3. Copy the repository URL"
echo "4. Run: git remote add origin YOUR_REPOSITORY_URL"
echo "5. Run: git add ."
echo "6. Run: git commit -m \"Initial commit: TechKwiz-v8 with Playwright visual testing implementation\""
echo "7. Run: git push -u origin main"
echo ""
echo "📝 Detailed instructions are in GITHUB_SETUP_GUIDE.md"
echo ""
echo "✅ Setup preparation complete!"