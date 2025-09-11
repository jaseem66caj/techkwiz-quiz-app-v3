#!/bin/bash

# Fix Redis MCP Conflict Script
# This script resolves conflicts between different Redis MCP server installations

echo "🔧 Fixing Redis MCP Server Conflict"
echo "================================="

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

# Function to kill processes by pattern
kill_processes() {
    local pattern=$1
    local name=$2
    
    print_info "Checking for $name processes..."
    local pids=$(pgrep -f "$pattern")
    
    if [ -n "$pids" ]; then
        print_warning "Found $name processes:"
        ps -p $pids -o pid,cmd | tail -n +2
        print_info "Killing $name processes..."
        kill $pids 2>/dev/null
        sleep 2
        
        # Check if processes are still running
        local remaining=$(pgrep -f "$pattern")
        if [ -n "$remaining" ]; then
            print_info "Force killing remaining $name processes..."
            kill -9 $remaining 2>/dev/null
        fi
        
        print_status "$name processes stopped"
    else
        print_status "No $name processes found"
    fi
}

# Main function
main() {
    echo
    print_info "Analyzing Redis MCP Server Conflict..."
    echo
    
    # 1. Kill any processes trying to run the non-existent @modelcontextprotocol/server-redis
    kill_processes "@modelcontextprotocol/server-redis" "non-existent Redis MCP server"
    
    # 2. Check if the custom Redis MCP server is running properly
    print_info "Checking custom Redis MCP server status..."
    if pgrep -f "redis-mcp-server" > /dev/null; then
        print_status "Custom Redis MCP server is running"
        print_info "Process details:"
        ps aux | grep "redis-mcp-server" | grep -v grep
    else
        print_warning "Custom Redis MCP server is not running"
    fi
    
    # 3. Check Redis server status
    print_info "Checking Redis server status..."
    if redis-cli ping >/dev/null 2>&1; then
        print_status "Local Redis server is running"
    else
        print_info "Starting local Redis server..."
        if redis-server --daemonize yes; then
            sleep 2
            if redis-cli ping >/dev/null 2>&1; then
                print_status "Local Redis server started successfully"
            else
                print_error "Failed to start local Redis server"
            fi
        else
            print_error "Failed to start local Redis server"
        fi
    fi
    
    # 4. Check Claude Desktop configuration
    print_info "Verifying Claude Desktop configuration..."
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    if [ -f "$CONFIG_FILE" ]; then
        print_status "Claude Desktop configuration found"
        
        # Check for any Redis references
        if grep -q "redis" "$CONFIG_FILE"; then
            print_warning "Found Redis references in Claude Desktop configuration"
            print_info "Configuration contains:"
            grep -A 3 -B 1 "redis" "$CONFIG_FILE"
        else
            print_status "No Redis references found in Claude Desktop configuration"
        fi
    else
        print_warning "Claude Desktop configuration not found"
    fi
    
    # 5. Recommendations
    echo
    print_info "Recommendations:"
    print_info "================"
    print_info "1. Use the custom Redis MCP server (already installed via uvx)"
    print_info "2. Remove any references to '@modelcontextprotocol/server-redis'"
    print_info "3. If you want to use the custom Redis MCP server, ensure it's properly configured"
    print_info "4. The custom server connects to a Redis Cloud instance (check connection details)"
    
    echo
    print_info "To test the custom Redis MCP server:"
    print_info "1. Make sure Claude Desktop is running"
    print_info "2. In Claude Desktop, try asking:"
    print_info "   - 'Can you store this information in Redis?'"
    print_info "   - 'What can you do with the Redis server?'"
    
    echo
    print_status "✅ Redis MCP Server Conflict Resolution Completed!"
    print_info "The error was caused by trying to run a non-existent package"
    print_info "Your custom Redis MCP server should continue working properly"
}

main "$@"