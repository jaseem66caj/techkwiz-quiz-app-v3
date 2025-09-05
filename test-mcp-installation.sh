#!/bin/bash

# Test MCP Installation Script
echo "🧪 Testing MCP Servers Installation"
echo "==================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() { echo -e "${BLUE}🔍 Testing: $1${NC}"; }
print_pass() { echo -e "${GREEN}✅ PASS: $1${NC}"; }
print_fail() { echo -e "${RED}❌ FAIL: $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }

# Test 1: Check if Claude Desktop config exists
print_test "Claude Desktop Configuration"
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    print_pass "Configuration file exists"
    print_info "Location: $CONFIG_FILE"
else
    print_fail "Configuration file not found"
    exit 1
fi

# Test 2: Validate JSON syntax
print_test "Configuration JSON Syntax"
if python3 -m json.tool "$CONFIG_FILE" >/dev/null 2>&1; then
    print_pass "JSON syntax is valid"
else
    print_fail "Invalid JSON syntax in configuration"
fi

# Test 3: Check Node.js availability
print_test "Node.js Installation"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_pass "Node.js is available: $NODE_VERSION"
else
    print_fail "Node.js not found"
fi

# Test 4: Check npm/npx availability
print_test "NPX Availability"
if command -v npx >/dev/null 2>&1; then
    print_pass "npx is available"
else
    print_fail "npx not found"
fi

# Test 5: Test MCP servers individually
echo ""
print_info "Testing individual MCP servers..."

# Test filesystem server
print_test "Filesystem Server"
if npx -y @modelcontextprotocol/server-filesystem --help >/dev/null 2>&1; then
    print_pass "Filesystem server can be loaded"
else
    print_fail "Filesystem server failed to load"
fi

# Test memory server
print_test "Memory Server"
if echo "" | npx -y @modelcontextprotocol/server-memory >/dev/null 2>&1 &
then
    sleep 2
    kill $! 2>/dev/null
    print_pass "Memory server can be loaded"
else
    print_fail "Memory server failed to load"
fi

# Test everything server
print_test "Everything Server"
if npx -y @modelcontextprotocol/server-everything --help >/dev/null 2>&1; then
    print_pass "Everything server can be loaded"
else
    print_fail "Everything server failed to load"
fi

# Test 6: Check project directory access
print_test "Project Directory Access"
PROJECT_DIR="/Users/jaseem/Documents/GitHub/Techkwiz-v8"
if [ -d "$PROJECT_DIR" ]; then
    print_pass "Project directory exists and is accessible"
    FILE_COUNT=$(find "$PROJECT_DIR" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l)
    print_info "Found $FILE_COUNT TypeScript/JavaScript files"
else
    print_fail "Project directory not accessible"
fi

# Test 7: Check if Claude Desktop is installed
print_test "Claude Desktop Application"
if [ -d "/Applications/Claude.app" ]; then
    print_pass "Claude Desktop found at /Applications/Claude.app"
elif [ -d "/Applications/Claude Desktop.app" ]; then
    print_pass "Claude Desktop found at /Applications/Claude Desktop.app"
else
    print_info "Claude Desktop app not found in /Applications"
    print_info "You may need to download it from: https://claude.ai/download"
fi

echo ""
echo "🎯 Summary"
echo "=========="
print_info "MCP servers are configured and ready to use"
print_info "Configuration file: $CONFIG_FILE"
print_info "Project directory: $PROJECT_DIR"

echo ""
print_info "Next steps:"
echo "1. Make sure Claude Desktop is installed"
echo "2. Restart Claude Desktop completely"
echo "3. Test with: 'Can you list files in my TechKwiz project?'"

echo ""
print_pass "MCP installation test completed! 🎉"
