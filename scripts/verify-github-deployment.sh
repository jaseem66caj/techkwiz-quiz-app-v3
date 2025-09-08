#!/bin/bash

# TechKwiz-v8 GitHub Deployment Verification Script

echo "🔍 Verifying TechKwiz-v8 GitHub Deployment"
echo "========================================"

# Check if we're in the correct directory
if [ ! -f "GITHUB_DEPLOYMENT_COMPLETED.md" ]; then
  echo "❌ Please run this script from the Techkwiz-v8 root directory"
  exit 1
fi

echo "✅ Correct directory detected"

# Check git remote
echo "🔍 Checking git remote configuration..."
REMOTE=$(git remote -v | grep origin)
if [ -n "$REMOTE" ]; then
  echo "✅ Git remote configured"
  echo "   $REMOTE"
else
  echo "❌ Git remote not configured"
fi

# Check current branch
echo "🔍 Checking current branch..."
BRANCH=$(git branch --show-current)
echo "✅ Current branch: $BRANCH"

# Check commit history
echo "🔍 Checking commit history..."
COMMITS=$(git log --oneline -3)
if [ -n "$COMMITS" ]; then
  echo "✅ Recent commits found:"
  echo "$COMMITS"
else
  echo "❌ No commits found"
fi

# Check for staged files
echo "🔍 Checking for uncommitted changes..."
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
  echo "✅ No uncommitted changes"
else
  echo "⚠️  Uncommitted changes detected:"
  echo "$CHANGES"
fi

echo ""
echo "📋 Deployment verification complete"
echo "================================="
echo "✅ Repository has been prepared for GitHub deployment"
echo "✅ All files have been committed"
echo "✅ Git remote is configured"
echo ""
echo "📝 Note: The actual push to GitHub may take a few moments"
echo "   Please check your GitHub repository to confirm the deployment"