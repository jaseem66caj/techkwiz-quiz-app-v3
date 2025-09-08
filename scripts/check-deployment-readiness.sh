#!/bin/bash

# TechKwiz-v8 Deployment Readiness Check

echo "🔍 TechKwiz-v8 Deployment Readiness Check"
echo "========================================"

# Check if we're in the correct directory
if [ ! -d "/Users/jaseem/Documents/GitHub/Techkwiz-v8" ]; then
    echo "⚠️  Warning: Not in the expected project directory"
    echo "Current directory: $(pwd)"
fi

# Check for required files and directories
echo "📋 Checking required files and directories..."

REQUIRED_ITEMS=(
    ".git"
    "frontend"
    "docs"
    "README.md"
    "frontend/package.json"
    "frontend/playwright.config.ts"
    "frontend/src/__tests__/visual"
)

MISSING_ITEMS=()

for item in "${REQUIRED_ITEMS[@]}"; do
    if [ ! -e "/Users/jaseem/Documents/GitHub/Techkwiz-v8/$item" ]; then
        echo "❌ Missing: $item"
        MISSING_ITEMS+=("$item")
    else
        echo "✅ Found: $item"
    fi
done

# Check for deployment preparation files
echo "📦 Checking deployment preparation files..."

DEPLOYMENT_FILES=(
    "GITHUB_DEPLOYMENT_INSTRUCTIONS.md"
    "GITHUB_DEPLOYMENT_SUMMARY.md"
    "deploy-to-github.sh"
)

for file in "${DEPLOYMENT_FILES[@]}"; do
    if [ ! -e "/Users/jaseem/Documents/GitHub/Techkwiz-v8/$file" ]; then
        echo "❌ Missing deployment file: $file"
    else
        echo "✅ Found deployment file: $file"
    fi
done

# Summary
echo ""
echo "📊 Summary"
echo "========="

if [ ${#MISSING_ITEMS[@]} -eq 0 ]; then
    echo "✅ All required items are present"
    echo "✅ Project is ready for GitHub deployment"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Review GITHUB_DEPLOYMENT_INSTRUCTIONS.md"
    echo "   2. Create repository on GitHub"
    echo "   3. Run deploy-to-github.sh or follow manual instructions"
else
    echo "❌ Missing ${#MISSING_ITEMS[@]} required items"
    echo "Please ensure all required files are present before deployment"
fi

echo ""
echo "📄 Deployment Documentation:"
echo "   - GITHUB_DEPLOYMENT_INSTRUCTIONS.md: Step-by-step guide"
echo "   - GITHUB_DEPLOYMENT_SUMMARY.md: What will be deployed"
echo "   - deploy-to-github.sh: Automated deployment script (if executable)"

echo ""
echo "✅ Readiness check complete"