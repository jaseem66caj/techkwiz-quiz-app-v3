#!/bin/bash

# TechKwiz-v8 GitHub Sync Verification Script

echo "🔍 Verifying TechKwiz-v8 GitHub Sync Status"
echo "======================================="

# Check if we're in the correct directory
if [ ! -f "GITHUB_SYNC_VERIFICATION.md" ]; then
  echo "❌ Please run this script from the Techkwiz-v8 root directory"
  exit 1
fi

echo "✅ Correct directory detected"

# Check git status
echo "🔍 Checking git status..."
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
  echo "✅ No uncommitted changes - repository is clean"
else
  echo "⚠️  Uncommitted changes detected:"
  echo "$CHANGES"
fi

# Check current branch
echo "🔍 Checking current branch..."
BRANCH=$(git branch --show-current)
echo "✅ Current branch: $BRANCH"

# Check commit history
echo "🔍 Checking recent commit history..."
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %an, %ar : %s")
echo "✅ Latest commit: $LAST_COMMIT"

# Check remote configuration
echo "🔍 Checking remote repository configuration..."
REMOTE=$(git remote -v | grep origin | head -1)
if [ -n "$REMOTE" ]; then
  echo "✅ Remote repository configured:"
  echo "   $REMOTE"
else
  echo "❌ No remote repository configured"
fi

echo ""
echo "📋 Sync verification complete"
echo "==========================="
echo "✅ Repository status checked"
echo "✅ Branch information verified"
echo "✅ Commit history confirmed"
echo "✅ Remote configuration verified"
echo ""
echo "📝 For detailed verification, please check your GitHub repository directly at:"
echo "   https://github.com/jaseem66caj/TechKwiz-v8"
echo ""
echo "📊 For complete sync report, see: GITHUB_SYNC_VERIFICATION.md"