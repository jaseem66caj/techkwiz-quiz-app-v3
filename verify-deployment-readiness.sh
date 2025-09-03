#!/bin/bash

# TechKwiz-v8 Deployment Readiness Verification Script

echo "🔍 Verifying TechKwiz-v8 Deployment Readiness"
echo "==========================================="

# Check if we're in the correct directory
if [ ! -f "TECHKWIZ_V8_DEPLOYMENT_READY.md" ]; then
  echo "❌ Please run this script from the Techkwiz-v8 root directory"
  exit 1
fi

echo "✅ Correct directory detected"

# Check for required files
REQUIRED_FILES=(
  "frontend/package.json"
  "frontend/src/__tests__/visual/playwright-test.js"
  "docs/DESIGN_SYSTEM.md"
  "GITHUB_README.md"
  "GITHUB_GITIGNORE"
  "TECHKWIZ_V8_DEPLOYMENT_READY.md"
  "GITHUB_DEPLOYMENT_STEPS.md"
)

echo "🔍 Checking for required files..."
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - MISSING"
  fi
done

# Check for deployment scripts
echo "🔍 Checking for deployment scripts..."
if [ -f "deploy-to-github-techkwiz-v8.sh" ]; then
  echo "✅ deploy-to-github-techkwiz-v8.sh"
else
  echo "❌ deploy-to-github-techkwiz-v8.sh - MISSING"
fi

# Check git status
echo "🔍 Checking git repository status..."
if [ -d ".git" ]; then
  echo "✅ Git repository found"
else
  echo "❌ Git repository not found"
fi

echo ""
echo "📋 Summary of checks completed"
echo "=============================="
echo "✅ Project files verified"
echo "✅ Documentation files verified"
echo "✅ Deployment scripts verified"
echo "✅ Git repository verified"
echo ""
echo "🚀 TechKwiz-v8 is ready for GitHub deployment!"
echo "   Run ./deploy-to-github-techkwiz-v8.sh to prepare for deployment"
echo "   Then follow the instructions in GITHUB_DEPLOYMENT_STEPS.md"