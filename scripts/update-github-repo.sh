#!/bin/bash

# TechKwiz-v8 GitHub Repository Update Script

echo "🔄 TechKwiz-v8 GitHub Repository Update"
echo "===================================="

# Check if we're in the correct directory
if [ ! -f "DEPLOYMENT_FINAL_CONFIRMATION.md" ]; then
  echo "❌ Please run this script from the Techkwiz-v8 root directory"
  exit 1
fi

echo "✅ Correct directory detected"

# Stage all files
echo "📦 Staging all files..."
git add .

# Check if there are changes to commit
if [ -z "$(git diff --cached)" ]; then
  echo "ℹ️  No changes to commit"
else
  echo "📝 Committing changes..."
  git commit -m "Update: TechKwiz-v8 project files"
  echo "🚀 Pushing changes to GitHub..."
  git push origin main
  echo "✅ Changes pushed to GitHub successfully!"
fi

echo ""
echo "✅ Repository update process completed"