#!/bin/bash

# MCP Troubleshooting Script
echo "🔧 MCP Troubleshooting for Claude Desktop"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

echo ""
print_info "Step 1: Checking Claude Desktop"

# Check if Claude is running
if pgrep -f "Claude" > /dev/null; then
    print_status "Claude Desktop is running"
    CLAUDE_VERSION=$(osascript -e 'tell application "Claude" to get version' 2>/dev/null || echo "Unknown")
    print_info "Version: $CLAUDE_VERSION"
else
    print_error "Claude Desktop is not running"
    print_info "Starting Claude Desktop..."
    open -a Claude
    sleep 5
fi

echo ""
print_info "Step 2: Checking Configuration File"

if [ -f "$CONFIG_FILE" ]; then
    print_status "Configuration file exists"
    print_info "Location: $CONFIG_FILE"
    
    # Check JSON syntax
    if python3 -m json.tool "$CONFIG_FILE" >/dev/null 2>&1; then
        print_status "JSON syntax is valid"
    else
        print_error "Invalid JSON syntax"
        echo "Current content:"
        cat "$CONFIG_FILE"
        exit 1
    fi
    
    # Show current config
    echo ""
    print_info "Current configuration:"
    cat "$CONFIG_FILE" | python3 -m json.tool
else
    print_error "Configuration file not found"
    print_info "Creating basic configuration..."
    
    mkdir -p "$(dirname "$CONFIG_FILE")"
    cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/jaseem/Documents/GitHub/Techkwiz-v8"],
      "env": {}
    }
  }
}
EOF
    print_status "Basic configuration created"
fi

echo ""
print_info "Step 3: Testing MCP Server Availability"

# Test individual servers
SERVERS=(
    "@modelcontextprotocol/server-filesystem"
    "@modelcontextprotocol/server-memory"
    "@modelcontextprotocol/server-sequential-thinking"
    "@modelcontextprotocol/server-github"
)

for server in "${SERVERS[@]}"; do
    print_info "Testing $server..."
    if timeout 10 npx -y "$server" --version >/dev/null 2>&1; then
        print_status "$server is available"
    else
        # Try without --version flag
        if echo "" | timeout 5 npx -y "$server" >/dev/null 2>&1; then
            print_status "$server is available (no version flag)"
        else
            print_warning "$server may not be available or needs different args"
        fi
    fi
done

echo ""
print_info "Step 4: Checking for MCP Processes"

MCP_PROCESSES=$(ps aux | grep -E "(mcp|modelcontextprotocol)" | grep -v grep | wc -l)
if [ "$MCP_PROCESSES" -gt 0 ]; then
    print_status "Found $MCP_PROCESSES MCP-related processes"
    ps aux | grep -E "(mcp|modelcontextprotocol)" | grep -v grep | head -5
else
    print_warning "No MCP processes currently running"
fi

echo ""
print_info "Step 5: Force Claude Desktop Restart"

print_info "Stopping Claude Desktop..."
osascript -e 'tell application "Claude" to quit' 2>/dev/null
sleep 3
killall -9 "Claude" 2>/dev/null || true
sleep 2

print_info "Starting Claude Desktop..."
open -a Claude
sleep 8

echo ""
print_info "Step 6: Post-restart Check"

if pgrep -f "Claude" > /dev/null; then
    print_status "Claude Desktop restarted successfully"
    
    # Wait a bit for MCP servers to start
    sleep 5
    
    NEW_MCP_PROCESSES=$(ps aux | grep -E "(mcp|modelcontextprotocol)" | grep -v grep | wc -l)
    if [ "$NEW_MCP_PROCESSES" -gt "$MCP_PROCESSES" ]; then
        print_status "New MCP processes detected after restart!"
        print_info "Total MCP processes: $NEW_MCP_PROCESSES"
    else
        print_warning "No new MCP processes detected"
    fi
else
    print_error "Failed to restart Claude Desktop"
fi

echo ""
print_info "Step 7: Alternative Configuration Formats"

print_info "Trying alternative configuration format..."

# Create alternative config with more explicit format
cat > "${CONFIG_FILE}.alt" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/jaseem/Documents/GitHub/Techkwiz-v8"
      ],
      "env": {},
      "disabled": false
    },
    "memory": {
      "command": "npx", 
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "env": {},
      "disabled": false
    }
  },
  "defaults": {
    "disabled": false
  }
}
EOF

print_info "Alternative config created at: ${CONFIG_FILE}.alt"
print_info "To use it: cp '${CONFIG_FILE}.alt' '$CONFIG_FILE'"

echo ""
print_info "Step 8: Manual Test Commands"

echo "Try these commands in Claude Desktop:"
echo "1. 'What MCP servers do you have access to?'"
echo "2. 'Can you list files in my project directory?'"
echo "3. 'Do you have access to my filesystem?'"
echo "4. 'What tools are available to you?'"

echo ""
print_info "Step 9: Debugging Information"

echo "System Information:"
echo "- macOS Version: $(sw_vers -productVersion)"
echo "- Node.js Version: $(node --version 2>/dev/null || echo 'Not found')"
echo "- NPX Available: $(command -v npx >/dev/null && echo 'Yes' || echo 'No')"
echo "- Claude Desktop Version: $CLAUDE_VERSION"
echo "- Config File Size: $(wc -c < "$CONFIG_FILE" 2>/dev/null || echo '0') bytes"

echo ""
print_warning "If MCP servers still don't work:"
echo "1. Check Claude Desktop settings for MCP options"
echo "2. Try the alternative configuration format"
echo "3. Ensure you're using a compatible Claude Desktop version"
echo "4. Check Claude Desktop logs in Console.app"

echo ""
print_status "Troubleshooting completed!"
