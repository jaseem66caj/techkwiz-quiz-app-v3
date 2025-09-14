#!/bin/bash

# Full cleanup script for TechKwiz Quiz App
# This script will:
# 1. Kill any running development servers
# 2. Clear build caches
# 3. Clear npm cache
# 4. Provide instructions for clearing browser data

echo "🚀 Starting full cleanup process..."

# 1. Kill Next.js development servers
echo "🛑 Killing Next.js development servers..."
pkill -f "next dev" || echo "No Next.js dev servers found"

# 2. Kill Playwright test servers
echo "🛑 Killing Playwright test servers..."
pkill -f "playwright" || echo "No Playwright test servers found"

# 3. Remove Next.js build directory
echo "🗑️  Removing Next.js build directory..."
rm -rf .next
echo "✅ Next.js build directory removed"

# 4. Remove node_modules cache
echo "🗑️  Removing node_modules cache..."
rm -rf node_modules/.cache
echo "✅ Node_modules cache removed"

# 5. Clear npm cache (may require sudo)
echo "🧹 Clearing npm cache..."
npm cache clean --force 2>/dev/null || echo "⚠️  npm cache clean failed, you may need to run: sudo chown -R $(whoami) ~/.npm"

# 6. Clear temporary files
echo "🗑️  Removing temporary files..."
rm -rf .tmp
rm -rf temp
echo "✅ Temporary files removed"

# 7. Clear test results
echo "🗑️  Removing test results..."
rm -rf test-results
rm -rf test-results-local
rm -rf playwright-report
rm -rf playwright-report-local
echo "✅ Test results removed"

echo ""
echo "✅ Full cleanup completed!"
echo ""
echo "📋 To clear browser data, please:"
echo "   1. Open your browser's developer tools (F12)"
echo "   2. Go to the Console tab"
echo "   3. Copy and paste the following script:"
echo ""
echo "   (function(){localStorage.clear();sessionStorage.clear();const c=document.cookie.split(';');for(let i=0;i<c.length;i++){const e=c[i];const n=e.indexOf('=');const name=n>-1?e.substr(0,n):e;document.cookie=name+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';document.cookie=name+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain='+window.location.hostname;document.cookie=name+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.'+window.location.hostname;}console.log('Browser data cleared! Please refresh the page.');})();"
echo ""
echo "   4. Press Enter to run the script"
echo "   5. Refresh your browser"
echo ""
echo "🔧 For persistent npm cache issues, run:"
echo "   sudo chown -R $(whoami) ~/.npm"
echo ""