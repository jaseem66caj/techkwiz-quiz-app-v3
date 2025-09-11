#!/bin/bash

# Fix Redis MCP Error Script
# This script helps resolve the "Invalid URL" error when starting Redis MCP server

echo "🔧 Fixing Redis MCP Server Error"
echo "==============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main troubleshooting function
troubleshoot_redis_mcp() {
    echo
    print_info "Analyzing Redis MCP Error..."
    echo
    
    # 1. Check if Redis is installed
    print_info "1. Checking Redis installation..."
    if command_exists redis-server; then
        print_status "Redis is installed"
    else
        print_warning "Redis is not installed"
        print_info "To install Redis:"
        print_info "  macOS: brew install redis"
        print_info "  Ubuntu: sudo apt-get install redis-server"
        return 1
    fi
    
    # 2. Check if Redis server is running
    print_info "2. Checking Redis server status..."
    if redis-cli ping >/dev/null 2>&1; then
        print_status "Redis server is running"
    else
        print_info "Starting Redis server..."
        if redis-server --daemonize yes; then
            sleep 2
            if redis-cli ping >/dev/null 2>&1; then
                print_status "Redis server started successfully"
            else
                print_error "Failed to start Redis server"
                return 1
            fi
        else
            print_error "Failed to start Redis server"
            return 1
        fi
    fi
    
    # 3. Check for Redis MCP server
    print_info "3. Checking for Redis MCP server..."
    
    # The error indicates that there's no official Redis MCP server
    # The issue is that someone is trying to run "@modelcontextprotocol/server-redis" 
    # which doesn't exist, causing the "Invalid URL" error
    
    print_warning "There is no official Redis MCP server package"
    print_info "The error occurs when trying to run a non-existent package"
    
    # 4. Check Claude Desktop configuration
    print_info "4. Checking Claude Desktop configuration..."
    
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    if [ -f "$CONFIG_FILE" ]; then
        print_status "Claude Desktop configuration found"
        
        # Check if there's a reference to Redis MCP server
        if grep -q "redis" "$CONFIG_FILE"; then
            print_warning "Found Redis reference in Claude Desktop configuration"
            print_info "This might be causing the error"
            print_info "The configuration contains:"
            grep -A 5 -B 5 "redis" "$CONFIG_FILE"
            
            print_info "Recommended actions:"
            print_info "1. Remove the Redis section from the configuration"
            print_info "2. Use postgres instead (if you need persistent storage)"
            print_info "3. Or create a custom Redis MCP server implementation"
        else
            print_status "No Redis references found in Claude Desktop configuration"
        fi
    else
        print_warning "Claude Desktop configuration not found"
        print_info "This might not be the source of the error"
    fi
    
    # 5. Check for any scripts trying to run Redis MCP server
    print_info "5. Checking for scripts that might be causing the error..."
    
    # Look for any scripts in the project that might be trying to run Redis MCP
    REDIS_SCRIPTS=$(grep -r "@modelcontextprotocol/server-redis" . 2>/dev/null | grep -v ".git" | head -5)
    
    if [ -n "$REDIS_SCRIPTS" ]; then
        print_warning "Found scripts referencing Redis MCP server:"
        echo "$REDIS_SCRIPTS"
        print_info "These scripts are likely causing the error since the package doesn't exist"
    else
        print_status "No scripts found referencing Redis MCP server"
    fi
    
    # 6. Provide solutions
    echo
    print_info "Solutions:"
    print_info "=========="
    print_info "1. If you don't need Redis MCP server:"
    print_info "   - Remove any references to '@modelcontextprotocol/server-redis' from your configuration"
    print_info "   - Use the updated Claude Desktop configuration we just created"
    
    print_info "2. If you need persistent storage:"
    print_info "   - Use the postgres MCP server instead (already configured)"
    print_info "   - Install PostgreSQL: brew install postgresql"
    
    print_info "3. If you specifically need Redis:"
    print_info "   - Use our custom Redis implementation in ./custom-mcp-servers/"
    print_info "   - Or create a proper MCP server implementation for Redis"
    
    print_info "4. Restart Claude Desktop after making changes:"
    print_info "   - Quit Claude Desktop (Cmd+Q)"
    print_info "   - Reopen Claude Desktop"
    
    echo
    print_status "✅ Redis MCP Error Analysis Completed!"
    print_info "The main issue is that '@modelcontextprotocol/server-redis' doesn't exist"
    print_info "Remove references to it from your configuration to resolve the error"
}

# Main function
main() {
    troubleshoot_redis_mcp
}

main "$@"