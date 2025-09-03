#!/bin/bash

# TechKwiz-v8 Repository Access Check Script

echo "🔍 Checking TechKwiz-v8 Repository Access"
echo "====================================="

# Check if repository is accessible
echo "📡 Testing repository access..."
curl -s -o /dev/null -w "%{http_code}" https://github.com/jaseem66caj/TechKwiz-v8 | grep -q "200" && echo "✅ Repository is accessible" || echo "❌ Repository is not accessible"

# Check if we can access the raw content
echo "📡 Testing raw content access..."
curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/jaseem66caj/TechKwiz-v8/main/README.md | grep -q "200" && echo "✅ Raw content is accessible" || echo "❌ Raw content is not accessible"

echo ""
echo "📋 Repository Access Check Complete"
echo "================================"
echo "If the repository is not accessible, please follow the manual setup instructions in GITHUB_TROUBLESHOOTING.md"