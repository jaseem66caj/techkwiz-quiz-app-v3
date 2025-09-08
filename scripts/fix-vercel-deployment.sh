#!/bin/bash

# TechKwiz v8 - Vercel Deployment Fix Script
# This script resolves npm registry issues and forces cache invalidation

echo "🔧 Fixing Vercel deployment issues..."

# Step 1: Clean local dependencies
echo "1. Cleaning local dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Step 2: Clear npm cache
echo "2. Clearing npm cache..."
npm cache clean --force

# Step 3: Reinstall dependencies with specific registry
echo "3. Reinstalling dependencies..."
npm install --registry=https://registry.npmjs.org/ --force

# Step 4: Generate fresh package-lock.json
echo "4. Generating fresh package-lock.json..."
npm install --package-lock-only

# Step 5: Test build locally
echo "5. Testing build locally..."
npm run build

# Step 6: Commit changes
echo "6. Committing dependency fixes..."
git add package-lock.json .npmrc vercel.json package.json
git commit -m "fix: Resolve Vercel deployment npm registry issues

- Add .npmrc with registry configuration and retry settings
- Create vercel.json with explicit build commands
- Update Sentry to stable version
- Add vercel-build script with registry specification
- Force cache invalidation and dependency refresh

Fixes npm registry 500 errors during Vercel deployment"

echo "✅ Deployment fix complete!"
echo "🚀 Push to main branch to trigger new Vercel deployment"
echo ""
echo "Commands to run:"
echo "git push origin main"
echo ""
echo "Monitor deployment at: https://vercel.com/dashboard"
